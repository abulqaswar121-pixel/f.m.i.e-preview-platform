import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Globe2, Megaphone, PenLine, ShieldCheck } from "lucide-react";

import { DisclosureBadge } from "@/components/common/Primitives";
import { SectionHeading } from "@/components/common/Primitives";
import { Typewriter } from "@/components/ui/Typewriter";
import { Eyebrow } from "@/components/common/Primitives";
import { NewsletterForm } from "@/components/layout/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import { DistributionBars } from "@/components/surveys/SurveyResultsChart";
import { SurveyCard } from "@/components/surveys/SurveyCard";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import {
  compliance,
  contactEmail,
  formatDate,
  formatCurrency,
  livePositioning,
  newsCategories,
  prTiers,
  site,
} from "@/config/site";
import { SiteLink } from "@/components/common/SiteLink";
import { useAsyncResource } from "@/hooks/useAsync";
import { api } from "@/services/api";

export function HomePage() {
  const articles = useAsyncResource(() => api.articles.list({ limit: 7 }), [], []);
  const surveys = useAsyncResource(() => api.surveys.list({ status: "active", limit: 4 }), [], []);
  const products = useAsyncResource(() => api.products.featured(3), [], []);
  const services = useAsyncResource(() => api.services.list(), [], []);

  const lead = articles.data.find((article) => article.isFeatured) ?? articles.data[0];
  const secondary = articles.data.filter((article) => article.id !== lead?.id).slice(0, 4);
  const spotlight = surveys.data.find(
    (survey) => survey.distribution && survey.distribution.length > 0,
  );
  const spotlightQuestion = spotlight?.questions[0];
  const spotlightDistribution = spotlight?.distribution?.find(
    (entry) => entry.questionId === spotlightQuestion?.id,
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-navy-dark text-white">
        <img
          src="/media/hero-field.webp"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-navy-dark via-brand-navy-dark/88 to-brand-navy/55"
        />
        <div className="fmie-container relative grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <Eyebrow className="text-brand-gold">{site.tagline}</Eyebrow>
            <h1 className="mt-4 min-h-[2.16em] max-w-2xl font-display text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
              <span className="sr-only">{livePositioning.heroRotatingLines[0]}</span>
              <span aria-hidden="true">
                <Typewriter phrases={livePositioning.heroRotatingLines} />
              </span>
            </h1>
            <p className="mt-3 max-w-2xl font-display text-lg font-semibold text-brand-gold sm:text-xl">
              Where Global Business, Ideas &amp; Opportunities Meet.
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Discover verified business intelligence, participate in independent research, amplify
              corporate visibility, and connect with international markets.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-brand-gold text-brand-navy-dark hover:bg-[#d4b87e]"
              >
                <Link to="/news">Explore News &amp; Insights</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/surveys/create">Create a Survey</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/press-releases/book">Book a Press Release</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6 text-center sm:text-left">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                  Editorial desks
                </dt>
                <dd className="mt-1 font-display text-2xl font-bold text-brand-gold">10</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                  Survey categories
                </dt>
                <dd className="mt-1 font-display text-2xl font-bold text-brand-gold">10</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-white/60">
                  Distribution tiers
                </dt>
                <dd className="mt-1 font-display text-2xl font-bold text-brand-gold">3</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-white/15 bg-white/5 p-6 backdrop-blur">
            <h2 className="font-display text-lg font-semibold text-white">
              The platform in one view
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                {
                  icon: PenLine,
                  title: "Independent newsroom",
                  body: "Ten editorial desks with strict separation of paid and editorial content.",
                },
                {
                  icon: BarChart3,
                  title: "Survey marketplace",
                  body: "Free and premium research with moderation, analytics and documented consent.",
                },
                {
                  icon: Megaphone,
                  title: "Press release portal",
                  body: "Three tiers, twelve tracked workflow states, transparent distribution reporting.",
                },
                {
                  icon: Globe2,
                  title: "Executive services",
                  body: "Profile writing, marketing contracting, representation and Wikipedia advisory.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                  <span>
                    <span className="block font-semibold text-white">{item.title}</span>
                    <span className="block text-xs leading-relaxed text-white/70">{item.body}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-white/15 pt-3 text-[11px] leading-relaxed text-white/60">
              {compliance.noAffiliation}
            </p>
          </div>
          <p className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-white/45">
            {livePositioning.heroCredit}
          </p>
        </div>
      </section>

      {/* Positioning band — copy adopted from the client's live site, claims rewritten */}
      <section className="border-y border-brand-border bg-brand-cream py-14 sm:py-20">
        <div className="fmie-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <figure className="overflow-hidden rounded-xl border border-brand-border bg-white">
            <img
              src="/media/newsroom-portrait.webp"
              alt="An interviewee speaking to a camera crew outdoors."
              className="h-72 w-full object-cover sm:h-96"
            />
            <figcaption className="px-4 py-3 text-[11px] leading-relaxed text-brand-slate">
              {livePositioning.photoCredit}
            </figcaption>
          </figure>
          <div>
            <Eyebrow>Our services</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-bold text-brand-charcoal sm:text-4xl">
              {livePositioning.bandTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-brand-slate sm:text-base">
              {livePositioning.bandBody}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {livePositioning.pillars.map((pillar) => (
                <SiteLink
                  key={pillar.title}
                  to={pillar.to}
                  className="group rounded-lg border border-brand-border bg-white p-5 transition-colors hover:border-brand-gold"
                >
                  <span className="font-display text-lg font-semibold text-brand-navy">
                    {pillar.title}
                  </span>
                  <span className="mt-2 block text-xs leading-relaxed text-brand-slate">
                    {pillar.blurb}
                  </span>
                  <span className="mt-3 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-gold-dark">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </SiteLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial lead + categories */}
      <section className="fmie-container py-14 sm:py-20">
        <SectionHeading
          eyebrow="News & Insights"
          title="Today's editorial lead"
          description="Independent business journalism, labelled at the point of publication and separated from paid content."
          action={{ label: "All news & insights", to: "/news" }}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          {lead ? (
            <article className="group overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm">
              <Link to="/news/$slug" params={{ slug: lead.slug }} className="block">
                <img
                  src={lead.featuredImage}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                />
              </Link>
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="navy">{lead.category}</Badge>
                  {lead.disclosureTag ? <DisclosureBadge tag={lead.disclosureTag} /> : null}
                  <span className="text-xs text-brand-slate">
                    {formatDate(lead.publishedAt)} · {lead.readTime}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-brand-charcoal sm:text-3xl">
                  <Link
                    to="/news/$slug"
                    params={{ slug: lead.slug }}
                    className="hover:text-brand-navy"
                  >
                    {lead.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-slate">{lead.subtitle}</p>
                <p className="mt-4 text-xs font-medium text-brand-slate">
                  By {lead.author.name}, {lead.author.title}
                </p>
              </div>
            </article>
          ) : null}

          <div className="space-y-4">
            <div className="rounded-lg border border-brand-border bg-white p-5">
              <h3 className="fmie-eyebrow">Editorial desks</h3>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                {newsCategories.map((category) => (
                  <li key={category}>
                    <Link
                      to="/news"
                      search={{ category }}
                      className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-brand-charcoal hover:bg-brand-cream hover:text-brand-navy"
                    >
                      {category}
                      <ArrowRight className="h-3 w-3 text-brand-slate" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="space-y-3">
              {secondary.map((article) => (
                <li key={article.id} className="rounded-lg border border-brand-border bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-gold-dark">
                    {article.category}
                  </p>
                  <h4 className="mt-1 font-display text-sm font-semibold leading-snug text-brand-charcoal">
                    <Link
                      to="/news/$slug"
                      params={{ slug: article.slug }}
                      className="hover:text-brand-navy"
                    >
                      {article.title}
                    </Link>
                  </h4>
                  <p className="mt-1 text-[11px] text-brand-slate">
                    {article.author.name} · {article.readTime}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Surveys spotlight */}
      <section className="border-y border-brand-border bg-white py-14 sm:py-20">
        <div className="fmie-container">
          <SectionHeading
            eyebrow="Survey marketplace"
            title="Live research, open for participation"
            description="Independent surveys from organisations and research desks. Results are reported with their limitations — never as population estimates."
            action={{ label: "Explore surveys", to: "/surveys" }}
          />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
            {spotlight && spotlightQuestion && spotlightDistribution ? (
              <div className="rounded-lg border border-brand-border bg-brand-cream p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={spotlight.tier === "premium" ? "gold" : "navy"}>
                    {spotlight.tier}
                  </Badge>
                  <Badge tone="cream">{spotlight.category}</Badge>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold text-brand-charcoal">
                  {spotlight.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-brand-slate">
                  Live sample: {spotlightQuestion.prompt}
                </p>
                <div className="mt-4">
                  <DistributionBars
                    buckets={spotlightDistribution.buckets}
                    mean={spotlightDistribution.mean}
                    answered={spotlight.responseCount}
                    questionType={spotlightQuestion.type}
                  />
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
                    <Link to="/surveys/$id" params={{ id: spotlight.id }}>
                      Take part now
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/surveys/create">Publish your own</Link>
                  </Button>
                </div>
                <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-brand-slate">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold-dark" />
                  {compliance.surveyRepresentativeness.notice}
                </p>
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {surveys.data.slice(0, 4).map((survey) => (
                <SurveyCard key={survey.id} survey={survey} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visibility services */}
      <section className="fmie-container py-14 sm:py-20">
        <SectionHeading
          eyebrow="Global visibility"
          title="Your story deserves strategic visibility"
          description="Press release booking, executive services and advisory work — each with a documented workflow, a named owner and honest disclosure of what is and is not guaranteed."
          action={{ label: "Press release tiers", to: "/press-releases" }}
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {prTiers.map((tier) => (
            <article
              key={tier.id}
              className="flex flex-col rounded-lg border border-brand-border bg-white p-6 shadow-sm"
            >
              <Badge tone="navy">{tier.shortName}</Badge>
              <h3 className="mt-3 font-display text-xl font-semibold text-brand-charcoal">
                {tier.name}
              </h3>
              <p className="mt-1 font-display text-2xl font-bold text-brand-navy">
                from {formatCurrency(tier.priceFrom)}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-slate">{tier.summary}</p>
              <ul className="mt-4 space-y-1.5 text-xs text-brand-slate">
                {tier.includes.slice(0, 4).map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                    {line}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-5">
                <Link to="/press-releases/book">Request this tier</Link>
              </Button>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.data.map((service) => (
            <Link
              key={service.id}
              to="/services/$slug"
              params={{ slug: service.slug }}
              className="group rounded-lg border border-brand-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <PenLine className="h-5 w-5 text-brand-gold-dark" />
              <h3 className="mt-3 font-display text-base font-semibold leading-snug text-brand-charcoal group-hover:text-brand-navy">
                {service.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-brand-slate">
                {service.tagline}
              </p>
              <p className="mt-3 text-xs font-semibold text-brand-navy">{service.timeline}</p>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-[11px] leading-relaxed text-brand-slate">
          {compliance.distributionTransparency.notice}
        </p>
      </section>

      {/* Merch */}
      <section className="border-t border-brand-border bg-white py-14 sm:py-20">
        <div className="fmie-container">
          <SectionHeading
            eyebrow="F.M.I.E Shop"
            title="Branded merchandise, built to last"
            description="Apparel, stationery and accessories carrying the F.M.I.E monogram — specified by material and construction, not by logo size."
            action={{ label: "Visit the shop", to: "/shop" }}
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-brand-navy py-14 sm:py-20">
        <div className="fmie-container grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow className="text-brand-gold">Briefings</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Institutional briefings, on your terms
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Choose the desks you want to hear from and how often. Commercial content is a
              separate, optional preference — it is never bundled into editorial briefings.
            </p>
            <p className="mt-6 border-t border-white/15 pt-4 text-[11px] leading-relaxed text-white/55">
              {site.legalName} processes subscription data only to deliver the briefings you select.
              Withdraw at any time by emailing {contactEmail.general}.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}

export default HomePage;
