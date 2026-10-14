import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { commerce, formatCurrency } from "@/config/site";
import { useCart } from "@/hooks/useCart";

export function CartDrawer() {
  const cart = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<string | undefined>(undefined);

  return (
    <Sheet open={cart.isOpen} onOpenChange={(open) => (open ? cart.openCart() : cart.closeCart())}>
      <SheetContent
        side="right"
        className="flex w-[92vw] max-w-md flex-col border-brand-border bg-white p-0"
      >
        <SheetHeader className="border-b border-brand-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display text-lg text-brand-charcoal">
            <ShoppingBag className="h-4 w-4 text-brand-navy" />
            Your basket
            <span className="rounded-full bg-brand-cream px-2 py-0.5 text-xs font-semibold text-brand-slate">
              {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-10 w-10 text-brand-slate/40" />
              <p className="mt-4 font-display text-lg font-semibold text-brand-charcoal">
                Your basket is empty
              </p>
              <p className="mt-2 max-w-xs text-sm text-brand-slate">
                F.M.I.E branded apparel, stationery and accessories, made to last and marked with
                the monogram.
              </p>
              <Button
                asChild
                className="mt-5 bg-brand-navy text-white hover:bg-brand-navy-light"
                onClick={cart.closeCart}
              >
                <Link to="/shop">Browse the shop</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.items.map((item) => (
                <li
                  key={`${item.productId}-${item.variant}`}
                  className="flex gap-3 rounded-lg border border-brand-border p-3"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-md border border-brand-border bg-brand-cream object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to="/shop/$slug"
                        params={{ slug: item.slug }}
                        onClick={cart.closeCart}
                        className="text-sm font-semibold leading-snug text-brand-charcoal hover:text-brand-navy"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => cart.removeItem(item.productId, item.variant)}
                        className="text-brand-slate hover:text-danger"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-brand-slate">{item.variant}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-brand-border">
                        <button
                          type="button"
                          onClick={() =>
                            cart.updateQuantity(item.productId, item.variant, item.quantity - 1)
                          }
                          className="px-2 py-1 text-brand-slate hover:text-brand-navy"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-8 px-1 text-center text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            cart.updateQuantity(item.productId, item.variant, item.quantity + 1)
                          }
                          className="px-2 py-1 text-brand-slate hover:text-brand-navy"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-brand-charcoal">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.items.length > 0 ? (
          <div className="border-t border-brand-border bg-brand-cream px-5 py-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-brand-slate" />
                <input
                  value={promoInput}
                  onChange={(event) => setPromoInput(event.target.value)}
                  placeholder="Promo code"
                  className="w-full rounded-md border border-brand-border bg-white py-2 pl-8 pr-2 text-sm uppercase tracking-wider text-brand-charcoal focus:border-brand-navy focus:outline-none"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const result = cart.applyPromo(promoInput);
                  setPromoMessage(result.message);
                  if (result.ok) setPromoInput("");
                }}
              >
                Apply
              </Button>
              {cart.promoCode ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    cart.removePromo();
                    setPromoMessage(undefined);
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
            {promoMessage ? <p className="mt-2 text-xs text-brand-slate">{promoMessage}</p> : null}
            {cart.promoCode ? (
              <p className="mt-2 text-xs font-semibold text-success">
                Code {cart.promoCode} applied.
              </p>
            ) : null}

            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-brand-slate">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatCurrency(cart.subtotal)}</dd>
              </div>
              {cart.discount > 0 ? (
                <div className="flex justify-between text-success">
                  <dt>Discount ({cart.promoCode})</dt>
                  <dd className="tabular-nums">−{formatCurrency(cart.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between text-brand-slate">
                <dt>Shipping</dt>
                <dd className="tabular-nums">
                  {cart.shipping === 0 ? "Free" : formatCurrency(cart.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-brand-border pt-2 text-base font-semibold text-brand-charcoal">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatCurrency(cart.total)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11px] text-brand-slate">
              Free UK shipping over {formatCurrency(commerce.freeShippingThreshold)}.{" "}
              {commerce.vatNote}
            </p>
            <Button
              asChild
              className="mt-3 w-full bg-brand-navy text-white hover:bg-brand-navy-light"
              onClick={cart.closeCart}
            >
              <Link to="/checkout">Proceed to checkout</Link>
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;
