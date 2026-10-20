import { useEffect, useState } from "react";
import { Banknote, Download, ShieldCheck, Wallet as WalletIcon } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { PageHeader } from "@/components/common/Primitives";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { surveyPointPacks } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { api, useDatabase } from "@/services/api";
import type { PayoutRequest, WalletTransaction } from "@/types";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-gold focus:outline-none";

function naira(value: number): string {
  return `₦${value.toLocaleString("en-NG")}`;
}

/**
 * Two-sided wallet: cash earnings and bank withdrawal for survey earners,
 * survey points and Paystack (simulated) top-ups for researchers.
 */
export function WalletPage() {
  const { user } = useAuth();
  const database = useDatabase();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    amountNaira: "",
  });

  const settings = database.settings;

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void api.wallets.summary(user.id).then((summary) => {
      if (alive) setTransactions(summary.transactions);
    });
    void api.payouts.list().then((list) => {
      if (alive) setPayouts(list.filter((payout) => payout.userId === user.id));
    });
    return () => {
      alive = false;
    };
  }, [user, database.transactions, database.payouts]);

  const cash = user?.cashWallet ?? { availableNaira: 0, totalEarnedNaira: 0, completedSurveys: 0 };
  const points = user?.pointsWallet ?? { balance: 0, purchasedNaira: 0 };
  const isEarner = user?.role === "earner";

  async function submitWithdrawal(): Promise<void> {
    if (!user) return;
    setNotice(null);
    try {
      const payout = await api.wallets.withdraw(user.id, {
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        accountName: form.accountName,
        amountNaira: Number(form.amountNaira || 0),
      });
      setWithdrawOpen(false);
      setNotice(
        `Withdrawal of ${naira(payout.amountNaira)} to ${payout.bankName} is being processed — simulated instant payout.`,
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Withdrawal failed.");
    }
  }

  async function buyPack(packId: string): Promise<void> {
    if (!user) return;
    setBuying(packId);
    setNotice(null);
    try {
      await api.wallets.purchasePoints(user.id, packId);
      setNotice("Paystack checkout simulated — points credited to your research wallet.");
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
        description="Survey earners withdraw to a Nigerian bank account; researchers top up survey points through a simulated Paystack checkout. Every movement is stored locally and survives refresh."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Wallet" }]}
      />

      <div className="fmie-container py-10 sm:py-14">
        {notice ? (
          <p className="rounded-lg border border-brand-gold/60 bg-brand-gold/10 px-4 py-3 text-sm text-brand-charcoal">
            {notice}
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-brand-border bg-white p-5 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.14em] text-brand-slate">
              Available balance
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-brand-navy">
              {isEarner ? naira(cash.availableNaira) : `${points.balance.toLocaleString()} pts`}
            </p>
          </div>
          <div className="rounded-lg border border-brand-border bg-white p-5 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.14em] text-brand-slate">Total earned</p>
            <p className="mt-2 font-display text-3xl font-bold text-brand-navy">
              {isEarner ? naira(cash.totalEarnedNaira) : naira(points.purchasedNaira)}
            </p>
          </div>
          <div className="rounded-lg border border-brand-border bg-white p-5 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.14em] text-brand-slate">
              {isEarner ? "Completed surveys" : "Lifetime point spend"}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-brand-navy">
              {isEarner ? String(cash.completedSurveys) : `${points.balance.toLocaleString()} pts`}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {isEarner ? (
            <Button
              onClick={() => setWithdrawOpen(true)}
              className="bg-brand-navy text-white hover:bg-brand-navy-dark"
            >
              <Download className="mr-2 h-4 w-4" /> Withdraw to Bank
            </Button>
          ) : (
            <Badge tone="gold">
              <ShieldCheck className="mr-1 inline h-3 w-3" /> Researcher wallet — points escrowed
              per live survey
            </Badge>
          )}
        </div>

        {!isEarner ? (
          <section className="mt-10">
            <h2 className="font-display text-xl font-bold text-brand-charcoal">
              Buy survey points
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-brand-slate">
              Points fund respondent rewards and are locked in escrow when a survey goes live.
              Unused points return to this wallet automatically if a survey closes before its quota.
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
        ) : null}

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-charcoal">Transactions</h2>
            <ul className="mt-4 divide-y divide-brand-border rounded-lg border border-brand-border bg-white shadow-sm">
              {transactions.length === 0 ? (
                <li className="px-5 py-8 text-center text-sm text-brand-slate">
                  No wallet movements yet.
                </li>
              ) : (
                transactions.map((txn) => (
                  <li
                    key={txn.id}
                    className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-brand-charcoal">{txn.note}</p>
                      <p className="text-[11px] text-brand-slate">
                        {new Date(txn.createdAt).toLocaleString()} · {txn.kind.replace("_", " ")}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-brand-navy">
                      {txn.naira !== 0 ? `${txn.naira > 0 ? "+" : ""}${naira(txn.naira)}` : ""}
                      {txn.naira !== 0 && txn.points !== 0 ? " · " : ""}
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
              {payouts.length === 0 ? (
                <li className="rounded-lg border border-brand-border bg-white px-5 py-8 text-center text-sm text-brand-slate shadow-sm">
                  No withdrawal requests yet.
                </li>
              ) : (
                payouts.map((payout) => (
                  <li
                    key={payout.id}
                    className="rounded-lg border border-brand-border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-brand-charcoal">
                        {naira(payout.amountNaira)}
                      </p>
                      <Badge tone={payout.status === "paid" ? "navy" : "gold"}>
                        {payout.status === "paid" ? "Paid" : "Processing"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-brand-slate">
                      {payout.bankName} •••{payout.accountNumber.slice(-4)} ·{" "}
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </p>
                  </li>
                ))
              )}
            </ul>
            <p className="mt-4 flex items-start gap-2 text-xs text-brand-slate">
              <Banknote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-gold-dark" />
              Minimum withdrawal {naira(settings.minWithdrawalNaira)}. Payouts are simulated for
              this demonstration preview — no real bank transfer occurs.
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
            Amount (minimum {naira(settings.minWithdrawalNaira)})
            <input
              className={`${inputClass} mt-1`}
              type="number"
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
