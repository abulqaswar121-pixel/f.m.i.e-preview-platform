import { useMemo, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Download, Lock, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { EmptyState, PageHeader } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { commerce, countries, formatCurrency } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { api, downloadTextFile } from "@/services/api";
import type { Order } from "@/types";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none";

export function CheckoutPage() {
  const { user } = useAuth();
  const {
    items,
    subtotal,
    discount,
    promoCode,
    applyPromo,
    removePromo,
    updateQuantity,
    removeItem,
    clear,
  } = useCart();
  const [shippingMethod, setShippingMethod] = useState<"standard" | "international">("standard");
  const [paymentMethod, setPaymentMethod] = useState<string>(
    commerce.paymentMethods[0]?.id ?? "card",
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

  const [form, setForm] = useState<{
    fullName: string;
    email: string;
    phone: string;
    company: string;
    line1: string;
    line2: string;
    city: string;
    postcode: string;
    country: string;
    notes: string;
  }>({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    company: user?.organization ?? "",
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    country: countries[0] ?? "United Kingdom",
    notes: "",
  });

  const shippingCost = useMemo(() => {
    if (items.length === 0) return 0;
    if (subtotal - discount >= commerce.freeShippingThreshold) return 0;
    return shippingMethod === "international"
      ? commerce.internationalShipping
      : commerce.standardShipping;
  }, [items.length, subtotal, discount, shippingMethod]);

  const total = Math.max(0, Number((subtotal - discount + shippingCost).toFixed(2)));

  const applyPromoCode = () => {
    const result = applyPromo(promoInput);
    if (result.ok) {
      toast.success(result.message);
      setPromoInput("");
    } else {
      toast.error(result.message);
    }
  };

  const placeOrder = async (event: FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      toast.error("Your basket is empty.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
      toast.error("Enter a valid email address for the order confirmation.");
      return;
    }
    if (!form.fullName.trim() || !form.line1.trim() || !form.city.trim() || !form.postcode.trim()) {
      toast.error("Complete the delivery name, address line 1, city and postcode.");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Accept the delivery and demonstration-preview terms to continue.");
      return;
    }

    setPlacing(true);
    const order = await api.orders.create({
      items,
      email: form.email.trim().toLowerCase(),
      address: {
        fullName: form.fullName.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || undefined,
        city: form.city.trim(),
        postcode: form.postcode.trim(),
        country: form.country,
        phone: form.phone.trim(),
      },
      paymentMethod,
      promoCode: promoCode ?? undefined,
      discount,
      shipping: shippingCost,
      userId: user?.id,
    });
    setPlacing(false);
    setPlaced(order);
    clear();
    toast.success("Order placed (simulated)", {
      description: `${order.reference} · ${formatCurrency(order.total)}. No payment has been taken.`,
    });
  };

  const downloadInvoice = async (order: Order) => {
    const text = await api.orders.invoiceText(order);
    downloadTextFile(`${order.reference}-invoice.txt`, text, "text/plain;charset=utf-8");
    toast.success("Invoice downloaded", {
      description: "Simulated document — demonstration preview.",
    });
  };

  if (placed) {
    return (
      <div className="fmie-container py-12">
        <div className="mx-auto max-w-2xl rounded-lg border border-success/40 bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 font-display text-3xl font-bold text-brand-charcoal">
            Order confirmed
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-brand-slate">
            Reference{" "}
            <span className="font-mono font-semibold text-brand-charcoal">{placed.reference}</span>{" "}
            · {formatCurrency(placed.total)} · {placed.status.replace(/_/g, " ")}
          </p>
          <p className="mt-4 rounded-md bg-brand-cream px-4 py-3 text-xs leading-relaxed text-brand-slate">
            This is a simulated order inside the F.M.I.E demonstration preview. No payment has been
            taken, no goods will be dispatched and no confirmation email has been sent. The record
            is stored locally and appears in your dashboard and in the administrator panel so the
            full order lifecycle can be exercised.
          </p>

          <dl className="mt-6 space-y-1.5 border-t border-brand-border pt-4 text-left text-xs text-brand-slate">
            {placed.items.map((item) => (
              <div key={`${item.productId}-${item.variant}`} className="flex justify-between gap-3">
                <dt>
                  {item.quantity} × {item.name}{" "}
                  <span className="text-brand-slate/70">({item.variant})</span>
                </dt>
                <dd className="tabular-nums">{formatCurrency(item.price * item.quantity)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-3">
              <dt>Shipping</dt>
              <dd className="tabular-nums">
                {placed.shipping === 0 ? "Free" : formatCurrency(placed.shipping)}
              </dd>
            </div>
            {placed.discount > 0 ? (
              <div className="flex justify-between gap-3 text-success">
                <dt>Discount {placed.promoCode ? `(${placed.promoCode})` : ""}</dt>
                <dd className="tabular-nums">−{formatCurrency(placed.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3 border-t border-brand-border pt-2 text-sm font-semibold text-brand-charcoal">
              <dt>Total recorded</dt>
              <dd className="tabular-nums">{formatCurrency(placed.total)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Payment</dt>
              <dd className="font-mono">{placed.paymentReference}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Deliver to</dt>
              <dd className="max-w-[60%] text-right">
                {placed.address.line1}, {placed.address.city} {placed.address.postcode}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              className="bg-brand-navy text-white hover:bg-brand-navy-light"
              onClick={() => void downloadInvoice(placed)}
            >
              <Download className="h-4 w-4" /> Download invoice
            </Button>
            <Button asChild variant="outline">
              <Link to="/dashboard" search={{ tab: "orders" }}>
                View my orders
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/shop">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Checkout"
        title="Delivery, payment and confirmation"
        description="Payments are simulated in this preview. Orders are recorded against your account and appear immediately in the dashboard and the administrator panel."
        breadcrumb={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: "Checkout" },
        ]}
      />

      <div className="fmie-container py-10">
        {items.length === 0 ? (
          <EmptyState
            title="Your basket is empty"
            description="Add branded apparel, stationery or accessories before checking out."
            action={{ label: "Browse the shop", to: "/shop" }}
            icon={<ShoppingBag className="h-6 w-6" />}
          />
        ) : (
          <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <section className="rounded-lg border border-brand-border bg-white p-6">
                <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                  Delivery details
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input
                    className={inputClass}
                    placeholder="Full name *"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                  <input
                    className={inputClass}
                    type="email"
                    placeholder="Email *"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                  <input
                    className={inputClass}
                    placeholder="Telephone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="Company (optional)"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />
                  <input
                    className={`${inputClass} sm:col-span-2`}
                    placeholder="Address line 1 *"
                    value={form.line1}
                    onChange={(e) => setForm({ ...form, line1: e.target.value })}
                    required
                  />
                  <input
                    className={`${inputClass} sm:col-span-2`}
                    placeholder="Address line 2"
                    value={form.line2}
                    onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  />
                  <input
                    className={inputClass}
                    placeholder="City *"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                  />
                  <input
                    className={inputClass}
                    placeholder="Postcode *"
                    value={form.postcode}
                    onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                    required
                  />
                  <select
                    className={`${inputClass} sm:col-span-2`}
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    aria-label="Delivery country"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className={`${inputClass} sm:col-span-2`}
                    rows={2}
                    placeholder="Delivery notes (optional)"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <p className="mt-3 text-[11px] text-brand-slate">
                  Choose a country outside the United Kingdom and international shipping is applied
                  automatically.
                </p>
              </section>

              <section className="rounded-lg border border-brand-border bg-white p-6">
                <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                  Shipping method
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      {
                        id: "standard",
                        label: "Standard UK (2–4 working days)",
                        rate: commerce.standardShipping,
                      },
                      {
                        id: "international",
                        label: "International (5–10 working days)",
                        rate: commerce.internationalShipping,
                      },
                    ] as const
                  ).map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 ${
                        shippingMethod === method.id
                          ? "border-brand-navy bg-brand-cream/60"
                          : "border-brand-border bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        className="mt-1 accent-brand-navy"
                        checked={shippingMethod === method.id}
                        onChange={() => setShippingMethod(method.id)}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-brand-charcoal">
                          {method.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-brand-slate">
                          {formatCurrency(method.rate)} · free over{" "}
                          {formatCurrency(commerce.freeShippingThreshold)}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-brand-border bg-white p-6">
                <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                  Payment method
                </h2>
                <div className="mt-3 space-y-2">
                  {commerce.paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border px-4 py-3 ${
                        paymentMethod === method.id
                          ? "border-brand-navy bg-brand-cream/60"
                          : "border-brand-border bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        className="mt-1 accent-brand-navy"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-brand-charcoal">
                          {method.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-brand-slate">
                          {method.detail}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-brand-slate">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-navy" />
                  No card details are collected or stored. Payment is recorded as a simulated
                  transaction with a generated reference so the order lifecycle can be demonstrated
                  end to end.
                </p>
                <label className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-brand-slate">
                  <input
                    type="checkbox"
                    className="mt-0.5 accent-brand-navy"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  I accept that this is a demonstration preview: no goods will be dispatched and no
                  payment will be taken. {commerce.vatNote}
                </label>
              </section>
            </div>

            <aside className="space-y-4">
              <div className="rounded-lg border border-brand-border bg-white p-5">
                <h2 className="font-display text-base font-semibold text-brand-charcoal">
                  Order summary
                </h2>
                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li key={`${item.productId}-${item.variant}`} className="flex gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-14 w-14 shrink-0 rounded-md border border-brand-border bg-brand-cream object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-brand-charcoal">
                          {item.name}
                        </p>
                        <p className="text-xs text-brand-slate">
                          {item.variant} · {formatCurrency(item.price)} each
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.productId, item.variant, Number(e.target.value))
                            }
                            className="w-16 rounded border border-brand-border px-2 py-0.5 text-xs"
                            aria-label={`Quantity for ${item.name}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId, item.variant)}
                            className="inline-flex items-center gap-1 text-[11px] text-brand-slate hover:text-danger"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-brand-charcoal">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border-t border-brand-border pt-3">
                  <div className="flex gap-2">
                    <input
                      className={inputClass}
                      placeholder="Promo code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      aria-label="Promo code"
                    />
                    <Button type="button" variant="outline" onClick={applyPromoCode}>
                      Apply
                    </Button>
                  </div>
                  {promoCode ? (
                    <p className="mt-2 flex items-center gap-2 text-xs text-success">
                      <Badge tone="success">{promoCode}</Badge> applied
                      <button
                        type="button"
                        onClick={removePromo}
                        className="ml-auto text-[11px] text-brand-slate underline hover:text-danger"
                      >
                        remove
                      </button>
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-brand-slate">
                      Try{" "}
                      {commerce.promoCodes
                        .filter((code) => code.active)
                        .map((code) => code.code)
                        .join(" or ")}
                      .
                    </p>
                  )}
                </div>

                <dl className="mt-4 space-y-1.5 border-t border-brand-border pt-3 text-sm">
                  <div className="flex justify-between text-brand-slate">
                    <dt>Subtotal</dt>
                    <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
                  </div>
                  {discount > 0 ? (
                    <div className="flex justify-between text-success">
                      <dt>Discount</dt>
                      <dd className="tabular-nums">−{formatCurrency(discount)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-brand-slate">
                    <dt>Shipping</dt>
                    <dd className="tabular-nums">
                      {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-brand-border pt-2 text-base font-semibold text-brand-charcoal">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatCurrency(total)}</dd>
                  </div>
                </dl>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-4 w-full bg-brand-navy text-white hover:bg-brand-navy-light"
                  disabled={placing}
                >
                  {placing ? "Placing order…" : `Place order · ${formatCurrency(total)}`}
                </Button>
                <p className="mt-3 text-center text-[11px] text-brand-slate">
                  Simulated checkout — no funds move and no goods ship.
                </p>
              </div>

              <p className="rounded-md bg-brand-cream px-4 py-3 text-[11px] leading-relaxed text-brand-slate">
                {commerce.vatNote}
              </p>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}

export default CheckoutPage;
