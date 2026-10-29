import { formatUsd, NGN_PER_USD, outletPriceUsd } from "@/lib/outlet-pricing";
import { OutletLogo } from "@/components/press/OutletLogo";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, CreditCard, Loader2, PenLine, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileDropzone, type DropzoneItem } from "@/components/common/FileDropzone";
import { supabase } from "@/integrations/supabase/client";
import { paymentReferenceFromSearch, isPaymentReturn } from "@/lib/payment-return";
import { writePressRelease } from "@/lib/press-writer.functions";
import { useAuth } from "@/hooks/useAuth";
import { confirmPressBooking, startPressBooking } from "@/lib/press-bookings.functions";
import { api } from "@/services/api";
import type { DistributionChannel, DistributionChannelGroup } from "@/types";

const DRAFT_KEY = "fmie-press-draft";

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


const inputClass = "mt-1 w-full rounded-md border border-brand-border px-3 py-2 text-sm";

/**
 * Press booking order (client instructions, 20 and 26 Oct): choose outlets and
 * see the price first, then write the article with AI help, then check & pay.
 * Payment is always the last step, never before writing. Publication is never
 * guaranteed — editors decide.
 */
export function OutletBookingFlow() {
  const { user, isSignedIn } = useAuth();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const returnReference = isPaymentReturn(search) ? paymentReferenceFromSearch(search) : undefined;
  const writePress = useServerFn(writePressRelease);
  const [media, setMedia] = useState<{ item: DropzoneItem; file: File }[]>([]);
  const [aiUsed, setAiUsed] = useState<"drafted" | "polished" | null>(null);
  const startBooking = useServerFn(startPressBooking);
  const confirmBooking = useServerFn(confirmPressBooking);
  const [channels, setChannels] = useState<DistributionChannel[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paying, setPaying] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const confirmedReference = useRef<string | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);
  const firstStepRender = useRef(true);
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

  // Keep the written release in this browser, so signing in or a page reload never loses it.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { form?: Partial<typeof form>; selected?: unknown };
        if (parsed.form) setForm((prev) => ({ ...prev, ...parsed.form }));
        if (Array.isArray(parsed.selected)) setSelected(parsed.selected.filter((id): id is string => typeof id === "string"));
      }
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!draftLoaded || reference) return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, selected }));
  }, [draftLoaded, form, selected, reference]);

  // Coming back from Paystack: check the payment, then show the reference.
  useEffect(() => {
    if (!returnReference || !user) return;
    if (confirmedReference.current === returnReference) return;
    confirmedReference.current = returnReference;
    setChecking(true);
    void confirmBooking({ data: { reference: returnReference } })
      .then((result) => {
        if (result.status === "succeeded") {
          window.localStorage.removeItem(DRAFT_KEY);
          window.history.replaceState(null, "", window.location.pathname);
          setReference(result.referenceNumber);
        } else {
          setStep(3);
          setNotice(
            `We are still waiting for the payment to be confirmed (booking ${result.referenceNumber}). It will show in My requests once confirmed. Please don't pay twice.`,
          );
        }
      })
      .catch((error: unknown) => {
        setStep(3);
        setNotice(error instanceof Error ? error.message : "We could not check your payment yet.");
      })
      .finally(() => setChecking(false));
  }, [confirmBooking, returnReference, user]);

  // Moving between steps starts the new step from its top, not mid-page.
  useEffect(() => {
    if (firstStepRender.current) {
      firstStepRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const chosen = useMemo(
    () => channels.filter((channel) => selected.includes(channel.id)),
    [channels, selected],
  );
  const totalUsd = Math.round(chosen.reduce((sum, channel) => sum + outletPriceUsd(channel), 0) * 100) / 100;

  function toggle(id: string): void {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function runWriter(mode: "draft" | "polish"): Promise<void> {
    if (!isSignedIn) {
      setNotice("Please sign in to use the AI writer. Your text stays saved on this device.");
      return;
    }
    if (mode === "draft") setDrafting(true);
    else setPolishing(true);
    setNotice(null);
    try {
      const result =
        mode === "draft"
          ? await writePress({
              data: {
                mode: "draft",
                companyName: form.companyName,
                industry: form.industry,
                country: form.country,
                announcementType:
                  ANNOUNCEMENTS.find((entry) => entry.id === form.announcementType)?.label ?? form.announcementType,
                keyPoints: form.keyPoints,
                quote: form.quote,
                quoteAttribution: form.quoteAttribution,
                contactName: form.contactName,
                contactEmail: form.contactEmail,
              },
            })
          : await writePress({
              data: { mode: "polish", headline: form.headline, subhead: form.subhead, body: form.body },
            });
      setForm((prev) => ({ ...prev, ...result }));
      setAiUsed(mode === "draft" ? "drafted" : "polished");
      setNotice(
        mode === "draft"
          ? "Done — the AI wrote a new draft below. Read it and change anything you like."
          : "Done — your article was polished. You can polish again for another version.",
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The AI writer could not finish. Please try again.");
    } finally {
      setDrafting(false);
      setPolishing(false);
    }
  }

  function addMedia(files: File[]): void {
    setMedia((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        item: {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          previewUrl: URL.createObjectURL(file),
        },
      })),
    ]);
  }

  function removeMedia(id: string): void {
    setMedia((prev) => {
      const gone = prev.find((entry) => entry.item.id === id);
      if (gone?.item.previewUrl) URL.revokeObjectURL(gone.item.previewUrl);
      return prev.filter((entry) => entry.item.id !== id);
    });
  }

  async function pay(): Promise<void> {
    if (!form.editorialAccepted) {
      setNotice("Please tick the editorial notice box before paying.");
      return;
    }
    setPaying(true);
    setNotice(null);
    const uploaded: string[] = [];
    try {
      if (media.length && user) {
        setMedia((prev) => prev.map((entry) => ({ ...entry, item: { ...entry.item, status: "uploading" } })));
        for (const entry of media) {
          const path = `${user.id}/press/${crypto.randomUUID()}-${entry.file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80)}`;
          const { error: uploadError } = await supabase.storage.from("member-files").upload(path, entry.file);
          if (uploadError) throw new Error(`"${entry.file.name}" could not be uploaded. Please try again.`);
          uploaded.push(path);
        }
        setMedia((prev) => prev.map((entry) => ({ ...entry, item: { ...entry.item, status: "done" } })));
      }
      const result = await startBooking({
        data: {
          outletIds: chosen.map((channel) => channel.id),
          headline: form.headline,
          subhead: form.subhead,
          body: form.body,
          companyName: form.companyName,
          industry: form.industry,
          country: form.country,
          contactName: form.contactName,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          websiteUrl: form.websiteUrl,
          targetDate: form.targetDate,
          images: uploaded,
          editorialAccepted: true,
        },
      });
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      if (uploaded.length) await supabase.storage.from("member-files").remove(uploaded);
      setMedia((prev) => prev.map((entry) => ({ ...entry, item: { ...entry.item, status: undefined } })));
      setNotice(error instanceof Error ? error.message : "The payment could not be started. Please try again.");
      setPaying(false);
    }
  }

  if (checking) {
    return (
      <div className="fmie-card flex items-center justify-center gap-2 p-8 text-sm text-brand-slate">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking your payment…
      </div>
    );
  }

  if (reference) {
    return (
      <div className="fmie-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand-gold-dark" />
        <h2 className="mt-4 font-display text-2xl font-bold text-brand-charcoal">
          Paid and sent to the press desk
        </h2>
        <p className="mt-2 text-sm text-brand-slate">
          Your booking number is <span className="font-semibold text-brand-navy">{reference}</span>.
          Our team will review your release and keep you updated in My requests.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-dark">
            <a href="/press-releases/tracker">Open My requests</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-32 space-y-8">
      <ol className="flex flex-wrap gap-2 text-xs font-semibold">
        {(["Choose outlets", "Write with AI help", "Check & pay"] as const).map(
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

      {step === 2 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-gold/60 bg-brand-gold/10 px-4 py-3 text-xs text-brand-charcoal">
            <span className="min-w-0">
              <span className="font-semibold">{chosen.length}</span> outlet
              {chosen.length === 1 ? "" : "s"} chosen · Total{" "}
              <span className="font-semibold text-brand-navy">{formatUsd(totalUsd)}</span>
            </span>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="font-semibold text-brand-navy underline underline-offset-2"
            >
              Change outlets
            </button>
          </div>
          <div className="fmie-card space-y-4 p-6">
            <div className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-brand-gold-dark" />
              <h3 className="font-display text-xl font-bold text-brand-charcoal">
                Write your release — pay later
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-brand-slate">
              Give the AI a few key points and it writes a full release for you. It never adds facts
              you did not give. Nothing is paid at this step.
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
              onClick={() => void runWriter("draft")}
              disabled={drafting || polishing || form.keyPoints.trim().length < 3}
              className="bg-brand-gold text-brand-navy-dark hover:bg-[#d4b87e]"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {drafting ? "Writing your release…" : form.body.trim() ? "Write a new draft with AI" : "Write my release with AI"}
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
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                disabled={polishing || drafting || form.body.trim().length < 80}
                onClick={() => void runWriter("polish")}
              >
                {polishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-brand-gold-dark" />}
                {polishing ? "Polishing…" : aiUsed === "polished" ? "Polish again" : "Polish my article with AI"}
              </Button>
              {aiUsed ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/15 px-3 py-1 text-[11px] font-semibold text-brand-navy">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {aiUsed === "drafted" ? "Written with AI" : "Polished with AI"}
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-brand-slate">
              Polish keeps your facts and makes the wording clearer. Each tap gives a fresh version.
            </p>
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

            </div>
            <FileDropzone
              label="Photos or short video (optional)"
              hint="JPG, PNG, WebP, MP4 or MOV · up to 50 MB each · up to 6 files. Sent when you pay."
              accept={["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"]}
              maxSizeMb={50}
              maxFiles={6}
              items={media.map((entry) => entry.item)}
              onAdd={addMedia}
              onRemove={removeMedia}
              disabled={paying}
            />
            {notice ? <p className="rounded-md bg-brand-cream px-3 py-2 text-xs text-brand-charcoal">{notice}</p> : null}
            <p className="text-[11px] text-brand-slate">
              {form.body.trim().length} characters written · no payment taken on this step
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back to outlets
              </Button>
              <Button
                disabled={!form.headline.trim() || form.body.trim().length < 80}
                onClick={() => {
                  setNotice(null);
                  setStep(3);
                }}
                className="bg-brand-navy text-white hover:bg-brand-navy-dark"
              >
                Continue to check &amp; pay
              </Button>
            </div>
            {!form.headline.trim() || form.body.trim().length < 80 ? (
              <p className="text-[11px] text-brand-slate">
                Add a headline and a short story (80+ characters) to continue — or let the AI
                write it from your key points.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-8">
          <p className="text-sm leading-relaxed text-brand-slate">
            Tap the media you want your story sent to. Your total shows at the bottom. Next, you
            write your release (with AI help if you like). You only pay at the very end.
          </p>
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
                          <OutletLogo id={channel.id} label={channel.label} />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-brand-charcoal">
                              {channel.label}
                            </span>
                            <span className="block text-xs text-brand-slate">
                              {formatUsd(outletPriceUsd(channel))}
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
                  {formatUsd(totalUsd)}
                </span>
              </p>
              <Button
                disabled={chosen.length === 0}
                onClick={() => {
                  setNotice(null);
                  setStep(2);
                }}
                className="bg-brand-navy text-white hover:bg-brand-navy-dark"
              >
                Continue to write your release
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

      {step === 3 ? (
        <div className="space-y-4 fmie-card p-6">
          <h3 className="font-display text-xl font-bold text-brand-charcoal">
            Check your release, then pay
          </h3>
          <p className="text-xs text-brand-slate">
            Read it one last time. When you pay, your release is saved and sent to our press desk.
          </p>
          <div className="rounded-lg border border-brand-border bg-brand-cream p-4">
            <p className="font-display text-lg font-bold text-brand-charcoal">{form.headline}</p>
            {form.subhead ? <p className="mt-1 text-sm text-brand-slate">{form.subhead}</p> : null}
            <p className="mt-3 max-h-56 overflow-y-auto whitespace-pre-line break-words text-sm leading-relaxed text-brand-charcoal">
              {form.body}
            </p>
          </div>
          <ul className="divide-y divide-brand-border text-sm">
            {chosen.map((channel) => (
              <li key={channel.id} className="flex justify-between gap-3 py-2">
                <span className="min-w-0 text-brand-charcoal">{channel.label}</span>
                <span className="shrink-0 text-brand-slate">{formatUsd(outletPriceUsd(channel))}</span>
              </li>
            ))}
            <li className="flex justify-between py-2 font-semibold text-brand-navy">
              <span>Total to pay</span>
              <span>{formatUsd(totalUsd)}</span>
            </li>
          </ul>
          <p className="text-[11px] text-brand-slate">
            You are charged the same amount in naira: ₦
            {Math.round(totalUsd * NGN_PER_USD).toLocaleString("en-NG")} (₦{NGN_PER_USD.toLocaleString("en-NG")} = $1).
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
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setStep(2)} aria-label="Back to your release">
              Back
            </Button>
            {isSignedIn ? (
              <Button
                onClick={() => void pay()}
                disabled={paying || chosen.length === 0}
                className="bg-brand-gold text-brand-navy-dark hover:bg-[#d4b87e]"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {paying ? (media.length ? "Sending your files…" : "Opening secure payment…") : `Pay ${formatUsd(totalUsd)} securely`}
              </Button>
            ) : (
              <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-dark">
                <a href={`/signin?next=${encodeURIComponent("/press-releases/book")}`}>Sign in to pay</a>
              </Button>
            )}
          </div>
          <p className="text-[11px] text-brand-slate">
            {isSignedIn
              ? "You pay on a secure payment page, then come straight back here."
              : "Your release is kept on this device while you sign in."}{" "}
            Publication is always the editor's choice and is never guaranteed.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default OutletBookingFlow;
