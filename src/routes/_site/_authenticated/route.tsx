import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Members-only area (dashboard, wallet, admin). The session lives in the
 * browser, so this gate runs in the browser only and sends visitors to sign in.
 */
export const Route = createFileRoute("/_site/_authenticated")({
  ssr: false,
  pendingComponent: MemberAreaPending,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/signin", search: { next: location.href } });
    }
  },
  component: MemberArea,
});

function MemberAreaPending() {
  return (
    <div className="fmie-container flex min-h-64 items-center justify-center gap-2 py-24 text-sm text-brand-slate">
      <Loader2 className="h-4 w-4 animate-spin" /> Checking your account…
    </div>
  );
}

function MemberArea() {
  const { user } = useAuth();
  if (!user) {
    return (
      <div className="fmie-container flex items-center justify-center gap-2 py-24 text-sm text-brand-slate">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your account…
      </div>
    );
  }
  return <Outlet />;
}
