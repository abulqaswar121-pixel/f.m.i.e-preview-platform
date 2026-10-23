import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, MailCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { OrDivider, SocialSignInButtons } from "@/components/auth/SocialSignInButtons";
import { PageHeader } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { countries, industries } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 8;

const INTENTS = [
  {
    id: "earn",
    label: "Answer surveys and earn",
    detail: "Get paid for completed surveys and withdraw to your bank account.",
  },
  {
    id: "research",
    label: "Run surveys and read results",
    detail: "Build surveys, reach respondents and follow live results.",
  },
  {
    id: "communications",
    label: "Book press releases",
    detail: "Write and polish your story first, then pay and track publication.",
  },
  {
    id: "commerce",
    label: "Team kits and merchandise",
    detail: "Request custom kits for your club or company and order merchandise.",
  },
] as const;

type Intent = (typeof INTENTS)[number]["id"];

export function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [intent, setIntent] = useState<Intent>("earn");
  const [working, setWorking] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const GENDERS = ["Female", "Male"];
  const AGE_RANGES = ["18–24", "25–34", "35–44", "45–54", "55+"];
  const LIFE_STAGES = ["Student", "Employed", "Self-employed", "Parent", "Nursing mother", "Retired"];
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    confirm: string;
    organization: string;
    jobTitle: string;
    country: string;
    industry: string;
    gender: string;
    ageRange: string;
    lifeStage: string;
    consent: boolean;
    commercial: boolean;
  }>({
    name: "",
    email: "",
    password: "",
    confirm: "",
    organization: "",
    jobTitle: "",
    country: countries[0] ?? "United Kingdom",
    industry: industries[0] ?? "Technology",
    gender: "",
    ageRange: "",
    lifeStage: "",
    consent: false,
    commercial: false,
  });

  // A member who is already signed in (or finishes Google / Lovable sign-in here) goes to the dashboard.
  useEffect(() => {
    if (user) void navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Enter your full name.");
      return;
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (form.password.length < MIN_PASSWORD) {
      toast.error(`Your password needs at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("The two passwords don't match.");
      return;
    }
    if (!form.consent) {
      toast.error("Please agree to the Terms of Use and Privacy Policy.");
      return;
    }

    setWorking(true);
    const email = form.email.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          name: form.name.trim(),
          organization: form.organization.trim(),
          jobTitle: form.jobTitle.trim(),
          country: form.country,
          industry: form.industry,
          preferences: {
            joinedFor: intent,
            audience: {
              gender: form.gender,
              ageRange: form.ageRange,
              lifeStage: form.lifeStage,
            },
            notifications: {
              editorialDigest: true,
              surveyActivity: true,
              pressReleaseUpdates: true,
              orderAndInvoice: true,
              commercialOffers: form.commercial,
            },
          },
        },
      },
    });
    setWorking(false);

    if (error) {
      const text = error.message.toLowerCase();
      toast.error(
        text.includes("already")
          ? "An account with this email already exists. Please sign in instead."
          : text.includes("password")
            ? "Please choose a stronger password."
            : "We couldn't create your account. Please try again.",
      );
      return;
    }
    if (!data.session) {
      setSentTo(email);
      return;
    }
    toast.success(`Welcome to F.M.I.E, ${form.name.trim().split(" ")[0]}`);
  };

  if (sentTo) {
    return (
      <div className="fmie-container py-16">
        <div className="mx-auto max-w-lg rounded-lg border border-brand-border bg-white p-8 text-center">
          <MailCheck className="mx-auto h-10 w-10 text-brand-navy" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-brand-charcoal">
            Confirm your email
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-brand-slate">
            We've sent a confirmation link to <strong>{sentTo}</strong>. Click it to finish creating
            your account, then sign in.
          </p>
          <Button asChild className="mt-6 bg-brand-navy text-white hover:bg-brand-navy-light">
            <Link to="/signin">Go to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Create an account"
        title="Join the F.M.I.E platform"
        description="One account across surveys, your wallet, press releases, services and the shop."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Register" }]}
      />

      <div className="fmie-container grid gap-8 py-10 lg:grid-cols-[1.2fr_1fr]">
        <form
          onSubmit={submit}
          className="rounded-lg border border-brand-border bg-white p-6 sm:p-8"
        >
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-brand-charcoal">
            <UserPlus className="h-5 w-5 text-brand-navy" /> Create your account
          </h2>

          <div className="mt-5">
            <SocialSignInButtons />
          </div>
          <OrDivider />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-brand-slate">
              Full name *
              <input
                className={`${inputClass} mt-1`}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                autoComplete="name"
                maxLength={120}
                required
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Email *
              <input
                className={`${inputClass} mt-1`}
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                autoComplete="email"
                required
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Password * <span className="font-normal">(at least {MIN_PASSWORD} characters)</span>
              <input
                className={`${inputClass} mt-1`}
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                autoComplete="new-password"
                minLength={MIN_PASSWORD}
                required
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Confirm password *
              <input
                className={`${inputClass} mt-1`}
                type="password"
                value={form.confirm}
                onChange={(event) => setForm({ ...form, confirm: event.target.value })}
                autoComplete="new-password"
                required
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Organisation
              <input
                className={`${inputClass} mt-1`}
                value={form.organization}
                onChange={(event) => setForm({ ...form, organization: event.target.value })}
                maxLength={160}
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Job title
              <input
                className={`${inputClass} mt-1`}
                value={form.jobTitle}
                onChange={(event) => setForm({ ...form, jobTitle: event.target.value })}
                maxLength={120}
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
            {(
              [
                ["gender", "Gender", GENDERS],
                ["ageRange", "Age range", AGE_RANGES],
                ["lifeStage", "Life stage", LIFE_STAGES],
              ] as const
            ).map(([key, label, options]) => (
              <label key={key} className="block text-xs font-semibold text-brand-slate">
                {label}
                <select
                  className={`${inputClass} mt-1`}
                  value={form[key]}
                  onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                >
                  <option value="">Prefer not to say</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-brand-slate">
            We use these details only to send you surveys that fit you.
          </p>

          <fieldset className="mt-6">
            <legend className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-slate">
              Main reason for joining
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
              <span>
                I agree to the{" "}
                <Link to="/terms" className="font-semibold text-brand-navy hover:underline">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="font-semibold text-brand-navy hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            <label className="flex items-start gap-2 text-xs leading-relaxed text-brand-slate">
              <input
                type="checkbox"
                className="mt-0.5 accent-brand-navy"
                checked={form.commercial}
                onChange={(event) => setForm({ ...form, commercial: event.target.checked })}
              />
              Send me offers and event news (optional).
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
              Corporate plans add team seats, billing history and branded surveys. Create your
              account first, then our team can upgrade it for your organisation.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/surveys/plans">Compare research plans</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default RegisterPage;
