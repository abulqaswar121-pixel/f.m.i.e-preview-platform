import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Sparkles } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import type { DistributionChannel, DistributionChannelGroup } from "@/types";

const GROUPS: { id: DistributionChannelGroup; label: string }[] = [
  { id: "nigerian-national", label: "Nigerian National Newspapers" },
  { id: "premium-nigerian", label: "Premium Nigerian Publications" },
  { id: "international", label: "International & Business Media" },
];

const EDITORIAL_NOTICE =
  "Editorial Notice: Editors and partner publications reserve the right to edit content to suit professional journalistic standards and legal compliance.";

function formatNaira(value: number): string {
  return `₦${value.toLocaleString("en-NG")}`;
}
function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

/** Simulated tone-and-clarity refinement — clearly labelled as a demo assistant. */
function aiPolish(
  headline: string,
  subhead: string,
  body: string,
): { headline: string; subhead: string; body: string } {
  const tidy = (text: string): string =>
    text
      .replace(/\s+/g, " ")
      .trim()
      .replace(/(^|[\u2014.!?]\s+)([a-z])/g, (_m, p1, p2) => p1 + (p2.toUpperCase() as string));
  let head = tidy(headline).replace(/\.$/, "");
  if (head && !/\d/.test(head)) head = head.charAt(0).toUpperCase() + head.slice(1);
  return {
    headline: head,
    subhead: tidy(subhead),
    body: tidy(body),
  };
}

/**
 * Pay-first press distribution booking: choose partner outlets (live ₦/$ total),
 * settle a simulated checkout, then submit the story with the mandatory
 * editorial notice. Publication is never guaranteed — editors decide.
 */
export function OutletBookingFlow() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<DistributionChannel[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [form, setForm] = useState({
    headline: "",
    subhead: "",
    body: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    companyName: "",
    industry: "",
    country: "United Kingdom",
    websiteUrl: "",
    targetDate: "",
    images: "",
    editorialAccepted: false,
  });

  useEffect(() => {
    let alive = true;
    void api.pressReleases.channels().then((list) => {
      if (alive) setChannels(list.filter((channel) => channel.status === "verified"));
    });
    return () => {
      alive = false;
    };
  }, []);

  const chosen = useMemo(
    () => channels.filter((channel) => selected.includes(channel.id)),
    [channels, selected],
  );
  const totalNaira = chosen.reduce((sum, channel) => sum + (channel.priceNaira ?? 0), 0);
  const totalUsd = chosen.reduce((sum, channel) => sum + (channel.priceUsd ?? 0), 0);

  function toggle(id: string): void {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function pay(): Promise<void> {
    setPaying(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setPaying(false);
    setPaid(true);
    setStep(3);
  }

  async function submit(): Promise<void> {
    if (!form.editorialAccepted) {
      setNotice("Please acknowledge the editorial notice before submitting.");
      return;
    }
    const group: DistributionChannelGroup = chosen.some((c) => c.group === "international")
      ? "international"
      : chosen.some((c) => c.group === "premium-nigerian")
        ? "premium-nigerian"
        : "nigerian-national";
    const booking = await api.pressReleases.create({
      title: form.headline,
      companyName: form.companyName || "Independent client",
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      country: form.country,
      industry: form.industry || "General",
      websiteUrl: form.websiteUrl,
      tier:
        group === "international"
          ? "tier_1_premium"
          : group === "premium-nigerian"
            ? "tier_2_business"
            : "tier_3_emerging",
      targetAudience: `Partner desks: ${chosen.map((c) => c.label).join(", ")}`,
      distributionRegions: [...new Set(chosen.map((c) => c.region))],
      targetDate:
        form.targetDate || new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
      contentDraft: `${form.subhead}\n\n${form.body}`,
      mediaAttachments: form.images ? form.images.split(",").map((entry) => entry.trim()) : [],
      addOnIds: [],
      disclosureAcknowledged: true,
      consentToProcessing: true,
      userId: user?.id,
    });
    await api.pressReleases.markPaid(booking.id);
    setReference(booking.referenceNumber);
  }

  if (reference) {
    return (
      <div className="rounded-lg border border-brand-border bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand-gold-dark" />
        <h2 className="mt-4 font-display text-2xl font-bold text-brand-charcoal">
          Booking received
        </h2>
        <p className="mt-2 text-sm text-brand-slate">
          Reference <span className="font-semibold text-brand-navy">{reference}</span> — paid and
          queued with the press desk. Track progress through the six-stage pipeline any time.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-dark">
            <a href="/press-releases/tracker">Open order tracker</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ol className="flex flex-wrap gap-2 text-xs font-semibold">
        {(["Select outlets", "Payment", "Story submission"] as const).map((label, index) => (
          <li
            key={label}
            className={
              step === index + 1
                ? "rounded-full bg-brand-navy px-4 py-1.5 text-white"
                : "rounded-full border border-brand-border bg-white px-4 py-1.5 text-brand-slate"
            }
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <div className="space-y-8">
          {GROUPS.map((group) => (
            <section key={group.id}>
              <h3 className="font-display text-lg font-bold text-brand-charcoal">{group.label}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {channels
                  .filter((channel) => channel.group === group.id)
                  .map((channel) => {
                    const active = selected.includes(channel.id);
                    return (
                      <button
                        key={channel.id}
                        type="button"
                        onClick={() => toggle(channel.id)}
                        className={
                          active
                            ? "rounded-lg border-2 border-brand-gold bg-brand-gold/10 p-4 text-left"
                            : "rounded-lg border border-brand-border bg-white p-4 text-left hover:border-brand-gold"
                        }
                        aria-pressed={active}
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-brand-navy font-display text-sm font-bold text-brand-gold">
                            {channel.label
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-brand-charcoal">
                              {channel.label}
                            </span>
                            <span className="block text-xs text-brand-slate">
                              {channel.priceNaira != null ? formatNaira(channel.priceNaira) : ""}
                              {channel.priceNaira != null && channel.priceUsd != null ? " · " : ""}
                              {channel.priceUsd != null ? formatUsd(channel.priceUsd) : ""}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
          <div className="sticky bottom-4 rounded-lg border border-brand-border bg-white p-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-brand-slate">
                <span className="font-semibold text-brand-charcoal">{chosen.length}</span> outlet
                {chosen.length === 1 ? "" : "s"} selected · Total{" "}
                <span className="font-semibold text-brand-navy">
                  {totalNaira > 0 ? formatNaira(totalNaira) : ""}
                  {totalNaira > 0 && totalUsd > 0 ? " + " : ""}
                  {totalUsd > 0 ? formatUsd(totalUsd) : ""}
                  {totalNaira === 0 && totalUsd === 0 ? "₦0" : ""}
                </span>
              </p>
              <Button
                disabled={chosen.length === 0}
                onClick={() => setStep(2)}
                className="bg-brand-navy text-white hover:bg-brand-navy-dark"
              >
                Continue to payment
              </Button>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-brand-slate">
              Listed publications are independent third parties reached through partner distribution
              desks. Placement is always at the editor's discretion — no outlet guarantees
              publication.
            </p>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="rounded-lg border border-brand-border bg-white p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-brand-charcoal">
            Checkout (simulated)
          </h3>
          <ul className="mt-4 divide-y divide-brand-border text-sm">
            {chosen.map((channel) => (
              <li key={channel.id} className="flex justify-between py-2">
                <span className="text-brand-charcoal">{channel.label}</span>
                <span className="text-brand-slate">
                  {channel.priceNaira != null
                    ? formatNaira(channel.priceNaira)
                    : formatUsd(channel.priceUsd ?? 0)}
                </span>
              </li>
            ))}
            <li className="flex justify-between py-2 font-semibold text-brand-navy">
              <span>Total due</span>
              <span>
                {totalNaira > 0 ? formatNaira(totalNaira) : ""}
                {totalNaira > 0 && totalUsd > 0 ? " + " : ""}
                {totalUsd > 0 ? formatUsd(totalUsd) : ""}
              </span>
            </li>
          </ul>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => void pay()}
              disabled={paying}
              className="bg-brand-gold text-brand-navy-dark hover:bg-[#d4b87e]"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {paying ? "Processing…" : paid ? "Paid — continue" : "Pay now (Paystack simulated)"}
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-brand-slate">
            No real payment is taken in this demonstration preview.
          </p>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4 rounded-lg border border-brand-border bg-white p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-brand-charcoal">Story submission</h3>
          <label className="block text-xs font-semibold text-brand-slate">
            Headline
            <input
              className="mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm"
              value={form.headline}
              onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))}
            />
          </label>
          <label className="block text-xs font-semibold text-brand-slate">
            Subhead
            <input
              className="mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm"
              value={form.subhead}
              onChange={(e) => setForm((p) => ({ ...p, subhead: e.target.value }))}
            />
          </label>
          <label className="block text-xs font-semibold text-brand-slate">
            Press release body
            <textarea
              rows={8}
              className="mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm"
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            />
          </label>
          <Button
            variant="outline"
            disabled={polishing}
            onClick={() => {
              setPolishing(true);
              setTimeout(() => {
                setForm((p) => ({ ...p, ...aiPolish(p.headline, p.subhead, p.body) }));
                setPolishing(false);
                setNotice("AI Polish Assistant (simulated): tone and clarity refinements applied.");
              }, 700);
            }}
          >
            <Sparkles className="mr-2 h-4 w-4 text-brand-gold-dark" />
            {polishing ? "Polishing…" : "AI Polish Assistant"}
          </Button>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-brand-slate">
              Company
              <input
                className="mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm"
                value={form.companyName}
                onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Contact name
              <input
                className="mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm"
                value={form.contactName}
                onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Contact email
              <input
                type="email"
                className="mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm"
                value={form.contactEmail}
                onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Contact phone
              <input
                className="mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm"
                value={form.contactPhone}
                onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Press images (filenames, comma separated)
              <input
                className="mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm"
                value={form.images}
                onChange={(e) => setForm((p) => ({ ...p, images: e.target.value }))}
                placeholder="logo.png, team.jpg"
              />
            </label>
          </div>
          <label className="flex items-start gap-3 rounded-md border border-brand-gold/60 bg-brand-gold/10 p-4 text-xs leading-relaxed text-brand-charcoal">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={form.editorialAccepted}
              onChange={(e) => setForm((p) => ({ ...p, editorialAccepted: e.target.checked }))}
            />
            <span>{EDITORIAL_NOTICE}</span>
          </label>
          {notice ? <p className="text-xs text-brand-slate">{notice}</p> : null}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              onClick={() => void submit()}
              className="bg-brand-navy text-white hover:bg-brand-navy-dark"
            >
              Submit to press desk
            </Button>
          </div>
          <p className="text-[11px] text-brand-slate">
            <Badge tone="cream">Paid</Badge> Your checkout for {chosen.length} outlet
            {chosen.length === 1 ? "" : "s"} is attached to this booking.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default OutletBookingFlow;
