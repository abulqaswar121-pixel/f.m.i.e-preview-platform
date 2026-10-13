import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { PageHeader } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { roleDescriptions, roleLabels, site } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none";

export function SignInPage() {
  const search = useSearch({ strict: false }) as { next?: string };
  const navigate = useNavigate();
  const { signIn, switchPersona, personas } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [working, setWorking] = useState(false);

  const destination = search.next && search.next.startsWith("/") ? search.next : "/dashboard";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      toast.error("Enter a valid-looking email address.", {
        description: "This preview accepts any correctly formatted address — nothing is verified.",
      });
      return;
    }
    setWorking(true);
    const user = await signIn(email, name || undefined);
    setWorking(false);
    toast.success(`Signed in as ${user.name}`, { description: roleLabels[user.role] });
    // `destination` comes from the `next` search parameter, so it is a runtime string.
    void navigate({ to: destination } as unknown as Parameters<typeof navigate>[0]);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Member access"
        title="Sign in to your F.M.I.E account"
        description="No passwords exist in this demonstration preview. Enter any valid-looking email address and the platform creates or restores a pre-filled account with surveys, campaigns and orders already in place."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Sign in" }]}
      />

      <div className="fmie-container grid gap-8 py-10 lg:grid-cols-[1fr_1.1fr]">
        <form
          onSubmit={submit}
          className="rounded-lg border border-brand-border bg-white p-6 sm:p-8"
        >
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-brand-charcoal">
            <KeyRound className="h-5 w-5 text-brand-navy" /> Sign in
          </h2>
          <div className="mt-5 space-y-3">
            <label className="block text-xs font-semibold text-brand-slate">
              Email address
              <input
                className={`${inputClass} mt-1`}
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Name (optional — used if this is a new account)
              <input
                className={`${inputClass} mt-1`}
                placeholder="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </label>
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full bg-brand-navy text-white hover:bg-brand-navy-light"
            disabled={working}
          >
            {working ? "Signing in…" : "Sign in"}
          </Button>
          <p className="mt-3 text-center text-xs text-brand-slate">
            No account yet?{" "}
            <Link to="/register" className="font-semibold text-brand-navy hover:underline">
              Create one in a minute
            </Link>
          </p>
          <p className="mt-4 flex items-start gap-2 rounded-md bg-brand-cream px-3 py-2 text-[11px] leading-relaxed text-brand-slate">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-navy" />
            Credentials are never checked, transmitted or stored. Your session lives in this
            browser's local storage and disappears when you reset the preview.
          </p>
        </form>

        <div className="space-y-4">
          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-brand-charcoal">
              <Sparkles className="h-5 w-5 text-brand-gold-dark" /> One-click demo presets
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-brand-slate">
              Jump straight into a fully populated account. Each preset changes permissions,
              navigation and dashboard content instantly — no page reload.
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
                    void navigate({ to: destination } as unknown as Parameters<typeof navigate>[0]);
                  }}
                  className="rounded-lg border border-brand-border bg-brand-cream/40 p-4 text-left transition-colors hover:border-brand-navy/40"
                >
                  <p className="font-display text-sm font-semibold text-brand-charcoal">
                    {persona.name}
                  </p>
                  <p className="mt-1">
                    <Badge
                      tone={
                        persona.role === "administrator"
                          ? "gold"
                          : persona.role === "visitor"
                            ? "muted"
                            : "navy"
                      }
                    >
                      {roleLabels[persona.role]}
                    </Badge>
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-brand-slate">
                    {roleDescriptions[persona.role]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h3 className="font-display text-base font-semibold text-brand-charcoal">
              What membership unlocks
            </h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-brand-slate">
              <li>
                · Create surveys, collect responses and read analytics with filters and export.
              </li>
              <li>
                · Book press releases, review quotations and follow the twelve-state workflow.
              </li>
              <li>· Order branded merchandise with invoices recorded against your account.</li>
              <li>
                · Corporate accounts add team seats, billing history and branded survey experiences.
              </li>
              <li>
                · Administrators gain moderation, plan configuration and channel verification.
              </li>
            </ul>
            <p className="mt-4 border-t border-brand-border pt-3 text-[11px] leading-relaxed text-brand-slate">
              {site.previewNotice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
