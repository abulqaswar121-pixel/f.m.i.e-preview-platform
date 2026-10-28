import { useCallback, useEffect, useRef, useState } from "react";
import { Banknote, Download, ShieldCheck, Wallet as WalletIcon } from "lucide-react";
import { useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Badge } from "@/components/common/Badge";
import { PageHeader } from "@/components/common/Primitives";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { surveyEconomyDefaults } from "@/config/site";
import { NGN_PER_USD, formatUsd } from "@/lib/outlet-pricing";
import { STUDENT_ID_FOLDER, packChargeKobo, packsInGroup } from "@/lib/survey-points";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  confirmPointPurchase,
  getWalletSummary,
  initializePointPurchase,
  requestWalletWithdrawal,
} from "@/lib/wallet.functions";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-gold focus:outline-none";

/** Wallet amounts are kept in naira for bank payouts but shown in US dollars. */
function naira(value: number): string {
  return formatUsd(value / NGN_PER_USD);
}

function localNaira(value: number): string {
  return `₦${value.toLocaleString("en-NG")}`;
}

/**
 * Cash earnings and research points are shown independently for every member.
 */
export function WalletPage() {
  const { user } = useAuth();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const returnReference = isPaymentReturn(search) ? paymentReferenceFromSearch(search) : undefined;
  const getSummary = useServerFn(getWalletSummary);
  const beginPurchase = useServerFn(initializePointPurchase);
  const confirmPurchase = useServerFn(confirmPointPurchase);
  const reconcilePurchases = useServerFn(reconcileMyPointPurchases);
  const makeWithdrawal = useServerFn(requestWalletWithdrawal);
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getWalletSummary>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ state: "checking" | "succeeded" | "pending"; points: number; reference: string } | null>(null);
  const confirmedReference = useRef<string | null>(null);
  const reconciled = useRef(false);
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

  // Coming back from the payment page: confirm it, show a receipt, then tidy the link.
  useEffect(() => {
    if (!returnReference || !user || confirmedReference.current === returnReference) return;
    confirmedReference.current = returnReference;
    if (!/^fmie_points_[a-f0-9]{32}$/.test(returnReference)) {
      setNotice("We could not read that payment link. If you paid, your points will appear here shortly.");
      return;
    }
    setReceipt({ state: "checking", points: 0, reference: returnReference });
    void confirmPurchase({ data: { reference: returnReference } })
      .then(async (result) => {
        setReceipt({ state: result.status, points: result.points, reference: returnReference });
        await refresh();
      })
      .catch((error: unknown) => {
        setReceipt(null);
        setNotice(error instanceof Error ? error.message : "We could not check your payment yet.");
      })
      .finally(() => {
        void navigate({ to: "/wallet", search: {}, replace: true });
      });
  }, [confirmPurchase, navigate, refresh, returnReference, user]);

  // Safety net: credit any earlier payment that went through but was never confirmed.
  useEffect(() => {
    if (!user || returnReference || reconciled.current) return;
    reconciled.current = true;
    void reconcilePurchases()
      .then(async (result) => {
        if (result.credited > 0) {
          setNotice(`Good news: ${result.points.toLocaleString()} points from an earlier payment were added to your wallet.`);
          await refresh();
        }
      })
      .catch(() => undefined);
  }, [reconcilePurchases, refresh, returnReference, user]);

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

  const [studentIdUploaded, setStudentIdUploaded] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);

  useEffect(() => {
    if (!user) return;
    void supabase.auth.getUser().then(async ({ data: auth }) => {
      if (!auth.user) return;
      const { data } = await supabase.storage
        .from("member-files")
        .list(`${auth.user.id}/${STUDENT_ID_FOLDER}`, { limit: 1 });
      setStudentIdUploaded(Boolean(data && data.length > 0));
    });
  }, [user]);

  async function uploadStudentId(file: File): Promise<void> {
    if (!user) return;
    if (file.size > 10 * 1024 * 1024) {
      setNotice("Your ID file is too big. Please use a file under 10 MB.");
      return;
    }
    setUploadingId(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setUploadingId(false);
      setNotice("Please sign in again to upload your ID.");
      return;
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
    const { error } = await supabase.storage
      .from("member-files")
      .upload(`${auth.user.id}/${STUDENT_ID_FOLDER}/${Date.now()}-${safeName}`, file);
    setUploadingId(false);
    if (error) {
      setNotice("Your ID could not be uploaded. Please try again.");
      return;
    }
    setStudentIdUploaded(true);
    setNotice("Student ID uploaded. You can now buy the academic pack.");
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
        title="Your wallet"
        description="See your money, buy survey points or withdraw to your bank."
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
            <p className="text-[11px] uppercase tracking-[0.14em] text-brand-slate">
              Research points
            </p>
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
          <h2 className="font-display text-xl font-bold text-brand-charcoal">Buy survey points</h2>
          <p className="mt-1 max-w-2xl text-sm text-brand-slate">
            Pay as you go — no yearly plan. Points pay the people who answer your surveys. Top up
            any time they run low.
          </p>
          {([
            ["standard", "Pay-as-you-go packs", ""],
            ["corporate", "Corporate packs", "For companies, brands and banks. $999 to $4,999."],
            ["academic", "Academic research", "For Masters and PhD students only."],
          ] as const).map(([group, title, note]) => (
            <div key={group} className="mt-6">
              <h3 className="font-display text-base font-bold text-brand-charcoal">{title}</h3>
              {note ? <p className="text-xs text-brand-slate">{note}</p> : null}
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                {packsInGroup(group).map((pack) => {
                  const blocked = pack.requiresStudentId && !studentIdUploaded;
                  return (
                    <div
                      key={pack.id}
                      className="flex flex-col rounded-lg border border-brand-border bg-white p-5 shadow-sm"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-slate">
                        {pack.name}
                      </p>
                      <p className="mt-1 font-display text-2xl font-bold text-brand-navy">
                        {pack.points.toLocaleString()} pts
                      </p>
                      <p className="mt-1 text-lg font-semibold text-brand-charcoal">
                        {formatUsd(pack.usd)}
                      </p>
                      <p className="mt-2 flex-1 text-xs text-brand-slate">{pack.blurb}</p>
                      {pack.requiresStudentId ? (
                        <label className="mt-3 block text-xs font-semibold text-brand-slate">
                          {studentIdUploaded ? "Student ID uploaded ✓ (you can replace it)" : "Upload your student ID card"}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="mt-1 block w-full text-xs"
                            disabled={uploadingId}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void uploadStudentId(file);
                            }}
                          />
                          {uploadingId ? <span className="mt-1 block">Uploading…</span> : null}
                        </label>
                      ) : null}
                      <p className="mt-2 text-[11px] text-brand-slate">
                        Paystack shows {localNaira(packChargeKobo(pack) / 100)} at checkout.
                      </p>
                      <Button
                        className="mt-4"
                        variant="outline"
                        disabled={buying === pack.id || blocked}
                        onClick={() => void buyPack(pack.id)}
                      >
                        <WalletIcon className="mr-2 h-4 w-4" />
                        {buying === pack.id ? "Processing…" : blocked ? "Upload ID to continue" : "Pay with Paystack"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-charcoal">Transactions</h2>
            <ul className="mt-4 divide-y divide-brand-border rounded-lg border border-brand-border bg-white shadow-sm">
              {loading ? (
                <li className="px-5 py-8 text-center text-sm text-brand-slate">
                  Loading wallet history…
                </li>
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
                      {txn.amountMinor !== 0
                        ? `${txn.amountMinor > 0 ? "+" : "−"}${naira(Math.abs(txn.amountMinor) / 100)}`
                        : ""}
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
                <li className="rounded-lg border border-brand-border bg-white px-5 py-8 text-center text-sm text-brand-slate shadow-sm">
                  Loading withdrawal requests…
                </li>
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
                      <Badge
                        tone={
                          payout.status === "rejected"
                            ? "danger"
                            : payout.status === "approved"
                              ? "info"
                              : "gold"
                        }
                      >
                        {payout.status === "rejected"
                          ? "Rejected — balance returned"
                          : payout.status === "approved"
                            ? "Approved — transfer pending"
                            : "Pending review"}
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
              Minimum withdrawal {naira(surveyEconomyDefaults.minWithdrawalNaira)}. Requests need
              administrator review; approval does not send a bank transfer.
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
            Amount in naira, paid to your bank (minimum {localNaira(surveyEconomyDefaults.minWithdrawalNaira)} ≈ {naira(surveyEconomyDefaults.minWithdrawalNaira)})
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
            {Number(form.amountNaira) > 0 ? (
              <span className="mt-1 block font-normal">≈ {naira(Number(form.amountNaira))}</span>
            ) : null}
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
