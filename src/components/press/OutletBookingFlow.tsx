import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, PenLine, Sparkles } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { contactEmail } from "@/config/site";
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

const ANNOUNCEMENTS = [
  { id: "launch", label: "Product or service launch", noun: "launch" },
  { id: "partnership", label: "Partnership or collaboration", noun: "strategic partnership" },
  { id: "milestone", label: "Funding or business milestone", noun: "major milestone" },
  { id: "expansion", label: "Expansion into new markets", noun: "market expansion" },
  { id: "appointment", label: "Executive appointment", noun: "executive appointment" },
  { id: "report", label: "Research or report publication", noun: "research publication" },
] as const;

function formatNaira(value: number): string {
  return `₦${value.toLocaleString("en-NG")}`;
}
function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface Brief {
  companyName: string;
  industry: string;
  country: string;
  announcementType: string;
  keyPoints: string;
  quote: string;
  quoteAttribution: string;
}

/**
 * Simulated AI drafting assistant: turns the client's brief into a full
 * professional release (dateline, lead, detail, quote, boilerplate, media
 * contact) which the client then edits freely. Clearly labelled as a demo.
 */
function aiDraft(
  brief: Brief,
  contactName: string,
  contactMail: string,
): {
  headline: string;
  subhead: string;
  body: string;
} {
  const company = brief.companyName.trim() || "The company";
  const industry = brief.industry.trim() || "its sector";
  const ann =
    ANNOUNCEMENTS.find((entry) => entry.id === brief.announcementType) ?? ANNOUNCEMENTS[0];
  const points = brief.keyPoints
    .split(/\n|;/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const topic = points[0] ?? `a ${ann.noun}`;
  const seed = hash(company + topic);
  const significance = [
    "a decisive step in its growth strategy",
    "the culmination of eighteen months of internal development",
    "its most significant announcement of the year",
    "a response to sustained demand from institutional clients",
  ][seed % 4];
  const benefit = [
    "with availability confirmed for the coming quarter",
    "backed by a dedicated delivery and support team",
    "alongside a published implementation timeline",
    "with independent audit coverage planned",
  ][seed % 4];
  const dateLong = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const city = brief.country.trim() === "Nigeria" ? "Lagos" : "London";

  const headline = `${company} Announces ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
  const subhead = `${company} confirms ${topic}${points[1] ? `, alongside ${points[1]}` : ""} — ${benefit}.`;
  const detail = points.length
    ? `The announcement covers: ${points.join("; ")}.`
    : `The announcement sets out the scope, timeline and accountability structure for the ${ann.noun}.`;
  const quote =
    brief.quote.trim() ||
    `This ${ann.noun} reflects what our clients have asked us for: clarity, speed and accountability. We are publishing our commitments so they can be measured.`;
  const attribution = brief.quoteAttribution.trim() || `Spokesperson, ${company}`;

  const body = [
    `${city.toUpperCase()}, ${brief.country || "United Kingdom"} — ${dateLong}. ${company}, an organisation operating in ${industry}, today announced ${topic}, marking ${significance}.`,
    detail,
    `“${quote}” — ${attribution}.`,
    `About ${company}: ${company} operates in ${industry}, serving clients across the United Kingdom, Nigeria and wider international markets.`,
    `Media contact: ${contactName || "Press Office"}, ${contactMail}.`,
  ].join("\n\n");

  return { headline, subhead, body };
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
      .replace(/(^|[—.!?]\s+)([a-z])/g, (_m, p1, p2) => p1 + (p2.toUpperCase() as string));
  const head = tidy(headline).replace(/\.$/, "");
  return {
    headline: head ? head.charAt(0).toUpperCase() + head.slice(1) : head,
    subhead: tidy(subhead),
    body: tidy(body),
  };
}

const inputClass = "mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm";

/**
 * Content-first press booking (client instruction, 2026-10-20): the client
 * writes their proposed article with AI drafting help FIRST, then selects
 * outlets, then pays — payment is prompted before submission, never before
 * writing. Publication is never guaranteed — editors decide.
 */
export function OutletBookingFlow() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<DistributionChannel[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [paying, setPaying] = useState(false);
  const [drafting, setDrafting] = useState(false);
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
    announcementType: "launch",
    keyPoints: "",
    quote: "",
    quoteAttribution: "",
    editorialAccepted: false,
  });

  useEffect(() => {
    let alive = true;
    void api.pressReleases.channels().then((list) => {
      if (!alive) return;
      setChannels(list.filter((channel) => channel.status === "verified"));
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

  function draftWithAi(): void {
    setDrafting(true);
    setNotice(null);
    setTimeout(() => {
      const draft = aiDraft(form, form.contactName, form.contactEmail || contactEmail.press);
      setForm((prev) => ({
        ...prev,
        headline: prev.headline.trim() ? prev.headline : draft.headline,
        subhead: prev.subhead.trim() ? prev.subhead : draft.subhead,
        body: prev.body.trim() ? `${prev.body}\n\n${draft.body}` : draft.body,
      }));
      setDrafting(false);
      setNotice(
        "AI Drafting Assistant (simulated): a full release draft was written from your brief — edit every line before continuing.",
      );
    }, 900);
  }

  async function pay(): Promise<void> {
    setPaying(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setPaying(false);
    setStep(4);
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
      <div className="fmie-card p-8 text-center">
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
        {(["Write with AI help", "Select outlets", "Payment", "Review & submit"] as const).map(
          (label, index) => (
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
          ),
        )}
      </ol>

      {step === 1 ? (
        <div className="space-y-4">
          <div className="fmie-card space-y-4 p-6">
            <div className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-brand-gold-dark" />
              <h3 className="font-display text-xl font-bold text-brand-charcoal">
                Write your release first — pay later
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-brand-slate">
              Tell the assistant what you want to announce and it drafts a full professional release
              for you to edit. Nothing is paid or submitted at this stage — the checkout only
              appears once your story is written and your outlets are chosen.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-brand-slate">
                Company / organisation
                <input
                  className={inputClass}
                  value={form.companyName}
                  onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                  placeholder="Ashaka Citrus Ltd"
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Industry
                <input
                  className={inputClass}
                  value={form.industry}
                  onChange={(e) => setForm((p) => ({ ...p, industry: e.target.value }))}
                  placeholder="Agro-processing"
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Announcement type
                <select
                  className={inputClass}
                  value={form.announcementType}
                  onChange={(e) => setForm((p) => ({ ...p, announcementType: e.target.value }))}
                >
                  {ANNOUNCEMENTS.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Country
                <input
                  className={inputClass}
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                />
              </label>
            </div>
            <label className="block text-xs font-semibold text-brand-slate">
              Key points (one per line — what must the story say?)
              <textarea
                rows={4}
                className={inputClass}
                value={form.keyPoints}
                onChange={(e) => setForm((p) => ({ ...p, keyPoints: e.target.value }))}
                placeholder={
                  "New processing line commissioned in Gombe\n400 direct jobs created\nExport contract signed with two EU distributors"
                }
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <label className="block text-xs font-semibold text-brand-slate">
                Quote (optional — the assistant writes one if left blank)
                <input
                  className={inputClass}
                  value={form.quote}
                  onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Quote attribution
                <input
                  className={inputClass}
                  value={form.quoteAttribution}
                  onChange={(e) => setForm((p) => ({ ...p, quoteAttribution: e.target.value }))}
                  placeholder="MD / CEO"
                />
              </label>
            </div>
            <Button
              onClick={draftWithAi}
              disabled={drafting}
              className="bg-brand-gold text-brand-navy-dark hover:bg-[#d4b87e]"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {drafting ? "Drafting your release…" : "Draft my release with AI help"}
            </Button>
          </div>

          <div className="fmie-card space-y-4 p-6">
            <h3 className="font-display text-lg font-bold text-brand-charcoal">
              Your article (fully editable)
            </h3>
            <label className="block text-xs font-semibold text-brand-slate">
              Headline
              <input
                className={inputClass}
                value={form.headline}
                onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))}
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Subhead
              <input
                className={inputClass}
                value={form.subhead}
                onChange={(e) => setForm((p) => ({ ...p, subhead: e.target.value }))}
              />
            </label>
            <label className="block text-xs font-semibold text-brand-slate">
              Press release body
              <textarea
                rows={12}
                className={inputClass}
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
                  setNotice(
                    "AI Polish Assistant (simulated): tone and clarity refinements applied.",
                  );
                }, 700);
              }}
            >
              <Sparkles className="mr-2 h-4 w-4 text-brand-gold-dark" />
              {polishing ? "Polishing…" : "AI Polish Assistant"}
            </Button>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-brand-slate">
                Contact name
                <input
                  className={inputClass}
                  value={form.contactName}
                  onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Contact email
                <input
                  type="email"
                  className={inputClass}
                  value={form.contactEmail}
                  onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Contact phone
                <input
                  className={inputClass}
                  value={form.contactPhone}
                  onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Website
                <input
                  className={inputClass}
                  value={form.websiteUrl}
                  onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-brand-slate">
                Press images (filenames, comma separated)
                <input
                  className={inputClass}
                  value={form.images}
                  onChange={(e) => setForm((p) => ({ ...p, images: e.target.value }))}
                  placeholder="logo.png, team.jpg"
                />
              </label>
            </div>
            {notice ? <p className="text-xs text-brand-slate">{notice}</p> : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] text-brand-slate">
                {form.body.trim().length} characters drafted · no payment taken on this step
              </p>
              <Button
                disabled={!form.headline.trim() || form.body.trim().length < 80}
                onClick={() => {
                  setNotice(null);
                  setStep(2);
                }}
                className="bg-brand-navy text-white hover:bg-brand-navy-dark"
              >
                Continue to outlets
              </Button>
            </div>
            {!form.headline.trim() || form.body.trim().length < 80 ? (
              <p className="text-[11px] text-brand-slate">
                A headline and at least a short body (80+ characters) are needed before outlets —
                use the AI draft button if you'd rather start from a full draft.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
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
                            : "fmie-card p-4 text-left hover:border-brand-gold"
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
          <div className="fmie-card sticky bottom-4 p-4">
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
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back to article
                </Button>
                <Button
                  disabled={chosen.length === 0}
                  onClick={() => setStep(3)}
                  className="bg-brand-navy text-white hover:bg-brand-navy-dark"
                >
                  Continue to payment
                </Button>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-brand-slate">
              Listed publications are independent third parties reached through partner distribution
              desks. Placement is always at the editor's discretion — no outlet guarantees
              publication.
            </p>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="fmie-card p-6">
          <h3 className="font-display text-xl font-bold text-brand-charcoal">
            Checkout (simulated) — payment before submission
          </h3>
          <p className="mt-1 text-xs text-brand-slate">
            Your article is saved with this booking. Distribution fees are settled now; the story
            goes to the press desk on the next step.
          </p>
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
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              onClick={() => void pay()}
              disabled={paying}
              className="bg-brand-gold text-brand-navy-dark hover:bg-[#d4b87e]"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {paying ? "Processing…" : "Pay now (Paystack simulated)"}
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-brand-slate">
            No real payment is taken in this demonstration preview.
          </p>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4 fmie-card p-6">
          <h3 className="font-display text-xl font-bold text-brand-charcoal">
            Review & submit to the press desk
          </h3>
          <div className="rounded-lg border border-brand-border bg-brand-cream p-4">
            <p className="font-display text-lg font-bold text-brand-charcoal">{form.headline}</p>
            {form.subhead ? <p className="mt-1 text-sm text-brand-slate">{form.subhead}</p> : null}
            <p className="mt-3 max-h-56 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-brand-charcoal">
              {form.body}
            </p>
          </div>
          <p className="text-xs text-brand-slate">
            <Badge tone="gold">Paid</Badge> Checkout for {chosen.length} outlet
            {chosen.length === 1 ? "" : "s"} ({totalNaira > 0 ? formatNaira(totalNaira) : ""}
            {totalNaira > 0 && totalUsd > 0 ? " + " : ""}
            {totalUsd > 0 ? formatUsd(totalUsd) : ""}) is attached to this booking.
          </p>
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
            <Button variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button
              onClick={() => void submit()}
              className="bg-brand-navy text-white hover:bg-brand-navy-dark"
            >
              Submit to press desk
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default OutletBookingFlow;
