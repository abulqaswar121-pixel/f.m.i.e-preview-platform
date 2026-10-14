import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { SearchX } from "lucide-react";

import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { EmptyState, PageHeader, CardSkeleton, StatCard } from "@/components/common/Primitives";
import { SurveyCard } from "@/components/surveys/SurveyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { surveyCategories } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { useAsyncResource, useDebouncedValue } from "@/hooks/useAsync";
import { api } from "@/services/api";
import type { SurveyCategory, SurveyTier } from "@/types";
import { cn } from "@/lib/utils";

export function SurveysIndexPage() {
  const { canCreateSurveys } = useAuth();
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 220);
  const [category, setCategory] = useState<SurveyCategory | "All categories">("All categories");
  const [tier, setTier] = useState<SurveyTier | "all">("all");
  const [sort, setSort] = useState<"recent" | "closing" | "responses">("recent");

  const surveys = useAsyncResource(
    () => api.surveys.publicList({ category, tier, query: debounced }),
    [],
    [category, tier, debounced],
  );

  const sorted = useMemo(() => {
    const list = [...surveys.data];
    if (sort === "closing") {
      list.sort((a, b) => new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime());
    } else if (sort === "responses") {
      list.sort((a, b) => b.responseCount - a.responseCount);
    }
    return list;
  }, [surveys.data, sort]);

  const totalResponses = sorted.reduce((sum, survey) => sum + survey.responseCount, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Survey marketplace"
        title="Independent research, open for participation"
        description="Free and premium surveys from organisations, research desks and individual creators — moderated before publication, with consent and limitations stated on every survey."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Surveys" }]}
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
            <Link to="/surveys/create">Create a survey</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/surveys/plans">Plans &amp; pricing</Link>
          </Button>
        </div>
      </PageHeader>

      <div className="fmie-container py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Live surveys"
            value={String(sorted.filter((survey) => survey.status === "active").length)}
            hint="Open for participation right now"
          />
          <StatCard
            label="Recorded responses"
            value={totalResponses.toLocaleString("en-GB")}
            hint="Across the filtered set"
            tone="gold"
          />
          <StatCard
            label="Categories"
            value={String(surveyCategories.length)}
            hint="From consumer behaviour to organisational research"
            tone="info"
          />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto_auto_auto]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles, objectives, creators and tags…"
            aria-label="Search surveys"
            className="border-brand-border bg-white"
          />
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as SurveyCategory | "All categories")
            }
            aria-label="Filter by category"
            className="rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none"
          >
            <option value="All categories">All categories</option>
            {surveyCategories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={tier}
            onChange={(event) => setTier(event.target.value as SurveyTier | "all")}
            aria-label="Filter by tier"
            className="rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none"
          >
            <option value="all">Free &amp; premium</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="corporate">Corporate</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            aria-label="Sort surveys"
            className="rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none"
          >
            <option value="recent">Most recently updated</option>
            <option value="closing">Closing soonest</option>
            <option value="responses">Most responses</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["All categories", ...surveyCategories] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCategory(option)}
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-medium",
                category === option
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-brand-border bg-white text-brand-slate hover:border-brand-navy/50",
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {surveys.loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} lines={4} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="No surveys match those filters"
              description="Clear the search or choose another category. New surveys appear here as soon as editorial moderation approves them."
              action={
                canCreateSurveys
                  ? { label: "Create the first one", to: "/surveys/create" }
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((survey) => (
              <SurveyCard key={survey.id} survey={survey} showStatus />
            ))}
          </div>
        )}

        <div className="mt-10">
          <ComplianceBanner variant="survey" />
        </div>
      </div>
    </div>
  );
}

export default SurveysIndexPage;
