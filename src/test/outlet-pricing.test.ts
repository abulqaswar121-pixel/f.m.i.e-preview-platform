import { describe, expect, it } from "vitest";
import { outletPriceUsd } from "@/lib/outlet-pricing";

describe("press outlet prices in dollars", () => {
  it("converts Daily Independent ₦69,600 to $43.50", () => expect(outletPriceUsd({ priceNaira: 69600 })).toBe(43.5));
  it("keeps the client's dollar price when one is listed", () =>
    expect(outletPriceUsd({ priceNaira: 687000, priceUsd: 437.5 })).toBe(437.5));
});
