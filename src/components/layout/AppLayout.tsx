import { Outlet, useRouterState } from "@tanstack/react-router";

import { CartDrawer } from "@/components/shop/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AiAssistant } from "@/components/layout/AiAssistant";

/**
 * App-like surfaces (auth, member/admin portals, checkout) keep the focus on the
 * task in hand, so the marketing footer is omitted there; public editorial,
 * market and legal pages keep it.
 */
const FOOTERLESS_PREFIXES = [
  "/signin",
  "/register",
  "/dashboard",
  "/admin",
  "/checkout",
  "/wallet",
];

/**
 * The client assistant works the public storefront only: portals, checkout,
 * auth and focused survey-taking screens stay free of both footer and
 * assistant so the task in hand owns the screen.
 */
const ASSISTANTLESS_PREFIXES = FOOTERLESS_PREFIXES;

/** Site shell: header (utility bar, ticker, navigation), page content, footer. */
export function AppLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const matches = (prefixes: string[]) =>
    prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const showFooter = !matches(FOOTERLESS_PREFIXES);
  const showAssistant = !matches(ASSISTANTLESS_PREFIXES) && !/^\/surveys\/.+/.test(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter ? <Footer /> : null}
      {showAssistant ? <AiAssistant /> : null}
      <CartDrawer />
    </div>
  );
}

export default AppLayout;
