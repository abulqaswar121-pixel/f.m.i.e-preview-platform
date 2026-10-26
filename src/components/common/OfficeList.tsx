import { MapPin } from "lucide-react";

import { offices } from "@/config/site";

/** Every official office, head office first, each with a map link. */
export function OfficeList() {
  return (
    <div className="rounded-lg border border-brand-border bg-white p-6">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-gold-dark">
        <MapPin className="h-4 w-4" /> Our offices
      </p>
      <ul className="mt-3 divide-y divide-brand-border">
        {offices.map((item) => (
          <li key={item.label} className="py-3 first:pt-0 last:pb-0">
            <p className="text-sm font-semibold text-brand-charcoal">
              {item.country}
              {item.label === "Head Office" ? <span className="ml-2 text-xs font-medium text-brand-gold-dark">Head office</span> : null}
            </p>
            <address className="mt-1 not-italic text-xs leading-relaxed text-brand-slate">{item.addressOneLine}</address>
            <a href={item.mapUrl} target="_blank" rel="noreferrer noopener" className="mt-1 inline-block text-xs font-semibold text-brand-navy hover:underline">
              View on map
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
