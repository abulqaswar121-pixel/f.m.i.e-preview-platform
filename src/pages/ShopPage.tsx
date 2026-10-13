import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Package, Search, ShoppingBag, Truck } from "lucide-react";

import { ProductCard } from "@/components/shop/ProductCard";
import { Badge } from "@/components/common/Badge";
import { EmptyState, PageHeader } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { commerce, contactEmail, formatCurrency } from "@/config/site";
import { useAsyncResource, useDebouncedValue } from "@/hooks/useAsync";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types";

type CategoryFilter = ProductCategory | "All products";

export function ShopPage() {
  const products = useAsyncResource(() => api.products.list(), [], []);
  const [category, setCategory] = useState<CategoryFilter>("All products");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);

  const filters: CategoryFilter[] = useMemo(() => ["All products", ...commerce.shopCategories], []);

  const visible = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    return products.data.filter((product) => {
      if (category !== "All products" && product.category !== category) return false;
      if (!needle) return true;
      return `${product.name} ${product.description} ${product.material}`
        .toLowerCase()
        .includes(needle);
    });
  }, [products.data, category, debouncedQuery]);

  return (
    <div>
      <PageHeader
        eyebrow="F.M.I.E Commerce"
        title="Branded apparel, stationery and accessories"
        description="Six lines made for boardrooms, conferences and newsrooms — cut, embroidered and finished to a specification you can read before you buy. Orders ship from London with tracked delivery."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Shop" }]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
            <Link to="/checkout">Go to checkout</Link>
          </Button>
          <p className="text-xs text-brand-slate">
            Free UK delivery over {formatCurrency(commerce.freeShippingThreshold)} ·{" "}
            {commerce.vatNote}
          </p>
        </div>
      </PageHeader>

      <div className="fmie-container space-y-8 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Package className="h-4 w-4 text-brand-navy" />
            {filters.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setCategory(entry)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                  category === entry
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-brand-border bg-white text-brand-slate hover:border-brand-navy/50 hover:text-brand-navy",
                )}
              >
                {entry}
              </button>
            ))}
          </div>
          <div className="relative lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-slate" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the catalogue"
              aria-label="Search products"
              className="w-full rounded-md border border-brand-border bg-white py-2 pl-9 pr-3 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none"
            />
          </div>
        </div>

        {products.loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((key) => (
              <div key={key} className="h-96 animate-pulse rounded-lg bg-brand-slate/12" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            title="No products match that search"
            description="Clear the search box or choose another category to see the full catalogue."
            icon={<ShoppingBag className="h-6 w-6" />}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-brand-charcoal">Delivery</h2>
            <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-brand-slate">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy" />
              Standard UK {formatCurrency(commerce.standardShipping)} · international{" "}
              {formatCurrency(commerce.internationalShipping)} · free above{" "}
              {formatCurrency(commerce.freeShippingThreshold)}.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-brand-slate">{commerce.vatNote}</p>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-brand-charcoal">Promotions</h2>
            <ul className="mt-3 space-y-3">
              {commerce.promoCodes
                .filter((code) => code.active)
                .map((code) => (
                  <li key={code.code} className="text-xs">
                    <p className="flex items-center gap-2">
                      <Badge tone="gold">{code.code}</Badge>
                      <span className="font-semibold text-brand-charcoal">{code.value}% off</span>
                    </p>
                    <p className="mt-1 text-brand-slate">
                      {code.description}
                      {code.minimumSubtotal > 0
                        ? ` · baskets over ${formatCurrency(code.minimumSubtotal)}`
                        : ""}
                    </p>
                  </li>
                ))}
            </ul>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-brand-charcoal">
              Bulk and corporate orders
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-brand-slate">
              Orders of twenty-five units or more, conference kits and purchase-order billing are
              handled by the commerce desk. Send the line items, quantities and delivery address and
              you will receive a written quotation with unit pricing.
            </p>
            <p className="mt-3 text-xs">
              <a
                href={`mailto:${contactEmail.general}`}
                className="font-semibold text-brand-navy hover:underline"
              >
                {contactEmail.general}
              </a>
            </p>
          </div>
        </section>

        <p className="rounded-md bg-brand-cream px-4 py-3 text-[11px] leading-relaxed text-brand-slate">
          Demonstration preview: no payment is taken, no goods are dispatched and no order is
          fulfilled. Orders you place are recorded locally so the checkout, invoicing and dashboard
          workflows can be exercised end to end.
        </p>
      </div>
    </div>
  );
}

export default ShopPage;
