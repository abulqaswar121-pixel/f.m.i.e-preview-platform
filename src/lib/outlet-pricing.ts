/** Naira-to-dollar rate taken from the client's own price sheet (Forbes Africa: ₦10,000,000 = $6,250). */
export const NGN_PER_USD = 1600;

/** Every outlet is sold in US dollars; Naira-only rates are converted at the price-sheet rate. */
export function outletPriceUsd(channel: { priceNaira?: number | null | undefined; priceUsd?: number | null | undefined }): number {
  if (channel.priceUsd != null) return channel.priceUsd;
  if (channel.priceNaira != null) return Math.round((channel.priceNaira / NGN_PER_USD) * 100) / 100;
  return 0;
}

export function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
