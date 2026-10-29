import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { site } from "@/config/site";
import { seedDistributionChannels } from "@/data";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { initializePaystack, verifyPaystack } from "@/lib/paystack";
import { PRESS_REFERENCE_PATTERN, quotePressBooking } from "@/lib/press-booking-rules";

const bookingInput = z.object({
  outletIds: z.array(z.string().min(1).max(40)).min(1).max(60),
  headline: z.string().trim().min(3).max(300),
  subhead: z.string().max(500),
  body: z.string().trim().min(80).max(30_000),
  companyName: z.string().max(160),
  industry: z.string().max(120),
  country: z.string().max(80),
  contactName: z.string().max(120),
  contactEmail: z.string().max(200),
  contactPhone: z.string().max(40),
  websiteUrl: z.string().max(300),
  targetDate: z.string().max(10),
  images: z.array(z.string().max(200)).max(20),
  editorialAccepted: z.literal(true),
});

function paymentOrigin(): string {
  const origin = getRequestHeader("origin");
  if (!origin) return site.url;
  try {
    const url = new URL(origin);
    const permitted =
      url.hostname === "fmie.co.uk" ||
      url.hostname === "www.fmie.co.uk" ||
      url.hostname.endsWith(".lovable.app") ||
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1";
    return permitted ? url.origin : site.url;
  } catch {
    return site.url;
  }
}

/**
 * Saves the written release with its outlets and price, then opens Paystack.
 * The price always comes from the official outlet list, never from the browser.
 */
export const startPressBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => bookingInput.parse(input))
  .handler(async ({ data, context }) => {
    const secret = process.env["PAYSTACK_SECRET_KEY"];
    if (!secret) throw new Error("Payments are not connected yet. You have not been charged.");
    const quote = quotePressBooking(data.outletIds, seedDistributionChannels);
    if (!quote) throw new Error("One of the chosen outlets is not available. Please pick your outlets again.");
    const { data: authData } = await context.supabase.auth.getUser();
    const email = authData.user?.email;
    if (!email) throw new Error("Please sign in again before paying.");

    const reference = `fmie_press_${crypto.randomUUID().replaceAll("-", "")}`;
    const targetDate = /^\d{4}-\d{2}-\d{2}$/.test(data.targetDate) ? data.targetDate : null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: insertError } = await supabaseAdmin.from("press_releases").insert({
      user_id: context.userId,
      title: data.headline,
      content_draft: data.subhead.trim() ? `${data.subhead.trim()}\n\n${data.body}` : data.body,
      company_name: data.companyName.trim(),
      industry: data.industry.trim(),
      country: data.country.trim(),
      contact_name: data.contactName.trim(),
      contact_email: data.contactEmail.trim() || email,
      contact_phone: data.contactPhone.trim(),
      website_url: data.websiteUrl.trim(),
      target_date: targetDate,
      attachments: data.images,
      selected_outlets: quote.outlets.map((outlet) => ({ id: outlet.id, label: outlet.label, usd: outlet.usd })),
      distribution_regions: [...new Set(quote.outlets.map((outlet) => outlet.region))],
      target_audience: quote.outlets.map((outlet) => outlet.label).join(", "),
      disclosure_acknowledged: true,
      consent_to_processing: true,
      status: "awaiting_payment",
      quote_minor: quote.chargeKobo,
      price_usd_cents: quote.usdCents,
      currency: "NGN",
      payment_reference: reference,
      timeline: [{ status: "awaiting_payment", at: new Date().toISOString(), note: "Release written and outlets chosen. Waiting for payment." }],
    });
    if (insertError) throw new Error("Your booking could not be saved. Please try again.");

    const authorizationUrl = await initializePaystack(secret, {
      email,
      amount: quote.chargeKobo,
      reference,
      callback_url: `${paymentOrigin()}/press-releases/book?payment=return&reference=${encodeURIComponent(reference)}`,
      metadata: { press_reference: reference, price_usd: quote.usdCents / 100, outlets: quote.outlets.length },
    });
    if (!authorizationUrl) {
      await supabaseAdmin.from("press_releases").update({ status: "cancelled" }).eq("payment_reference", reference);
      throw new Error("Paystack could not start the payment. You have not been charged.");
    }
    return { authorizationUrl };
  });

/** Checks the payment with Paystack and sends the release to the press desk once. */
export const confirmPressBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ reference: z.string().regex(PRESS_REFERENCE_PATTERN) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: booking, error } = await context.supabase
      .from("press_releases")
      .select("reference_number, quote_minor, currency, paid_at")
      .eq("payment_reference", data.reference)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error || !booking) throw new Error("This payment was not found on your account.");
    if (booking.paid_at) return { status: "succeeded" as const, referenceNumber: booking.reference_number };
    const secret = process.env["PAYSTACK_SECRET_KEY"];
    if (!secret) return { status: "pending" as const, referenceNumber: booking.reference_number };
    const payment = await verifyPaystack(data.reference, secret);
    if (
      !payment ||
      payment.status !== "success" ||
      payment.reference !== data.reference ||
      payment.amount !== booking.quote_minor ||
      payment.currency !== booking.currency
    ) {
      return { status: "pending" as const, referenceNumber: booking.reference_number };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: settled, error: settleError } = await supabaseAdmin.rpc("settle_press_release_payment", {
      _reference: data.reference,
      _amount_minor: payment.amount,
      _currency: payment.currency,
      _provider_transaction_id: String(payment.id),
    });
    if (settleError || !settled) return { status: "pending" as const, referenceNumber: booking.reference_number };
    return { status: "succeeded" as const, referenceNumber: booking.reference_number };
  });

export interface CloudPressBooking {
  id: string;
  referenceNumber: string;
  title: string;
  companyName: string;
  status: string;
  priceUsdCents: number;
  outlets: string[];
  publishedUrls: string[];
  createdAt: string;
  paidAt: string | null;
}

function toBooking(row: {
  id: string;
  reference_number: string;
  title: string;
  company_name: string;
  status: string;
  price_usd_cents: number | null;
  selected_outlets: unknown;
  published_urls: unknown;
  created_at: string;
  paid_at: string | null;
}): CloudPressBooking {
  const outlets = Array.isArray(row.selected_outlets)
    ? row.selected_outlets
        .map((item) => (item && typeof item === "object" && "label" in item ? String((item as { label: unknown }).label) : ""))
        .filter(Boolean)
    : [];
  const publishedUrls = Array.isArray(row.published_urls) ? row.published_urls.filter((url): url is string => typeof url === "string") : [];
  return {
    id: row.id,
    referenceNumber: row.reference_number,
    title: row.title,
    companyName: row.company_name,
    status: row.status,
    priceUsdCents: row.price_usd_cents ?? 0,
    outlets,
    publishedUrls,
    createdAt: row.created_at,
    paidAt: row.paid_at,
  };
}

const BOOKING_COLUMNS = "id, reference_number, title, company_name, status, price_usd_cents, selected_outlets, published_urls, created_at, paid_at";

/** The signed-in member's own press bookings, newest first. */
export const listMyPressBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("press_releases")
      .select(BOOKING_COLUMNS)
      .eq("user_id", context.userId)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error("Your press releases could not be loaded.");
    return (data ?? []).map(toBooking);
  });

async function requireAdmin(context: { supabase: { rpc: (name: "has_role", args: { _user_id: string; _role: "administrator" }) => PromiseLike<{ data: boolean | null; error: unknown }> }; userId: string }): Promise<void> {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "administrator" });
  if (error || data !== true) throw new Error("Administrator access required.");
}

/** Paid press bookings for the admin press desk. */
export const getPaidPressQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("press_releases")
      .select(`${BOOKING_COLUMNS}, content_draft, contact_name, contact_email, contact_phone, attachments`)
      .not("paid_at", "is", null)
      .order("paid_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("Press bookings could not be loaded.");
    return (data ?? []).map((row) => ({
      ...toBooking(row),
      contentDraft: row.content_draft,
      contactName: row.contact_name,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      attachments: Array.isArray(row.attachments) ? row.attachments.filter((path): path is string => typeof path === "string") : [],
    }));
  });

export const PRESS_DESK_STAGES = [
  "under_review",
  "additional_info_required",
  "approved",
  "in_production",
  "distribution_in_progress",
  "completed",
  "rejected",
] as const;

export const updatePressStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        bookingId: z.string().uuid(),
        status: z.enum(PRESS_DESK_STAGES),
        note: z.string().max(1000).default(""),
        publishedUrl: z.union([z.literal(""), z.string().url().max(500)]).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ok, error } = await supabaseAdmin.rpc("update_press_release_stage", {
      _id: data.bookingId,
      _status: data.status,
      _note: data.note,
      _published_url: data.publishedUrl,
    });
    if (error || !ok) throw new Error("This booking could not be updated.");
    return { ok: true };
  });
