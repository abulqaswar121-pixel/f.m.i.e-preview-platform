import { describe, expect, it } from "vitest";

import { seedDistributionChannels } from "@/data";
import { quotePressBooking, usdCentsToKobo } from "@/lib/press-booking-rules";

describe("press booking quote", () => {
  it("prices Daily Independent at $43.50 and charges ₦69,600", () => {
    const quote = quotePressBooking(["ch-001"], seedDistributionChannels);
    expect(quote?.usdCents).toBe(4350);
    expect(quote?.chargeKobo).toBe(6_960_000);
  });

  it("adds outlets together and counts a repeated outlet once", () => {
    const one = quotePressBooking(["ch-001"], seedDistributionChannels)!;
    const two = quotePressBooking(["ch-001", "ch-002", "ch-001"], seedDistributionChannels)!;
    expect(two.outlets).toHaveLength(2);
    expect(two.usdCents).toBeGreaterThan(one.usdCents);
  });

  it("refuses unknown outlets and empty bookings", () => {
    expect(quotePressBooking(["not-an-outlet"], seedDistributionChannels)).toBeNull();
    expect(quotePressBooking([], seedDistributionChannels)).toBeNull();
  });

  it("converts dollars to naira at ₦1,600 = $1", () => {
    expect(usdCentsToKobo(100)).toBe(160_000);
  });
});
