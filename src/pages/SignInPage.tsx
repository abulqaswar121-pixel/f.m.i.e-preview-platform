import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { KeyRound, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { OrDivider, SocialSignInButtons } from "@/components/auth/SocialSignInButtons";
import { PageHeader } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function friendlySignInError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("invalid login")) return "That email and password don't match.";
  if (text.includes("not confirmed"))
    return "Please confirm your email first — check your inbox for our link.";
  if (text.includes("rate limit") || text.includes("too many"))
    return "Too many tries. Please wait a minute and try again.";
  return "We couldn't sign you in. Please try again.";
}

export function SignInPage() {
  const search = useSearch({ strict: false }) as { next?: string };
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "forgot" | "sent">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [working, setWorking] = useState(false);

  const destination =
    search.next && search.next.startsWith("/") && !search.next.startsWith("//")
      ? search.next
      : "/dashboard";

  // Once the account has loaded (after any sign-in method), continue to the page the member wanted.
  useEffect(() => {
    if (!user) return;
    // `destination` comes from the `next` search parameter, so it is a runtime string.
    void navigate({ to: destination, replace: true } as unknown as Parameters<typeof navigate>[0]);
  }, [user, destination, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (!password) {
      toast.error("Enter your password.");
      return;
    }
    setWorking(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setWorking(false);
    if (error) {
      toast.error(friendlySignInError(error.message));
      return;
    }
    toast.success("Welcome back");
  };

  const sendReset = async (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      toast.error("Enter the email address you signed up with.");
      return;
    }
    setWorking(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setWorking(false);
    if (error) {
      toast.error("We couldn't send the link. Please try again in a minute.");
      return;
    }
    setMode("sent");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Member access"
        title="Sign in to your F.M.I.E account"
        description="One account for surveys, your wallet, press release bookings, services and orders."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Sign in" }]}
      />

      <div className="fmie-container grid gap-8 py-10 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-brand-border bg-white p-6 sm:p-8">
          {mode === "sent" ? (
            <div className="text-center">
              <MailCheck className="mx-auto h-10 w-10 text-brand-navy" />
              <h2 className="mt-3 font-display text-xl font-semibold text-brand-charcoal">
                Check your email
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-slate">
                If an account exists for <strong>{email.trim()}</strong>, we've sent a link to set a
                new password. The link opens a page where you choose your new password.
              </p>
              <Button variant="outline" className="mt-5" onClick={() => setMode("signin")}>
                Back to sign in
              </Button>
            </div>
          ) : mode === "forgot" ? (
            <form onSubmit={sendReset}>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-brand-charcoal">
                <KeyRound className="h-5 w-5 text-brand-navy" /> Reset your password
              </h2>
              <p className="mt-2 text-sm text-brand-slate">
                Enter your email and we'll send you a link to choose a new password.
              </p>
              <label className="mt-5 block text-xs font-semibold text-brand-slate">
                Email address
                <input
                  className={`${inputClass} mt-1`}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              <Button
                type="submit"
                size="lg"
                className="mt-5 w-full bg-brand-navy text-white hover:bg-brand-navy-light"
                disabled={working}
              >
                {working ? "Sending…" : "Send reset link"}
              </Button>
              <button
                type="button"
                className="mt-3 w-full text-center text-xs font-semibold text-brand-navy hover:underline"
                onClick={() => setMode("signin")}
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <>
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-brand-charcoal">
                <KeyRound className="h-5 w-5 text-brand-navy" /> Sign in
              </h2>
              <div className="mt-5">
                <SocialSignInButtons />
              </div>
              <OrDivider />
              <form onSubmit={submit} className="space-y-3">
                <label className="block text-xs font-semibold text-brand-slate">
                  Email address
                  <input
                    className={`${inputClass} mt-1`}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="block text-xs font-semibold text-brand-slate">
                  <span className="flex items-center justify-between">
                    Password
                    <button
                      type="button"
                      className="font-semibold text-brand-navy hover:underline"
                      onClick={() => setMode("forgot")}
                    >
                      Forgot password?
                    </button>
                  </span>
                  <input
                    className={`${inputClass} mt-1`}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </label>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-brand-navy text-white hover:bg-brand-navy-light"
                  disabled={working}
                >
                  {working ? "Signing in…" : "Sign in"}
                </Button>
              </form>
              <p className="mt-4 text-center text-xs text-brand-slate">
                No account yet?{" "}
                <Link to="/register" className="font-semibold text-brand-navy hover:underline">
                  Create one in a minute
                </Link>
              </p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h3 className="font-display text-base font-semibold text-brand-charcoal">
              What membership unlocks
            </h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-brand-slate">
              <li>· Answer surveys, earn rewards and withdraw to your bank account.</li>
              <li>· Create surveys, collect responses and read live results.</li>
              <li>
                · Write your press release, polish it with the AI assistant, then pay and track it.
              </li>
              <li>· Request custom team kits and order F.M.I.E merchandise.</li>
              <li>· Keep your profile, orders and bookings in one place on any device.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
