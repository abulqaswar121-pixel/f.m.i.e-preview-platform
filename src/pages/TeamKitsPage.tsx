import { useMemo, useState } from "react";
import { Plus, Shirt, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { teamKitUnitNaira } from "@/config/site";
import { api } from "@/services/api";
import type { KitRosterRow } from "@/types";

const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
type Sport = "Football" | "Basketball" | "Corporate";
const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-gold focus:outline-none";

function naira(value: number): string {
  return `₦${value.toLocaleString("en-NG")}`;
}

/** Custom football & corporate kit builder with live quote summary. */
export function TeamKitsPage() {
  const [form, setForm] = useState({
    clubName: "",
    sport: "Football" as Sport,
    crestFileName: "",
    primaryColor: "#0A2E68",
    secondaryColor: "#C5A869",
    quantity: 18,
    deliveryDate: "",
    deliveryAddress: "",
    notes: "",
  });
  const [roster, setRoster] = useState<KitRosterRow[]>([{ name: "", number: "1", size: "M" }]);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const quote = useMemo(() => {
    const base = form.quantity * teamKitUnitNaira;
    const crestFee = form.crestFileName ? 15000 : 0;
    return { base, crestFee, total: base + crestFee };
  }, [form.quantity, form.crestFileName]);

  function setRow(index: number, patch: Partial<KitRosterRow>): void {
    setRoster((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function submit(): Promise<void> {
    const request = await api.kits.submit({
      clubName: form.clubName || "Unnamed club",
      sport: form.sport,
      ...(form.crestFileName ? { crestFileName: form.crestFileName } : {}),
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      roster: roster.filter((row) => row.name.trim().length > 0),
      quantity: form.quantity,
      deliveryDate: form.deliveryDate,
      deliveryAddress: form.deliveryAddress,
      notes: form.notes,
    });
    setSubmitted(request.id);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Team kits"
        title="Custom football & corporate kit builder"
        description="For clubs, academies and corporate teams ordering seasonal custom kits. Build your roster, pick your colours and submit the request — the F.M.I.E kit desk replies with an official invoice quote."
        breadcrumb={[
          { label: "Home", to: "/" },
          { label: "Shop", to: "/shop" },
          { label: "Team kits" },
        ]}
      />

      <div className="fmie-container grid gap-8 py-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {submitted ? (
            <p className="rounded-lg border border-brand-gold/60 bg-brand-gold/10 px-4 py-3 text-sm text-brand-charcoal">
              Kit request <span className="font-semibold">{submitted}</span> received — the kit desk
              will reply with an official invoice quote (see Super Admin → Kit quotes).
            </p>
          ) : null}

          <section className="rounded-lg border border-brand-border bg-white p-6 shadow-sm">
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
              <label className="block text-xs font-semibold text-brand-slate">
                Club crest (file name)
                <input
                  className={`${inputClass} mt-1`}
                  value={form.crestFileName}
                  onChange={(e) => setForm((p) => ({ ...p, crestFileName: e.target.value }))}
                  placeholder="crest.png"
                />
              </label>
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

          <section className="rounded-lg border border-brand-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
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
                <div key={index} className="grid grid-cols-[1fr_70px_90px_36px] gap-2">
                  <input
                    className={inputClass}
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
                  <button
                    type="button"
                    aria-label={`Remove row ${index + 1}`}
                    className="rounded-md border border-brand-border text-brand-slate hover:border-danger hover:text-danger"
                    onClick={() => setRoster((prev) => prev.filter((_r, i) => i !== index))}
                  >
                    <Trash2 className="mx-auto h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-brand-border bg-white p-6 shadow-sm">
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

        <aside className="h-fit rounded-lg border border-brand-border bg-brand-navy p-6 text-white shadow-sm lg:sticky lg:top-24">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Shirt className="h-4 w-4 text-brand-gold" /> Instant quote summary
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/70">
                Kits ({form.quantity} × {naira(teamKitUnitNaira)})
              </dt>
              <dd>{naira(quote.base)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/70">Crest digitising</dt>
              <dd>{quote.crestFee ? naira(quote.crestFee) : "included"}</dd>
            </div>
            <div className="flex justify-between border-t border-white/20 pt-2 font-display text-base font-bold text-brand-gold">
              <dt>Estimated total</dt>
              <dd>{naira(quote.total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-white/70">
            Estimate only — the kit desk confirms fabric, sizing splits and delivery before issuing
            the official invoice.
          </p>
          <Button
            onClick={() => void submit()}
            className="mt-5 w-full bg-brand-gold text-brand-navy-dark hover:bg-[#d4b87e]"
          >
            Submit Kit Request for Official Invoice
          </Button>
        </aside>
      </div>
    </div>
  );
}

export default TeamKitsPage;
