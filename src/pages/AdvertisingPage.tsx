import { Link } from "@tanstack/react-router";
import { BadgeCheck, Ban, LineChart, Tag } from "lucide-react";

import { SiteLink } from "@/components/common/SiteLink";

import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { DisclosureBadge, PageHeader } from "@/components/common/Primitives";
import { contactRoutes, formatCurrency, prAddOns, prTiers } from "@/config/site";
import type { DisclosureTag } from "@/types";

const PRODUCTS = [
  {
    title: "Press release distribution",
    detail:
      "Preparation, coordination and confirmed transmission through owned commercial desks, verified partner channels and syndication wires. Priced by tier with published add-ons.",
    link: "/press-releases",
    linkLabel: "See tiers and the channel catalogue",
    disclosure: "Partner Dispatch" as DisclosureTag,
  },
  {
    title: "Sponsored research",
    detail:
      "A named sponsor funds a survey instrument, its fieldwork and a written analysis. The sponsor is identified in the publication and may review factual accuracy only — never conclusions, framing or the headline.",
    link: "/surveys/plans",
    linkLabel: "See research plans and limits",
    disclosure: "Sponsored Research" as DisclosureTag,
  },
  {
    title: "Commercial desk placements",
    detail:
      "Company dispatches, partner contributions and commercial features published on F.M.I.E commercial desks, produced separately from the newsroom and labelled at the point of publication.",
    link: "/news",
    linkLabel: "Browse the archive and its disclosure tags",
    disclosure: "Partner Dispatch" as DisclosureTag,
  },
  {
    title: "Executive services",
    detail:
      "Profile writing, digital marketing contracting, pitching advisory and Wikipedia policy guidance — scoped, priced and delivered as professional services rather than as editorial placements.",
    link: "/services",
    linkLabel: "Review the four engagements",
    disclosure: "Independent Editorial" as DisclosureTag,
  },
];

const PROHIBITED = [
  "Anything implying guaranteed publication, coverage or ranking in a named third-party outlet.",
  "Use of third-party publisher names, marks or front pages to suggest affiliation or endorsement.",
  "Unlabelled sponsored content, native advertising presented as newsroom reporting, or undisclosed paid contributions.",
  "Survey results presented as statistically representative without a stated sampling method and base.",
  "Financial promotion of unregulated investment opportunities, or copy promising returns.",
  "Claims about individuals that are unverified, defamatory or intrusive.",
  "Products and services that are unlawful in the United Kingdom or in the territories being targeted.",
];

const GUARANTEES = [
  {
    title: "What you always receive",
    icon: BadgeCheck,
    items: [
      "A written scope, a named desk owner and a dated workflow record for every campaign.",
      "Confirmed transmission receipts for owned and partner channels, with verification dates.",
      "Disclosure labelling applied at the point of publication, never retrofitted on request.",
      "A completion dossier listing exactly what was distributed and where it appeared.",
    ],
  },
  {
    title: "What is never for sale",
    icon: Ban,
    items: [
      "Editorial coverage, interviews, opinion columns or newsroom commissioning decisions.",
      "Placement in a named third-party publication, broadcaster or newswire.",
      "Search ranking, encyclopaedic article survival, or investment outcomes.",
      "Access to respondent identities from self-selected survey samples.",
    ],
  },
];

export function AdvertisingPage() {
  const press = contactRoutes.find((route) => route.id === "press") ?? contactRoutes[2]!;

  return (
    <div>
      <PageHeader
        eyebrow="Advertising & sponsorship"
        title="What can be bought, what cannot, and how it is labelled"
        description="Commercial activity on this platform is disclosed at the point of publication and produced separately from the newsroom. This page states the boundaries in full."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Advertising & Sponsorship" }]}
      />

      <div className="fmie-container space-y-10 py-10">
        <ComplianceBanner variant="editorial" />

        <section>
          <h2 className="font-display text-2xl font-bold text-brand-charcoal">
            Commercial products
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {PRODUCTS.map((product) => (
              <article
                key={product.title}
                className="rounded-lg border border-brand-border bg-white p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-brand-charcoal">
                    {product.title}
                  </h3>
                  <DisclosureBadge tag={product.disclosure} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-brand-slate">{product.detail}</p>
                <SiteLink
                  to={product.link}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy hover:underline"
                >
                  <Tag className="h-3.5 w-3.5" /> {product.linkLabel}
                </SiteLink>
              </article>
            ))}
          </div>
          <p className="mt-4 rounded-md bg-brand-cream px-4 py-3 text-xs leading-relaxed text-brand-slate">
            The “Independent Editorial” badge above marks services that are not advertising at all:
            they are professional engagements delivered to a written scope and are never presented
            as editorial coverage.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-brand-charcoal">
            Published rate card
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-slate">
            Distribution tiers and add-ons are configured by an administrator, so the figures below
            are the current values in this preview rather than a fixed price list. All amounts
            exclude VAT.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {prTiers.map((tier) => (
              <div key={tier.id} className="rounded-lg border border-brand-border bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-gold-dark">
                  {tier.shortName}
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-brand-navy">
                  from {formatCurrency(tier.priceFrom)}
                </p>
                <p className="mt-1 text-xs text-brand-slate">{tier.turnaround}</p>
                <p className="mt-3 text-xs leading-relaxed text-brand-slate">{tier.summary}</p>
                <ul className="mt-3 space-y-1">
                  {tier.regions.map((region) => (
                    <li key={region} className="text-[11px] text-brand-slate">
                      · {region}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {prAddOns.map((addOn) => (
              <div
                key={addOn.id}
                className="rounded-md border border-brand-border bg-white px-4 py-3"
              >
                <p className="text-xs font-semibold text-brand-charcoal">{addOn.label}</p>
                <p className="mt-1 font-display text-base font-bold text-brand-navy">
                  {formatCurrency(addOn.price)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {GUARANTEES.map((block) => {
            const Icon = block.icon;
            return (
              <div key={block.title} className="rounded-lg border border-brand-border bg-white p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-brand-charcoal">
                  <Icon className="h-5 w-5 text-brand-navy" /> {block.title}
                </h2>
                <ul className="mt-4 space-y-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-2 text-xs leading-relaxed text-brand-slate">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        <section className="rounded-lg border border-danger/30 bg-danger/5 p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-brand-charcoal">
            <Ban className="h-5 w-5 text-danger" /> Not accepted on this platform
          </h2>
          <ul className="mt-4 grid gap-2 lg:grid-cols-2">
            {PROHIBITED.map((item) => (
              <li
                key={item}
                className="flex gap-2 rounded-md bg-white/70 px-3 py-2 text-xs leading-relaxed text-brand-slate"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-brand-charcoal">
              <LineChart className="h-5 w-5 text-brand-navy" /> Measurement and reporting
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-slate">
              Campaign reporting covers what was produced, which channels transmitted it, when
              transmission was confirmed and which placements were recorded. Where a channel
              provides audience statistics, they are reported with their source and period.
              Earned-media outreach is logged with its outcome, including refusals — it is never
              counted as delivery.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-slate">
              Survey-derived material reports the instrument, field dates, achieved sample and
              collection method, and always carries the representativeness limitation.
            </p>
            <Link
              to="/press-releases/book"
              className="mt-4 inline-block text-sm font-semibold text-brand-navy hover:underline"
            >
              Start a booking →
            </Link>
          </div>

          <div className="rounded-lg border border-brand-border bg-brand-cream p-6">
            <h2 className="font-display text-lg font-semibold text-brand-charcoal">
              Talk to the commercial desk
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-brand-slate">{press.description}</p>
            <p className="mt-4 text-sm">
              <a
                href={`mailto:${press.email}`}
                className="font-semibold text-brand-navy hover:underline"
              >
                {press.email}
              </a>
            </p>
            <p className="mt-1 text-xs text-brand-slate">
              {press.telephone} · expected response {press.responseTime.toLowerCase()}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdvertisingPage;
