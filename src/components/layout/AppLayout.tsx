import { Outlet, useRouterState } from "@tanstack/react-router";

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
 * Member portal pages. Signed-in members get the portal-only menu here; on
 * every other page (homepage, news, shop…) they see the normal site menu and
 * stay signed in.
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

/** Site shell: portal header for members inside the portal, public header and footer elsewhere. */
export function AppLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { isSignedIn } = useAuth();
  const matches = (prefixes: string[]) =>
    prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const inPortal = isSignedIn && isPortalPath(pathname);
  const database = useDatabase();

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
