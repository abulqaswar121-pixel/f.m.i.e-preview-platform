import { useState } from "react";
import { SearchX } from "lucide-react";
import { Link, useSearch } from "@tanstack/react-router";

import { Badge } from "@/components/common/Badge";
import {
  DisclosureBadge,
  EmptyState,
  PageHeader,
  CardSkeleton,
} from "@/components/common/Primitives";
import { Input } from "@/components/ui/input";
import { formatDate, newsCategories, newsCategoryDescriptions } from "@/config/site";
import { useAsyncResource, useDebouncedValue } from "@/hooks/useAsync";
import { api } from "@/services/api";
import type { NewsCategory } from "@/types";
import { cn } from "@/lib/utils";

interface NewsSearch {
  category?: string;
}

export function NewsIndexPage() {
  const searchParams = useSearch({ strict: false }) as NewsSearch;
  const [category, setCategory] = useState<NewsCategory | "All categories">(() => {
    const requested = searchParams.category;
    return newsCategories.includes(requested as NewsCategory)
      ? (requested as NewsCategory)
      : "All categories";
  });
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 220);

  const articles = useAsyncResource(
    () => api.articles.list({ category, query: debounced }),
    [],
    [category, debounced],
  );

  const lead = articles.data[0];
  const rest = articles.data.slice(1);

  return (
    <div>
      <PageHeader
        eyebrow="News & Insights"
        title="Independent business journalism across ten desks"
        description="Reporting, features and signed analysis. Editorial content is produced separately from paid distribution and is labelled at the point of publication."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "News & Insights" }]}
      />

      <div className="fmie-container py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search headlines, authors and keywords…"
              aria-label="Search articles"
              className="border-brand-border bg-white"
            />
          </div>
          <p className="text-xs text-brand-slate">
            {articles.loading
              ? "Loading coverage…"
              : `${articles.data.length} article${articles.data.length === 1 ? "" : "s"}`}
            {category !== "All categories" ? ` in ${category}` : " across all desks"}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["All categories", ...newsCategories] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                category === option
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-brand-border bg-white text-brand-charcoal hover:border-brand-navy/50",
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {category !== "All categories" ? (
          <p className="mt-4 rounded-md border border-brand-border bg-white px-4 py-3 text-sm text-brand-slate">
            {newsCategoryDescriptions[category]}
          </p>
        ) : null}

        {articles.loading ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} lines={4} />
            ))}
          </div>
        ) : articles.data.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="No articles match"
              description="Try a different desk, or clear the search to see the full coverage list."
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            {lead ? (
              <article className="overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm">
                <Link to="/news/$slug" params={{ slug: lead.slug }}>
                  <img
                    src={lead.featuredImage}
                    alt=""
                    className="aspect-[16/9] w-full object-cover"
                  />
                </Link>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="navy">{lead.category}</Badge>
                    {lead.disclosureTag ? <DisclosureBadge tag={lead.disclosureTag} /> : null}
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-brand-charcoal">
                    <Link
                      to="/news/$slug"
                      params={{ slug: lead.slug }}
                      className="hover:text-brand-navy"
                    >
                      {lead.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-brand-slate">{lead.subtitle}</p>
                  <p className="mt-4 text-xs text-brand-slate">
                    {lead.author.name} · {formatDate(lead.publishedAt)} · {lead.readTime}
                  </p>
                </div>
              </article>
            ) : null}

            <ul className="space-y-4">
              {rest.map((article) => (
                <li
                  key={article.id}
                  className="rounded-lg border border-brand-border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="cream">{article.category}</Badge>
                    {article.disclosureTag ? <DisclosureBadge tag={article.disclosureTag} /> : null}
                    {article.isEditorialChoice ? <Badge tone="gold">Editor's choice</Badge> : null}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-brand-charcoal">
                    <Link
                      to="/news/$slug"
                      params={{ slug: article.slug }}
                      className="hover:text-brand-navy"
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-brand-slate">{article.subtitle}</p>
                  <p className="mt-3 text-xs text-brand-slate">
                    {article.author.name} · {formatDate(article.publishedAt)} · {article.readTime}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsIndexPage;
