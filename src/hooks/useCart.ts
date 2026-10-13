import { createContext, useContext } from "react";

import { commerce } from "@/config/site";
import type { CartItem, Product } from "@/types";

/**
 * Cart store & context contract.
 *
 * `localStorage`-backed and hydration-safe: the server and the client's first
 * render both see an empty basket, then persisted lines are restored after
 * mount. The provider component lives in `@/components/providers/CartProvider`
 * so this module exports no JSX and no components.
 */

const CART_STORAGE_KEY = "fmie.cart.v1";

export interface CartState {
  items: CartItem[];
  promoCode: string | null;
  discountPercent: number;
}

const EMPTY_STATE: CartState = { items: [], promoCode: null, discountPercent: 0 };

let state: CartState = EMPTY_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function emit(): void {
  for (const listener of listeners) listener();
}

function persist(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / privacy mode failures */
  }
}

/** Restore persisted basket lines. Safe to call repeatedly. */
export function hydrateCart(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    state = {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      promoCode: typeof parsed.promoCode === "string" ? parsed.promoCode : null,
      discountPercent: typeof parsed.discountPercent === "number" ? parsed.discountPercent : 0,
    };
  } catch {
    state = EMPTY_STATE;
  }
}

/** Drop the persisted basket — used when the preview data is reset. */
export function clearCartStorage(): void {
  state = EMPTY_STATE;
  hydrated = true;
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  emit();
}

export function getCartState(): CartState {
  return state;
}

export function setCartState(next: CartState): void {
  state = next;
  persist();
  emit();
}

export function subscribeCart(listener: () => void): () => void {
  hydrateCart();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, variant: string, quantity?: number) => void;
  updateQuantity: (productId: string, variant: string, quantity: number) => void;
  removeItem: (productId: string, variant: string) => void;
  clear: () => void;
  applyPromo: (code: string) => { ok: boolean; message: string };
  removePromo: () => void;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>.");
  }
  return context;
}

/** Shipping and discount arithmetic shared by the provider and the checkout. */
export function priceBasket(items: CartItem[], discountPercent: number) {
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  );
  const discount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const afterDiscount = subtotal - discount;
  const shipping =
    items.length === 0
      ? 0
      : afterDiscount >= commerce.freeShippingThreshold
        ? 0
        : commerce.standardShipping;
  const total = Number((afterDiscount + shipping).toFixed(2));
  return { subtotal, discount, shipping, total };
}
