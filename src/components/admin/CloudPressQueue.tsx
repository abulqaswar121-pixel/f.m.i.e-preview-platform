import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatUsd } from "@/lib/outlet-pricing";
import { PRESS_DESK_STAGES, getPaidPressQueue, updatePressStage } from "@/lib/press-bookings.functions";

type Booking = Awaited<ReturnType<typeof getPaidPressQueue>>[number];
type Stage = (typeof PRESS_DESK_STAGES)[number];

/** Opens a member's private press file for the team with a short-lived link. */
async function openFile(path: string): Promise<void> {
  const { data, error } = await supabase.storage.from("member-files").createSignedUrl(path, 300);
  if (error || !data) {
    toast.error("This file could not be opened.");
    return;
  }
  window.open(data.signedUrl, "_blank", "noopener");
}

const STAGE_LABELS: Record<Stage, string> = {
  under_review: "In review",
  additional_info_required: "Need more details",
  approved: "Approved",
  in_production: "Being prepared",
  distribution_in_progress: "Sending to outlets",
  completed: "Published",
  rejected: "Not accepted",
};

/** Paid press releases saved in the database, for the admin press desk. */
export function CloudPressQueue() {
  const getQueue = useServerFn(getPaidPressQueue);
  const updateStage = useServerFn(updatePressStage);
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ status: Stage; note: string; url: string }>({ status: "under_review", note: "", url: "" });

  async function reload(): Promise<void> {
    setLoading(true);
    try {
      setItems(await getQueue());
    } catch {
      toast.error("Paid press releases could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  async function save(bookingId: string): Promise<void> {
    setBusyId(bookingId);
    try {
      await updateStage({ data: { bookingId, status: draft.status, note: draft.note, publishedUrl: draft.url.trim() } });
      toast.success("Booking updated.");
      setOpenId(null);
      await reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "This booking could not be updated.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-brand-charcoal">Paid press releases</h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-brand-slate">
          Real bookings paid through Paystack. Move each one along and add the live link when it is published. The member sees every change in My requests.
        </p>
      </div>
      {loading ? <p className="py-6 text-center text-sm text-brand-slate">Loading paid press releases…</p> : null}
      {!loading && items.length === 0 ? (
        <p className="rounded-lg border border-brand-border bg-white px-5 py-6 text-center text-sm text-brand-slate">No paid press releases yet.</p>
      ) : null}
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-brand-border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words text-sm font-semibold text-brand-charcoal">{item.title}</h3>
                <p className="mt-1 text-xs text-brand-slate">
                  {item.referenceNumber} · {formatUsd(item.priceUsdCents / 100)} · paid {item.paidAt ? new Date(item.paidAt).toLocaleDateString() : ""}
                </p>
                <p className="mt-1 break-words text-xs text-brand-slate">{item.outlets.join(", ")}</p>
                <p className="mt-1 break-words text-xs text-brand-slate">
                  {[item.companyName, item.contactName, item.contactEmail, item.contactPhone].filter(Boolean).join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={item.status === "completed" ? "success" : "gold"}>
                  {item.status === "submitted" ? "New — paid" : STAGE_LABELS[item.status as Stage] ?? item.status}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setOpenId(openId === item.id ? null : item.id);
                    setDraft({ status: "under_review", note: "", url: "" });
                  }}
                >
                  {openId === item.id ? "Close" : "Open"}
                </Button>
              </div>
            </div>
            {openId === item.id ? (
              <div className="mt-4 space-y-3 border-t border-brand-border pt-4">
                <p className="max-h-64 overflow-y-auto whitespace-pre-line break-words rounded-md bg-brand-cream p-3 text-xs leading-relaxed text-brand-charcoal">
                  {item.contentDraft}
                </p>
                {item.attachments.length ? (
                  <div className="flex flex-wrap gap-2">
                    {item.attachments.map((path, index) => (
                      <Button key={path} size="sm" variant="outline" onClick={() => void openFile(path)}>
                        Open file {index + 1}
                      </Button>
                    ))}
                  </div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-brand-slate">
                    Move to
                    <select
                      className="mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm"
                      value={draft.status}
                      onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as Stage }))}
                    >
                      {PRESS_DESK_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {STAGE_LABELS[stage]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-brand-slate">
                    Live link (when published)
                    <input
                      className="mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm"
                      value={draft.url}
                      onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
                      placeholder="https://"
                    />
                  </label>
                </div>
                <label className="block text-xs font-semibold text-brand-slate">
                  Note (optional)
                  <input
                    className="mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm"
                    value={draft.note}
                    onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
                  />
                </label>
                <Button size="sm" disabled={busyId === item.id} onClick={() => void save(item.id)}>
                  Save
                </Button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
