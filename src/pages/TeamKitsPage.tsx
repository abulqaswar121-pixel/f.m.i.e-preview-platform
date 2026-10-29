import { useState } from "react";
import { Plus, Shirt, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { submitKitRequest } from "@/lib/kit-quotes.functions";
import { kitRequestSchema } from "@/lib/kit-quotes";
import { KitRequestList } from "@/components/shop/KitRequestList";
import { FileDropzone } from "@/components/common/FileDropzone";
import type { KitRosterRow } from "@/types";

const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
type Sport = "Football" | "Basketball" | "Corporate";
const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-gold focus:outline-none";

/** Custom football & corporate kit builder with live quote summary. */
export function TeamKitsPage() {
  const { user, isSignedIn } = useAuth();
  const saveRequest = useServerFn(submitKitRequest);
  const queryClient = useQueryClient();
  const [crest, setCrest] = useState<File | null>(null);
  const [crestPreview, setCrestPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    clubName: "",
    sport: "Football" as Sport,
    primaryColor: "#0A2E68",
    secondaryColor: "#C5A869",
    quantity: 18,
    deliveryDate: "",
    deliveryAddress: "",
    notes: "",
  });
  const [roster, setRoster] = useState<KitRosterRow[]>([{ name: "", number: "1", size: "M" }]);
  const [submitted, setSubmitted] = useState<string | null>(null);

  function setRow(index: number, patch: Partial<KitRosterRow>): void {
    setRoster((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function submit(): Promise<void> {
    if (!user || busy) return;
    setError("");
    const parsed = kitRequestSchema.safeParse({ ...form, crestPath: null, roster: roster.filter((row) => row.name.trim()) });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check your details."); return; }
    if (crest && (!['image/png', 'image/jpeg', 'image/webp'].includes(crest.type) || crest.size > 5 * 1024 * 1024)) { setError("Choose a PNG, JPG or WebP crest, up to 5 MB."); return; }
    setBusy(true);
    let crestPath: string | null = null;
    try {
      if (crest) {
        crestPath = `${user.id}/kit-crests/${crypto.randomUUID()}-${crest.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100)}`;
        const { error: uploadError } = await supabase.storage.from("member-files").upload(crestPath, crest);
        if (uploadError) throw new Error("Your crest could not be uploaded. Please try again.");
      }
      const request = await saveRequest({ data: { ...parsed.data, crestPath } });
      setSubmitted(request.id);
      await queryClient.invalidateQueries({ queryKey: ["kit-requests"] });
    } catch (err) {
      if (crestPath) await supabase.storage.from("member-files").remove([crestPath]);
      setError(err instanceof Error ? err.message : "Your request could not be saved.");
    } finally { setBusy(false); }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Team kits"
        title="Custom team kits"
        description="Pick your colours, add your players and ask for a price. Our team confirms the fabric and delivery before you pay."
        breadcrumb={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: "Team kits" },
        ]}
      />

      <div className="fmie-container grid grid-cols-1 gap-8 py-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {submitted ? (
            <p className="rounded-lg border border-brand-gold/60 bg-brand-gold/10 px-4 py-3 text-sm text-brand-charcoal">
              Request saved: <span className="break-all font-semibold">{submitted}</span>. Your quote will appear in My kit requests below.
            </p>
          ) : null}

          <section className="rounded-lg border border-brand-border bg-white p-4 shadow-sm sm:p-6">
            <h2 className="font-display text-lg font-bold text-brand-charcoal">Team details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-brand-slate">
                Club / team name
                <input
                  className={`${inputClass} mt-1`}
                  value={form.clubName}
                  onChange={(e) => setForm((p) => ({ ...p, clubName: e.target.value }))}
                  placeholder="e.g. Lagos Harbour FC"
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Sport
                <select
                  className={`${inputClass} mt-1`}
                  value={form.sport}
                  onChange={(e) => setForm((p) => ({ ...p, sport: e.target.value as Sport }))}
                >
                  <option>Football</option>
                  <option>Basketball</option>
                  <option>Corporate</option>
                </select>
              </label>
              <div className="sm:col-span-2">
                <FileDropzone
                  label="Team crest or logo (optional)"
                  hint="PNG, JPG or WebP · up to 5 MB"
                  accept={["image/png", "image/jpeg", "image/webp"]}
                  maxSizeMb={5}
                  disabled={busy || !isSignedIn}
                  disabledText={!isSignedIn ? "Sign in to add your crest" : undefined}
                  items={crest ? [{ id: "crest", name: crest.name, size: crest.size, type: crest.type, previewUrl: crestPreview ?? undefined }] : []}
                  onAdd={([file]) => {
                    if (!file) return;
                    if (crestPreview) URL.revokeObjectURL(crestPreview);
                    setCrest(file);
                    setCrestPreview(URL.createObjectURL(file));
                  }}
                  onRemove={() => {
                    if (crestPreview) URL.revokeObjectURL(crestPreview);
                    setCrest(null);
                    setCrestPreview(null);
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-brand-slate">
                  Primary colour
                  <input
                    type="color"
                    className="mt-1 h-9 w-full rounded-md border border-brand-border"
                    value={form.primaryColor}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                  />
                </label>
                <label className="block text-xs font-semibold text-brand-slate">
                  Secondary colour
                  <input
                    type="color"
                    className="mt-1 h-9 w-full rounded-md border border-brand-border"
                    value={form.secondaryColor}
                    onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-brand-border bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-brand-charcoal">Player roster</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setRoster((prev) => [
                    ...prev,
                    { name: "", number: String(prev.length + 1), size: "M" },
                  ])
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add player
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {roster.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_4.5rem_5.5rem_2.5rem]"
                >
                  <input
                    className={`${inputClass} col-span-3 sm:col-span-1`}
                    value={row.name}
                    onChange={(e) => setRow(index, { name: e.target.value })}
                    placeholder="Player name"
                  />
                  <input
                    className={inputClass}
                    value={row.number}
                    onChange={(e) => setRow(index, { number: e.target.value })}
                    placeholder="#"
                  />
                  <select
                    className={inputClass}
                    value={row.size}
                    onChange={(e) =>
                      setRow(index, { size: e.target.value as KitRosterRow["size"] })
                    }
                  >
                    {SIZES.map((size) => (
                      <option key={size}>{size}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Remove row ${index + 1}`}
                    className="rounded-md border border-brand-border text-brand-slate hover:border-danger hover:text-danger"
                    onClick={() => setRoster((prev) => prev.filter((_r, i) => i !== index))}
                  >
                    <Trash2 className="mx-auto h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-brand-border bg-white p-4 shadow-sm sm:p-6">
            <h2 className="font-display text-lg font-bold text-brand-charcoal">
              Order specifications
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-brand-slate">
                Quantity
                <input
                  type="number"
                  min={1}
                  className={`${inputClass} mt-1`}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: Number(e.target.value || 0) }))
                  }
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Expected delivery date
                <input
                  type="date"
                  className={`${inputClass} mt-1`}
                  value={form.deliveryDate}
                  onChange={(e) => setForm((p) => ({ ...p, deliveryDate: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate sm:col-span-2">
                Delivery address / city
                <input
                  className={`${inputClass} mt-1`}
                  value={form.deliveryAddress}
                  onChange={(e) => setForm((p) => ({ ...p, deliveryAddress: e.target.value }))}
                  placeholder="e.g. 14 Adeola Odeku Street, Victoria Island, Lagos"
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate sm:col-span-2">
                Special notes
                <textarea
                  rows={3}
                  className={`${inputClass} mt-1`}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="h-fit border-t border-brand-border py-6 lg:sticky lg:top-24">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-charcoal"><Shirt className="h-4 w-4 text-brand-gold" /> Request a quote</h2>
          <p className="mt-3 text-sm text-brand-slate">{form.quantity} kits · {form.sport}</p>
          <p className="mt-3 text-sm leading-relaxed text-brand-slate">No payment now. We will send a price in dollars after checking your team details.</p>
          {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
          {submitted ? <p className="mt-4 text-sm font-semibold text-brand-charcoal">Request received.</p> : isSignedIn ? <Button onClick={() => void submit()} disabled={busy} className="mt-5 w-full">{busy ? "Saving request…" : "Send kit request"}</Button> : <Button asChild className="mt-5 w-full"><Link to="/signin" search={{ next: "/shop/team-kits" }}>Sign in to send request</Link></Button>}
        </aside>
      </div>
      {user && <div className="fmie-container pb-12"><KitRequestList /></div>}
    </div>
  );
}

export default TeamKitsPage;
