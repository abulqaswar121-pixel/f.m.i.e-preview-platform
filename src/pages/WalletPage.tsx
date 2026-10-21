import { useCallback, useEffect, useRef, useState } from "react";
import { Banknote, Download, ShieldCheck, Wallet as WalletIcon } from "lucide-react";
import { useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Badge } from "@/components/common/Badge";
import { PageHeader } from "@/components/common/Primitives";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { surveyEconomyDefaults, surveyPointPacks } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import {
  confirmPointPurchase,
  getWalletSummary,
  initializePointPurchase,
  requestWalletWithdrawal,
} from "@/lib/wallet.functions";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-gold focus:outline-none";

function naira(value: number): string {
  return `₦${value.toLocaleString("en-NG")}`;
}

/**
 * Cash earnings and research points are shown independently for every member.
 */
export function WalletPage() {
  const { user } = useAuth();
  const search = useSearch({ strict: false }) as { payment?: string; reference?: string };
  const getSummary = useServerFn(getWalletSummary);
  const beginPurchase = useServerFn(initializePointPurchase);
  const confirmPurchase = useServerFn(confirmPointPurchase);
  const makeWithdrawal = useServerFn(requestWalletWithdrawal);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getWalletSummary>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const confirmedReference = useRef<string | null>(null);
  const [form, setForm] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    amountNaira: "",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await getSummary());
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Your wallet could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [getSummary]);

  useEffect(() => {
    if (user) void refresh();
  }, [user, refresh]);

  useEffect(() => {
    if (search.payment !== "return" || !search.reference || !user || confirmedReference.current === search.reference) return;
    confirmedReference.current = search.reference;
    void confirmPurchase({ data: { reference: search.reference } })
      .then(async (result) => {
        setNotice(result.status === "succeeded"
          ? "Payment confirmed. Points have been added to your research wallet."
          : "Payment is still being confirmed. Your wallet will update once it is verified.");
        await refresh();
      })
      .catch((error: unknown) => {
        setNotice(error instanceof Error ? error.message : "Payment confirmation is still pending.");
      });
  }, [confirmPurchase, refresh, search.payment, search.reference, user]);

  const cashMinor = summary?.cashMinor ?? 0;
  const pointsBalance = summary?.points ?? 0;

  async function submitWithdrawal(): Promise<void> {
    if (!user) return;
    setNotice(null);
    try {
      await makeWithdrawal({
        data: {
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          accountName: form.accountName,
          amountNaira: Number(form.amountNaira || 0),
        },
      });
      setWithdrawOpen(false);
      setForm({ bankName: "", accountNumber: "", accountName: "", amountNaira: "" });
      setNotice("Withdrawal request saved for review. This does not send a bank transfer.");
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Withdrawal failed.");
    }
  }

  async function buyPack(packId: string): Promise<void> {
    if (!user) return;
    setBuying(packId);
    setNotice(null);
    try {
      const result = await beginPurchase({ data: { packId } });
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Purchase failed.");
    } finally {
      setBuying(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Wallet"
        title="Cash earnings & research points"
        description="View your saved wallet balance, buy research points, or request a bank withdrawal."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Wallet" }]}
      />

      <div className="fmie-container py-10 sm:py-14">
        {notice ? (
          <p className="rounded-lg border border-brand-gold/60 bg-brand-gold/10 px-4 py-3 text-sm text-brand-charcoal">
            {notice}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="fmie-card p-5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-brand-slate">
              Available cash
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-brand-navy">
              {loading ? "Loading…" : naira(cashMinor / 100)}
            </p>
          </div>
          <div className="fmie-card p-5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-brand-slate">Research points</p>
            <p className="mt-2 font-display text-3xl font-bold text-brand-navy">
              {loading ? "Loading…" : `${pointsBalance.toLocaleString()} pts`}
            </p>
          </div>
          <div className="rounded-lg border border-brand-border bg-white p-5 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.14em] text-brand-slate">Cash earned</p>
            <p className="mt-2 font-display text-3xl font-bold text-brand-navy">
              {loading ? "Loading…" : naira((summary?.totalEarnedMinor ?? 0) / 100)}
            </p>
          </div>
          <div className="rounded-lg border border-brand-border bg-white p-5 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.14em] text-brand-slate">
              Points reserved for surveys
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-brand-navy">
              {loading ? "Loading…" : `${(summary?.lockedPoints ?? 0).toLocaleString()} pts`}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            disabled={loading || cashMinor < surveyEconomyDefaults.minWithdrawalNaira * 100}
            onClick={() => setWithdrawOpen(true)}
            className="bg-brand-navy text-white hover:bg-brand-navy-dark"
          >
            <Download className="mr-2 h-4 w-4" /> Withdraw to Bank
          </Button>
          <Badge tone="gold">
            <ShieldCheck className="mr-1 inline h-3 w-3" /> Survey reward funding is not active yet
          </Badge>
        </div>

          <section className="mt-10">
            <h2 className="font-display text-xl font-bold text-brand-charcoal">
              Buy survey points
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-brand-slate">
              Confirmed point purchases are saved to this wallet. Using points to fund survey
              rewards is not active yet.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {surveyPointPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="flex flex-col rounded-lg border border-brand-border bg-white p-5 shadow-sm"
                >
                  <p className="font-display text-2xl font-bold text-brand-navy">
                    {pack.points.toLocaleString()} pts
                  </p>
                  <p className="mt-1 text-sm font-semibold text-brand-charcoal">
                    {naira(pack.naira)}
                  </p>
                  <p className="mt-2 flex-1 text-xs text-brand-slate">{pack.blurb}</p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    disabled={buying === pack.id}
                    onClick={() => void buyPack(pack.id)}
                  >
                    <WalletIcon className="mr-2 h-4 w-4" />
                    {buying === pack.id ? "Processing…" : "Pay with Paystack"}
                  </Button>
                </div>
              ))}
            </div>
          </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-charcoal">Transactions</h2>
            <ul className="mt-4 divide-y divide-brand-border rounded-lg border border-brand-border bg-white shadow-sm">
              {loading ? (
                <li className="px-5 py-8 text-center text-sm text-brand-slate">Loading wallet history…</li>
              ) : (summary?.transactions.length ?? 0) === 0 ? (
                <li className="px-5 py-8 text-center text-sm text-brand-slate">
                  No wallet movements yet.
                </li>
              ) : (
                (summary?.transactions ?? []).map((txn) => (
                  <li
                    key={txn.id}
                    className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-brand-charcoal">{txn.note}</p>
                      <p className="text-[11px] text-brand-slate">
                        {new Date(txn.createdAt).toLocaleString()} · {txn.kind.replaceAll("_", " ")}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-brand-navy">
                      {txn.amountMinor !== 0 ? `${txn.amountMinor > 0 ? "+" : "−"}${naira(Math.abs(txn.amountMinor) / 100)}` : ""}
                      {txn.amountMinor !== 0 && txn.points !== 0 ? " · " : ""}
                      {txn.points !== 0 ? `${txn.points > 0 ? "+" : ""}${txn.points} pts` : ""}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-brand-charcoal">Withdrawals</h2>
            <ul className="mt-4 space-y-3">
              {loading ? (
                <li className="rounded-lg border border-brand-border bg-white px-5 py-8 text-center text-sm text-brand-slate shadow-sm">Loading withdrawal requests…</li>
              ) : (summary?.withdrawals.length ?? 0) === 0 ? (
                <li className="rounded-lg border border-brand-border bg-white px-5 py-8 text-center text-sm text-brand-slate shadow-sm">
                  No withdrawal requests yet.
                </li>
              ) : (
                (summary?.withdrawals ?? []).map((payout) => (
                  <li
                    key={payout.id}
                    className="rounded-lg border border-brand-border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-brand-charcoal">
                        {naira(payout.amountMinor / 100)}
                      </p>
                      <Badge tone={payout.status === "rejected" ? "danger" : payout.status === "approved" ? "info" : "gold"}>
                        {payout.status === "rejected" ? "Rejected — balance returned" : payout.status === "approved" ? "Approved — transfer pending" : "Pending review"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-brand-slate">
                      {payout.bankName} ••••{payout.accountLastFour} ·{" "}
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </p>
                  </li>
                ))
              )}
            </ul>
            <p className="mt-4 flex items-start gap-2 text-xs text-brand-slate">
              <Banknote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold-dark" />
              Minimum withdrawal {naira(surveyEconomyDefaults.minWithdrawalNaira)}. Requests need administrator review; approval does not send a bank transfer.
            </p>
          </div>
        </section>
      </div>

      <Modal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="Withdraw to bank">
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-brand-slate">
            Bank name
            <input
              className={`${inputClass} mt-1`}
              value={form.bankName}
              onChange={(event) => setForm((prev) => ({ ...prev, bankName: event.target.value }))}
              placeholder="e.g. Guaranty Trust Bank"
            />
          </label>
          <label className="block text-xs font-semibold text-brand-slate">
            Account number
            <input
              className={`${inputClass} mt-1`}
              value={form.accountNumber}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, accountNumber: event.target.value }))
              }
              placeholder="10-digit NUBAN"
            />
          </label>
          <label className="block text-xs font-semibold text-brand-slate">
            Account name
            <input
              className={`${inputClass} mt-1`}
              value={form.accountName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, accountName: event.target.value }))
              }
              placeholder="As recorded by the bank"
            />
          </label>
          <label className="block text-xs font-semibold text-brand-slate">
            Amount (minimum {naira(surveyEconomyDefaults.minWithdrawalNaira)})
            <input
              className={`${inputClass} mt-1`}
              type="number"
              min={surveyEconomyDefaults.minWithdrawalNaira}
              step="1"
              value={form.amountNaira}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, amountNaira: event.target.value }))
              }
              placeholder="2000"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void submitWithdrawal()}
              className="bg-brand-navy text-white hover:bg-brand-navy-dark"
            >
              Request payout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default WalletPage;
