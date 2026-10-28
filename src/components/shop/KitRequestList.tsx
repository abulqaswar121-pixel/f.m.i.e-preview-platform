import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/common/Badge";
import { getKitQueue, listMyKitRequests, replyToKitRequest, getKitCrest } from "@/lib/kit-quotes.functions";
import { formatUsd, NGN_PER_USD } from "@/lib/outlet-pricing";
import { kitReplySchema } from "@/lib/kit-quotes";
import { useAuth } from "@/hooks/useAuth";

type Kit = Awaited<ReturnType<typeof listMyKitRequests>>[number];
const inputClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground";

function KitCard({ item, admin }: { item: Kit; admin: boolean }) {
  const reply = useServerFn(replyToKitRequest);
  const openCrest = useServerFn(getKitCrest);
  const queryClient = useQueryClient();
  const [usd, setUsd] = useState(item.quote_minor == null ? "" : String(item.quote_minor / (100 * NGN_PER_USD)));
  const [note, setNote] = useState(item.quote_note);
  const [busy, setBusy] = useState(false);
  async function save() {
    const parsed = kitReplySchema.safeParse({ id: item.id, usd: Number(usd), note });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Check the quote."); return; }
    setBusy(true);
    try { await reply({ data: parsed.data }); await queryClient.invalidateQueries({ queryKey: ["kit-requests"] }); toast.success("Quote saved for the member."); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Quote could not be saved."); }
    finally { setBusy(false); }
  }
  return <article className="rounded-lg border border-border bg-background p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><h3 className="break-words font-semibold text-foreground">{item.club_name}</h3><p className="mt-1 text-xs text-muted-foreground">{item.sport} · {item.quantity} kits · {new Date(item.created_at).toLocaleDateString()}</p><p className="mt-1 break-all text-xs text-muted-foreground">Request {item.id}</p></div>
      <Badge tone={item.status === "quoted" ? "success" : "gold"}>{item.status === "quoted" && item.quote_minor != null ? formatUsd(item.quote_minor / (100 * NGN_PER_USD)) : "Waiting for quote"}</Badge>
    </div>
    <p className="mt-3 break-words text-sm text-muted-foreground">Delivery: {item.delivery_address} · {item.delivery_date || "Date to be agreed"}</p>
    <p className="mt-2 text-xs text-muted-foreground">Colours: {item.primary_color} / {item.secondary_color}</p>
    {item.notes && <p className="mt-2 whitespace-pre-line break-words text-sm text-foreground">{item.notes}</p>}
    {item.quote_note && item.status === "quoted" && <p className="mt-3 whitespace-pre-line break-words text-sm text-foreground">Quote details: {item.quote_note}</p>}
    {admin && <>
      {item.crest_path && <Button variant="outline" size="sm" className="mt-3" onClick={async () => { try { const { url } = await openCrest({ data: { id: item.id } }); window.open(url, "_blank", "noopener,noreferrer"); } catch { toast.error("Crest could not be opened."); } }}>Open team crest</Button>}
      {Array.isArray(item.roster) && item.roster.length > 0 && <ul className="mt-3 space-y-1 text-sm text-muted-foreground">{item.roster.map((row, i) => row && typeof row === "object" && !Array.isArray(row) ? <li key={i}>{String(row["name"] ?? "")} · #{String(row["number"] ?? "")} · {String(row["size"] ?? "")}</li> : null)}</ul>}
      <div className="mt-4 grid items-end gap-3 sm:grid-cols-[140px_minmax(0,1fr)_auto]">
        <label className="text-xs text-muted-foreground">Quote ($)<input type="number" min="0.01" step="0.01" className={`${inputClass} mt-1`} value={usd} onChange={(e) => setUsd(e.target.value)} /></label>
        <label className="text-xs text-muted-foreground">Fabric, delivery and other details<textarea rows={2} className={`${inputClass} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} /></label>
        <Button disabled={busy} onClick={() => void save()}>{busy ? "Saving…" : "Send quote"}</Button>
      </div>
    </>}
  </article>;
}

export function KitRequestList({ admin = false }: { admin?: boolean }) {
  const { user } = useAuth();
  const getMine = useServerFn(listMyKitRequests);
  const getQueue = useServerFn(getKitQueue);
  const query = useQuery({ queryKey: ["kit-requests", admin ? "admin" : "mine", user?.id], queryFn: () => admin ? getQueue() : getMine(), enabled: Boolean(user) });
  return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-xl font-semibold text-foreground">{admin ? "Kit quote requests" : "My kit requests"}</h2><Button size="sm" variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}>Refresh</Button></div>
    {query.isLoading && <p className="text-sm text-muted-foreground">Loading requests…</p>}
    {query.isError && <p role="alert" className="text-sm text-destructive">Requests could not be loaded. Please try again.</p>}
    {query.data?.length === 0 && <p className="py-4 text-sm text-muted-foreground">{admin ? "No kit requests yet." : "No kit requests yet. Your saved requests and quotes will appear here."}</p>}
    {query.data?.map((item) => <KitCard key={item.id} item={item} admin={admin} />)}
  </section>;
}