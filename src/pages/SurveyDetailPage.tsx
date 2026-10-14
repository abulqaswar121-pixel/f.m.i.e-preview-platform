import { useMemo, useState } from "react";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import { Download, FileSpreadsheet, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { EmptyState, InfoNote, KeyedList, StatCard } from "@/components/common/Primitives";
import { DistributionBars, MixPie } from "@/components/surveys/SurveyResultsChart";
import { SurveyTaker } from "@/components/surveys/SurveyTaker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatDateTime } from "@/config/site";
import { useAsyncResource } from "@/hooks/useAsync";
import { api, downloadTextFile } from "@/services/api";
import { cn } from "@/lib/utils";

export function SurveyDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const search = useSearch({ strict: false }) as { tab?: string };
  const [tab, setTab] = useState(
    search.tab === "results" ? "results" : search.tab === "take" ? "take" : "overview",
  );
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [segment, setSegment] = useState("All segments");
  const [country, setCountry] = useState("All countries");

  const survey = useAsyncResource(() => api.surveys.getById(id), undefined, [id]);
  const analytics = useAsyncResource(
    () =>
      api.surveys.analytics(id, { from: from || undefined, to: to || undefined, segment, country }),
    undefined,
    [id, from, to, segment, country],
  );

  const data = survey.data;
  const stats = analytics.data;

  const filtersActive = Boolean(
    from || to || segment !== "All segments" || country !== "All countries",
  );
  const segments = useMemo(() => stats?.segments.map((entry) => entry.label) ?? [], [stats]);
  const countriesList = useMemo(() => stats?.countries.map((entry) => entry.label) ?? [], [stats]);

  if (survey.loading) {
    return (
      <div className="fmie-container py-16">
        <div className="h-4 w-24 animate-pulse rounded bg-brand-slate/15" />
        <div className="mt-4 h-9 w-2/3 animate-pulse rounded bg-brand-slate/15" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fmie-container py-20">
        <EmptyState
          title="Survey not found"
          description="It may have been removed by its owner or by moderation."
          action={{ label: "Back to the marketplace", to: "/surveys" }}
        />
      </div>
    );
  }

  const exportCsv = async () => {
    const csv = await api.surveys.exportCsv(data.id);
    if (!csv) {
      toast.info("No respondent-level records to export yet.");
      return;
    }
    downloadTextFile(`${data.slug}-responses.csv`, csv);
    toast.success("Export generated", {
      description: "CSV includes the methodology note fields required for republication.",
    });
  };

  return (
    <div>
      <header className="border-b border-brand-border bg-white">
        <div className="fmie-container max-w-5xl py-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-brand-slate"
          >
            <Link to="/" className="hover:text-brand-navy hover:underline">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/surveys" className="hover:text-brand-navy hover:underline">
              Surveys
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-brand-charcoal">{data.category}</span>
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge
              tone={data.tier === "premium" ? "gold" : data.tier === "corporate" ? "info" : "navy"}
            >
              {data.tier}
            </Badge>
            <Badge tone="cream">{data.category}</Badge>
            <Badge
              tone={
                data.status === "active"
                  ? "success"
                  : data.status === "pending_moderation"
                    ? "warning"
                    : data.status === "closed"
                      ? "muted"
                      : "info"
              }
            >
              {data.status.replace(/_/g, " ")}
            </Badge>
            {data.isAnonymous ? <Badge tone="success">Anonymous</Badge> : null}
            {data.isBranded ? <Badge tone="info">Branded environment</Badge> : null}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-brand-charcoal sm:text-4xl">
            {data.title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-brand-slate">
            {data.objective}
          </p>
          <p className="mt-4 text-xs text-brand-slate">
            Created by {data.creatorName} · opened {formatDate(data.openingDate)} · closes{" "}
            {formatDate(data.closingDate)}
          </p>
        </div>
      </header>

      <div className="fmie-container max-w-5xl py-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full justify-start overflow-x-auto rounded-lg border border-brand-border bg-white p-1">
            <TabsTrigger value="overview">Overview & method</TabsTrigger>
            <TabsTrigger value="take">Participate</TabsTrigger>
            <TabsTrigger value="results">Results & analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-5 rounded-lg border border-brand-border bg-white p-6">
                <section>
                  <h2 className="fmie-eyebrow">Objective</h2>
                  <p className="mt-2 text-sm leading-relaxed text-brand-slate">{data.objective}</p>
                </section>
                <section>
                  <h2 className="fmie-eyebrow">Audience & eligibility</h2>
                  <p className="mt-2 text-sm leading-relaxed text-brand-slate">{data.audience}</p>
                </section>
                <section>
                  <h2 className="fmie-eyebrow">Consent notice shown to respondents</h2>
                  <p className="mt-2 rounded-md border border-brand-border bg-brand-cream px-4 py-3 text-sm leading-relaxed text-brand-slate">
                    {data.consentNotice}
                  </p>
                </section>
                <section>
                  <h2 className="fmie-eyebrow">Question set ({data.questions.length})</h2>
                  <ol className="mt-3 space-y-3">
                    {data.questions.map((question, index) => (
                      <li
                        key={question.id}
                        className="rounded-md border border-brand-border px-4 py-3"
                      >
                        <p className="text-sm font-medium text-brand-charcoal">
                          {index + 1}. {question.prompt}
                        </p>
                        <p className="mt-1 text-[11px] text-brand-slate">
                          {question.type.replace(/_/g, " ")}
                          {question.options ? ` · ${question.options.length} options` : ""} ·{" "}
                          {question.required ? "required" : "optional"}
                          {question.logic ? ` · conditional: ${question.logic.description}` : ""}
                        </p>
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
              <div className="space-y-4">
                <KeyedList
                  items={[
                    { label: "Owner", value: data.creatorName },
                    { label: "Plan", value: data.planId.replace("plan-", "") },
                    {
                      label: "Responses",
                      value: `${data.responseCount.toLocaleString("en-GB")} of ${data.responseLimit.toLocaleString("en-GB")}`,
                    },
                    { label: "Est. completion", value: `${data.estimatedMinutes} minutes` },
                    { label: "Anonymous", value: data.isAnonymous ? "Yes" : "No" },
                    { label: "Incentive", value: data.incentive ?? "None" },
                  ]}
                />
                {data.moderationNote ? (
                  <div className="rounded-lg border border-warning/40 bg-warning/8 p-4">
                    <h3 className="text-sm font-semibold text-brand-charcoal">Moderation note</h3>
                    <p className="mt-2 text-xs leading-relaxed text-brand-slate">
                      {data.moderationNote}
                    </p>
                  </div>
                ) : null}
                <div className="rounded-lg border border-brand-border bg-white p-4">
                  <h3 className="text-sm font-semibold text-brand-charcoal">Tags</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {data.tags.map((tag) => (
                      <Badge key={tag} tone="cream">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                {data.status === "active" ? (
                  <Button
                    className="w-full bg-brand-navy text-white hover:bg-brand-navy-light"
                    onClick={() => setTab("take")}
                  >
                    Take part in this survey
                  </Button>
                ) : null}
              </div>
            </div>
            <ComplianceBanner variant="survey" />
          </TabsContent>

          <TabsContent value="take" className="mt-6">
            <div className="mx-auto max-w-3xl">
              <SurveyTaker survey={data} />
            </div>
          </TabsContent>

          <TabsContent value="results" className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Reported responses"
                value={data.responseCount.toLocaleString("en-GB")}
                icon={<Users className="h-4 w-4" />}
              />
              <StatCard
                label="Completion rate"
                value={`${stats?.completionRate ?? 0}%`}
                hint="Of sampled respondent records"
                tone="gold"
              />
              <StatCard
                label="Mean duration"
                value={`${Math.round((stats?.averageDurationSeconds ?? 0) / 60)}m ${(stats?.averageDurationSeconds ?? 0) % 60}s`}
                tone="info"
              />
              <StatCard
                label="Sample shown"
                value={(stats?.responses.length ?? 0).toLocaleString("en-GB")}
                hint={
                  filtersActive ? "Filtered respondent records" : "Respondent records in preview"
                }
                tone="success"
              />
            </div>

            <div className="rounded-lg border border-brand-border bg-white p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h3 className="font-display text-base font-semibold text-brand-charcoal">
                  Filters
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFrom("");
                    setTo("");
                    setSegment("All segments");
                    setCountry("All countries");
                  }}
                >
                  Reset filters
                </Button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-xs text-brand-slate">
                  From
                  <input
                    type="date"
                    value={from}
                    onChange={(event) => setFrom(event.target.value)}
                    className="mt-1 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none"
                  />
                </label>
                <label className="text-xs text-brand-slate">
                  To
                  <input
                    type="date"
                    value={to}
                    onChange={(event) => setTo(event.target.value)}
                    className="mt-1 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none"
                  />
                </label>
                <label className="text-xs text-brand-slate">
                  Segment
                  <select
                    value={segment}
                    onChange={(event) => setSegment(event.target.value)}
                    className="mt-1 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none"
                  >
                    <option>All segments</option>
                    {segments.map((entry) => (
                      <option key={entry} value={entry}>
                        {entry}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-brand-slate">
                  Country
                  <select
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="mt-1 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none"
                  >
                    <option>All countries</option>
                    {countriesList.map((entry) => (
                      <option key={entry} value={entry}>
                        {entry}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4">
                <p className="flex items-center gap-2 text-xs text-brand-slate">
                  <FileSpreadsheet className="h-4 w-4 text-brand-navy" />
                  Exports include every respondent record with a methodology note (demo only).
                </p>
                <Button variant="outline" size="sm" onClick={() => void exportCsv()}>
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <MixPie data={stats?.segments ?? []} title="Respondent segments (sample)" />
              <MixPie data={stats?.countries ?? []} title="Respondent geography (sample)" />
            </div>

            <div className="space-y-5">
              {(stats?.perQuestion ?? []).map((entry, index) => (
                <section
                  key={entry.question.id}
                  className="rounded-lg border border-brand-border bg-white p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-brand-charcoal">
                      Q{index + 1}. {entry.question.prompt}
                    </h3>
                    <span className="text-xs tabular-nums text-brand-slate">
                      {entry.answered} answered
                    </span>
                  </div>
                  <div className="mt-4">
                    <DistributionBars
                      buckets={entry.buckets}
                      mean={entry.mean}
                      answered={entry.answered}
                      questionType={entry.question.type}
                    />
                  </div>
                </section>
              ))}
            </div>

            <InfoNote>
              Charts are computed from the respondent records stored in this preview. Reported
              totals ({data.responseCount.toLocaleString("en-GB")}) include historical records held
              by the research owner; the preview retains the most recent sample for performance.
              Last analytics refresh: {formatDateTime(new Date().toISOString())}.
            </InfoNote>

            <ComplianceBanner variant="survey" />
            <p className="flex items-start gap-2 text-[11px] leading-relaxed text-brand-slate">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold-dark" />
              {data.consentNotice}
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SurveyDetailPage;
