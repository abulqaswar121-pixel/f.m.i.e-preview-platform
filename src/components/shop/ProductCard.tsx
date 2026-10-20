import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/config/site";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <article className="fmie-card group flex h-full flex-col overflow-hidden">
      <Link
        to="/shop/$slug"
        params={{ slug: product.slug }}
        className="relative block bg-brand-cream"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {product.badge ? (
          <span className="absolute left-3 top-3">
            <Badge tone="gold">{product.badge}</Badge>
          </span>
        ) : null}
        {!product.inStock ? (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Badge tone="muted">Out of stock</Badge>
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-slate">
          {product.category}
        </p>
        <h3 className="mt-1 font-display text-base font-semibold leading-snug text-brand-charcoal">
          <Link to="/shop/$slug" params={{ slug: product.slug }} className="hover:text-brand-navy">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-brand-slate">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-display text-lg font-bold text-brand-navy">
            {formatCurrency(product.price)}
            {product.priceNaira != null ? (
              <span className="ml-1 text-xs font-medium text-brand-slate">
                / ₦{product.priceNaira.toLocaleString("en-NG")}
              </span>
            ) : null}
          </p>
          <Button
            size="sm"
            className="bg-brand-navy text-white hover:bg-brand-navy-light"
            disabled={!product.inStock}
            onClick={() => addItem(product, product.variants[0] ?? "Standard")}
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
