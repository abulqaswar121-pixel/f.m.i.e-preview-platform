import { Link } from "@tanstack/react-router";
import { Compass, Search } from "lucide-react";

import { SiteLink } from "@/components/common/SiteLink";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { mainNavigation, site } from "@/config/site";

const SHORTCUTS = [
  { label: "News & Insights", to: "/news", detail: "Reporting across ten editorial desks" },
  { label: "Survey marketplace", to: "/surveys", detail: "Live research you can take part in" },
  {
    label: "Press releases",
    to: "/press-releases",
    detail: "Tiers, workflow and channel catalogue",
  },
  { label: "Professional services", to: "/services", detail: "Four structured engagements" },
  { label: "Shop", to: "/shop", detail: "Branded apparel, stationery and accessories" },
  { label: "My dashboard", to: "/dashboard", detail: "Surveys, campaigns, orders and account" },
] as const;

export function NotFoundPage() {
  return (
    <div className="fmie-container py-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center justify-center rounded-full border border-brand-border bg-brand-cream p-4 text-brand-navy">
          <Compass className="h-8 w-8" />
        </span>
        <p className="mt-6 fmie-eyebrow">Error 404</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-brand-charcoal">
          That page is not on the platform
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-slate">
          The address may be mistyped, or the record may have been removed when the demonstration
          data was reset. Nothing has been lost — every article, survey and campaign remains
          reachable from the sections below.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
            <Link to="/">Return to the homepage</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">
              <Search className="h-4 w-4" /> Ask the desk for help
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-3 text-left sm:grid-cols-2">
          {SHORTCUTS.map((shortcut) => (
            <Link
              key={shortcut.to}
              to={shortcut.to}
              className="rounded-lg border border-brand-border bg-white p-4 transition-colors hover:border-brand-navy/40"
            >
              <p className="font-display text-sm font-semibold text-brand-charcoal">
                {shortcut.label}
              </p>
              <p className="mt-1 text-xs text-brand-slate">{shortcut.detail}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 border-t border-brand-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-slate">
            Site sections
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {mainNavigation.map((item) => (
              <SiteLink key={item.label} to={item.to} search={item.search} hash={item.hash}>
                <Badge tone="cream">{item.label}</Badge>
              </SiteLink>
            ))}
          </div>
          <p className="mt-6 text-[11px] leading-relaxed text-brand-slate">{site.previewNotice}</p>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
