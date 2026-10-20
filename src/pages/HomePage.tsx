import { Link } from "@tanstack/react-router";
import { ArrowRight, Shirt } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { DisclosureBadge, Eyebrow, SectionHeading } from "@/components/common/Primitives";
import { HeroMedia } from "@/components/common/HeroMedia";
import { VideoShowcaseCard } from "@/components/common/VideoShowcaseCard";
import { DailyPoll } from "@/components/surveys/DailyPoll";
import { Typewriter } from "@/components/ui/Typewriter";
import { Button } from "@/components/ui/button";
import {
  contactEmail,
  formatDate,
  headquarters,
  livePositioning,
  newsCategories,
  site,
  westAfricaDesk,
} from "@/config/site";
import { useAsyncResource } from "@/hooks/useAsync";
import { useDatabase } from "@/services/api";
import { api } from "@/services/api";
import { SiteLink } from "@/components/common/SiteLink";

/**
 * Homepage: five deliberate blocks — film banner, positioning strip, poll +
 * two-sided spotlight, editorial desk, and a single visibility band (published
 * releases + custom kits). Everything else lives one click away in the nav.
 */
export function HomePage() {
  const articles = useAsyncResource(() => api.articles.list({ limit: 5 }), [], []);
  const publishedReleases = useAsyncResource(
    () => api.pressReleases.list({ status: "completed" }),
    [],
    [],
  );

  const database = useDatabase();
  const isHidden = (section: string): boolean => database.settings.hiddenSections.includes(section);

  const list = articles.data ?? [];
  const lead = list[0];
  const rest = list.slice(1, 5);
  const releases = (publishedReleases.data ?? []).slice(0, 3);

  return (
    <div>
      {/* 1 — Film banner */}
      {!isHidden("hero") ? (
        <section className="relative overflow-hidden bg-brand-navy-dark text-white">
          <div aria-hidden="true" className="fmie-orb -left-24 top-8 h-72 w-72 bg-brand-gold/35" />
          <div
            aria-hidden="true"
            className="fmie-orb -right-20 bottom-0 h-80 w-80 bg-brand-navy-light/50"
          />
          <HeroMedia />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-navy-dark via-brand-navy-dark/85 to-brand-navy/45"
          />
          <div className="fmie-container relative grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <Eyebrow className="text-brand-gold">{site.tagline}</Eyebrow>
              <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
                {database.settings.heroHeadline}
              </h1>
              <p className="mt-3 min-h-[1.6em] max-w-2xl font-display text-lg font-semibold text-brand-gold sm:text-xl">
                <Typewriter phrases={database.settings.heroRotatingLines} />
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-gold text-brand-navy-dark hover:bg-[#d4b87e]"
                >
                  <Link to="/surveys">Earn Answering Surveys</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/press-releases/book">Book Press Distribution</Link>
                </Button>
              </div>
              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                {[
                  ["Editorial desks", String(newsCategories.length)],
                  ["Live survey categories", "10"],
                  ["Distribution tiers", "3"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline gap-2">
                    <dd className="font-display text-xl font-bold text-brand-gold">{value}</dd>
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                      {label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
            <VideoShowcaseCard className="w-full" />
            <dl className="fmie-glass-dark col-span-full grid gap-x-6 gap-y-4 rounded-2xl px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: headquarters.label, value: headquarters.addressOneLine },
                { label: westAfricaDesk.label, value: westAfricaDesk.addressOneLine },
                {
                  label: "Survey rewards",
                  value: "Locked in escrow, released via Paystack on completion",
                },
                { label: "Press desk", value: contactEmail.press, mailto: contactEmail.press },
              ].map((cell) => (
                <div key={cell.label} className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-gold">
                    {cell.label}
                  </dt>
                  <dd className="mt-1 text-xs leading-relaxed text-white/80">
                    {cell.mailto ? (
                      <a className="hover:text-brand-gold" href={`mailto:${cell.mailto}`}>
                        {cell.value}
                      </a>
                    ) : (
                      cell.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-white/45">
              {livePositioning.heroCredit}
            </p>
          </div>
        </section>
      ) : null}

      {/* 2 — Positioning strip (copy adopted from the client's live site) */}
      {!isHidden("positioning") ? (
        <section className="border-b border-brand-border bg-brand-cream">
          <div className="fmie-container flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-bold text-brand-charcoal">
                {livePositioning.bandTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-slate">
                {livePositioning.bandBody}
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {livePositioning.pillars.map((pillar) => (
                <li key={pillar.title}>
                  <SiteLink
                    to={pillar.to as "/press-releases" | "/surveys" | "/services"}
                    className="flex items-center gap-1.5 rounded-full border border-brand-border bg-white px-4 py-2 text-xs font-semibold text-brand-navy hover:border-brand-gold"
                  >
                    {pillar.title}
                    <ArrowRight className="h-3 w-3 text-brand-gold-dark" />
                  </SiteLink>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* 3 — Daily poll + two-sided spotlight */}
      {!isHidden("poll") ? (
        <section className="border-b border-brand-border bg-white">
          <div className="fmie-container grid gap-6 py-10 lg:grid-cols-[1fr_1.1fr] lg:items-stretch">
            <DailyPoll />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col rounded-2xl border border-brand-border bg-brand-cream p-6 shadow-lg shadow-brand-navy/10 transition-transform duration-300 hover:-translate-y-1">
                <p className="fmie-eyebrow">For Researchers</p>
                <h3 className="mt-2 font-display text-xl font-bold text-brand-charcoal">
                  Guaranteed High-Quality Survey Data
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-slate">
                  Fund a quota, lock respondent rewards in escrow and read a live results dashboard
                  with demographic filters and CSV export.
                </p>
                <Button asChild className="mt-4 bg-brand-navy text-white hover:bg-brand-navy-dark">
                  <Link to="/surveys/create">Launch research</Link>
                </Button>
              </div>
              <div className="flex flex-col rounded-2xl border border-brand-gold/40 bg-gradient-to-br from-brand-navy to-brand-navy-dark p-6 text-white shadow-xl shadow-brand-navy/30 transition-transform duration-300 hover:-translate-y-1">
                <p className="fmie-eyebrow text-brand-gold">For Public</p>
                <h3 className="mt-2 font-display text-xl font-bold">
                  Earn Cash Rewards Per Survey
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/80">
                  Answer live surveys in minutes, watch ₦ rewards land in your wallet instantly and
                  withdraw from ₦2,000 to any Nigerian bank account.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-4 border-brand-gold bg-transparent text-brand-gold hover:bg-brand-gold hover:text-brand-navy-dark"
                >
                  <Link to="/surveys">Start earning</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* 4 — Editorial desk */}
      {!isHidden("news") ? (
        <section className="bg-brand-cream">
          <div className="fmie-container py-10 sm:py-12">
            <SectionHeading
              eyebrow="News & Insights"
              title="Today's editorial lead"
              description="Independent business journalism, labelled at the point of publication and separated from paid content."
              action={{ label: "All news & insights", to: "/news" }}
            />
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
              {lead ? (
                <article className="fmie-card overflow-hidden">
                  <Link to="/news/$slug" params={{ slug: lead.slug }} className="block">
                    <img
                      src={lead.featuredImage}
                      alt=""
                      className="aspect-[16/9] w-full object-cover"
                    />
                  </Link>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="navy">{lead.category}</Badge>
                      {lead.disclosureTag ? <DisclosureBadge tag={lead.disclosureTag} /> : null}
                      <span className="text-xs text-brand-slate">
                        {formatDate(lead.publishedAt)} · {lead.readTime}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-xl font-bold leading-tight text-brand-charcoal sm:text-2xl">
                      <Link
                        to="/news/$slug"
                        params={{ slug: lead.slug }}
                        className="hover:text-brand-navy"
                      >
                        {lead.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-slate">
                      {lead.subtitle}
                    </p>
                  </div>
                </article>
              ) : null}
              <ul className="fmie-card flex h-full flex-col divide-y divide-brand-border overflow-hidden">
                {rest.map((article) => (
                  <li key={article.id} className="flex-1">
                    <Link
                      to="/news/$slug"
                      params={{ slug: article.slug }}
                      className="flex h-full items-center gap-3 px-4 py-3 hover:bg-brand-cream"
                    >
                      <img
                        src={article.featuredImage}
                        alt=""
                        className="h-14 w-20 shrink-0 rounded-md object-cover"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-brand-charcoal">
                          {article.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-brand-slate">
                          {article.category} · {article.author.name} · {article.readTime}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {/* 5 — Visibility band: published releases + custom kits */}
      {!isHidden("visibility") ? (
        <section className="bg-brand-navy-dark text-white">
          <div className="fmie-container grid gap-8 py-10 sm:py-12 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="fmie-eyebrow text-brand-gold">Press releases</p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                Recently published announcements
              </h2>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/70">
                Campaigns that completed the six-stage pipeline through partner desks — publication
                always at the editor's discretion.
              </p>
              <ul className="mt-5 space-y-3">
                {releases.map((release) => (
                  <li
                    key={release.id}
                    className="fmie-glass-dark flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-3 transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{release.title}</p>
                      <p className="text-[11px] text-white/60">
                        {release.companyName} · {formatDate(release.submittedDate)}
                      </p>
                    </div>
                    <Badge tone="gold">Partner Distribution</Badge>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 border-brand-gold bg-transparent text-brand-gold hover:bg-brand-gold hover:text-brand-navy-dark"
              >
                <Link to="/press-releases/book">Book distribution</Link>
              </Button>
            </div>
            <div className="fmie-glass-dark flex flex-col justify-between rounded-3xl p-6 shadow-2xl shadow-brand-navy-dark/40 transition-transform duration-300 hover:-translate-y-1">
              <div>
                <Shirt className="h-6 w-6 text-brand-gold" />
                <h2 className="mt-3 font-display text-2xl font-bold">Custom Kits & Jerseys</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/80">
                  Football clubs, academies and corporate teams: build your roster, choose club
                  colours and get an official invoice quote for seasonal custom kits.
                </p>
              </div>
              <Button
                asChild
                className="mt-5 bg-brand-gold text-brand-navy-dark hover:bg-[#d4b87e]"
              >
                <Link to="/shop/team-kits">Design your kit</Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default HomePage;
