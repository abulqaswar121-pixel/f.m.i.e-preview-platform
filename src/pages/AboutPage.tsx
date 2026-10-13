import { Link } from "@tanstack/react-router";
import { Building2, Compass, Layers, MapPin } from "lucide-react";

import { PageHeader } from "@/components/common/Primitives";
import { coreValues, headquarters, site } from "@/config/site";
import { useAsyncResource } from "@/hooks/useAsync";
import { api } from "@/services/api";

const MODULES = [
  {
    title: "News & Insights",
    to: "/news",
    body: "An editorial archive across seven desks, with named authors, published corrections and a hard separation between independent journalism and commercial content.",
  },
  {
    title: "Survey Marketplace",
    to: "/surveys",
    body: "Build Likert, multiple-choice and long-text surveys, collect responses, and read results with completion rates, filters and explicit representativeness caveats.",
  },
  {
    title: "Global Press Releases",
    to: "/press-releases",
    body: "Three distribution tiers, a twelve-state workflow, an administrator-verified channel catalogue and a written record of what was transmitted and where.",
  },
  {
    title: "Professional Services",
    to: "/services",
    body: "Four structured engagements with documented workflows, named deliverables and published limits on what can honestly be promised.",
  },
  {
    title: "F.M.I.E Commerce",
    to: "/shop",
    body: "Branded apparel, accessories and stationery, plus multi-unit corporate bundles with volume pricing and purchase-order billing.",
  },
] as const;

const ROADMAP = [
  {
    phase: "Phase one",
    title: "Brand, editorial and design system",
    body: "Identity, typography, colour, article archive, desk structure, disclosure labelling and the compliance language used across every commercial surface.",
    status: "In this preview",
  },
  {
    phase: "Phase two",
    title: "Accounts, roles and press-release booking",
    body: "Persona-based permissions, membership plans, the booking wizard, quotations, payment states and the campaign tracker with a dated workflow log.",
    status: "In this preview",
  },
  {
    phase: "Phase three",
    title: "Survey marketplace and research tooling",
    body: "Question types, conditional logic, live preview, plans and moderation, response capture, analytics filters, segments and demo-only export.",
    status: "In this preview",
  },
  {
    phase: "Phase four",
    title: "Commerce and corporate accounts",
    body: "Product catalogue, basket, checkout, invoicing, team seats, billing history and branded survey experiences for corporate plans.",
    status: "In this preview",
  },
  {
    phase: "Phase five",
    title: "International scaling",
    body: "Multi-territory distribution, translated survey instruments, regional desks and local research partners — modelled here through regions, countries and channel records.",
    status: "Modelled, not live",
  },
] as const;

export function AboutPage() {
  const authors = useAsyncResource(() => api.articles.authors(), [], []);

  return (
    <div>
      <PageHeader
        eyebrow={`About ${site.legalName}`}
        title={site.mission}
        description={site.description}
        breadcrumb={[{ label: "Home", to: "/" }, { label: "About" }]}
      />

      <div className="fmie-container space-y-12 py-10">
        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-bold text-brand-charcoal">What F.M.I.E is</h2>
            <div className="fmie-prose mt-4">
              <p className="fmie-dropcap">
                {site.tagline} is the operating principle behind everything on this platform.
                Business media is only useful when the reader can trust the boundary between
                reporting and selling, so F.M.I.E publishes that boundary explicitly: every article
                carries a named author and a disclosure tag, every press release campaign carries a
                dated workflow record, and every survey carries a statement of what its sample can
                and cannot support.
              </p>
              <p>
                Founded in {site.founded} and headquartered in London, the platform combines five
                modules that would normally sit in five separate vendors — an editorial archive, a
                survey marketplace, a press release distribution network, an executive services
                consultancy and a branded commerce store — behind one account, one permission model
                and one audit trail.
              </p>
              <p>
                This build is a demonstration preview. There is no live database, no payment
                processing, no email delivery and no file storage: state lives in your browser's
                local storage and resets when you clear it. The service layer is written as an async
                API boundary so a real backend can replace it without touching a single component.
              </p>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-lg border border-brand-border bg-white p-6">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-gold-dark">
                <MapPin className="h-4 w-4" /> {headquarters.label}
              </p>
              <address className="mt-3 not-italic text-sm leading-relaxed text-brand-charcoal">
                {headquarters.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p className="mt-3 text-sm text-brand-slate">{headquarters.telephone}</p>
              <p className="mt-1 text-xs text-brand-slate">{headquarters.hours}</p>
              <a
                href={headquarters.mapUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:underline"
              >
                <Building2 className="h-3.5 w-3.5" /> View on map
              </a>
            </div>
            <div className="rounded-lg border border-brand-border bg-brand-navy p-6 text-white">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-gold">
                <Compass className="h-4 w-4" /> Demonstration preview
              </p>
              <p className="mt-3 text-xs leading-relaxed text-white/80">{site.previewNotice}</p>
              <Link
                to="/editorial-policy"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-gold hover:underline"
              >
                Read the editorial policy →
              </Link>
            </div>
          </aside>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-brand-charcoal">Core values</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-slate">
            Seven values, each with a testable consequence for how the platform behaves rather than
            an aspiration.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value) => (
              <article
                key={value.id}
                className="rounded-lg border border-brand-border bg-white p-5"
              >
                <h3 className="font-display text-base font-semibold text-brand-navy">
                  {value.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-brand-slate">{value.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-brand-charcoal">
            The platform, module by module
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {MODULES.map((module, index) => (
              <Link
                key={module.title}
                to={module.to}
                className="group flex gap-4 rounded-lg border border-brand-border bg-white p-5 transition-colors hover:border-brand-navy/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-cream font-display text-sm font-bold text-brand-navy">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-display text-base font-semibold text-brand-charcoal group-hover:text-brand-navy">
                    {module.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-brand-slate">
                    {module.body}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-brand-charcoal">Editorial team</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-slate">
            Every published article on this platform carries an identifiable author with a stated
            credential. These are fictional bylines created for the demonstration preview.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {authors.data.map((author) => (
              <article
                key={author.name}
                className="flex gap-3 rounded-lg border border-brand-border bg-white p-4"
              >
                <img
                  src={author.avatarUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-full border border-brand-border bg-brand-cream object-cover"
                />
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-brand-charcoal">
                    {author.name}
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-brand-gold-dark">
                    {author.title}
                  </p>
                  {author.credential ? (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-brand-slate">
                      {author.credential}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-brand-charcoal">Build roadmap</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-slate">
            The platform was scoped in five phases so that brand and editorial integrity land before
            commercial surfaces. This preview implements the first four and models the fifth.
          </p>
          <ol className="mt-6 space-y-4">
            {ROADMAP.map((phase) => (
              <li
                key={phase.phase}
                className="flex gap-4 rounded-lg border border-brand-border bg-white p-5"
              >
                <Layers className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold-dark" />
                <div>
                  <p className="flex flex-wrap items-baseline gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-slate">
                    {phase.phase}
                    <span className="rounded-full bg-brand-cream px-2 py-0.5 text-[10px] normal-case tracking-normal text-brand-charcoal">
                      {phase.status}
                    </span>
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-brand-charcoal">
                    {phase.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-brand-slate">{phase.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
