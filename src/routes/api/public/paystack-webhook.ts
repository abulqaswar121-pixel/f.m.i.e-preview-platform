import { createFileRoute } from "@tanstack/react-router";

import { matchesPaystackPayment } from "@/lib/wallet-rules";

export const Route = createFileRoute("/api/public/paystack-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYSTACK_SECRET_KEY"];
        if (!secret) return new Response("Payment service is not configured", { status: 503 });
        const signature = request.headers.get("x-paystack-signature");
        const body = await request.text();
        if (!signature || !(await isValidPaystackSignature(body, signature, secret))) {
          return new Response("Invalid signature", { status: 401 });
        }
        let payload: unknown;
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }
        if (!isChargeSuccess(payload)) return Response.json({ received: true });

        const verified = await verifyPayment(payload.data.reference, secret);
        if (!verified || verified.reference !== payload.data.reference) {
          return new Response("Payment verification pending", { status: 202 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: purchase, error: purchaseError } = await supabaseAdmin
          .from("wallet_point_purchases")
          .select("reference, amount_minor, currency")
          .eq("reference", verified.reference)
          .maybeSingle();
        if (purchaseError || !purchase || !matchesPaystackPayment(verified, {
          reference: purchase.reference,
          amountMinor: purchase.amount_minor,
          currency: purchase.currency,
        })) {
          return new Response("Payment does not match a pending purchase", { status: 400 });
        }
        const { data: settled, error } = await supabaseAdmin.rpc("settle_wallet_point_purchase", {
          _reference: verified.reference,
          _amount_minor: verified.amount,
          _currency: verified.currency,
          _provider_transaction_id: String(verified.id),
        });
        if (error || !settled) return new Response("Payment settlement failed", { status: 500 });
        return Response.json({ received: true });
      },
    },
  },
});

async function isValidPaystackSignature(body: string, signature: string, secret: string): Promise<boolean> {
  if (!/^[a-fA-F0-9]{128}$/.test(signature)) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
  const expected = Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
  let difference = expected.length ^ signature.length;
  for (let index = 0; index < Math.min(expected.length, signature.length); index += 1) {
    difference |= expected.charCodeAt(index) ^ signature.toLowerCase().charCodeAt(index);
  }
  return difference === 0;
}

interface PaystackPayment {
  id: number | string;
  status: string;
  reference: string;
  amount: number;
  currency: string;
}

function isChargeSuccess(value: unknown): value is { event: "charge.success"; data: { reference: string } } {
  return !!value && typeof value === "object" && "event" in value && value.event === "charge.success" && "data" in value && !!value.data && typeof value.data === "object" && "reference" in value.data && typeof value.data.reference === "string";
}

async function verifyPayment(reference: string, secret: string): Promise<PaystackPayment | null> {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("data" in payload)) return null;
    const data = payload.data;
    if (!data || typeof data !== "object" || !("status" in data) || !("reference" in data) || !("amount" in data) || !("currency" in data) || !("id" in data)) return null;
    if (typeof data.status !== "string" || typeof data.reference !== "string" || typeof data.amount !== "number" || typeof data.currency !== "string" || (typeof data.id !== "number" && typeof data.id !== "string")) return null;
    return { id: data.id, status: data.status, reference: data.reference, amount: data.amount, currency: data.currency };
  } catch {
    return null;
  }
}