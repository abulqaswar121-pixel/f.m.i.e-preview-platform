import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  Download,
  FlaskConical,
  LogOut,
  Megaphone,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { EmptyState, KeyedList, StatCard } from "@/components/common/Primitives";
import { StatusBadge } from "@/components/press/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  commerce,
  formatDate,
  formatCurrency,
  prTiers,
  roleDescriptions,
  roleLabels,
  site,
} from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { api, downloadTextFile, useDatabase } from "@/services/api";
import { cn } from "@/lib/utils";
import type { Survey, SurveyStatus } from "@/types";

export type DashboardTab = "overview" | "surveys" | "press" | "orders" | "account";

const TABS: { id: DashboardTab; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "surveys", label: "My surveys", icon: FlaskConical },
  { id: "press", label: "Press campaigns", icon: Megaphone },
  { id: "orders", label: "Orders & invoices", icon: Package },
  { id: "account", label: "Account & organisation", icon: UserCog },
];

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none";

const surveyStatusTone: Record<SurveyStatus, "muted" | "warning" | "success" | "info"> = {
  draft: "muted",
  pending_moderation: "warning",
  active: "success",
  closed: "info",
};

export function DashboardPage() {
  const search = useSearch({ strict: false }) as { tab?: DashboardTab };
  const tab: DashboardTab = TABS.some((entry) => entry.id === search.tab)
    ? (search.tab as DashboardTab)
    : "overview";

  const database = useDatabase();
  const { user, isAdmin, personas, switchPersona, signOut, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    jobTitle: user?.jobTitle ?? "",
    location: user?.location ?? "",
    organization: user?.organization ?? "",
  });

  const mySurveys = useMemo(() => {
    if (!user) return [];
    const mine = isAdmin
      ? database.surveys
      : database.surveys.filter((survey) => survey.creatorId === user.id);
    return [...mine].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [database.surveys, user, isAdmin]);

  const myCampaigns = useMemo(() => {
    if (!user) return [];
    const mine = isAdmin
      ? database.pressReleases
      : database.pressReleases.filter((booking) => booking.userId === user.id);
    return [...mine].sort(
      (a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime(),
    );
  }, [database.pressReleases, user, isAdmin]);

  const myOrders = useMemo(() => {
    if (!user) return [];
    const mine = isAdmin
      ? database.orders
      : database.orders.filter((order) => order.userId === user.id || order.email === user.email);
    return [...mine].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    );
  }, [database.orders, user, isAdmin]);

  const organization = useMemo(
    () =>
      user?.organization
        ? database.organizations.find((entry) => entry.name === user.organization)
        : undefined,
    [database.organizations, user],
  );

  const plan = useMemo(
    () => database.surveyPlans.find((entry) => entry.id === organization?.planId),
    [database.surveyPlans, organization],
  );

  if (!user || user.role === "visitor") {
    return (
      <div className="fmie-container py-12">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            title="Your dashboard is one sign-in away"
            description="Sign in with any valid-looking email to open a pre-filled dashboard, or switch straight to a demonstration persona below. Nothing is verified and no email is sent."
            action={{ label: "Sign in", to: "/signin" }}
            icon={<ShieldCheck className="h-6 w-6" />}
          />
          <div className="mt-8 rounded-lg border border-brand-border bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-brand-charcoal">
              One-click demo presets
            </h2>
            <p className="mt-1 text-xs text-brand-slate">
              Each preset loads a complete account with surveys, campaigns, orders and permissions
              already in place.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  onClick={async () => {
                    await switchPersona(persona.id);
                    toast.success(`Signed in as ${persona.name}`, {
                      description: roleLabels[persona.role],
                    });
                  }}
                  className="rounded-lg border border-brand-border bg-brand-cream/40 p-4 text-left transition-colors hover:border-brand-navy/40"
                >
                  <p className="font-display text-sm font-semibold text-brand-charcoal">
                    {persona.name}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-gold-dark">
                    {roleLabels[persona.role]}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-brand-slate">
                    {roleDescriptions[persona.role]}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalResponses = mySurveys.reduce((sum, survey) => sum + survey.responseCount, 0);
  const activeCampaigns = myCampaigns.filter((booking) =>
    [
      "submitted",
      "under_review",
      "quote_sent",
      "awaiting_payment",
      "approved",
      "in_production",
      "distribution_in_progress",
    ].includes(booking.status),
  ).length;
  const orderValue = myOrders.reduce((sum, order) => sum + order.total, 0);

  const changeSurveyStatus = async (survey: Survey, status: SurveyStatus) => {
    await api.surveys.setStatus(survey.id, status);
    toast.success(`Survey ${status === "closed" ? "closed" : "reopened"}`, {
      description: `${survey.title} · ${survey.responseCount} responses retained.`,
    });
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await updateProfile({
      name: profile.name.trim() || user.name,
      jobTitle: profile.jobTitle.trim(),
      location: profile.location.trim(),
      organization: profile.organization.trim(),
    });
    setSaving(false);
    toast.success("Profile updated", {
      description: "Saved to local storage and reflected across the platform.",
    });
  };

  const downloadInvoice = async (orderId: string) => {
    const order = database.orders.find((entry) => entry.id === orderId);
    if (!order) return;
    const text = await api.orders.invoiceText(order);
    downloadTextFile(`${order.reference}-invoice.txt`, text, "text/plain;charset=utf-8");
    toast.success("Invoice downloaded", {
      description: "Simulated document — demonstration preview.",
    });
  };

  return (
    <div>
      <header className="border-b border-brand-border bg-white">
        <div className="fmie-container py-8">
          <p className="fmie-eyebrow">Member dashboard</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-brand-charcoal">{user.name}</h1>
              <p className="mt-1 text-sm text-brand-slate">
                {roleLabels[user.role]}
                {user.organization ? ` · ${user.organization}` : ""}
                {user.jobTitle ? ` · ${user.jobTitle}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
                <Link to="/surveys/create">
                  <Plus className="h-4 w-4" /> New survey
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/press-releases/book">
                  <Megaphone className="h-4 w-4" /> Book a press release
                </Link>
              </Button>
              {isAdmin ? (
                <Button asChild variant="outline">
                  <Link to="/admin">
                    <ShieldCheck className="h-4 w-4" /> Admin panel
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          <nav aria-label="Dashboard sections" className="mt-6 flex flex-wrap gap-2">
            {TABS.map((entry) => {
              const Icon = entry.icon;
              const active = tab === entry.id;
              return (
                <Link
                  key={entry.id}
                  to="/dashboard"
                  search={{ tab: entry.id }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                    active
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-brand-border bg-white text-brand-slate hover:border-brand-navy/40 hover:text-brand-navy",
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
                value={String(mySurveys.length)}
                hint={`${mySurveys.filter((survey) => survey.status === "active").length} active · ${totalResponses.toLocaleString("en-GB")} responses`}
                icon={<FlaskConical className="h-4 w-4" />}
              />
              <StatCard
                label="Press campaigns"
                value={String(myCampaigns.length)}
                hint={`${activeCampaigns} in flight`}
                tone="gold"
                icon={<Megaphone className="h-4 w-4" />}
              />
              <StatCard
                label="Orders"
                value={String(myOrders.length)}
                hint={formatCurrency(orderValue)}
                tone="success"
                icon={<Package className="h-4 w-4" />}
              />
              <StatCard
                label="Plan"
                value={plan?.name ?? roleLabels[user.role]}
                hint={
                  organization
                    ? `${organization.seatsUsed} of ${organization.seatsIncluded} seats used`
                    : "Individual account"
                }
                tone="info"
                icon={<Building2 className="h-4 w-4" />}
              />
            </div>

            <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-lg border border-brand-border bg-white p-6">
                <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                  Recent activity
                </h2>
                <ul className="mt-4 divide-y divide-brand-border">
                  {[
                    ...mySurveys.slice(0, 3).map((survey) => ({
                      kind: "survey" as const,
                      id: survey.id,
                      at: survey.updatedAt,
                      label: `Survey updated — ${survey.title}`,
                      meta: `${survey.status.replace(/_/g, " ")} · ${survey.responseCount} responses`,
                    })),
                    ...myCampaigns.slice(0, 3).map((booking) => ({
                      kind: "campaign" as const,
                      id: booking.id,
                      at: booking.submittedDate,
                      label: `Press campaign — ${booking.referenceNumber}`,
                      meta: `${booking.status.replace(/_/g, " ")} · ${booking.title}`,
                    })),
                    ...myOrders.slice(0, 3).map((order) => ({
                      kind: "order" as const,
                      id: order.id,
                      at: order.placedAt,
                      label: `Order ${order.reference}`,
                      meta: `${order.status.replace(/_/g, " ")} · ${formatCurrency(order.total)}`,
                    })),
                  ]
                    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
                    .slice(0, 8)
                    .map((entry) => {
                      const inner = (
                        <>
                          <p className="truncate text-sm font-semibold text-brand-charcoal">
                            {entry.label}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-brand-slate">{entry.meta}</p>
                        </>
                      );
                      return (
                        <li
                          key={`${entry.kind}-${entry.id}`}
                          className="flex items-center justify-between gap-4 py-3"
                        >
                          {entry.kind === "survey" ? (
                            <Link
                              to="/surveys/$id"
                              params={{ id: entry.id }}
                              className="min-w-0 hover:underline"
                            >
                              {inner}
                            </Link>
                          ) : entry.kind === "campaign" ? (
                            <Link
                              to="/press-releases/$id"
                              params={{ id: entry.id }}
                              className="min-w-0 hover:underline"
                            >
                              {inner}
                            </Link>
                          ) : (
                            <Link
                              to="/dashboard"
                              search={{ tab: "orders" }}
                              className="min-w-0 hover:underline"
                            >
                              {inner}
                            </Link>
                          )}
                          <span className="shrink-0 text-[11px] text-brand-slate">
                            {formatDate(entry.at)}
                          </span>
                        </li>
                      );
                    })}
                </ul>
                {mySurveys.length + myCampaigns.length + myOrders.length === 0 ? (
                  <p className="mt-4 text-sm text-brand-slate">
                    Nothing recorded yet for this account. Create a survey or book a campaign and it
                    will appear here immediately.
                  </p>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-brand-border bg-white p-6">
                  <h2 className="font-display text-base font-semibold text-brand-charcoal">
                    Next actions
                  </h2>
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-brand-slate">
                    {myCampaigns
                      .filter((booking) => booking.status === "quote_sent")
                      .map((booking) => (
                        <li key={booking.id}>
                          <Link
                            to="/press-releases/$id"
                            params={{ id: booking.id }}
                            className="font-semibold text-brand-navy hover:underline"
                          >
                            Review the quotation for {booking.referenceNumber}
                          </Link>
                        </li>
                      ))}
                    {myCampaigns
                      .filter((booking) => booking.status === "awaiting_payment")
                      .map((booking) => (
                        <li key={booking.id}>
                          <Link
                            to="/press-releases/$id"
                            params={{ id: booking.id }}
                            className="font-semibold text-brand-navy hover:underline"
                          >
                            Submit payment for {booking.referenceNumber} (simulated)
                          </Link>
                        </li>
                      ))}
                    {mySurveys
                      .filter((survey) => survey.status === "draft")
                      .map((survey) => (
                        <li key={survey.id}>
                          <Link
                            to="/surveys/$id"
                            params={{ id: survey.id }}
                            className="font-semibold text-brand-navy hover:underline"
                          >
                            Finish and submit “{survey.title}” for moderation
                          </Link>
                        </li>
                      ))}
                    {mySurveys
                      .filter((survey) => survey.status === "pending_moderation")
                      .map((survey) => (
                        <li key={survey.id}>
                          <span className="text-brand-slate">
                            “{survey.title}” is awaiting moderation
                            {survey.moderationNote ? ` — ${survey.moderationNote}` : ""}
                          </span>
                        </li>
                      ))}
                    {myOrders
                      .filter((order) => order.status === "pending_payment")
                      .map((order) => (
                        <li key={order.id}>
                          <span className="font-semibold text-brand-navy">
                            Order {order.reference} awaits payment
                          </span>
                        </li>
                      ))}
                  </ul>
                  <p className="mt-3 border-t border-brand-border pt-3 text-[11px] text-brand-slate">
                    Data is stored in this browser's local storage. Use the administrator panel to
                    reset the preview to its shipped sample data.
                  </p>
                </div>
                <ComplianceBanner variant="sample" className="text-xs" />
              </div>
            </section>
          </>
        ) : null}

        {tab === "surveys" ? (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-brand-charcoal">
                  {isAdmin ? "All surveys" : "My surveys"}
                </h2>
                <p className="mt-1 text-xs text-brand-slate">
                  {isAdmin
                    ? "Administrator view — every survey on the platform, including drafts and items awaiting moderation."
                    : "Surveys you created, with response progress against your plan limit."}
                </p>
              </div>
              <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
                <Link to="/surveys/create">
                  <Plus className="h-4 w-4" /> Create a survey
                </Link>
              </Button>
            </div>

            {mySurveys.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No surveys yet"
                  description="Build a Likert, multiple-choice or long-text instrument, preview it live and publish it to the marketplace."
                  action={{ label: "Create your first survey", to: "/surveys/create" }}
                  icon={<FlaskConical className="h-6 w-6" />}
                />
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {mySurveys.map((survey) => {
                  const progress =
                    survey.responseLimit > 0
                      ? Math.min(100, (survey.responseCount / survey.responseLimit) * 100)
                      : 0;
                  return (
                    <article
                      key={survey.id}
                      className="rounded-lg border border-brand-border bg-white p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={surveyStatusTone[survey.status]}>
                              {survey.status.replace(/_/g, " ")}
                            </Badge>
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
                            {survey.isBranded ? <Badge tone="info">Branded</Badge> : null}
                            {survey.isAnonymous ? <Badge tone="muted">Anonymous</Badge> : null}
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
                          <p className="mt-1 text-xs text-brand-slate">
                            {survey.category} · {survey.questions.length} questions · closes{" "}
                            {formatDate(survey.closingDate)}
                            {survey.moderationNote ? ` · moderation: ${survey.moderationNote}` : ""}
                          </p>
                        </div>
                        <div className="w-full sm:w-56">
                          <div className="flex items-baseline justify-between text-xs text-brand-slate">
                            <span className="font-semibold tabular-nums text-brand-charcoal">
                              {survey.responseCount.toLocaleString("en-GB")}
                            </span>
                            <span>of {survey.responseLimit.toLocaleString("en-GB")} responses</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-border">
                            <div
                              className="h-full rounded-full bg-brand-navy transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-border pt-3">
                        <Button asChild size="sm" variant="outline">
                          <Link
                            to="/surveys/$id"
                            params={{ id: survey.id }}
                            search={{ tab: "results" }}
                          >
                            <BarChart3 className="h-3.5 w-3.5" /> Results
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link
                            to="/surveys/$id"
                            params={{ id: survey.id }}
                            search={{ tab: "take" }}
                          >
                            Preview as respondent
                          </Link>
                        </Button>
                        {survey.status === "active" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void changeSurveyStatus(survey, "closed")}
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Close survey
                          </Button>
                        ) : null}
                        {survey.status === "closed" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void changeSurveyStatus(survey, "active")}
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Reopen
                          </Button>
                        ) : null}
                        {survey.status === "draft" && isAdmin ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              await api.surveys.delete(survey.id);
                              toast.success("Survey deleted", { description: survey.title });
                            }}
                          >
                            Delete draft
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="mt-6">
              <ComplianceBanner variant="survey" />
            </div>
          </section>
        ) : null}

        {tab === "press" ? (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-brand-charcoal">
                  {isAdmin ? "All press campaigns" : "My press campaigns"}
                </h2>
                <p className="mt-1 text-xs text-brand-slate">
                  Live workflow state, quotation value and the dated event log for each booking.
                </p>
              </div>
              <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
                <Link to="/press-releases/book">
                  <Plus className="h-4 w-4" /> New booking
                </Link>
              </Button>
            </div>

            {myCampaigns.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No campaigns booked"
                  description="Choose a tier, describe the announcement and the press desk will issue a priced quotation after editorial and compliance review."
                  action={{ label: "Book a press release", to: "/press-releases/book" }}
                  icon={<Megaphone className="h-6 w-6" />}
                />
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-lg border border-brand-border bg-white">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-brand-border bg-brand-cream/60 text-xs uppercase tracking-[0.08em] text-brand-slate">
                    <tr>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Campaign</th>
                      <th className="px-4 py-3">Tier</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Quoted</th>
                      <th className="px-4 py-3">Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {myCampaigns.map((booking) => (
                      <tr key={booking.id} className="hover:bg-brand-cream/40">
                        <td className="px-4 py-3">
                          <Link
                            to="/press-releases/$id"
                            params={{ id: booking.id }}
                            className="font-mono text-xs font-semibold text-brand-navy hover:underline"
                          >
                            {booking.referenceNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <p className="max-w-xs truncate font-semibold text-brand-charcoal">
                            {booking.title}
                          </p>
                          <p className="text-xs text-brand-slate">{booking.companyName}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-brand-slate">
                          {prTiers.find((tier) => tier.id === booking.tier)?.shortName ??
                            booking.tier}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {booking.quoteAmount !== undefined
                            ? formatCurrency(booking.quoteAmount)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-brand-slate">
                          {formatDate(booking.targetDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6">
              <ComplianceBanner variant="distribution" />
            </div>
          </section>
        ) : null}

        {tab === "orders" ? (
          <section>
            <h2 className="font-display text-xl font-semibold text-brand-charcoal">
              {isAdmin ? "All orders" : "My orders & invoices"}
            </h2>
            <p className="mt-1 text-xs text-brand-slate">
              Simulated commerce records. Invoices can be downloaded as plain-text documents for
              demonstration.
            </p>
            {myOrders.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No orders yet"
                  description="Browse branded apparel, stationery and accessories, then check out to generate a simulated order and invoice."
                  action={{ label: "Visit the shop", to: "/shop" }}
                  icon={<Package className="h-6 w-6" />}
                />
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {myOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-lg border border-brand-border bg-white p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 font-mono text-sm font-semibold text-brand-charcoal">
                          {order.reference}
                          <Badge
                            tone={
                              order.status === "delivered"
                                ? "success"
                                : order.status === "cancelled" || order.status === "refunded"
                                  ? "danger"
                                  : order.status === "pending_payment"
                                    ? "warning"
                                    : "info"
                            }
                          >
                            {order.status.replace(/_/g, " ")}
                          </Badge>
                        </p>
                        <p className="mt-1 text-xs text-brand-slate">
                          Placed {formatDate(order.placedAt)} ·{" "}
                          {order.paymentMethod.replace(/_/g, " ")} ·{" "}
                          <span className="font-mono">{order.paymentReference}</span>
                        </p>
                        <ul className="mt-2 space-y-1">
                          {order.items.map((item) => (
                            <li
                              key={`${item.productId}-${item.variant}`}
                              className="text-xs text-brand-slate"
                            >
                              {item.quantity} × {item.name} ({item.variant}) —{" "}
                              {formatCurrency(item.price * item.quantity)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl font-bold text-brand-navy">
                          {formatCurrency(order.total)}
                        </p>
                        {order.promoCode ? (
                          <p className="mt-0.5 text-[11px] text-success">Promo {order.promoCode}</p>
                        ) : null}
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={() => void downloadInvoice(order.id)}
                        >
                          <Download className="h-3.5 w-3.5" /> Invoice
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <p className="mt-6 rounded-md bg-brand-cream px-4 py-3 text-[11px] leading-relaxed text-brand-slate">
              {commerce.vatNote} Delivery: standard {formatCurrency(commerce.standardShipping)} ·
              international {formatCurrency(commerce.internationalShipping)} · free over{" "}
              {formatCurrency(commerce.freeShippingThreshold)}.
            </p>
          </section>
        ) : null}

        {tab === "account" ? (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-6">
              <form
                onSubmit={saveProfile}
                className="rounded-lg border border-brand-border bg-white p-6"
              >
                <h2 className="font-display text-lg font-semibold text-brand-charcoal">Profile</h2>
                <p className="mt-1 text-xs text-brand-slate">
                  Signed in as {user.email} · member since{" "}
                  {user.joinedAt ? formatDate(user.joinedAt) : "today"}.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    className={inputClass}
                    placeholder="Full name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="Job title"
                    value={profile.jobTitle}
                    onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="Location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="Organisation"
                    value={profile.organization}
                    onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-4 bg-brand-navy text-white hover:bg-brand-navy-light"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save profile"}
                </Button>
              </form>

              <div className="rounded-lg border border-brand-border bg-white p-6">
                <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                  Notification preferences
                </h2>
                <div className="mt-3 space-y-2">
                  {user.notificationPreferences ? (
                    Object.entries(user.notificationPreferences).map(([key, enabled]) => (
                      <label
                        key={key}
                        className="flex items-center justify-between gap-3 rounded-md border border-brand-border px-4 py-2.5"
                      >
                        <span className="text-xs text-brand-slate">
                          {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </span>
                        <input
                          type="checkbox"
                          className="accent-brand-navy"
                          checked={enabled}
                          onChange={async (event) => {
                            await updateProfile({
                              notificationPreferences: {
                                ...user.notificationPreferences!,
                                [key]: event.target.checked,
                              },
                            });
                          }}
                        />
                      </label>
                    ))
                  ) : (
                    <p className="text-xs text-brand-slate">
                      No preferences stored yet. Toggle any option to create them.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-brand-border bg-white p-6">
                <h2 className="font-display text-lg font-semibold text-brand-charcoal">Session</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {personas.map((persona) => (
                    <Button
                      key={persona.id}
                      size="sm"
                      variant={persona.id === user.id ? "default" : "outline"}
                      className={
                        persona.id === user.id
                          ? "bg-brand-navy text-white hover:bg-brand-navy-light"
                          : undefined
                      }
                      onClick={async () => {
                        await switchPersona(persona.id);
                        toast.success(`Switched to ${persona.name}`, {
                          description: roleLabels[persona.role],
                        });
                      }}
                    >
                      {roleLabels[persona.role]}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await signOut();
                      toast.success("Signed out", {
                        description: "You are browsing as a guest reader.",
                      });
                    }}
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </Button>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-brand-slate">
                  Switching persona updates permissions, navigation and dashboard contents
                  immediately — no page reload. {site.previewNotice}
                </p>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-lg border border-brand-border bg-white p-6">
                <h2 className="flex items-center gap-2 font-display text-base font-semibold text-brand-charcoal">
                  <Building2 className="h-4 w-4 text-brand-navy" /> Organisation
                </h2>
                {organization ? (
                  <>
                    <KeyedList
                      items={[
                        { label: "Name", value: organization.name },
                        { label: "Plan", value: plan?.name ?? organization.planId },
                        { label: "Sector", value: organization.sector },
                        { label: "Country", value: organization.country },
                        {
                          label: "Seats",
                          value: `${organization.seatsUsed} used of ${organization.seatsIncluded} included`,
                        },
                      ]}
                    />
                    <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-brand-slate">
                      Team members
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {organization.teamMembers.map((member) => (
                        <li
                          key={member.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-brand-border px-3 py-2"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold text-brand-charcoal">
                              {member.name}
                            </span>
                            <span className="block truncate text-[11px] text-brand-slate">
                              {member.email}
                            </span>
                          </span>
                          <Badge tone={member.status === "active" ? "success" : "warning"}>
                            {member.role}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                    <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.1em] text-brand-slate">
                      Billing history
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {organization.invoices.map((invoice) => (
                        <li
                          key={invoice.id}
                          className="rounded-md border border-brand-border px-3 py-2 text-xs"
                        >
                          <p className="flex items-center justify-between gap-2">
                            <span className="font-mono font-semibold text-brand-charcoal">
                              {invoice.reference}
                            </span>
                            <Badge
                              tone={
                                invoice.status === "paid"
                                  ? "success"
                                  : invoice.status === "due"
                                    ? "danger"
                                    : invoice.status === "scheduled"
                                      ? "info"
                                      : "muted"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </p>
                          <p className="mt-1 text-brand-slate">{invoice.description}</p>
                          <p className="mt-1 flex justify-between text-brand-slate">
                            <span>Issued {formatDate(invoice.issuedAt)}</span>
                            <span className="font-semibold tabular-nums text-brand-charcoal">
                              {formatCurrency(invoice.amount)}
                            </span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="mt-2 text-xs leading-relaxed text-brand-slate">
                    This account is an individual membership. Corporate plans add team seats,
                    billing history and branded survey experiences. Switch to the corporate preset
                    to see a populated organisation record.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-brand-border bg-white p-6">
                <h2 className="font-display text-base font-semibold text-brand-charcoal">
                  Plan limits
                </h2>
                {plan ? (
                  <ul className="mt-3 space-y-1.5 text-xs text-brand-slate">
                    <li>Questions per survey: {plan.questionLimit ?? "Unlimited"}</li>
                    <li>
                      Responses per survey:{" "}
                      {plan.responseLimit?.toLocaleString("en-GB") ?? "Unlimited"}
                    </li>
                    <li>Active surveys: {plan.surveyLimit ?? "Unlimited"}</li>
                    <li>Seats included: {plan.seatsIncluded}</li>
                    <li>
                      Price: {plan.price === 0 ? "Free" : formatCurrency(plan.price)}{" "}
                      {plan.billingPeriod === "annual"
                        ? "per year"
                        : plan.billingPeriod === "monthly"
                          ? "per month"
                          : "one-off"}
                    </li>
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-brand-slate">
                    No organisation plan attached. Plans are configured by an administrator, never
                    hardcoded in the interface.
                  </p>
                )}
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/surveys/plans">Compare plans</Link>
                </Button>
              </div>

              {isAdmin ? (
                <div className="rounded-lg border border-danger/40 bg-danger/5 p-6">
                  <h2 className="font-display text-base font-semibold text-brand-charcoal">
                    Reset demonstration data
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-brand-slate">
                    Clears local storage and restores every article, survey, campaign, order and
                    persona to the shipped sample set.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={async () => {
                      await api.admin.reset();
                      toast.success("Preview reset", { description: "Sample data restored." });
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reset preview data
                  </Button>
                </div>
              ) : null}
            </aside>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default DashboardPage;
