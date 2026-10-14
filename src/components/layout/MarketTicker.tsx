import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { api } from "@/services/api";
import type { MarketIndex } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Global financial market ticker.
 *
 * The preview has no live market feed; values are derived from the configured
 * seed with a bounded drift so the strip behaves like a ticker. It refreshes
 * every six seconds and pauses on hover.
 */
export function MarketTicker() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () => {
      api.market.indices().then((next) => {
        if (alive) setIndices(next);
      });
    };
    load();
    const timer = setInterval(load, 6000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  if (indices.length === 0) {
    return <div className="h-9 bg-brand-navy-dark" aria-hidden="true" />;
  }

  const strip = (keyPrefix: string) => (
    <div className="flex shrink-0 items-center" aria-hidden={keyPrefix === "b"}>
      {indices.map((index) => {
        const positive = index.change >= 0;
        return (
          <span
            key={`${keyPrefix}-${index.symbol}`}
            className="flex items-center gap-2 whitespace-nowrap px-5 text-[11px] font-medium text-white/85"
          >
            <span className="font-semibold tracking-[0.08em] text-white">{index.symbol}</span>
            <span className="tabular-nums text-white/70">
              {index.value.toLocaleString("en-GB", {
                minimumFractionDigits: index.value < 10 ? 4 : 2,
              })}
              {index.unit ? ` ${index.unit}` : ""}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 tabular-nums",
                positive ? "text-emerald-300" : "text-rose-300",
              )}
            >
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {positive ? "+" : ""}
              {index.changePercent.toFixed(2)}%
            </span>
          </span>
        );
      })}
    </div>
  );

  return (
    <div
      className="overflow-hidden border-b border-white/10 bg-brand-navy-dark py-2"
      role="marquee"
      aria-label="Global market indices"
    >
      <div className="fmie-ticker-track">
        {strip("a")}
        {strip("b")}
      </div>
    </div>
  );
}

export default MarketTicker;
