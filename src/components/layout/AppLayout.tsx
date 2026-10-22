import { useEffect } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";

import { CartDrawer } from "@/components/shop/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { AiAssistant } from "@/components/layout/AiAssistant";
import { useAuth } from "@/hooks/useAuth";
import { useDatabase } from "@/services/api";

/**
 * App-like surfaces (auth, checkout) keep the focus on the task in hand, so
 * the marketing footer is omitted there; public pages keep it.
 */
const FOOTERLESS_PREFIXES = ["/signin", "/register", "/reset-password", "/checkout"];

const ASSISTANTLESS_PREFIXES = ["/signin", "/register", "/reset-password", "/checkout"];

/**
 * Pages a signed-in member may use. Signed-in members stay inside the portal;
 * any other page sends them to the dashboard until they sign out.
 */
const PORTAL_PREFIXES = [
  "/dashboard",
  "/wallet",
  "/admin",
  "/surveys",
  "/press-releases/book",
  "/press-releases/tracker",
  "/checkout",
  "/reset-password",
];

export function isPortalPath(pathname: string) {
  return PORTAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Site shell: public header and footer for visitors, portal header for members. */
export function AppLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { isSignedIn, ready } = useAuth();
  const navigate = useNavigate();
  const matches = (prefixes: string[]) =>
    prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const inPortal = isSignedIn;
  const database = useDatabase();

  useEffect(() => {
    if (ready && isSignedIn && !isPortalPath(pathname)) {
      void navigate({ to: "/dashboard", replace: true });
    }
  }, [ready, isSignedIn, pathname, navigate]);

  const showFooter = !inPortal && !matches(FOOTERLESS_PREFIXES);
  const showAssistant =
    !inPortal &&
    database.settings.assistantEnabled &&
    !matches(ASSISTANTLESS_PREFIXES) &&
    !/^\/surveys\/.+/.test(pathname);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-brand-cream">
      {inPortal ? <PortalHeader /> : <Header />}
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      {showFooter ? <Footer /> : null}
      {showAssistant ? <AiAssistant /> : null}
      <CartDrawer />
    </div>
  );
}

export default AppLayout;
