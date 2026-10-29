import { useEffect, useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_site/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: `Choose a new password | ${site.name}` },
      { name: "description", content: "Set a new password for your F.M.I.E account." },
      { property: "og:title", content: `Choose a new password | ${site.name}` },
      { property: "og:description", content: "Set a new password for your F.M.I.E account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "twitter:image", content: "https://fmie.lovable.app/og-image.jpg" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<"checking" | "ready" | "expired">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const fromLink = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (fromLink && session)) setState("ready");
    });
    const timer = window.setTimeout(() => {
      void supabase.auth.getSession().then(({ data: current }) => {
        setState((previous) =>
          previous === "checking" ? (current.session && fromLink ? "ready" : "expired") : previous,
        );
      });
    }, 1500);
    return () => {
      window.clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Your password needs at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("The two passwords don't match.");
      return;
    }
    setWorking(true);
    const { error } = await supabase.auth.updateUser({ password });
    setWorking(false);
    if (error) {
      toast.error("We couldn't save your new password. Please request a new link.");
      return;
    }
    toast.success("Your password has been changed");
    void navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="fmie-container py-16">
      <div className="mx-auto max-w-md rounded-lg border border-brand-border bg-white p-8">
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-brand-charcoal">
          <KeyRound className="h-5 w-5 text-brand-navy" /> Choose a new password
        </h1>
        {state === "checking" ? (
          <p className="mt-4 text-sm text-brand-slate">Checking your link…</p>
        ) : state === "expired" ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-relaxed text-brand-slate">
              This link has expired or was already used. Please ask for a new one from the sign-in
              page.
            </p>
            <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
              <Link to="/signin">Go to sign in</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <label className="block text-xs font-semibold text-brand-slate">
              New password (at least 8 characters)
              <input
                className={`${inputClass} mt-1`}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Confirm new password
              <input
                className={`${inputClass} mt-1`}
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            <Button
              type="submit"
              size="lg"
              className="w-full bg-brand-navy text-white hover:bg-brand-navy-light"
              disabled={working}
            >
              {working ? "Saving…" : "Save new password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
