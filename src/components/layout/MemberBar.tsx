import { useEffect, useState } from "react";
import { Bell, Wallet as WalletIcon } from "lucide-react";

import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import type { WalletTransaction } from "@/types";
import { Link } from "@tanstack/react-router";

function formatNaira(value: number): string {
  return `₦${value.toLocaleString("en-NG")}`;
}

/** Wallet balance chip: cash for earners, points for researchers. */
export function WalletChip() {
  const { user } = useAuth();
  if (!user) return null;
  const isEarner = user.role === "earner";
  const cash = user.cashWallet?.availableNaira ?? 0;
  const points = user.pointsWallet?.balance ?? 0;

  return (
    <Link
      to="/wallet"
      className="hidden items-center gap-2 rounded-full border border-brand-border bg-brand-cream px-3 py-1.5 text-xs font-semibold text-brand-navy hover:border-brand-gold sm:flex"
      aria-label="Open wallet"
    >
      <WalletIcon className="h-3.5 w-3.5 text-brand-gold-dark" />
      {isEarner ? formatNaira(cash) : `${points.toLocaleString()} pts`}
    </Link>
  );
}

/** Notification bell: the member's most recent wallet and escrow activity. */
export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    if (!user || !open) return;
    let alive = true;
    void api.wallets.summary(user.id).then((summary) => {
      if (alive) setItems(summary.transactions.slice(0, 5));
    });
    return () => {
      alive = false;
    };
  }, [user, open]);

  if (!user) return null;

  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-full border border-brand-border bg-white p-2 text-brand-slate hover:border-brand-gold hover:text-brand-navy"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-brand-gold" />
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-lg border border-brand-border bg-white shadow-lg">
          <p className="border-b border-brand-border bg-brand-cream px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-slate">
            Recent activity
          </p>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-brand-slate">
              No activity yet — take a survey or buy points to see it here.
            </p>
          ) : (
            <ul className="divide-y divide-brand-border">
              {items.map((txn) => (
                <li key={txn.id} className="px-4 py-2.5 text-xs">
                  <p className="font-medium text-brand-charcoal">{txn.note}</p>
                  <p className="mt-0.5 text-[11px] text-brand-slate">
                    {txn.naira !== 0
                      ? `${txn.naira > 0 ? "+" : ""}${formatNaira(txn.naira)} · `
                      : ""}
                    {txn.points !== 0 ? `${txn.points > 0 ? "+" : ""}${txn.points} pts · ` : ""}
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
