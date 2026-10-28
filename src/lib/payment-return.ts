/**
 * The payment page sends members back with the payment code in the link
 * (`reference` and/or `trxref`). Older links carried it twice, which the router
 * reads as a list, so always take the first clean text value.
 */
export function paymentReferenceFromSearch(search: Record<string, unknown>): string | undefined {
  for (const key of ["reference", "trxref"] as const) {
    const raw = search[key];
    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) {
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return undefined;
}

/** True when the link shows the member has just come back from the payment page. */
export function isPaymentReturn(search: Record<string, unknown>): boolean {
  const flag = Array.isArray(search["payment"]) ? search["payment"][0] : search["payment"];
  return flag === "return" || paymentReferenceFromSearch(search) !== undefined;
}
