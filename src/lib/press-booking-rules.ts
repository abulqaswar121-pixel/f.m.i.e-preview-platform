import { NGN_PER_USD, outletPriceUsd } from "@/lib/outlet-pricing";

export interface PricedOutlet {
  id: string;
  label: string;
  region: string;
  usd: number;
}

export interface PressQuote {
  outlets: PricedOutlet[];
  usdCents: number;
  chargeKobo: number;
}

interface CatalogueEntry {
  id: string;
  label: string;
  region: string;
  status: string;
  hidden?: boolean | undefined;
  priceNaira?: number | null | undefined;
  priceUsd?: number | null | undefined;
}

/**
 * Prices a booking from the official outlet list. Unknown, hidden or unlisted
 * outlets make the whole quote invalid, so a member can never pay a made-up price.
 */
export function quotePressBooking(outletIds: readonly string[], catalogue: readonly CatalogueEntry[]): PressQuote | null {
  const unique = [...new Set(outletIds)];
  if (unique.length === 0) return null;
  const outlets: PricedOutlet[] = [];
  for (const id of unique) {
    const entry = catalogue.find((item) => item.id === id);
    if (!entry || entry.status !== "verified" || entry.hidden) return null;
    const usd = outletPriceUsd(entry);
    if (!(usd > 0)) return null;
    outlets.push({ id: entry.id, label: entry.label, region: entry.region, usd });
  }
  const usdCents = outlets.reduce((sum, outlet) => sum + Math.round(outlet.usd * 100), 0);
  return { outlets, usdCents, chargeKobo: usdCentsToKobo(usdCents) };
}

/** Paystack charges in naira (kobo) at the price-sheet rate; the price shown is dollars. */
export function usdCentsToKobo(usdCents: number): number {
  return Math.round(usdCents * NGN_PER_USD);
}

export const PRESS_REFERENCE_PATTERN = /^fmie_press_[a-f0-9]{32}$/;
