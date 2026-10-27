import { OutletLogo } from "@/components/press/OutletLogo";
import { outletLogoUrl } from "@/data/outlet-logos";

interface Channel {
  id: string;
  label: string;
  status: string;
}

/**
 * Sliding strip of press partner logos, shown to build trust before booking.
 * `light` sits on a white page band; `dark` sits inside the navy film banner.
 */
export function PressPartnerSlider({
  channels,
  variant = "light",
}: {
  channels: Channel[];
  variant?: "light" | "dark";
}) {
  const partners = channels.filter(
    (channel) => channel.status === "verified" && outletLogoUrl(channel.id),
  );
  if (partners.length === 0) return null;
  const loop = [...partners, ...partners];
  const dark = variant === "dark";
  return (
    <section
      aria-label="Our press partners"
      className={
        dark ? "fmie-glass-dark rounded-2xl px-4 py-3" : "border-y border-brand-border bg-white py-5"
      }
    >
      <p
        className={
          dark
            ? "text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold"
            : "fmie-container text-center text-xs font-semibold uppercase tracking-[0.14em] text-brand-slate"
        }
      >
        Media we send your story to
      </p>
      <div
        className={
          dark
            ? "group mt-2 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
            : "group mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        }
      >
        <ul
          className={
            dark
              ? "flex w-max animate-ticker gap-5 group-hover:[animation-play-state:paused]"
              : "flex w-max animate-ticker gap-8 group-hover:[animation-play-state:paused]"
          }
        >
          {loop.map((channel, index) => (
            <li
              key={`${channel.id}-${index}`}
              aria-hidden={index >= partners.length}
              className={
                dark
                  ? "flex shrink-0 items-center gap-2 text-xs font-semibold text-white"
                  : "flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-charcoal"
              }
            >
              <OutletLogo id={channel.id} label={channel.label} size={dark ? 28 : 32} />
              {channel.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
