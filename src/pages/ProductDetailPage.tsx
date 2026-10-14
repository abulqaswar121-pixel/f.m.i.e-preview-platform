import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { EmptyState, KeyedList } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { commerce, formatCurrency } from "@/config/site";
import { useAsyncResource } from "@/hooks/useAsync";
import { useCart } from "@/hooks/useCart";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

export function ProductDetailPage() {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const product = useAsyncResource(() => api.products.getById(slug), undefined, [slug]);
  const products = useAsyncResource(() => api.products.list(), [], []);
  const { addItem } = useCart();
  const [variant, setVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const data = product.data;
  const selectedVariant = variant ?? data?.variants[0] ?? "Standard";

  useEffect(() => {
    setVariant(null);
    setQuantity(1);
  }, [slug]);

  if (product.loading) {
    return (
      <div className="fmie-container py-16">
        <div className="h-96 w-full animate-pulse rounded-lg bg-brand-slate/12" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fmie-container py-20">
        <EmptyState
          title="Product not found"
          description="This line may have been retired from the catalogue."
          action={{ label: "Back to shop", to: "/shop" }}
        />
      </div>
    );
  }

  const related = products.data
    .filter((entry) => entry.category === data.category && entry.id !== data.id)
    .slice(0, 3);

  return (
    <div className="fmie-container py-10">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-brand-slate"
      >
        <Link to="/" className="hover:text-brand-navy hover:underline">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/shop" className="hover:text-brand-navy hover:underline">
          Shop
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-brand-charcoal">{data.name}</span>
      </nav>

      <Link
        to="/shop"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to shop
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-lg border border-brand-border bg-brand-cream">
            <img
              src={data.imageUrl}
              alt={data.name}
              className="aspect-square w-full object-cover"
            />
            {data.badge ? (
              <span className="absolute left-4 top-4">
                <Badge tone="gold">{data.badge}</Badge>
              </span>
            ) : null}
          </div>
          <div className="mt-4 rounded-lg border border-brand-border bg-white p-5">
            <h2 className="font-display text-base font-semibold text-brand-charcoal">
              Product detail
            </h2>
            <ul className="mt-3 space-y-2">
              {data.detail.map((line) => (
                <li key={line} className="flex gap-2 text-xs leading-relaxed text-brand-slate">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-navy" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="navy">{data.category}</Badge>
            <Badge tone="muted">SKU {data.sku}</Badge>
            {!data.inStock ? (
              <Badge tone="danger">Out of stock</Badge>
            ) : data.stockLevel < 10 ? (
              <Badge tone="warning">Low stock — {data.stockLevel} left</Badge>
            ) : null}
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-brand-charcoal">
            {data.name}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-slate">{data.description}</p>
          <p className="mt-5 font-display text-3xl font-bold text-brand-navy">
            {formatCurrency(data.price)}
          </p>
          <p className="mt-1 text-[11px] text-brand-slate">{commerce.vatNote}</p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-brand-slate">
            {data.variantLabel} — {selectedVariant}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.variants.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setVariant(entry)}
                className={cn(
                  "min-w-12 rounded-md border px-4 py-2 text-sm transition-colors",
                  entry === selectedVariant
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-brand-border bg-white text-brand-charcoal hover:border-brand-navy/50",
                )}
              >
                {entry}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-md border border-brand-border bg-white px-2 py-1">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="flex h-8 w-8 items-center justify-center rounded text-brand-slate hover:bg-brand-cream hover:text-brand-navy"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-semibold tabular-nums text-brand-charcoal">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  setQuantity((value) => Math.min(Math.max(1, data.stockLevel), value + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded text-brand-slate hover:bg-brand-cream hover:text-brand-navy"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1 bg-brand-navy text-white hover:bg-brand-navy-light"
              disabled={!data.inStock || data.stockLevel < 1}
              onClick={() => {
                addItem(data, selectedVariant, quantity);
                toast.success("Added to basket", {
                  description: `${quantity} × ${data.name} (${selectedVariant})`,
                });
              }}
            >
              {data.inStock ? "Add to basket" : "Currently unavailable"}
            </Button>
          </div>

          <div className="mt-6 space-y-2 text-xs leading-relaxed text-brand-slate">
            <p className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy" />
              Standard UK {formatCurrency(commerce.standardShipping)} · international{" "}
              {formatCurrency(commerce.internationalShipping)} · free over{" "}
              {formatCurrency(commerce.freeShippingThreshold)}
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy" />
              Stock shown is the simulated catalogue level for this preview; it reduces when an
              order is placed.
            </p>
          </div>

          <KeyedList
            items={[
              { label: "Material", value: data.material },
              { label: "Currency", value: data.currency },
              {
                label: "Stock",
                value: data.inStock ? `${data.stockLevel} units available` : "Out of stock",
              },
              ...(data.careNotes ? [{ label: "Care", value: data.careNotes }] : []),
            ]}
          />

          <div className="mt-6 rounded-lg border border-brand-border bg-white p-5">
            <h2 className="font-display text-base font-semibold text-brand-charcoal">
              Payment options
            </h2>
            <ul className="mt-3 space-y-2">
              {commerce.paymentMethods.map((method) => (
                <li key={method.id} className="text-xs leading-relaxed text-brand-slate">
                  <span className="font-semibold text-brand-charcoal">{method.label}</span> —{" "}
                  {method.detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold text-brand-charcoal">
            More in {data.category}
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((entry) => (
              <Link
                key={entry.id}
                to="/shop/$slug"
                params={{ slug: entry.slug }}
                className="group overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <img
                  src={entry.imageUrl}
                  alt={entry.name}
                  className="aspect-[4/3] w-full bg-brand-cream object-cover"
                />
                <div className="p-4">
                  <p className="font-display text-sm font-semibold text-brand-charcoal group-hover:text-brand-navy">
                    {entry.name}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-navy">
                    {formatCurrency(entry.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default ProductDetailPage;
