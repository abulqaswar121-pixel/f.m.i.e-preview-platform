import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { commerce } from "@/config/site";
import {
  CartContext,
  getCartState,
  hydrateCart,
  priceBasket,
  setCartState,
  subscribeCart,
  type CartContextValue,
} from "@/hooks/useCart";
import type { Product } from "@/types";

/** E-commerce cart provider: basket lines, promo codes and the drawer state. */
export function CartProvider({ children }: { children: ReactNode }) {
  const cart = useSyncExternalStore(subscribeCart, getCartState, getCartState);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    hydrateCart();
  }, []);

  const addItem = useCallback((product: Product, variant: string, quantity = 1) => {
    const current = getCartState();
    const existing = current.items.find(
      (item) => item.productId === product.id && item.variant === variant,
    );
    const items = existing
      ? current.items.map((item) =>
          item.productId === product.id && item.variant === variant
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stockLevel) }
            : item,
        )
      : [
          ...current.items,
          {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            currency: product.currency,
            variant,
            quantity: Math.min(quantity, product.stockLevel),
            imageUrl: product.imageUrl,
          },
        ];
    setCartState({ ...current, items });
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((productId: string, variant: string, quantity: number) => {
    const current = getCartState();
    const items =
      quantity <= 0
        ? current.items.filter(
            (item) => !(item.productId === productId && item.variant === variant),
          )
        : current.items.map((item) =>
            item.productId === productId && item.variant === variant ? { ...item, quantity } : item,
          );
    setCartState({ ...current, items });
  }, []);

  const removeItem = useCallback((productId: string, variant: string) => {
    const current = getCartState();
    setCartState({
      ...current,
      items: current.items.filter(
        (item) => !(item.productId === productId && item.variant === variant),
      ),
    });
  }, []);

  const clear = useCallback(() => {
    setCartState({ items: [], promoCode: null, discountPercent: 0 });
  }, []);

  const applyPromo = useCallback((code: string) => {
    const current = getCartState();
    const normalised = code.trim().toUpperCase();
    const definition = commerce.promoCodes.find((entry) => entry.code === normalised);
    if (!definition || !definition.active) {
      return { ok: false, message: "That code is not recognised on this platform." };
    }
    const subtotal = current.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (subtotal < definition.minimumSubtotal) {
      return {
        ok: false,
        message: `This code applies to baskets of ${commerce.currencySymbol}${definition.minimumSubtotal} or more.`,
      };
    }
    setCartState({ ...current, promoCode: definition.code, discountPercent: definition.value });
    return { ok: true, message: `${definition.code} applied — ${definition.description}.` };
  }, []);

  const removePromo = useCallback(() => {
    const current = getCartState();
    setCartState({ ...current, promoCode: null, discountPercent: 0 });
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const { subtotal, discount, shipping, total } = priceBasket(cart.items, cart.discountPercent);

    return {
      items: cart.items,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discount,
      shipping,
      total,
      promoCode: cart.promoCode,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clear,
      applyPromo,
      removePromo,
    };
  }, [cart, isOpen, addItem, updateQuantity, removeItem, clear, applyPromo, removePromo]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartProvider;
