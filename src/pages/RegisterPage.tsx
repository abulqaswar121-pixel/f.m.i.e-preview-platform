import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { PageHeader } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { countries, industries, roleLabels, site } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none";

const INTENTS = [
  {
    id: "research",
    label: "Publish surveys and read research",
    detail: "Free and premium research plans, analytics filters and demo-only export.",
  },
  {
    id: "communications",
    label: "Book press releases and distribution",
    detail: "Three tiers, quotations, workflow tracking and completion dossiers.",
  },
  {
    id: "services",
    label: "Commission executive services",
    detail:
      "Profile writing, marketing contracts, pitching advisory and Wikipedia policy guidance.",
  },
  {
    id: "commerce",
    label: "Order branded merchandise",
    detail: "Apparel, stationery and accessories with invoicing and purchase-order billing.",
  },
] as const;

export function RegisterPage() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [intent, setIntent] = useState<(typeof INTENTS)[number]["id"]>("research");
  const [working, setWorking] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    organization: string;
    jobTitle: string;
    country: string;
    industry: string;
    consent: boolean;
    commercial: boolean;
  }>({
    name: "",
    email: "",
    organization: "",
    jobTitle: "",
    country: countries[0] ?? "United Kingdom",
    industry: industries[0] ?? "Technology",
    consent: false,
    commercial: false,
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      toast.error("Enter a valid-looking email address.", {
        description: "This preview accepts any correctly formatted address — nothing is verified.",
      });
      return;
    }
    if (!form.consent) {
      toast.error("Confirm the demonstration-preview terms to create an account.");
      return;
    }

    setWorking(true);
    const account = await signIn(form.email, form.name);
    await api.users.updateProfile(account.id, {
      jobTitle: form.jobTitle.trim() || roleLabels[account.role],
      location: form.country,
      organization: form.organization.trim() || undefined,
      notificationPreferences: {
        editorialDigest: true,
        surveyActivity: true,
        pressReleaseUpdates: intent === "communications",
        orderAndInvoice: intent === "commerce",
        commercialOffers: form.commercial,
      },
    });
    setWorking(false);
    toast.success(`Welcome to F.M.I.E, ${account.name.split(" ")[0] ?? account.name}`, {
      description: "Your dashboard is pre-filled with sample surveys, campaigns and orders.",
    });
    void navigate({ to: "/dashboard" });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Create an account"
        title="Join the F.M.I.E platform"
        description="One account across research, distribution, services and commerce. Registration is simulated: nothing is verified, no email is sent and no data leaves your browser."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Register" }]}
      />

      <div className="fmie-container grid gap-8 py-10 lg:grid-cols-[1.2fr_1fr]">
        <form
          onSubmit={submit}
          className="rounded-lg border border-brand-border bg-white p-6 sm:p-8"
        >
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-brand-charcoal">
            <UserPlus className="h-5 w-5 text-brand-navy" /> Your details
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-brand-slate">
              Full name *
              <input
                className={`${inputClass} mt-1`}
                placeholder="Amara Okafor"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                autoComplete="name"
                required
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Work email *
              <input
                className={`${inputClass} mt-1`}
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                autoComplete="email"
                required
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Organisation
              <input
                className={`${inputClass} mt-1`}
                placeholder="InnoTrend Analytics"
                value={form.organization}
                onChange={(event) => setForm({ ...form, organization: event.target.value })}
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Job title
              <input
                className={`${inputClass} mt-1`}
                placeholder="Head of Research"
                value={form.jobTitle}
                onChange={(event) => setForm({ ...form, jobTitle: event.target.value })}
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Country
              <select
                className={`${inputClass} mt-1`}
                value={form.country}
                onChange={(event) => setForm({ ...form, country: event.target.value })}
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Industry
              <select
                className={`${inputClass} mt-1`}
                value={form.industry}
                onChange={(event) => setForm({ ...form, industry: event.target.value })}
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="mt-6">
            <legend className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-slate">
              Primary reason for joining
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {INTENTS.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 ${
                    intent === option.id
                      ? "border-brand-navy bg-brand-cream/60"
                      : "border-brand-border bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="intent"
                    className="mt-1 accent-brand-navy"
                    checked={intent === option.id}
                    onChange={() => setIntent(option.id)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-brand-charcoal">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-brand-slate">
                      {option.detail}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 space-y-2">
            <label className="flex items-start gap-2 text-xs leading-relaxed text-brand-slate">
              <input
                type="checkbox"
                className="mt-0.5 accent-brand-navy"
                checked={form.consent}
                onChange={(event) => setForm({ ...form, consent: event.target.checked })}
              />
              I understand this is a demonstration preview: no real account, payment, email or
              publication results from anything I submit here. {site.previewNotice}
            </label>
            <label className="flex items-start gap-2 text-xs leading-relaxed text-brand-slate">
              <input
                type="checkbox"
                className="mt-0.5 accent-brand-navy"
                checked={form.commercial}
                onChange={(event) => setForm({ ...form, commercial: event.target.checked })}
              />
              Send me commercial and event notifications (optional — editorial and research
              notifications are on by default).
            </label>
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full bg-brand-navy text-white hover:bg-brand-navy-light"
            disabled={working}
          >
            {working ? "Creating account…" : "Create account"}
          </Button>
          <p className="mt-3 text-center text-xs text-brand-slate">
            Already registered?{" "}
            <Link to="/signin" className="font-semibold text-brand-navy hover:underline">
              Sign in instead
            </Link>
          </p>
        </form>

        <aside className="space-y-4">
          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-brand-charcoal">
              <Building2 className="h-4 w-4 text-brand-navy" /> Corporate accounts
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-brand-slate">
              Corporate plans add team seats, billing history, purchase-order commerce and branded
              survey experiences. Plans are configured by an administrator rather than hardcoded, so
              limits can change without a release.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/surveys/plans">Compare research plans</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h3 className="font-display text-base font-semibold text-brand-charcoal">
              Prefer to explore first?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-brand-slate">
              Switch to a demonstration persona from the header at any time. Each preset loads a
              complete account with sample surveys, campaigns and orders.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="cream">{roleLabels.survey_creator}</Badge>
              <Badge tone="cream">{roleLabels.premium_customer}</Badge>
              <Badge tone="gold">{roleLabels.administrator}</Badge>
            </div>
            <Button asChild variant="ghost" size="sm" className="mt-4">
              <Link to="/signin">Use a demo preset</Link>
            </Button>
          </div>

          {user ? (
            <p className="rounded-md bg-brand-cream px-4 py-3 text-[11px] leading-relaxed text-brand-slate">
              You are currently signed in as {user.name} ({roleLabels[user.role]}). Creating another
              account will switch your session.
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export default RegisterPage;
