import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { surveyPointPacks, site } from "@/config/site";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isValidWithdrawalAmount } from "@/lib/wallet-rules";

const withdrawalInput = z.object({
  amountNaira: z.number().int().positive().max(10_000_000),
  bankName: z.string().trim().min(2).max(100),
  accountNumber: z.string().regex(/^\d{10}$/),
  accountName: z.string().trim().min(2).max(120),
});

function paymentOrigin(): string {
  const origin = getRequestHeader("origin");
  if (!origin) return site.url;
  try {
    const url = new URL(origin);
    const permitted =
      url.hostname === "fmie.co.uk" ||
      url.hostname === "www.fmie.co.uk" ||
      url.hostname === "fmie.lovable.app" ||
      url.hostname.endsWith(".lovable.app") ||
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1";
    return permitted ? url.origin : site.url;
  } catch {
    return site.url;
  }
}

export const getWalletSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [walletResult, transactionResult, withdrawalResult] = await Promise.all([
      supabase.from("wallet_accounts").select("cash_minor, points, locked_points").eq("user_id", userId).maybeSingle(),
      supabase
        .from("wallet_transactions")
        .select("id, kind, amount_minor, points, note, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("withdrawals")
        .select("id, amount_minor, bank_name, account_name, account_number, status, requested_at, processed_at")
        .eq("user_id", userId)
        .order("requested_at", { ascending: false })
        .limit(50),
    ]);
    if (walletResult.error || transactionResult.error || withdrawalResult.error) {
      throw new Error("Your wallet could not be loaded. Please try again.");
    }
    const transactions = transactionResult.data ?? [];
    const summary = transactions.reduce(
      (totals, item) => {
        if (item.kind === "survey_reward" && item.amount_minor > 0) {
          totals.earnedMinor += item.amount_minor;
          totals.completedSurveys += 1;
        }
        if (item.kind === "points_purchase" && item.amount_minor < 0) {
          totals.purchasedMinor += Math.abs(item.amount_minor);
        }
        return totals;
      },
      { earnedMinor: 0, purchasedMinor: 0, completedSurveys: 0 },
    );
    return {
      cashMinor: walletResult.data?.cash_minor ?? 0,
      points: walletResult.data?.points ?? 0,
      lockedPoints: walletResult.data?.locked_points ?? 0,
      totalEarnedMinor: summary.earnedMinor,
      purchasedMinor: summary.purchasedMinor,
      completedSurveys: summary.completedSurveys,
      transactions: transactions.map((item) => ({
        id: item.id,
        kind: item.kind,
        amountMinor: item.amount_minor,
        points: item.points,
        note: item.note,
        createdAt: item.created_at,
      })),
      withdrawals: (withdrawalResult.data ?? []).map((item) => ({
        id: item.id,
        amountMinor: item.amount_minor,
        bankName: item.bank_name,
        accountName: item.account_name,
        accountLastFour: item.account_number.slice(-4),
        status: item.status,
        requestedAt: item.requested_at,
        processedAt: item.processed_at,
      })),
    };
  });

export const requestWalletWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => withdrawalInput.parse(input))
  .handler(async ({ data, context }) => {
    const amountMinor = data.amountNaira * 100;
    if (!isValidWithdrawalAmount(amountMinor)) {
      throw new Error("Withdrawals must be at least ₦2,000 and entered as whole naira.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: withdrawalId, error } = await supabaseAdmin.rpc("request_wallet_withdrawal", {
      _user_id: context.userId,
      _amount_minor: amountMinor,
      _bank_name: data.bankName,
      _account_number: data.accountNumber,
      _account_name: data.accountName,
    });
    if (error || !withdrawalId) {
      throw new Error(error?.message.includes("available balance") ? "Amount exceeds your available balance." : error?.message.includes("Minimum withdrawal") ? "Minimum withdrawal is ₦2,000." : "Your withdrawal request could not be saved.");
    }
    return { id: withdrawalId };
  });

export const initializePointPurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ packId: z.string().min(1).max(40) }).parse(input))
  .handler(async ({ data, context }) => {
    const secret = process.env["PAYSTACK_SECRET_KEY"];
    if (!secret) throw new Error("Paystack is not connected yet. Your wallet has not been charged.");
    const pack = surveyPointPacks.find((candidate) => candidate.id === data.packId);
    if (!pack) throw new Error("That points package is not available.");
    const { data: authData, error: authError } = await context.supabase.auth.getUser();
    const email = authData.user?.email;
    if (authError || !email) throw new Error("Please sign in again before paying.");

    const reference = `fmie_points_${crypto.randomUUID().replaceAll("-", "")}`;
    const amountMinor = pack.naira * 100;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: insertError } = await supabaseAdmin.from("wallet_point_purchases").insert({
      user_id: context.userId,
      reference,
      pack_id: pack.id,
      amount_minor: amountMinor,
      points: pack.points,
    });
    if (insertError) throw new Error("The payment could not be started. Please try again.");

    let response: Response;
    try {
      response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount: amountMinor,
          currency: "NGN",
          reference,
          callback_url: `${paymentOrigin()}/wallet?payment=return&reference=${encodeURIComponent(reference)}`,
          metadata: { purchase_reference: reference, pack_id: pack.id },
        }),
      });
    } catch {
      await supabaseAdmin.from("wallet_point_purchases").update({ status: "failed" }).eq("reference", reference);
      throw new Error("Paystack could not be reached. No points were added; please try again.");
    }
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok || !isPaystackAuthorization(payload)) {
      await supabaseAdmin.from("wallet_point_purchases").update({ status: "failed" }).eq("reference", reference);
      throw new Error("Paystack could not start the payment. No points were added.");
    }
    return { authorizationUrl: payload.data.authorization_url };
  });

export const confirmPointPurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ reference: z.string().regex(/^fmie_points_[a-f0-9]{32}$/) }).parse(input))
  .handler(async ({ data, context }) => {
    const secret = process.env["PAYSTACK_SECRET_KEY"];
    if (!secret) return { status: "pending" as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("wallet_point_purchases")
      .select("reference, amount_minor, currency")
      .eq("reference", data.reference)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (purchaseError || !purchase) throw new Error("This payment reference was not found on your account.");
    const payment = await verifyPaystackReference(data.reference, secret);
    if (!payment || !matchesPurchase(payment, purchase)) return { status: "pending" as const };
    const { data: settled, error } = await supabaseAdmin.rpc("settle_wallet_point_purchase", {
      _reference: purchase.reference,
      _amount_minor: purchase.amount_minor,
      _currency: purchase.currency,
      _provider_transaction_id: String(payment.id),
    });
    if (error || !settled) throw new Error("Payment verification is still pending. Your wallet was not credited yet.");
    return { status: "succeeded" as const };
  });

export const getWithdrawalQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "administrator",
    });
    if (roleError || !isAdmin) throw new Error("Administrator access required.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("withdrawals")
      .select("id, user_id, amount_minor, bank_name, account_name, account_number, status, requested_at")
      .in("status", ["pending", "approved"])
      .order("requested_at", { ascending: true });
    if (error) throw new Error("Withdrawal requests could not be loaded.");
    return (data ?? []).map((item) => ({
      id: item.id,
      userId: item.user_id,
      amountMinor: item.amount_minor,
      bankName: item.bank_name,
      accountName: item.account_name,
      accountNumber: item.account_number,
      status: item.status,
      requestedAt: item.requested_at,
    }));
  });

export const resolveWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ withdrawalId: z.string().uuid(), decision: z.enum(["approve", "reject"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "administrator",
    });
    if (roleError || !isAdmin) throw new Error("Administrator access required.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: updated, error } = await supabaseAdmin.rpc("resolve_wallet_withdrawal", {
      _withdrawal_id: data.withdrawalId,
      _decision: data.decision,
    });
    if (error || !updated) throw new Error("This request has already been handled or could not be updated.");
    return { updated: true };
  });

async function verifyPaystackReference(reference: string, secret: string): Promise<VerifiedPaystackPayment | null> {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    if (!isVerifiedPaystackPayment(payload)) return null;
    return payload.data;
  } catch {
    return null;
  }
}

interface VerifiedPaystackPayment {
  id: number | string;
  status: string;
  reference: string;
  amount: number;
  currency: string;
}

function isVerifiedPaystackPayment(value: unknown): value is { data: VerifiedPaystackPayment } {
  if (!value || typeof value !== "object" || !("data" in value)) return false;
  const data = value.data;
  return !!data && typeof data === "object" && "reference" in data && "amount" in data && "currency" in data && "status" in data && "id" in data && typeof data.reference === "string" && typeof data.amount === "number" && typeof data.currency === "string" && typeof data.status === "string" && (typeof data.id === "number" || typeof data.id === "string");
}

function matchesPurchase(payment: VerifiedPaystackPayment, purchase: { reference: string; amount_minor: number; currency: string }): boolean {
  return payment.status === "success" && payment.reference === purchase.reference && payment.amount === purchase.amount_minor && payment.currency === purchase.currency;
}

function isPaystackAuthorization(value: unknown): value is { data: { authorization_url: string } } {
  return !!value && typeof value === "object" && "status" in value && value.status === true && "data" in value && !!value.data && typeof value.data === "object" && "authorization_url" in value.data && typeof value.data.authorization_url === "string";
}