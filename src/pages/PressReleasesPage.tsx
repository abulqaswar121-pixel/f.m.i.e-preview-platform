import { Link } from "@tanstack/react-router";
import { BadgeCheck, Globe2, Megaphone, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { PageHeader } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { distributionChannelTypes, formatCurrency, prStatuses, prTiers } from "@/config/site";
import { useAsyncResource } from "@/hooks/useAsync";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

export function PressReleasesPage() {
  const channels = useAsyncResource(() => api.pressReleases.channels(), [], []);

  return (
    <div>
      <PageHeader
        eyebrow="Global Press Release Portal"
        title="Booking, distribution and transparent campaign tracking"
        description="Three service tiers, a twelve-state workflow you can follow in real time, and a distribution catalogue where every channel carries an administrator-recorded verification status."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Global Press Releases" }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
            <Link to="/press-releases/book">Book a press release</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard" search={{ tab: "press" }}>
              Track my campaigns
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="fmie-container space-y-12 py-10">
        <ComplianceBanner variant="distribution" showPoints />

        <section>
          <h2 className="font-display text-2xl font-bold text-brand-charcoal">Service tiers</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-slate">
            Every tier includes editorial review, a compliance check on claims and disclosures, and
            a written record of exactly what was distributed and where. What changes between tiers
            is reach, turnaround and the depth of reporting.
          </p>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {prTiers.map((tier, index) => (
              <article
                key={tier.id}
                className={cn(
                  "flex flex-col rounded-lg border bg-white p-6 shadow-sm",
                  index === 1
                    ? "border-brand-gold ring-2 ring-brand-gold/40"
                    : "border-brand-border",
                )}
              >
                <div className="flex items-center justify-between">
                  <Badge tone={index === 2 ? "gold" : index === 1 ? "navy" : "cream"}>
                    {tier.shortName}
                  </Badge>
                  {index === 1 ? <Badge tone="gold">Most booked</Badge> : null}
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold text-brand-charcoal">
                  {tier.name}
                </h3>
                <p className="mt-1 font-display text-3xl font-bold text-brand-navy">
                  from {formatCurrency(tier.priceFrom)}
                </p>
                <p className="mt-1 text-xs text-brand-slate">{tier.turnaround} · excludes VAT</p>
                <p className="mt-3 text-sm leading-relaxed text-brand-slate">{tier.summary}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {tier.includes.map((line) => (
                    <li key={line} className="flex gap-2 text-xs leading-relaxed text-brand-slate">
                      <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-md bg-brand-cream px-3 py-2 text-[11px] text-brand-slate">
                  <span className="font-semibold text-brand-charcoal">Best for: </span>
                  {tier.bestFor}
                </p>
                <Button asChild className="mt-4 bg-brand-navy text-white hover:bg-brand-navy-light">
                  <Link to="/press-releases/book">Start a {tier.shortName} booking</Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-brand-charcoal">
            The twelve-state workflow
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-slate">
            Every campaign moves through the same tracked states. You see the same timeline the desk
            sees, with a dated note and a named actor against each event.
          </p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {prStatuses.map((status, index) => (
              <li key={status.id} className="rounded-lg border border-brand-border bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-slate">
                  {status.terminal ? "Terminal state" : `Stage ${status.stage}`} ·{" "}
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-sm font-semibold text-brand-charcoal">{status.label}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-brand-slate">
                  {status.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section id="catalogue">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-charcoal">
                Distribution catalogue
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-slate">
                Channels are configured by an administrator with a status, a verification date and a
                recorded note. Channels marked pending verification are excluded from quotations
                until verification is re-recorded — they are shown here for transparency, not for
                sale.
              </p>
            </div>
            <Megaphone className="h-6 w-6 text-brand-gold-dark" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {(channels.data ?? []).map((channel) => (
              <article
                key={channel.id}
                className={cn(
                  "rounded-lg border bg-white p-5",
                  channel.status === "verified"
                    ? "border-brand-border"
                    : channel.status === "pending_verification"
                      ? "border-warning/50 bg-warning/5"
                      : "border-danger/40 bg-danger/5",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-base font-semibold text-brand-charcoal">
                    {channel.label}
                  </h3>
                  <Badge
                    tone={
                      channel.status === "verified"
                        ? "success"
                        : channel.status === "pending_verification"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {channel.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-brand-gold-dark">
                  {distributionChannelTypes[channel.type].label} · {channel.region}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-brand-slate">{channel.audience}</p>
                <p className="mt-2 text-xs leading-relaxed text-brand-slate">
                  {channel.administratorNote}
                </p>
                <p className="mt-3 border-t border-brand-border pt-2 text-xs text-brand-slate">
                  {channel.indicativePrice === 0
                    ? "Included in every tier"
                    : `Indicative channel fee: ${formatCurrency(channel.indicativePrice)}`}
                  {channel.verifiedOn ? ` · verified ${channel.verifiedOn.slice(0, 10)}` : ""}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(distributionChannelTypes).map(([type, definition]) => (
              <div key={type} className="rounded-lg border border-brand-border bg-brand-cream p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-charcoal">
                  <Globe2 className="h-4 w-4 text-brand-navy" />
                  {definition.label}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-brand-slate">
                  {definition.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-brand-border bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-brand-charcoal">
                Ready to put an announcement in front of the right rooms?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-slate">
                The booking wizard takes about six minutes. You will receive a reference number
                immediately and a priced quotation after editorial and compliance review.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <Button
                asChild
                size="lg"
                className="bg-brand-navy text-white hover:bg-brand-navy-light"
              >
                <Link to="/press-releases/book">Book a press release</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact" search={{ department: "press" }}>
                  Talk to the press desk
                </Link>
              </Button>
            </div>
          </div>
          <p className="mt-5 flex items-start gap-2 border-t border-brand-border pt-4 text-[11px] leading-relaxed text-brand-slate">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold-dark" />
            No placement in a named third-party publication is guaranteed. Outlet names and logos
            are not used in F.M.I.E marketing unless a contractual authority is held and
            independently verified.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PressReleasesPage;
