import { Outlet, useRouterState } from "@tanstack/react-router";

import { CartDrawer } from "@/components/shop/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/**
 * App-like surfaces (auth, member/admin portals, checkout) keep the focus on the
 * task in hand, so the marketing footer is omitted there; public editorial,
 * market and legal pages keep it.
 */
const FOOTERLESS_PREFIXES = ["/signin", "/register", "/dashboard", "/admin", "/checkout"];

/** Site shell: header (utility bar, ticker, navigation), page content, footer. */
export function AppLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const showFooter = !FOOTERLESS_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter ? <Footer /> : null}
      <CartDrawer />
    </div>
  );
}

export default AppLayout;
