/** Small Paystack helpers shared by server functions. The secret is always passed in, never read here. */

export interface VerifiedPaystackPayment {
  id: number | string;
  status: string;
  reference: string;
  amount: number;
  currency: string;
}

export async function initializePaystack(
  secret: string,
  body: { email: string; amount: number; reference: string; callback_url: string; metadata: Record<string, unknown> },
): Promise<string | null> {
  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, currency: "NGN" }),
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok || !payload || typeof payload !== "object" || !("data" in payload)) return null;
    const data = (payload as { data: unknown }).data;
    if (!data || typeof data !== "object" || !("authorization_url" in data)) return null;
    const url = (data as { authorization_url: unknown }).authorization_url;
    return typeof url === "string" ? url : null;
  } catch {
    return null;
  }
}

export async function verifyPaystack(reference: string, secret: string): Promise<VerifiedPaystackPayment | null> {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object" || !("data" in payload)) return null;
    const data = (payload as { data: Record<string, unknown> | null }).data;
    if (!data || typeof data !== "object") return null;
    const { id, status, reference: ref, amount, currency } = data;
    if (typeof status !== "string" || typeof ref !== "string" || typeof amount !== "number" || typeof currency !== "string") return null;
    if (typeof id !== "number" && typeof id !== "string") return null;
    return { id, status, reference: ref, amount, currency };
  } catch {
    return null;
  }
}
