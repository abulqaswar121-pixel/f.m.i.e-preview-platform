import { useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import {
  BadgeCheck,
  Banknote,
  Boxes,
  Clapperboard,
  Shirt,
  FlaskConical,
  Gauge,
  Megaphone,
  Radio,
  RefreshCw,
  ShieldAlert,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { EmptyState, KeyedList, StatCard } from "@/components/common/Primitives";
import { StatusBadge } from "@/components/press/StatusBadge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/common/Modal";
import { formatDate, formatCurrency, prStatuses, prTiers, roleLabels } from "@/config/site";
import { useAsyncResource } from "@/hooks/useAsync";
import { useAuth } from "@/hooks/useAuth";
import { api, useDatabase } from "@/services/api";
import { cn } from "@/lib/utils";
import type { PRStatus, SurveyPlan, SurveyStatus } from "@/types";

export type AdminTab =
  | "overview"
  | "moderation"
  | "plans"
  | "press"
  | "channels"
  | "payouts"
  | "kits"
  | "platform"
  | "commerce"
  | "audience";

const TABS: { id: AdminTab; label: string; icon: typeof Gauge }[] = [
  { id: "overview", label: "Platform overview", icon: Gauge },
  { id: "moderation", label: "Survey moderation", icon: FlaskConical },
  { id: "plans", label: "Plan configuration", icon: SlidersHorizontal },
  { id: "press", label: "Press campaigns", icon: Megaphone },
  { id: "channels", label: "Distribution channels", icon: Radio },
  { id: "payouts", label: "Bank payouts", icon: Banknote },
  { id: "kits", label: "Kit quote requests", icon: Shirt },
  { id: "platform", label: "Homepage video & settings", icon: Clapperboard },
  { id: "commerce", label: "Commerce & orders", icon: Boxes },
  { id: "audience", label: "Audience & enquiries", icon: Users },
];

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none";

const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "in_fulfilment",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export function AdminPage() {
  const search = useSearch({ strict: false }) as { tab?: AdminTab };
  const tab: AdminTab = TABS.some((entry) => entry.id === search.tab)
    ? (search.tab as AdminTab)
    : "overview";
  const { user, isAdmin } = useAuth();
  const database = useDatabase();
  const overview = useAsyncResource(() => api.admin.overview(), undefined, [database.updatedAt]);

  const [moderating, setModerating] = useState<{
    id: string;
    title: string;
    action: SurveyStatus;
  } | null>(null);
  const [moderationNote, setModerationNote] = useState("");
  const [editingPlan, setEditingPlan] = useState<SurveyPlan | null>(null);
  const [planDraft, setPlanDraft] = useState({
    price: 0,
    questionLimit: "",
    responseLimit: "",
    surveyLimit: "",
    seatsIncluded: 1,
  });
  const [quoting, setQuoting] = useState<{ id: string; reference: string } | null>(null);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [advancing, setAdvancing] = useState<{
    id: string;
    reference: string;
    status: PRStatus;
  } | null>(null);
  const [advanceNote, setAdvanceNote] = useState("");
  const [publishing, setPublishing] = useState<{ id: string; reference: string } | null>(null);
  const [publishedUrl, setPublishedUrl] = useState("");

  if (!isAdmin) {
    return (
      <div className="fmie-container py-20">
        <EmptyState
          title="Administrator access required"
          description="The administration panel is restricted to the administrator persona. Switch persona from the header to explore moderation, plan configuration and channel verification."
          action={{ label: "Go to my dashboard", to: "/dashboard" }}
          icon={<ShieldAlert className="h-6 w-6" />}
        />
      </div>
    );
  }

  const pendingSurveys = database.surveys.filter(
    (survey) => survey.status === "pending_moderation",
  );
  const stats = overview.data;

  const submitModeration = async () => {
    if (!moderating) return;
    await api.surveys.setStatus(
      moderating.id,
      moderating.action,
      moderationNote.trim() || undefined,
    );
    toast.success(
      moderating.action === "active"
        ? "Survey approved and published"
        : "Survey returned to the creator",
      {
        description: `${moderating.title}${moderationNote.trim() ? ` — ${moderationNote.trim()}` : ""}`,
      },
    );
    setModerating(null);
    setModerationNote("");
  };

  const openPlanEditor = (plan: SurveyPlan) => {
    setEditingPlan(plan);
    setPlanDraft({
      price: plan.price,
      questionLimit: plan.questionLimit === null ? "" : String(plan.questionLimit),
      responseLimit: plan.responseLimit === null ? "" : String(plan.responseLimit),
      surveyLimit: plan.surveyLimit === null ? "" : String(plan.surveyLimit),
      seatsIncluded: plan.seatsIncluded,
    });
  };

  const savePlan = async () => {
    if (!editingPlan) return;
    await api.surveys.updatePlan(editingPlan.id, {
      price: Number(planDraft.price) || 0,
      questionLimit: planDraft.questionLimit === "" ? null : Number(planDraft.questionLimit),
      responseLimit: planDraft.responseLimit === "" ? null : Number(planDraft.responseLimit),
      surveyLimit: planDraft.surveyLimit === "" ? null : Number(planDraft.surveyLimit),
      seatsIncluded: Number(planDraft.seatsIncluded) || 1,
    });
    toast.success("Plan updated", {
      description: `${editingPlan.name} limits and pricing saved. Every surface reads plan configuration from the service layer.`,
    });
    setEditingPlan(null);
  };

  const submitQuote = async () => {
    if (!quoting) return;
    const amount = Number(quoteAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a quotation amount greater than zero.");
      return;
    }
    await api.pressReleases.setQuote(
      quoting.id,
      amount,
      `Quotation issued by ${user?.name ?? "the press desk"}.`,
    );
    toast.success("Quotation issued", {
      description: `${quoting.reference} · ${formatCurrency(amount)}`,
    });
    setQuoting(null);
    setQuoteAmount("");
  };

  const submitStatusAdvance = async () => {
    if (!advancing) return;
    await api.pressReleases.updateStatus(
      advancing.id,
      advancing.status,
      advanceNote.trim() || `Status changed by ${user?.name ?? "administrator"}.`,
      user?.name ?? "F.M.I.E Administrator",
    );
    toast.success("Campaign updated", {
      description: `${advancing.reference} → ${prStatuses.find((entry) => entry.id === advancing.status)?.label ?? advancing.status}`,
    });
    setAdvancing(null);
    setAdvanceNote("");
  };

  const submitPublishedUrl = async () => {
    if (!publishing) return;
    if (!/^https?:\/\/.+/.test(publishedUrl.trim())) {
      toast.error("Enter a full URL including https://");
      return;
    }
    await api.pressReleases.addPublishedUrl(publishing.id, publishedUrl.trim());
    toast.success("Placement recorded", {
      description: "Added to the completion dossier for this campaign.",
    });
    setPublishing(null);
    setPublishedUrl("");
  };

  return (
    <div>
      <header className="border-b border-brand-border bg-brand-navy text-white">
        <div className="fmie-container py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-gold">
            Administration
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Platform control panel</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/75">
            Moderation, plan configuration, distribution channel verification, campaign state
            changes and commerce oversight. Every action writes to the local data store and is
            reflected across the platform immediately.
          </p>
          <nav aria-label="Admin sections" className="mt-6 flex flex-wrap gap-2">
            {TABS.map((entry) => {
              const Icon = entry.icon;
              const active = tab === entry.id;
              return (
                <Link
                  key={entry.id}
                  to="/admin"
                  search={{ tab: entry.id }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                    active
                      ? "border-brand-gold bg-brand-gold text-brand-navy-dark"
                      : "border-white/25 bg-white/5 text-white/80 hover:border-white/50",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {entry.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="fmie-container space-y-8 py-10">
        {tab === "overview" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Surveys"
                value={String(stats?.surveys.total ?? database.surveys.length)}
                hint={`${stats?.surveys.active ?? 0} active · ${stats?.surveys.pendingModeration ?? pendingSurveys.length} awaiting moderation`}
                icon={<FlaskConical className="h-4 w-4" />}
              />
              <StatCard
                label="Responses captured"
                value={(stats?.surveys.responses ?? 0).toLocaleString("en-GB")}
                hint="Simulated response store"
                tone="info"
                icon={<Users className="h-4 w-4" />}
              />
              <StatCard
                label="Press pipeline"
                value={formatCurrency(stats?.pressReleases.pipelineValue ?? 0)}
                hint={`${stats?.pressReleases.awaitingAction ?? 0} awaiting action · ${stats?.pressReleases.inDistribution ?? 0} in distribution`}
                tone="gold"
                icon={<Megaphone className="h-4 w-4" />}
              />
              <StatCard
                label="Commerce revenue"
                value={formatCurrency(stats?.commerce.revenue ?? 0)}
                hint={`${stats?.commerce.orders ?? 0} orders · ${stats?.commerce.unitsSold ?? 0} units · ${stats?.commerce.lowStock ?? 0} low stock`}
                tone="success"
                icon={<Boxes className="h-4 w-4" />}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-brand-border bg-white p-6">
                <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                  Queue health
                </h2>
                <KeyedList
                  items={[
                    {
                      label: "Moderation",
                      value: `${pendingSurveys.length} survey${pendingSurveys.length === 1 ? "" : "s"} awaiting review`,
                    },
                    {
                      label: "Press desk",
                      value: `${database.pressReleases.filter((booking) => ["submitted", "under_review", "additional_info_required"].includes(booking.status)).length} campaigns in editorial or compliance review`,
                    },
                    {
                      label: "Payments",
                      value: `${database.pressReleases.filter((booking) => booking.status === "awaiting_payment").length} campaigns awaiting payment`,
                    },
                    {
                      label: "Channels",
                      value: `${database.distributionChannels.filter((channel) => channel.status !== "verified").length} channels not verified`,
                    },
                    {
                      label: "Enquiries",
                      value: `${database.serviceEnquiries.length} service enquiries · ${database.consultationBookings.length} consultation requests`,
                    },
                    {
                      label: "Messages",
                      value: `${database.contactMessages.length} contact messages · ${database.newsletterSubscriptions.length} newsletter subscriptions`,
                    },
                  ]}
                />
                {pendingSurveys.length > 0 ? (
                  <Button
                    asChild
                    className="mt-4 bg-brand-navy text-white hover:bg-brand-navy-light"
                  >
                    <Link to="/admin" search={{ tab: "moderation" }}>
                      Open moderation queue
                    </Link>
                  </Button>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-brand-border bg-white p-6">
                  <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                    Accounts
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {database.users.map((person) => (
                      <li
                        key={person.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-brand-border px-3 py-2"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-brand-charcoal">
                            {person.name}
                          </span>
                          <span className="block truncate text-[11px] text-brand-slate">
                            {person.email}
                          </span>
                        </span>
                        <Badge
                          tone={
                            person.role === "administrator"
                              ? "gold"
                              : person.role === "visitor"
                                ? "muted"
                                : "navy"
                          }
                        >
                          {roleLabels[person.role]}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-danger/40 bg-danger/5 p-6">
                  <h2 className="font-display text-base font-semibold text-brand-charcoal">
                    Reset preview data
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-brand-slate">
                    Restores every record to the shipped sample set and clears local storage.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={async () => {
                      await api.admin.reset();
                      toast.success("Preview reset", {
                        description: "Sample data restored across the platform.",
                      });
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reset now
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : null}

        {tab === "moderation" ? (
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-brand-charcoal">
                Survey moderation queue
              </h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
                Surveys submitted for publication are reviewed for consent wording, incentive
                clarity, question integrity and representativeness claims. Approval publishes the
                survey to the marketplace; returning it records a note the creator sees in their
                dashboard.
              </p>
            </div>
            {pendingSurveys.length === 0 ? (
              <EmptyState
                title="Queue is clear"
                description="No surveys are awaiting moderation. Newly submitted surveys appear here immediately."
                icon={<BadgeCheck className="h-6 w-6" />}
              />
            ) : (
              pendingSurveys.map((survey) => (
                <article
                  key={survey.id}
                  className="rounded-lg border border-brand-border bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="warning">Pending moderation</Badge>
                        <Badge
                          tone={
                            survey.tier === "free"
                              ? "cream"
                              : survey.tier === "premium"
                                ? "gold"
                                : "navy"
                          }
                        >
                          {survey.tier}
                        </Badge>
                        <Badge tone="muted">{survey.category}</Badge>
                      </div>
                      <h3 className="mt-2 font-display text-base font-semibold text-brand-charcoal">
                        <Link
                          to="/surveys/$id"
                          params={{ id: survey.id }}
                          className="hover:text-brand-navy hover:underline"
                        >
                          {survey.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-brand-slate">
                        {survey.objective}
                      </p>
                      <p className="mt-2 text-[11px] text-brand-slate">
                        Submitted by {survey.creatorName} · {survey.questions.length} questions ·
                        estimated {survey.estimatedMinutes} minutes · closes{" "}
                        {formatDate(survey.closingDate)}
                        {survey.incentive ? ` · incentive: ${survey.incentive}` : ""}
                      </p>
                      <p className="mt-2 rounded-md bg-brand-cream px-3 py-2 text-[11px] leading-relaxed text-brand-slate">
                        <span className="font-semibold text-brand-charcoal">Consent notice: </span>
                        {survey.consentNotice}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Button
                        size="sm"
                        className="bg-brand-navy text-white hover:bg-brand-navy-light"
                        onClick={() => {
                          setModerating({ id: survey.id, title: survey.title, action: "active" });
                          setModerationNote(
                            "Consent wording, incentives and question set reviewed. Cleared for publication.",
                          );
                        }}
                      >
                        Approve & publish
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setModerating({ id: survey.id, title: survey.title, action: "draft" });
                          setModerationNote("");
                        }}
                      >
                        Return to creator
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            )}
            <ComplianceBanner variant="survey" />
          </section>
        ) : null}

        {tab === "plans" ? (
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-brand-charcoal">
                Survey plan configuration
              </h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
                Free, Premium and Corporate plans are administrator-configurable rather than
                hardcoded. Changes here update the public plans page, the builder's limit checks and
                every corporate account view instantly.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {database.surveyPlans.map((plan) => (
                <article
                  key={plan.id}
                  className={cn(
                    "flex flex-col rounded-lg border bg-white p-5",
                    plan.highlighted
                      ? "border-brand-gold ring-2 ring-brand-gold/30"
                      : "border-brand-border",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      tone={
                        plan.tier === "free" ? "cream" : plan.tier === "premium" ? "gold" : "navy"
                      }
                    >
                      {plan.tier}
                    </Badge>
                    {plan.adminConfigurable ? (
                      <Badge tone="success">Admin configurable</Badge>
                    ) : (
                      <Badge tone="muted">Locked</Badge>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-brand-charcoal">
                    {plan.name}
                  </h3>
                  <p className="mt-1 font-display text-2xl font-bold text-brand-navy">
                    {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
                    <span className="ml-1 text-xs font-normal text-brand-slate">
                      {plan.billingPeriod === "annual"
                        ? "/ year"
                        : plan.billingPeriod === "monthly"
                          ? "/ month"
                          : "one-off"}
                    </span>
                  </p>
                  <ul className="mt-3 flex-1 space-y-1.5 text-xs text-brand-slate">
                    <li>Questions per survey: {plan.questionLimit ?? "Unlimited"}</li>
                    <li>
                      Responses per survey:{" "}
                      {plan.responseLimit?.toLocaleString("en-GB") ?? "Unlimited"}
                    </li>
                    <li>Surveys: {plan.surveyLimit ?? "Unlimited"}</li>
                    <li>Seats included: {plan.seatsIncluded}</li>
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => openPlanEditor(plan)}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Configure plan
                  </Button>
                </article>
              ))}
            </div>
            <div className="rounded-lg border border-brand-border bg-white p-6">
              <h3 className="font-display text-base font-semibold text-brand-charcoal">
                Feature matrix as configured
              </h3>
              <div className="mt-3 grid gap-4 lg:grid-cols-3">
                {database.surveyPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-md border border-brand-border bg-brand-cream/40 p-4"
                  >
                    <p className="text-sm font-semibold text-brand-charcoal">{plan.name}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-slate">
                      Included
                    </p>
                    <ul className="mt-1 space-y-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="text-xs text-brand-slate">
                          · {feature}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-slate">
                      Not included
                    </p>
                    <ul className="mt-1 space-y-1">
                      {plan.exclusions.map((exclusion) => (
                        <li key={exclusion} className="text-xs text-brand-slate">
                          · {exclusion}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {tab === "press" ? (
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-brand-charcoal">
                Press campaign oversight
              </h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
                Issue quotations, move campaigns through the twelve-state workflow with a dated note
                against your name, and record confirmed placements for the completion dossier.
              </p>
            </div>
            <div className="space-y-3">
              {database.pressReleases.map((booking) => {
                const tier = prTiers.find((entry) => entry.id === booking.tier);
                const nextStatuses = prStatuses
                  .filter((entry) => entry.id !== booking.status)
                  .slice(0, 12);
                return (
                  <article
                    key={booking.id}
                    className="rounded-lg border border-brand-border bg-white p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2">
                          <Link
                            to="/press-releases/$id"
                            params={{ id: booking.id }}
                            className="font-mono text-xs font-semibold text-brand-navy hover:underline"
                          >
                            {booking.referenceNumber}
                          </Link>
                          <StatusBadge status={booking.status} />
                          <Badge tone="cream">{tier?.shortName ?? booking.tier}</Badge>
                        </p>
                        <h3 className="mt-2 font-display text-base font-semibold text-brand-charcoal">
                          {booking.title}
                        </h3>
                        <p className="mt-1 text-xs text-brand-slate">
                          {booking.companyName} · {booking.contactName} · submitted{" "}
                          {formatDate(booking.submittedDate)} · target{" "}
                          {formatDate(booking.targetDate)}
                        </p>
                        <p className="mt-1 text-xs text-brand-slate">
                          Quoted{" "}
                          {booking.quoteAmount !== undefined
                            ? formatCurrency(booking.quoteAmount)
                            : "not yet issued"}
                          {booking.paidAt ? ` · paid ${formatDate(booking.paidAt)}` : ""}
                          {booking.publishedUrls?.length
                            ? ` · ${booking.publishedUrls.length} confirmed placements`
                            : ""}
                        </p>
                        {booking.notes ? (
                          <p className="mt-2 rounded-md bg-brand-cream px-3 py-2 text-[11px] text-brand-slate">
                            {booking.notes}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setQuoting({ id: booking.id, reference: booking.referenceNumber });
                            setQuoteAmount(String(booking.quoteAmount ?? tier?.priceFrom ?? 0));
                          }}
                        >
                          Issue / amend quote
                        </Button>
                        <select
                          className="rounded-md border border-brand-border bg-white px-2 py-1.5 text-xs text-brand-charcoal"
                          defaultValue=""
                          aria-label={`Change status for ${booking.referenceNumber}`}
                          onChange={(event) => {
                            const value = event.target.value as PRStatus;
                            event.target.value = "";
                            if (!value) return;
                            setAdvancing({
                              id: booking.id,
                              reference: booking.referenceNumber,
                              status: value,
                            });
                            setAdvanceNote("");
                          }}
                        >
                          <option value="" disabled>
                            Move to state…
                          </option>
                          {nextStatuses.map((entry) => (
                            <option key={entry.id} value={entry.id}>
                              {entry.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setPublishing({ id: booking.id, reference: booking.referenceNumber });
                            setPublishedUrl("");
                          }}
                        >
                          Record placement
                        </Button>
                      </div>
                    </div>
                    <details className="mt-3 border-t border-brand-border pt-3">
                      <summary className="cursor-pointer text-xs font-semibold text-brand-navy">
                        Workflow log ({booking.timeline.length} events)
                      </summary>
                      <ol className="mt-2 space-y-1.5">
                        {booking.timeline.map((event, index) => (
                          <li key={`${event.at}-${index}`} className="text-[11px] text-brand-slate">
                            <span className="font-mono">{event.at.slice(0, 10)}</span> ·{" "}
                            <span className="font-semibold text-brand-charcoal">
                              {event.status.replace(/_/g, " ")}
                            </span>{" "}
                            · {event.actor}: {event.note}
                          </li>
                        ))}
                      </ol>
                    </details>
                  </article>
                );
              })}
            </div>
            <ComplianceBanner variant="distribution" />
          </section>
        ) : null}

        {tab === "channels" ? (
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-brand-charcoal">
                Distribution channel verification
              </h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
                Each channel carries an administrator-controlled status, verification date and
                recorded note. Channels that are not verified are excluded from client quotations
                and shown publicly as pending, never as available.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {database.distributionChannels.map((channel) => (
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
                  <p className="mt-1 text-xs text-brand-slate">
                    {channel.region} ·{" "}
                    {channel.priceNaira != null ? `₦${channel.priceNaira.toLocaleString()}` : ""}
                    {channel.priceNaira != null && channel.priceUsd != null ? " / " : ""}
                    {channel.priceUsd != null ? `$${channel.priceUsd.toLocaleString()}` : ""}
                    {channel.priceNaira == null && channel.priceUsd == null
                      ? "rate on request"
                      : ""}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-brand-slate">
                    {channel.audience}
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-brand-slate">
                    {channel.administratorNote}
                  </p>
                  <p className="mt-2 text-[11px] text-brand-slate">
                    {channel.verifiedOn
                      ? `Last verified ${formatDate(channel.verifiedOn)}`
                      : "No verification recorded"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["verified", "pending_verification", "suspended"] as const).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={channel.status === status ? "default" : "outline"}
                        className={
                          channel.status === status
                            ? "bg-brand-navy text-white hover:bg-brand-navy-light"
                            : undefined
                        }
                        onClick={async () => {
                          await api.pressReleases.updateChannel(channel.id, {
                            status,
                            verifiedOn:
                              status === "verified" ? new Date().toISOString() : undefined,
                          });
                          toast.success(`Channel marked ${status.replace(/_/g, " ")}`, {
                            description: channel.label,
                          });
                        }}
                      >
                        {status.replace(/_/g, " ")}
                      </Button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {tab === "payouts" ? (
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-brand-charcoal">
                Bank payouts
              </h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
                Withdrawal requests from survey earners. Approving marks the request paid and closes
                the loop on the earner's wallet history. Payouts are simulated in this preview.
              </p>
            </div>
            <div className="space-y-3">
              {database.payouts.length === 0 ? (
                <EmptyState
                  title="No payout requests"
                  description="Earner withdrawals will appear here."
                />
              ) : (
                database.payouts.map((payout) => (
                  <article
                    key={payout.id}
                    className="rounded-lg border border-brand-border bg-white p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-brand-charcoal">
                          {payout.earnerName} — ₦{payout.amountNaira.toLocaleString()}
                        </h3>
                        <p className="mt-1 text-xs text-brand-slate">
                          {payout.bankName} •••{payout.accountNumber.slice(-4)} ·{" "}
                          {payout.accountName} · requested {formatDate(payout.requestedAt)}
                        </p>
                      </div>
                      {payout.status === "paid" ? (
                        <Badge tone="success">
                          Paid {payout.paidAt ? formatDate(payout.paidAt) : ""}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-brand-navy text-white hover:bg-brand-navy-dark"
                          onClick={() => {
                            void api.payouts
                              .markPaid(payout.id)
                              .then(() =>
                                toast.success(`Payout ${payout.id} approved and marked paid.`),
                              );
                          }}
                        >
                          Approve & Mark Paid
                        </Button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}

        {tab === "kits" ? (
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-brand-charcoal">
                Kit quote requests
              </h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
                Club and corporate kit requests with full player rosters. Reply with a custom quote;
                the requester sees the quoted status on submission.
              </p>
            </div>
            <div className="space-y-4">
              {database.kitRequests.length === 0 ? (
                <EmptyState
                  title="No kit requests yet"
                  description="Requests from /shop/team-kits land here."
                />
              ) : (
                database.kitRequests.map((request) => (
                  <KitQuoteCard key={request.id} requestId={request.id} />
                ))
              )}
            </div>
          </section>
        ) : null}

        {tab === "platform" ? <PlatformSettingsPanel /> : null}

        {tab === "commerce" ? (
          <section className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-brand-charcoal">
                Orders and catalogue stock
              </h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
                Simulated commerce oversight: move orders through fulfilment states and watch
                catalogue stock levels as orders are placed.
              </p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-brand-border bg-white">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-brand-border bg-brand-cream/60 text-xs uppercase tracking-[0.08em] text-brand-slate">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Placed</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {database.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-brand-cream/40">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-charcoal">
                        {order.reference}
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-slate">
                        {order.address.fullName}
                        <span className="block text-[11px]">{order.email}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-brand-slate">
                        {formatDate(order.placedAt)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs tabular-nums">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="rounded-md border border-brand-border bg-white px-2 py-1 text-xs"
                          value={order.status}
                          aria-label={`Order status for ${order.reference}`}
                          onChange={async (event) => {
                            const next = event.target.value as (typeof ORDER_STATUSES)[number];
                            await api.orders.updateStatus(order.id, next);
                            toast.success(`${order.reference} → ${next.replace(/_/g, " ")}`);
                          }}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg border border-brand-border bg-white p-6">
              <h3 className="font-display text-base font-semibold text-brand-charcoal">
                Catalogue stock
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {database.products.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-brand-border px-3 py-2 text-xs"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-brand-charcoal">
                        {product.name}
                      </span>
                      <span className="block text-[11px] text-brand-slate">
                        {product.sku} · {formatCurrency(product.price)}
                      </span>
                    </span>
                    <Badge
                      tone={
                        product.stockLevel === 0
                          ? "danger"
                          : product.stockLevel < 50
                            ? "warning"
                            : "success"
                      }
                    >
                      {product.stockLevel} in stock
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {tab === "audience" ? (
          <section className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-brand-charcoal">
                Audience, enquiries and messages
              </h2>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
                Everything submitted through the contact desks, service forms and newsletter
                preferences, stored locally for this preview.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-brand-border bg-white p-6">
                <h3 className="font-display text-base font-semibold text-brand-charcoal">
                  Contact messages ({database.contactMessages.length})
                </h3>
                {database.contactMessages.length === 0 ? (
                  <p className="mt-2 text-xs text-brand-slate">No messages submitted yet.</p>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {database.contactMessages.slice(0, 8).map((message) => (
                      <li
                        key={message.id}
                        className="rounded-md border border-brand-border px-3 py-2"
                      >
                        <p className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-brand-charcoal">
                            {message.subject}
                          </span>
                          <Badge tone="muted">{message.department}</Badge>
                        </p>
                        <p className="mt-1 text-[11px] text-brand-slate">
                          {message.name} · {message.email} · {formatDate(message.createdAt)}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-brand-slate">
                          {message.message}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border border-brand-border bg-white p-6">
                  <h3 className="font-display text-base font-semibold text-brand-charcoal">
                    Service enquiries ({database.serviceEnquiries.length})
                  </h3>
                  {database.serviceEnquiries.length === 0 ? (
                    <p className="mt-2 text-xs text-brand-slate">No enquiries submitted yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {database.serviceEnquiries.slice(0, 6).map((enquiry) => (
                        <li
                          key={enquiry.id}
                          className="rounded-md border border-brand-border px-3 py-2 text-xs"
                        >
                          <p className="font-semibold text-brand-charcoal">
                            {enquiry.serviceTitle}
                          </p>
                          <p className="mt-0.5 text-[11px] text-brand-slate">
                            {enquiry.name} · {enquiry.budgetBand} · preferred{" "}
                            {enquiry.preferredDate || "not stated"}
                          </p>
                          <p className="mt-1 line-clamp-2 text-brand-slate">{enquiry.message}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-lg border border-brand-border bg-white p-6">
                  <h3 className="font-display text-base font-semibold text-brand-charcoal">
                    Consultation requests ({database.consultationBookings.length})
                  </h3>
                  {database.consultationBookings.length === 0 ? (
                    <p className="mt-2 text-xs text-brand-slate">No consultations requested yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {database.consultationBookings.slice(0, 6).map((booking) => (
                        <li
                          key={booking.id}
                          className="rounded-md border border-brand-border px-3 py-2 text-xs"
                        >
                          <p className="font-semibold text-brand-charcoal">
                            {booking.serviceTitle}
                          </p>
                          <p className="mt-0.5 text-[11px] text-brand-slate">
                            {booking.name} · {booking.timezone} · {booking.preferredSlot}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-lg border border-brand-border bg-white p-6">
                  <h3 className="font-display text-base font-semibold text-brand-charcoal">
                    Newsletter subscriptions ({database.newsletterSubscriptions.length})
                  </h3>
                  {database.newsletterSubscriptions.length === 0 ? (
                    <p className="mt-2 text-xs text-brand-slate">No subscriptions recorded yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {database.newsletterSubscriptions.slice(0, 6).map((subscription) => (
                        <li
                          key={subscription.id}
                          className="rounded-md border border-brand-border px-3 py-2 text-xs"
                        >
                          <p className="font-semibold text-brand-charcoal">{subscription.email}</p>
                          <p className="mt-0.5 text-[11px] text-brand-slate">
                            {subscription.preferences.join(", ")} · {subscription.frequency}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <Modal
        open={moderating !== null}
        onClose={() => setModerating(null)}
        title={
          moderating?.action === "active"
            ? "Approve survey for publication"
            : "Return survey to creator"
        }
        description={moderating?.title ?? ""}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModerating(null)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-navy text-white hover:bg-brand-navy-light"
              onClick={() => void submitModeration()}
            >
              {moderating?.action === "active" ? "Approve & publish" : "Return with note"}
            </Button>
          </div>
        }
      >
        <label className="block text-xs font-semibold text-brand-slate">
          Moderation note (shown to the creator)
          <textarea
            className={`${inputClass} mt-1`}
            rows={4}
            value={moderationNote}
            onChange={(event) => setModerationNote(event.target.value)}
            placeholder="Record what was reviewed and any conditions attached to publication."
          />
        </label>
        <p className="mt-3 text-[11px] leading-relaxed text-brand-slate">
          Review checklist: consent notice present and accurate · incentives clearly stated · no
          representativeness claims without a stated sampling method · questions answerable and
          non-leading · no personal data collected beyond what the notice describes.
        </p>
      </Modal>

      <Modal
        open={editingPlan !== null}
        onClose={() => setEditingPlan(null)}
        title={`Configure ${editingPlan?.name ?? "plan"}`}
        description="Leave a limit blank for unlimited. Changes apply everywhere the plan is referenced."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingPlan(null)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-navy text-white hover:bg-brand-navy-light"
              onClick={() => void savePlan()}
            >
              Save plan
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-brand-slate">
            Price (GBP)
            <input
              className={`${inputClass} mt-1`}
              type="number"
              min={0}
              step={1}
              value={planDraft.price}
              onChange={(event) =>
                setPlanDraft({ ...planDraft, price: Number(event.target.value) })
              }
            />
          </label>
          <label className="block text-xs font-semibold text-brand-slate">
            Seats included
            <input
              className={`${inputClass} mt-1`}
              type="number"
              min={1}
              value={planDraft.seatsIncluded}
              onChange={(event) =>
                setPlanDraft({ ...planDraft, seatsIncluded: Number(event.target.value) })
              }
            />
          </label>
          <label className="block text-xs font-semibold text-brand-slate">
            Question limit (blank = unlimited)
            <input
              className={`${inputClass} mt-1`}
              type="number"
              min={1}
              value={planDraft.questionLimit}
              onChange={(event) =>
                setPlanDraft({ ...planDraft, questionLimit: event.target.value })
              }
            />
          </label>
          <label className="block text-xs font-semibold text-brand-slate">
            Response limit (blank = unlimited)
            <input
              className={`${inputClass} mt-1`}
              type="number"
              min={1}
              value={planDraft.responseLimit}
              onChange={(event) =>
                setPlanDraft({ ...planDraft, responseLimit: event.target.value })
              }
            />
          </label>
          <label className="block text-xs font-semibold text-brand-slate">
            Survey limit (blank = unlimited)
            <input
              className={`${inputClass} mt-1`}
              type="number"
              min={1}
              value={planDraft.surveyLimit}
              onChange={(event) => setPlanDraft({ ...planDraft, surveyLimit: event.target.value })}
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={quoting !== null}
        onClose={() => setQuoting(null)}
        title={`Quotation for ${quoting?.reference ?? ""}`}
        description="Tier price plus selected add-ons. The campaign moves to Quote Sent and the client sees this figure in their tracker."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setQuoting(null)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-navy text-white hover:bg-brand-navy-light"
              onClick={() => void submitQuote()}
            >
              Issue quotation
            </Button>
          </div>
        }
      >
        <label className="block text-xs font-semibold text-brand-slate">
          Quoted amount excluding VAT (GBP)
          <input
            className={`${inputClass} mt-1`}
            type="number"
            min={0}
            step={10}
            value={quoteAmount}
            onChange={(event) => setQuoteAmount(event.target.value)}
          />
        </label>
        <p className="mt-3 text-[11px] leading-relaxed text-brand-slate">
          Published tier prices:{" "}
          {prTiers
            .map((tier) => `${tier.shortName} from ${formatCurrency(tier.priceFrom)}`)
            .join(" · ")}
          . Quotations may include add-ons and channel fees, but must never include earned media.
        </p>
      </Modal>

      <Modal
        open={advancing !== null}
        onClose={() => setAdvancing(null)}
        title={`Move ${advancing?.reference ?? ""} to ${prStatuses.find((entry) => entry.id === advancing?.status)?.label ?? ""}`}
        description="The note is appended to the campaign's workflow log with your name and today's date."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAdvancing(null)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-navy text-white hover:bg-brand-navy-light"
              onClick={() => void submitStatusAdvance()}
            >
              Update campaign
            </Button>
          </div>
        }
      >
        <label className="block text-xs font-semibold text-brand-slate">
          Workflow note
          <textarea
            className={`${inputClass} mt-1`}
            rows={3}
            value={advanceNote}
            onChange={(event) => setAdvanceNote(event.target.value)}
            placeholder="Describe what happened, what was checked and what happens next."
          />
        </label>
      </Modal>

      <Modal
        open={publishing !== null}
        onClose={() => setPublishing(null)}
        title={`Record a placement for ${publishing?.reference ?? ""}`}
        description="Only record placements that are contractually confirmed. Earned-media pickup is logged separately and never invoiced."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPublishing(null)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-navy text-white hover:bg-brand-navy-light"
              onClick={() => void submitPublishedUrl()}
            >
              Add placement
            </Button>
          </div>
        }
      >
        <label className="block text-xs font-semibold text-brand-slate">
          Placement URL
          <input
            className={`${inputClass} mt-1`}
            placeholder="https://…"
            value={publishedUrl}
            onChange={(event) => setPublishedUrl(event.target.value)}
          />
        </label>
      </Modal>
    </div>
  );
}

export default AdminPage;

/** One club kit request with its roster and a quote reply form. */
function KitQuoteCard({ requestId }: { requestId: string }) {
  const database = useDatabase();
  const [quoteNaira, setQuoteNaira] = useState("");
  const [note, setNote] = useState("");
  const request = database.kitRequests.find((candidate) => candidate.id === requestId);
  if (!request) return null;

  return (
    <article className="rounded-lg border border-brand-border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-brand-charcoal">
          {request.clubName} · {request.sport} · {request.quantity} kits
        </h3>
        <Badge tone={request.status === "quoted" ? "success" : "warning"}>
          {request.status === "quoted"
            ? `Quoted ₦${(request.quoteNaira ?? 0).toLocaleString()}`
            : "Awaiting quote"}
        </Badge>
      </div>
      <p className="mt-1 text-xs text-brand-slate">
        Colours {request.primaryColor} / {request.secondaryColor}
        {request.crestFileName ? ` · crest ${request.crestFileName}` : ""} · deliver{" "}
        {request.deliveryDate || "TBC"} to {request.deliveryAddress || "address TBC"}
      </p>
      {request.roster.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border text-brand-slate">
                <th className="py-1 pr-4 font-semibold">Player</th>
                <th className="py-1 pr-4 font-semibold">Number</th>
                <th className="py-1 font-semibold">Size</th>
              </tr>
            </thead>
            <tbody>
              {request.roster.map((row, index) => (
                <tr key={index} className="border-b border-brand-border/60 text-brand-charcoal">
                  <td className="py-1 pr-4">{row.name}</td>
                  <td className="py-1 pr-4">{row.number}</td>
                  <td className="py-1">{row.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {request.notes ? (
        <p className="mt-2 text-xs italic text-brand-slate">“{request.notes}”</p>
      ) : null}
      {request.status === "quoted" ? (
        request.quoteNote ? (
          <p className="mt-2 text-xs text-brand-slate">Quote note: {request.quoteNote}</p>
        ) : null
      ) : (
        <div className="mt-3 grid gap-2 sm:grid-cols-[160px_1fr_auto]">
          <input
            className={inputClass}
            type="number"
            placeholder="Quote ₦"
            value={quoteNaira}
            onChange={(event) => setQuoteNaira(event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Quote note (fabric, splits, delivery)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <Button
            size="sm"
            className="bg-brand-gold text-brand-navy-dark hover:bg-[#d4b87e]"
            onClick={() => {
              void api.kits
                .quote(request.id, Number(quoteNaira || 0), note)
                .then(() => toast.success(`Quote sent for ${request.clubName}.`));
            }}
          >
            Send quote
          </Button>
        </div>
      )}
    </article>
  );
}

/** Homepage video manager + survey economy settings (admin configurable). */
function PlatformSettingsPanel() {
  const database = useDatabase();
  const [videoUrl, setVideoUrl] = useState(database.settings.heroVideoUrl);
  const [pointToNaira, setPointToNaira] = useState(String(database.settings.pointToNaira));
  const [minWithdrawal, setMinWithdrawal] = useState(String(database.settings.minWithdrawalNaira));

  async function uploadVideo(file: File | undefined): Promise<void> {
    if (!file) return;
    if (file.size > 4_000_000) {
      toast.error("Video too large for browser storage — paste a hosted URL instead (max 4 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setVideoUrl(url);
      void api.settings
        .update({ heroVideoUrl: url })
        .then(() => toast.success("Homepage video uploaded — the banner now loops it."));
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-brand-charcoal">
          Homepage video manager
        </h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
          The looping marketing banner on the homepage plays this video on auto-repeat. Upload a
          short clip (stored locally, max 4 MB) or paste a hosted URL; clear it to fall back to the
          brand photo montage.
        </p>
      </div>
      <div className="grid gap-4 rounded-lg border border-brand-border bg-white p-5 lg:grid-cols-[1fr_auto]">
        <label className="block text-xs font-semibold text-brand-slate">
          Video URL (or data URL)
          <input
            className={`${inputClass} mt-1`}
            value={videoUrl.startsWith("data:") ? "(uploaded file)" : videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://…/fmie-brand-loop.mp4"
          />
        </label>
        <div className="flex items-end gap-2">
          <label className="cursor-pointer rounded-md border border-brand-border px-3 py-2 text-xs font-semibold text-brand-navy hover:border-brand-gold">
            Upload video
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => void uploadVideo(event.target.files?.[0])}
            />
          </label>
          <Button
            size="sm"
            className="bg-brand-navy text-white hover:bg-brand-navy-dark"
            onClick={() =>
              void api.settings
                .update({
                  heroVideoUrl:
                    videoUrl === "(uploaded file)" ? database.settings.heroVideoUrl : videoUrl,
                })
                .then(() => toast.success("Homepage video updated."))
            }
          >
            Save video
          </Button>
        </div>
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold text-brand-charcoal">
          Platform settings
        </h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
          Survey point conversion and the minimum bank withdrawal are commercial levers — never
          hardcoded in the UI.
        </p>
      </div>
      <div className="grid gap-4 rounded-lg border border-brand-border bg-white p-5 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-brand-slate">
          Naira per survey point
          <input
            className={`${inputClass} mt-1`}
            type="number"
            value={pointToNaira}
            onChange={(event) => setPointToNaira(event.target.value)}
          />
        </label>
        <label className="block text-xs font-semibold text-brand-slate">
          Minimum withdrawal (₦)
          <input
            className={`${inputClass} mt-1`}
            type="number"
            value={minWithdrawal}
            onChange={(event) => setMinWithdrawal(event.target.value)}
          />
        </label>
        <div className="sm:col-span-2">
          <Button
            size="sm"
            className="bg-brand-gold text-brand-navy-dark hover:bg-[#d4b87e]"
            onClick={() =>
              void api.settings
                .update({
                  pointToNaira: Number(pointToNaira || 100),
                  minWithdrawalNaira: Number(minWithdrawal || 2000),
                })
                .then(() => toast.success("Platform settings saved."))
            }
          >
            Save settings
          </Button>
        </div>
      </div>
    </section>
  );
}
