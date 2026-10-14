import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, FileCheck2, Send } from "lucide-react";
import { toast } from "sonner";

import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { InfoNote } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  countries,
  distributionRegions,
  formatCurrency,
  industries,
  prAddOns,
  prTiers,
} from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import type { PRTier, PressReleaseBooking } from "@/types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy/30";

interface BookingDraft {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  industry: string;
  websiteUrl: string;
  title: string;
  contentDraft: string;
  targetAudience: string;
  targetDate: string;
  distributionRegions: string[];
  tier: PRTier;
  addOnIds: string[];
  disclosureAcknowledged: boolean;
  consentToProcessing: boolean;
}

export function PRBookingWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<PressReleaseBooking | null>(null);
  const [draft, setDraft] = useState<BookingDraft>(() => ({
    companyName: user?.organization ?? "",
    contactName: user?.name ?? "",
    contactEmail: user?.email ?? "",
    contactPhone: "",
    country: countries[0] ?? "United Kingdom",
    industry: industries[0] ?? "Professional Services",
    websiteUrl: "",
    title: "",
    contentDraft: "",
    targetAudience: "",
    targetDate: new Date(Date.now() + 21 * 86_400_000).toISOString().slice(0, 10),
    distributionRegions: ["United Kingdom"],
    tier: "tier_2_business",
    addOnIds: [],
    disclosureAcknowledged: false,
    consentToProcessing: false,
  }));

  const patch = (next: Partial<BookingDraft>) => setDraft((current) => ({ ...current, ...next }));

  const tierDefinition = prTiers.find((tier) => tier.id === draft.tier);
  const addOnTotal = prAddOns
    .filter((addOn) => draft.addOnIds.includes(addOn.id))
    .reduce((sum, addOn) => sum + addOn.price, 0);
  const estimate = (tierDefinition?.priceFrom ?? 0) + addOnTotal;

  const toggleRegion = (region: string) => {
    patch({
      distributionRegions: draft.distributionRegions.includes(region)
        ? draft.distributionRegions.filter((entry) => entry !== region)
        : [...draft.distributionRegions, region],
    });
  };

  const validate = (target: number): string[] => {
    const problems: string[] = [];
    if (target >= 1) {
      if (draft.companyName.trim().length < 2)
        problems.push("Company or organisation name is required.");
      if (draft.contactName.trim().length < 2) problems.push("A named contact is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.contactEmail))
        problems.push("A valid contact email is required.");
      if (draft.contactPhone.trim().length < 6)
        problems.push("A contact telephone number is required.");
    }
    if (target >= 2) {
      if (draft.title.trim().length < 10)
        problems.push("Give the release a headline of at least 10 characters.");
      if (draft.contentDraft.trim().length < 120)
        problems.push(
          "Provide a draft or brief of at least 120 characters so the desk can assess it.",
        );
      if (draft.distributionRegions.length === 0)
        problems.push("Select at least one distribution region.");
      if (new Date(draft.targetDate).getTime() < Date.now())
        problems.push("The target date must be in the future.");
    }
    if (target >= 4) {
      if (!draft.disclosureAcknowledged)
        problems.push("You must accept the commercial disclosure terms.");
      if (!draft.consentToProcessing)
        problems.push("You must consent to the processing of the contact details supplied.");
    }
    return problems;
  };

  const goTo = (target: number) => {
    const problems = validate(target);
    setErrors(problems);
    if (problems.length > 0) return;
    setStep(target);
  };

  const submit = async () => {
    const problems = validate(4);
    setErrors(problems);
    if (problems.length > 0) return;
    setSubmitting(true);
    const booking = await api.pressReleases.create({
      title: draft.title.trim(),
      companyName: draft.companyName.trim(),
      contactName: draft.contactName.trim(),
      contactEmail: draft.contactEmail.trim(),
      contactPhone: draft.contactPhone.trim(),
      country: draft.country,
      industry: draft.industry,
      websiteUrl: draft.websiteUrl.trim(),
      tier: draft.tier,
      targetAudience: draft.targetAudience.trim(),
      distributionRegions: draft.distributionRegions,
      targetDate: new Date(`${draft.targetDate}T07:00:00`).toISOString(),
      contentDraft: draft.contentDraft.trim(),
      mediaAttachments: [],
      addOnIds: draft.addOnIds,
      disclosureAcknowledged: draft.disclosureAcknowledged,
      consentToProcessing: draft.consentToProcessing,
      userId: user?.id,
    });
    setSubmitting(false);
    setCreated(booking);
    toast.success("Booking received", {
      description: `Reference ${booking.referenceNumber} issued. The press desk reviews every booking before a quote is sent.`,
    });
  };

  if (created) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-success/40 bg-white p-8 text-center sm:p-10">
        <FileCheck2 className="mx-auto h-12 w-12 text-success" />
        <h2 className="mt-4 font-display text-2xl font-bold text-brand-charcoal">
          Booking acknowledged
        </h2>
        <p className="mt-2 text-sm text-brand-slate">Your reference number is</p>
        <p className="mt-1 font-mono text-xl font-bold tracking-wider text-brand-navy">
          {created.referenceNumber}
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-brand-slate">
          The press desk will open an editorial and compliance review, then issue a priced quotation
          for the selected tier and add-ons. You can follow all twelve workflow states in the live
          tracker.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
            <Link to="/press-releases/$id" params={{ id: created.id }}>
              Open the live tracker
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard" search={{ tab: "press" }}>
              View in my dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const steps = ["Company profile", "Content brief", "Tier & add-ons", "Agreement & submit"];

  return (
    <div className="mx-auto max-w-4xl">
      <ol className="mb-6 flex flex-wrap items-center gap-1">
        {steps.map((label, index) => (
          <li key={label} className="flex items-center">
            <button
              type="button"
              onClick={() => (index < step ? setStep(index) : goTo(index))}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
                index === step
                  ? "bg-brand-navy text-white"
                  : index < step
                    ? "bg-brand-navy/10 text-brand-navy"
                    : "text-brand-slate",
              )}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px]">
                {index < step ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              {label}
            </button>
            {index < steps.length - 1 ? (
              <span className="mx-1 h-px w-4 bg-brand-border" aria-hidden="true" />
            ) : null}
          </li>
        ))}
      </ol>

      {errors.length > 0 ? (
        <ul className="mb-5 space-y-1 rounded-md border border-danger/40 bg-danger/8 px-4 py-3 text-sm text-danger">
          {errors.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}

      <div className="rounded-lg border border-brand-border bg-white p-5 sm:p-7">
        {step === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Company / organisation" required>
              <input
                value={draft.companyName}
                onChange={(e) => patch({ companyName: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Full name" required>
              <input
                value={draft.contactName}
                onChange={(e) => patch({ contactName: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                value={draft.contactEmail}
                onChange={(e) => patch({ contactEmail: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Telephone" required>
              <input
                value={draft.contactPhone}
                onChange={(e) => patch({ contactPhone: e.target.value })}
                className={inputClass}
                placeholder="+44 …"
              />
            </Field>
            <Field label="Country">
              <select
                value={draft.country}
                onChange={(e) => patch({ country: e.target.value })}
                className={inputClass}
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Industry">
              <select
                value={draft.industry}
                onChange={(e) => patch({ industry: e.target.value })}
                className={inputClass}
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field
                label="Website URL"
                hint="Used by the compliance desk to verify claims about the organisation."
              >
                <input
                  value={draft.websiteUrl}
                  onChange={(e) => patch({ websiteUrl: e.target.value })}
                  className={inputClass}
                  placeholder="https://…"
                />
              </Field>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <Field label="Press release headline" required>
              <input
                value={draft.title}
                onChange={(e) => patch({ title: e.target.value })}
                className={inputClass}
                placeholder="Organisation announces…"
              />
            </Field>
            <Field
              label="Draft text or brief"
              required
              hint="Paste an existing draft or outline the announcement. The desk sub-edits to house style during production."
            >
              <textarea
                rows={9}
                value={draft.contentDraft}
                onChange={(e) => patch({ contentDraft: e.target.value })}
                className={inputClass}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Target publication date" required>
                <input
                  type="date"
                  value={draft.targetDate}
                  onChange={(e) => patch({ targetDate: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Target audience">
                <input
                  value={draft.targetAudience}
                  onChange={(e) => patch({ targetAudience: e.target.value })}
                  className={inputClass}
                  placeholder="Investors, procurement leads, trade media…"
                />
              </Field>
            </div>
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-slate">
                Target distribution regions <span className="text-danger">*</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {distributionRegions.map((region) => {
                  const selected = draft.distributionRegions.includes(region);
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => toggleRegion(region)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        selected
                          ? "border-brand-navy bg-brand-navy text-white"
                          : "border-brand-border bg-white text-brand-charcoal hover:border-brand-navy/50",
                      )}
                    >
                      {region}
                    </button>
                  );
                })}
              </div>
              <InfoNote className="mt-3">
                Region selection determines which verified channels are scheduled. Regions where
                F.M.I.E holds no current arrangement are quoted as earned-media outreach only, and
                are never sold as placement.
              </InfoNote>
            </fieldset>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-3">
              {prTiers.map((tier) => {
                const selected = tier.id === draft.tier;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => patch({ tier: tier.id })}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-colors",
                      selected
                        ? "border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy"
                        : "border-brand-border hover:border-brand-navy/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-base font-semibold text-brand-charcoal">
                        {tier.name}
                      </span>
                      {selected ? <Check className="h-4 w-4 shrink-0 text-brand-navy" /> : null}
                    </div>
                    <p className="mt-1 font-display text-2xl font-bold text-brand-navy">
                      from {formatCurrency(tier.priceFrom)}
                    </p>
                    <p className="mt-1 text-[11px] text-brand-slate">{tier.turnaround}</p>
                    <p className="mt-3 text-xs leading-relaxed text-brand-slate">{tier.summary}</p>
                    <ul className="mt-3 space-y-1 text-[11px] text-brand-slate">
                      {tier.includes.slice(0, 4).map((line) => (
                        <li key={line}>· {line}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
            <fieldset className="rounded-lg border border-brand-border bg-brand-cream p-4">
              <legend className="px-1 text-xs font-semibold uppercase tracking-[0.1em] text-brand-slate">
                Editorial add-ons
              </legend>
              <ul className="mt-2 space-y-2">
                {prAddOns.map((addOn) => {
                  const selected = draft.addOnIds.includes(addOn.id);
                  return (
                    <li key={addOn.id}>
                      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-brand-border bg-white px-3 py-2.5">
                        <span className="flex items-center gap-2.5 text-sm text-brand-charcoal">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              patch({
                                addOnIds: selected
                                  ? draft.addOnIds.filter((id) => id !== addOn.id)
                                  : [...draft.addOnIds, addOn.id],
                              })
                            }
                            className="h-4 w-4 accent-[#0A2E68]"
                          />
                          {addOn.label}
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-brand-navy">
                          {formatCurrency(addOn.price)}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
            <div className="flex items-center justify-between rounded-lg border border-brand-gold/50 bg-brand-gold/10 px-4 py-3">
              <p className="text-sm text-brand-charcoal">
                Indicative total for {tierDefinition?.name}: tier from{" "}
                {formatCurrency(tierDefinition?.priceFrom ?? 0)} + add-ons{" "}
                {formatCurrency(addOnTotal)}
              </p>
              <p className="font-display text-xl font-bold text-brand-navy">
                {formatCurrency(estimate)}
              </p>
            </div>
            <InfoNote>
              This is an indication, not a quotation. A priced quotation is issued after editorial
              and compliance review, and is confirmed in writing before any payment is requested.
              All prices exclude VAT.
            </InfoNote>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-brand-border bg-brand-cream p-5 text-sm">
              <h3 className="font-display text-lg font-semibold text-brand-charcoal">
                {draft.title}
              </h3>
              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-brand-charcoal">Organisation: </dt>
                  <dd className="inline text-brand-slate">{draft.companyName}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-charcoal">Tier: </dt>
                  <dd className="inline text-brand-slate">{tierDefinition?.name}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-charcoal">Regions: </dt>
                  <dd className="inline text-brand-slate">
                    {draft.distributionRegions.join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-charcoal">Target date: </dt>
                  <dd className="inline text-brand-slate">{draft.targetDate}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-brand-charcoal">Indicative total: </dt>
                  <dd className="inline font-semibold text-brand-navy">
                    {formatCurrency(estimate)} + VAT
                  </dd>
                </div>
              </dl>
            </div>
            <ComplianceBanner variant="distribution" showPoints />
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal">
                <Switch
                  checked={draft.disclosureAcknowledged}
                  onCheckedChange={(value) => patch({ disclosureAcknowledged: value })}
                />
                <span>
                  I accept the commercial disclosure terms: distribution is a paid service; paid
                  content is labelled as such; and no placement in a named third-party publication
                  is guaranteed or implied.
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal">
                <Switch
                  checked={draft.consentToProcessing}
                  onCheckedChange={(value) => patch({ consentToProcessing: value })}
                />
                <span>
                  I consent to F.M.I.E processing the contact details supplied for the purpose of
                  this booking, in line with the platform privacy notice.
                </span>
              </label>
            </div>
          </div>
        ) : null}

        <div className="mt-7 flex items-center justify-between border-t border-brand-border pt-5">
          <Button
            variant="outline"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < 3 ? (
            <Button
              className="bg-brand-navy text-white hover:bg-brand-navy-light"
              onClick={() => goTo(step + 1)}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="bg-brand-navy text-white hover:bg-brand-navy-light"
              onClick={() => void submit()}
              disabled={submitting}
            >
              <Send className="h-4 w-4" /> {submitting ? "Submitting…" : "Submit booking"}
            </Button>
          )}
        </div>
      </div>

      <Button
        variant="link"
        className="mx-auto mt-4 block text-brand-slate"
        onClick={() => void navigate({ to: "/press-releases" })}
      >
        Cancel and return to the press release portal
      </Button>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-slate">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint ? <span className="mt-1 block text-[11px] text-brand-slate">{hint}</span> : null}
    </label>
  );
}

export default PRBookingWizard;
