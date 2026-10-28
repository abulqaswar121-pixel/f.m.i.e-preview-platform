import { describe, expect, it } from "vitest";

import { isPaymentReturn, paymentReferenceFromSearch } from "@/lib/payment-return";

describe("payment return link", () => {
  it("reads the code when the link carries it twice", () => {
    const ref = "fmie_points_ddf5b81f48464e3186d659825481ead0";
    expect(paymentReferenceFromSearch({ payment: "return", reference: [ref, ref] })).toBe(ref);
  });

  it("falls back to trxref when reference is missing", () => {
    expect(paymentReferenceFromSearch({ trxref: "fmie_press_abc" })).toBe("fmie_press_abc");
  });

  it("returns nothing when there is no code", () => {
    expect(paymentReferenceFromSearch({ payment: "return" })).toBeUndefined();
    expect(isPaymentReturn({})).toBe(false);
  });
});
