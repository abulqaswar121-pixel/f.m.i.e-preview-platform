import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { getWithdrawalAccountNumber, getWithdrawalQueue, resolveWithdrawal } from "@/lib/wallet.functions";

type Withdrawal = Awaited<ReturnType<typeof getWithdrawalQueue>>[number];

function naira(amountMinor: number): string {
  return `₦${(amountMinor / 100).toLocaleString("en-NG")}`;
}

export function CloudPayoutQueue() {
  const getQueue = useServerFn(getWithdrawalQueue);
  const getAccountNumber = useServerFn(getWithdrawalAccountNumber);
  const resolveRequest = useServerFn(resolveWithdrawal);
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [accountNumbers, setAccountNumbers] = useState<Record<string, string>>({});

  async function reload(): Promise<void> {
    setLoading(true);
    try {
      setItems(await getQueue());
    } catch {
      toast.error("Withdrawal requests could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function decide(withdrawalId: string, decision: "approve" | "reject"): Promise<void> {
    setBusyId(withdrawalId);
    try {
      await resolveRequest({ data: { withdrawalId, decision } });
      toast.success(decision === "approve" ? "Withdrawal approved for manual payment." : "Withdrawal rejected and funds returned.");
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The request could not be updated.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleAccountNumber(withdrawalId: string): Promise<void> {
    if (revealedId === withdrawalId) {
      setRevealedId(null);
      return;
    }
    setRevealedId(withdrawalId);
    if (accountNumbers[withdrawalId]) return;
    try {
      const result = await getAccountNumber({ data: { withdrawalId } });
      setAccountNumbers((current) => ({ ...current, [withdrawalId]: result.accountNumber }));
    } catch (error) {
      setRevealedId(null);
      toast.error(error instanceof Error ? error.message : "Bank details could not be loaded.");
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-brand-charcoal">Bank withdrawals</h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
          Approving records that a request is ready for manual transfer; it does not send money. Rejecting returns the reserved balance to the member.
        </p>
      </div>
      {loading ? <p className="py-8 text-center text-sm text-brand-slate">Loading withdrawal requests…</p> : null}
      {!loading && items.length === 0 ? <p className="rounded-lg border border-brand-border bg-white px-5 py-8 text-center text-sm text-brand-slate">No open withdrawal requests.</p> : null}
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-brand-border bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-brand-charcoal">{naira(item.amountMinor)} · {item.bankName}</h3>
                <p className="mt-1 text-xs text-brand-slate">{item.accountName} · account ending {item.accountNumber.slice(-4)} · requested {new Date(item.requestedAt).toLocaleDateString()}</p>
                {revealedId === item.id && accountNumbers[item.id] ? (
                  <p className="mt-2 font-mono text-sm text-brand-charcoal" aria-label="Full bank account number">{accountNumbers[item.id]}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={item.status === "approved" ? "success" : "gold"}>{item.status === "approved" ? "Approved — transfer pending" : "Pending review"}</Badge>
                <Button size="sm" variant="outline" onClick={() => void toggleAccountNumber(item.id)}>
                  {revealedId === item.id ? "Hide account" : "Show account"}
                </Button>
                {item.status === "pending" ? (
                  <>
                    <Button size="sm" variant="outline" disabled={busyId === item.id} onClick={() => void decide(item.id, "reject")}>Reject</Button>
                    <Button size="sm" disabled={busyId === item.id} onClick={() => void decide(item.id, "approve")}>Approve</Button>
                  </>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}