import { useState } from "react";
import { outletLogoUrl } from "@/data/outlet-logos";

export function OutletLogo({ id, label, size = 40 }: { id: string; label: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const url = outletLogoUrl(id);
  const initials = label
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded border border-brand-border bg-white font-display text-sm font-bold text-brand-navy"
      style={{ width: size, height: size }}
    >
      {url && !failed ? (
        <img
          src={url}
          alt={`${label} logo`}
          width={size}
          height={size}
          decoding="async"
          className="h-full w-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}
