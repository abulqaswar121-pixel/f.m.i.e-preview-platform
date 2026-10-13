import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { CreditCard, Download, ExternalLink, FileText, Paperclip } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { EmptyState, KeyedList } from "@/components/common/Primitives";
import { PRTimeline } from "@/components/press/PRTimeline";
import { StatusBadge } from "@/components/press/StatusBadge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/common/Modal";
import { formatDate, formatCurrency, prTiers } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { useAsyncResource } from "@/hooks/useAsync";
import { api, downloadTextFile } from "@/services/api";

export function PRDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { isAdmin } = useAuth();
  const booking = useAsyncResource(() => api.pressReleases.getById(id), undefined, [id]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  const data = booking.data;

  if (booking.loading) {
    return (
      <div className="fmie-container py-16">
        <div className="h-4 w-40 animate-pulse rounded bg-brand-slate/15" />
        <div className="mt-4 h-9 w-2/3 animate-pulse rounded bg-brand-slate/15" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fmie-container py-20">
        <EmptyState
          title="Campaign not found"
          description="Check the reference number, or view all campaigns in your dashboard."
          action={{ label: "My dashboard", to: "/dashboard" }}
        />
      </div>
    );
  }

  const tier = prTiers.find((entry) => entry.id === data.tier);
  const addOnTotal = data.addOns
    .filter((addOn) => addOn.selected)
    .reduce((sum, addOn) => sum + addOn.price, 0);

  const acceptQuote = async () => {
    await api.pressReleases.updateStatus(
      data.id,
      "awaiting_payment",
      "Quotation accepted by the client through the live tracker.",
      data.contactName,
    );
    setQuoteOpen(false);
    toast.success("Quotation accepted", {
      description: "An invoice has been raised with a seven-day term.",
    });
  };

  const pay = async () => {
    setPaying(true);
    await api.pressReleases.markPaid(data.id);
    setPaying(false);
    toast.success("Payment recorded (simulated)", {
      description:
        "The campaign moves to Approved and enters production. No funds have moved in this preview.",
    });
  };

  const downloadDossier = async () => {
    const lines = [
      "F.M.I.E MEDIA & RESEARCH LTD — COMPLETION DOSSIER",
      `Campaign reference: ${data.referenceNumber}`,
      `Title: ${data.title}`,
      `Client: ${data.companyName}`,
      `Tier: ${tier?.name ?? data.tier}`,
      `Status: ${data.status.replace(/_/g, " ")}`,
      `Submitted: ${data.submittedDate}`,
      `Target date: ${data.targetDate}`,
      "",
      "CONFIRMED PLACEMENTS",
      ...(data.publishedUrls?.length
        ? data.publishedUrls.map((url, index) => `${index + 1}. ${url}`)
        : ["None recorded."]),
      "",
      "WORKFLOW RECORD",
      ...data.timeline.map(
        (event) => `- ${event.at} [${event.status}] ${event.actor}: ${event.note}`,
      ),
      "",
      "DISCLOSURE",
      "Confirmed placements above are F.M.I.E owned commercial desks or partner distribution channels with a",
      "current written arrangement. Earned-media outreach, where performed, is logged with its outcome and is",
      "never sold or guaranteed. This dossier is a simulated document produced by the preview platform.",
    ];
    downloadTextFile(
      `${data.referenceNumber}-dossier.txt`,
      lines.join("\n"),
      "text/plain;charset=utf-8",
    );
    toast.success("Dossier downloaded", {
      description: "Simulated document — demonstration preview.",
    });
  };

  return (
    <div>
      <header className="border-b border-brand-border bg-white">
        <div className="fmie-container max-w-6xl py-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-brand-slate"
          >
            <Link to="/" className="hover:text-brand-navy hover:underline">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/press-releases" className="hover:text-brand-navy hover:underline">
              Global Press Releases
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-mono font-medium text-brand-charcoal">
              {data.referenceNumber}
            </span>
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={data.status} />
            <Badge tone="navy">{tier?.shortName ?? data.tier}</Badge>
            <Badge tone="cream">{data.industry}</Badge>
          </div>
          <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold leading-tight text-brand-charcoal sm:text-4xl">
            {data.title}
          </h1>
          <p className="mt-3 text-sm text-brand-slate">
            {data.companyName} · submitted {formatDate(data.submittedDate)} · target{" "}
            {formatDate(data.targetDate)}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {data.status === "quote_sent" ? (
              <Button
                className="bg-brand-navy text-white hover:bg-brand-navy-light"
                onClick={() => setQuoteOpen(true)}
              >
                <FileText className="h-4 w-4" /> Review quote
              </Button>
            ) : null}
            {data.status === "awaiting_payment" ? (
              <Button
                className="bg-brand-navy text-white hover:bg-brand-navy-light"
                onClick={() => void pay()}
                disabled={paying}
              >
                <CreditCard className="h-4 w-4" />{" "}
                {paying ? "Processing…" : "Submit payment (simulated)"}
              </Button>
            ) : null}
            {data.status === "completed" ? (
              <Button variant="outline" onClick={() => void downloadDossier()}>
                <Download className="h-4 w-4" /> Download published dossier
              </Button>
            ) : null}
            {isAdmin ? (
              <Button asChild variant="outline">
                <Link to="/admin" search={{ tab: "press" }}>
                  Manage in admin panel
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="fmie-container max-w-6xl space-y-8 py-10">
        <PRTimeline booking={data} />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-lg border border-brand-border bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                Content brief
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-brand-slate">
                {data.contentDraft}
              </p>
            </section>

            <section className="rounded-lg border border-brand-border bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                Distribution scope
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.distributionRegions.map((region) => (
                  <Badge key={region} tone="cream">
                    {region}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-brand-slate">{data.targetAudience}</p>
            </section>

            <section className="rounded-lg border border-brand-border bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                Media attachments
              </h2>
              {data.mediaAttachments.length === 0 ? (
                <p className="mt-2 text-sm text-brand-slate">
                  No assets uploaded with this booking.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {data.mediaAttachments.map((attachment) => (
                    <li
                      key={attachment}
                      className="flex items-center gap-2 rounded-md border border-brand-border bg-brand-cream px-3 py-2 text-xs text-brand-charcoal"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-brand-slate" />
                      {attachment}
                      <span className="ml-auto text-[10px] text-brand-slate">simulated file</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {data.publishedUrls?.length ? (
              <section className="rounded-lg border border-success/40 bg-success/5 p-6">
                <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                  Confirmed coverage
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-brand-slate">
                  Confirmed placements are F.M.I.E owned commercial desks or partner channels with a
                  current written arrangement. Earned-media pickup is never guaranteed and is not
                  invoiced.
                </p>
                <ul className="mt-3 space-y-2">
                  {data.publishedUrls.map((url) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-2 rounded-md border border-brand-border bg-white px-3 py-2 text-xs text-brand-navy hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4">
            <KeyedList
              items={[
                {
                  label: "Reference",
                  value: <span className="font-mono">{data.referenceNumber}</span>,
                },
                { label: "Contact", value: `${data.contactName} · ${data.contactEmail}` },
                { label: "Telephone", value: data.contactPhone },
                { label: "Country", value: data.country },
                { label: "Website", value: data.websiteUrl || "Not supplied" },
                { label: "Tier", value: tier?.name ?? data.tier },
                {
                  label: "Disclosure",
                  value: data.disclosureAcknowledged ? "Acknowledged" : "Not acknowledged",
                },
                { label: "Consent", value: data.consentToProcessing ? "Given" : "Not given" },
              ]}
            />

            <div className="rounded-lg border border-brand-border bg-white p-5">
              <h3 className="font-display text-base font-semibold text-brand-charcoal">
                Commercial summary
              </h3>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-brand-slate">
                  <dt>{tier?.shortName} tier (from)</dt>
                  <dd className="tabular-nums">{formatCurrency(tier?.priceFrom ?? 0)}</dd>
                </div>
                {data.addOns
                  .filter((addOn) => addOn.selected)
                  .map((addOn) => (
                    <div key={addOn.id} className="flex justify-between text-brand-slate">
                      <dt className="truncate pr-2">{addOn.label}</dt>
                      <dd className="tabular-nums">{formatCurrency(addOn.price)}</dd>
                    </div>
                  ))}
                <div className="flex justify-between border-t border-brand-border pt-2 font-semibold text-brand-charcoal">
                  <dt>Quoted total (excl. VAT)</dt>
                  <dd className="tabular-nums">
                    {data.quoteAmount !== undefined
                      ? formatCurrency(data.quoteAmount)
                      : "Awaiting review"}
                  </dd>
                </div>
                {data.quoteAmount === undefined ? (
                  <p className="text-[11px] text-brand-slate">
                    Indicative before review: {formatCurrency((tier?.priceFrom ?? 0) + addOnTotal)}
                  </p>
                ) : null}
                {data.paidAt ? (
                  <p className="text-[11px] text-success">
                    Paid {formatDate(data.paidAt)} (simulated)
                  </p>
                ) : null}
              </dl>
            </div>

            {data.notes ? (
              <div className="rounded-lg border border-brand-border bg-brand-cream p-5">
                <h3 className="text-sm font-semibold text-brand-charcoal">Desk notes</h3>
                <p className="mt-2 text-xs leading-relaxed text-brand-slate">{data.notes}</p>
              </div>
            ) : null}

            <ComplianceBanner variant="distribution" />
          </aside>
        </div>
      </div>

      <Modal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        title={`Quotation for ${data.referenceNumber}`}
        description="Priced after editorial and compliance review. Valid for fourteen days."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setQuoteOpen(false)}>
              Not now
            </Button>
            <Button
              className="bg-brand-navy text-white hover:bg-brand-navy-light"
              onClick={() => void acceptQuote()}
            >
              Accept quotation
            </Button>
          </div>
        }
      >
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between text-brand-slate">
            <dt>{tier?.name} — preparation and coordination</dt>
            <dd className="tabular-nums">{formatCurrency(tier?.priceFrom ?? 0)}</dd>
          </div>
          {data.addOns
            .filter((addOn) => addOn.selected)
            .map((addOn) => (
              <div key={addOn.id} className="flex justify-between text-brand-slate">
                <dt>{addOn.label}</dt>
                <dd className="tabular-nums">{formatCurrency(addOn.price)}</dd>
              </div>
            ))}
          <div className="flex justify-between border-t border-brand-border pt-2 text-base font-semibold text-brand-charcoal">
            <dt>Total excluding VAT</dt>
            <dd className="tabular-nums">
              {formatCurrency(data.quoteAmount ?? (tier?.priceFrom ?? 0) + addOnTotal)}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-brand-slate">
          Accepting this quotation raises an invoice and moves the campaign to Awaiting Payment.
          Production begins only when payment clears. Distribution scope is limited to the regions
          listed on this campaign; earned media is never included in a quotation.
        </p>
      </Modal>
    </div>
  );
}

export default PRDetailPage;
