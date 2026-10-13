import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  FileText,
  Mail,
  Menu,
  Newspaper,
  Package,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Modal } from "@/components/common/Modal";
import { MarketTicker } from "@/components/layout/MarketTicker";
import { PersonaSwitcher } from "@/components/layout/PersonaSwitcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { contactRoutes, mainNavigation, site } from "@/config/site";
import { useDebouncedValue } from "@/hooks/useAsync";
import { useCart } from "@/hooks/useCart";
import { SiteLink } from "@/components/common/SiteLink";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 220);
  const [results, setResults] = useState<Awaited<ReturnType<typeof api.search.all>> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    api.search.all(debounced).then((result) => {
      if (alive) setResults(result);
    });
    return () => {
      alive = false;
    };
  }, [debounced]);

  const total = useMemo(() => {
    if (!results) return 0;
    return (
      results.articles.length +
      results.surveys.length +
      results.pressReleases.length +
      results.services.length +
      results.products.length
    );
  }, [results]);

  const go = (to: string) => {
    onClose();
    setQuery("");
    // Search results carry already-resolved paths (e.g. `/news/$slug`), which
    // the literal-typed router API cannot express from a variable.
    void navigate({ to } as unknown as Parameters<typeof navigate>[0]);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Search F.M.I.E"
      description="News, surveys, campaigns, services and merchandise."
      size="md"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-brand-slate" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try: trade corridors, packaging, hydrogen, folio…"
          className="w-full rounded-md border border-brand-border bg-brand-cream py-2.5 pl-9 pr-3 text-sm text-brand-charcoal outline-none focus:border-brand-navy focus:bg-white"
        />
      </div>
      <div className="mt-4 max-h-[46vh] space-y-4 overflow-y-auto pr-1">
        {!query.trim() ? (
          <p className="rounded-md border border-brand-border bg-brand-cream px-4 py-3 text-xs text-brand-slate">
            Search across {site.name} editorial coverage, the survey marketplace, press release
            campaigns, professional services and the shop.
          </p>
        ) : total === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-brand-slate">
            No matches for “{query}”.
          </p>
        ) : null}

        {results?.articles.length ? (
          <section>
            <h3 className="fmie-eyebrow mb-2">News & Insights</h3>
            <ul className="space-y-1">
              {results.articles.map((article) => (
                <li key={article.id}>
                  <button
                    type="button"
                    onClick={() => go(`/news/${article.slug}`)}
                    className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-brand-cream"
                  >
                    <Newspaper className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy" />
                    <span>
                      <span className="block text-sm font-medium text-brand-charcoal">
                        {article.title}
                      </span>
                      <span className="text-xs text-brand-slate">{article.category}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {results?.surveys.length ? (
          <section>
            <h3 className="fmie-eyebrow mb-2">Surveys</h3>
            <ul className="space-y-1">
              {results.surveys.map((survey) => (
                <li key={survey.id}>
                  <button
                    type="button"
                    onClick={() => go(`/surveys/${survey.id}`)}
                    className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-brand-cream"
                  >
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold-dark" />
                    <span>
                      <span className="block text-sm font-medium text-brand-charcoal">
                        {survey.title}
                      </span>
                      <span className="text-xs capitalize text-brand-slate">
                        {survey.category} · {survey.tier} tier
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {results?.pressReleases.length ? (
          <section>
            <h3 className="fmie-eyebrow mb-2">Press release campaigns</h3>
            <ul className="space-y-1">
              {results.pressReleases.map((booking) => (
                <li key={booking.id}>
                  <button
                    type="button"
                    onClick={() => go(`/press-releases/${booking.id}`)}
                    className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-brand-cream"
                  >
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy" />
                    <span>
                      <span className="block text-sm font-medium text-brand-charcoal">
                        {booking.title}
                      </span>
                      <span className="text-xs text-brand-slate">
                        {booking.referenceNumber} · {booking.companyName}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {results?.services.length ? (
          <section>
            <h3 className="fmie-eyebrow mb-2">Professional services</h3>
            <ul className="space-y-1">
              {results.services.map((service) => (
                <li key={service.id}>
                  <button
                    type="button"
                    onClick={() => go(`/services/${service.slug}`)}
                    className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-brand-cream"
                  >
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-brand-slate" />
                    <span className="text-sm font-medium text-brand-charcoal">{service.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {results?.products.length ? (
          <section>
            <h3 className="fmie-eyebrow mb-2">Shop</h3>
            <ul className="space-y-1">
              {results.products.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => go(`/shop/${product.slug}`)}
                    className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-brand-cream"
                  >
                    <Package className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy" />
                    <span className="text-sm font-medium text-brand-charcoal">{product.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Modal>
  );
}

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-white/95 backdrop-blur">
      {/* Utility bar */}
      <div className="hidden bg-brand-navy-dark text-white/80 lg:block">
        <div className="fmie-container flex h-9 items-center justify-between text-[11px]">
          <p className="tracking-[0.08em]">{site.mission}</p>
          <div className="flex items-center gap-5">
            {contactRoutes.slice(0, 3).map((route) => (
              <a key={route.id} href={`mailto:${route.email}`} className="hover:text-brand-gold">
                {route.email}
              </a>
            ))}
            <span className="text-white/50">|</span>
            <span className="tracking-[0.08em]">{site.domain}</span>
          </div>
        </div>
      </div>

      <MarketTicker />

      {/* Main bar */}
      <div className="fmie-container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label="F.M.I.E home">
          <Logo variant="horizontal" compact />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">
          {mainNavigation.map((item) =>
            item.children ? (
              <div key={item.to} className="group relative">
                <SiteLink
                  to={item.to}
                  search={item.search}
                  hash={item.hash}
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-brand-charcoal hover:bg-brand-cream hover:text-brand-navy"
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 text-brand-slate transition-transform group-hover:rotate-180" />
                </SiteLink>
                <div className="invisible absolute left-0 top-full z-50 w-80 pt-1 opacity-0 transition-all group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div className="overflow-hidden rounded-lg border border-brand-border bg-white shadow-lg">
                    <p className="border-b border-brand-border bg-brand-cream px-4 py-2 text-[11px] text-brand-slate">
                      {item.description}
                    </p>
                    <ul className="p-1.5">
                      {item.children.map((child) => (
                        <li key={child.to}>
                          <SiteLink
                            to={child.to}
                            search={child.search}
                            hash={child.hash}
                            className="block rounded-md px-3 py-2 hover:bg-brand-cream"
                          >
                            <span className="block text-sm font-medium text-brand-charcoal">
                              {child.label}
                            </span>
                            <span className="block text-xs text-brand-slate">
                              {child.description}
                            </span>
                          </SiteLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <SiteLink
                key={item.to}
                to={item.to}
                search={item.search}
                hash={item.hash}
                className="rounded-md px-3 py-2 text-sm font-medium text-brand-charcoal hover:bg-brand-cream hover:text-brand-navy"
              >
                {item.label}
              </SiteLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            aria-label="Search the platform"
          >
            <Search />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={openCart}
            aria-label={`Open cart, ${itemCount} items`}
            className="relative"
          >
            <ShoppingCart />
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-navy-dark">
                {itemCount}
              </span>
            ) : null}
          </Button>
          <div className="hidden md:block">
            <PersonaSwitcher />
          </div>
          <Button
            asChild
            className="hidden bg-brand-navy text-white hover:bg-brand-navy-light lg:inline-flex"
            size="sm"
          >
            <Link to="/press-releases/book">Book a Press Release</Link>
          </Button>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[86vw] max-w-sm overflow-y-auto border-brand-border bg-white p-0"
            >
              <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
                <Logo variant="horizontal" compact />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X />
                </Button>
              </div>
              <nav aria-label="Mobile navigation" className="p-4">
                <ul className="space-y-1">
                  {mainNavigation.map((item) => (
                    <li key={item.to}>
                      <SiteLink
                        to={item.to}
                        search={item.search}
                        hash={item.hash}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-md px-3 py-2.5 text-sm font-semibold text-brand-charcoal hover:bg-brand-cream"
                      >
                        {item.label}
                      </SiteLink>
                      {item.children ? (
                        <ul className="ml-3 border-l border-brand-border pl-3">
                          {item.children.map((child) => (
                            <li key={child.to}>
                              <SiteLink
                                to={child.to}
                                search={child.search}
                                hash={child.hash}
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-md px-3 py-2 text-sm text-brand-slate hover:bg-brand-cream"
                              >
                                {child.label}
                              </SiteLink>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-2">
                  <Button
                    asChild
                    className="w-full bg-brand-navy text-white hover:bg-brand-navy-light"
                  >
                    <Link to="/press-releases/book" onClick={() => setMobileOpen(false)}>
                      Book a Press Release
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/surveys/create" onClick={() => setMobileOpen(false)}>
                      Publish a Survey
                    </Link>
                  </Button>
                </div>
                <div className="mt-4 border-t border-brand-border pt-4">
                  <p className="fmie-eyebrow mb-2">Signed in as</p>
                  <PersonaSwitcher />
                </div>
                <div className="mt-4 space-y-1 border-t border-brand-border pt-4 text-xs text-brand-slate">
                  {contactRoutes.map((route) => (
                    <a
                      key={route.id}
                      href={`mailto:${route.email}`}
                      className="block hover:text-brand-navy"
                    >
                      {route.label}: {route.email}
                    </a>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

export default Header;
