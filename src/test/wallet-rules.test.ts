import { describe, expect, it } from "vitest";

import { isValidWithdrawalAmount, matchesPaystackPayment, MINIMUM_WITHDRAWAL_MINOR } from "@/lib/wallet-rules";

describe("wallet safeguards", () => {
  it("accepts the configured ₦2,000 minimum and rejects smaller withdrawals", () => {
    expect(MINIMUM_WITHDRAWAL_MINOR).toBe(200_000);
    expect(isValidWithdrawalAmount(200_000)).toBe(true);
    expect(isValidWithdrawalAmount(199_900)).toBe(false);
  });

  it("only accepts a successful payment matching the saved reference, amount, and currency", () => {
    const expected = { reference: "fmie_points_order1", amountMinor: 500_000, currency: "NGN" };
    expect(matchesPaystackPayment({ status: "success", reference: expected.reference, amount: expected.amountMinor, currency: expected.currency }, expected)).toBe(true);
    expect(matchesPaystackPayment({ status: "success", reference: expected.reference, amount: 499_999, currency: expected.currency }, expected)).toBe(false);
    expect(matchesPaystackPayment({ status: "failed", reference: expected.reference, amount: expected.amountMinor, currency: expected.currency }, expected)).toBe(false);
  });
});