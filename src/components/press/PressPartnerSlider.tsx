import { OutletLogo } from "@/components/press/OutletLogo";
import { outletLogoUrl } from "@/data/outlet-logos";

interface Channel {
  id: string;
  label: string;
  status: string;
}

/** Sliding strip of press partner logos shown before booking, to build trust. */
export function PressPartnerSlider({ channels }: { channels: Channel[] }) {
  const partners = channels.filter((channel) => channel.status === "verified" && outletLogoUrl(channel.id));
  if (partners.length === 0) return null;
  const loop = [...partners, ...partners];
  return (
    <section aria-label="Our press partners" className="border-y border-brand-border bg-white py-5">
      <p className="fmie-container text-center text-xs font-semibold uppercase tracking-[0.14em] text-brand-slate">
        Media we send your story to
      </p>
      <div className="group mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-ticker gap-8 group-hover:[animation-play-state:paused]">
          {loop.map((channel, index) => (
            <li
              key={`${channel.id}-${index}`}
              aria-hidden={index >= partners.length}
              className="flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-charcoal"
            >
              <OutletLogo id={channel.id} label={channel.label} size={32} />
              {channel.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
