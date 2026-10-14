import { Link } from "@tanstack/react-router";
import { FileWarning, PenLine, Scale, ShieldCheck } from "lucide-react";

import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { DisclosureBadge, PageHeader } from "@/components/common/Primitives";
import { compliance, contactRoutes, legal, site } from "@/config/site";
import type { DisclosureTag } from "@/types";

const DISCLOSURE_TAXONOMY: { tag: DisclosureTag; meaning: string; rule: string }[] = [
  {
    tag: "Independent Editorial",
    meaning:
      "Commissioned, reported and edited by the F.M.I.E newsroom with no payment from any subject of the piece.",
    rule: "No commercial team may review, amend or approve copy before publication.",
  },
  {
    tag: "Sponsored Research",
    meaning:
      "Research or analysis funded by a named sponsor. The sponsor is identified in the article and in the record.",
    rule: "The sponsor may see factual accuracy checks only — never conclusions, framing or headlines.",
  },
  {
    tag: "Partner Dispatch",
    meaning:
      "Content supplied or co-produced by a distribution partner and published on an F.M.I.E commercial desk.",
    rule: "Always labelled at the point of publication and never presented as newsroom reporting.",
  },
];

const STANDARDS = [
  {
    title: "Sourcing and verification",
    body: "Every factual claim in a published article must be attributable to a named source, a primary document or a dataset the reader can inspect. Where a source is anonymous, the reason for anonymity is stated in the article and a second editor verifies the material before publication. Statistics are published with their base, period and collection method.",
  },
  {
    title: "Separation of editorial and commercial activity",
    body: compliance.editorialSeparation,
  },
  {
    title: "Corrections and clarifications",
    body: "Errors of fact are corrected visibly: the article carries a dated correction note at the top and the original wording is preserved in the record. Clarifications that do not change a factual claim are footnoted. Requests are acknowledged within two working days and decided by the desk editor, with escalation to the editorial board where the requester disputes the outcome.",
  },
  {
    title: "Right of reply",
    body: "Any person or organisation materially criticised in an article may request a right of reply. Requests are logged, considered on their merits and, where accepted, published adjacent to the original piece with a note explaining why. A reply is never a substitute for a correction.",
  },
  {
    title: "Opinion and commentary",
    body: "Opinion is labelled as such, written by a named author with a stated credential, and kept out of news reports. Commentators may not use the platform to promote a commercial interest they hold without disclosing it in the piece.",
  },
  {
    title: "Research published from the survey marketplace",
    body: "Survey-derived articles must state the instrument, the field dates, the achieved sample and the collection method, and must carry the representativeness limitation. Self-selected samples are never presented as population estimates, and no percentage is published without its base.",
  },
  {
    title: "Conflicts of interest",
    body: "Authors and editors declare financial interests, advisory roles and family relationships affecting a subject before commissioning. Declarations are recorded against the article and, where material, disclosed to the reader.",
  },
  {
    title: "Third-party names and affiliations",
    body: compliance.noAffiliation,
  },
];

export function EditorialPolicyPage() {
  const editorial = contactRoutes.find((route) => route.id === "editorial") ?? contactRoutes[1]!;

  return (
    <div>
      <PageHeader
        eyebrow="Editorial policy"
        title="How F.M.I.E decides what is journalism and what is commerce"
        description="One published standard covering sourcing, labelling, corrections, rights of reply, conflicts of interest and the treatment of survey-derived research."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Editorial Policy" }]}
      />

      <div className="fmie-container space-y-12 py-10">
        <ComplianceBanner variant="editorial" />

        <section>
          <h2 className="font-display text-2xl font-bold text-brand-charcoal">
            Disclosure taxonomy
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-slate">
            Every article on this platform carries exactly one disclosure tag, applied at
            publication and shown beside the byline. The tag determines which desk produced the
            piece and what commercial relationship, if any, exists.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {DISCLOSURE_TAXONOMY.map((entry) => (
              <article
                key={entry.tag}
                className="rounded-lg border border-brand-border bg-white p-5"
              >
                <DisclosureBadge tag={entry.tag} />
                <p className="mt-3 text-sm leading-relaxed text-brand-slate">{entry.meaning}</p>
                <p className="mt-3 border-t border-brand-border pt-3 text-xs leading-relaxed text-brand-charcoal">
                  <span className="font-semibold">Standing rule: </span>
                  {entry.rule}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-brand-charcoal">
            Standards of practice
          </h2>
          <div className="mt-6 space-y-4">
            {STANDARDS.map((standard, index) => (
              <article
                key={standard.title}
                className="flex gap-4 rounded-lg border border-brand-border bg-white p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-cream font-display text-sm font-bold text-brand-navy">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-brand-charcoal">
                    {standard.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-slate">{standard.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-brand-charcoal">
              <PenLine className="h-5 w-5 text-brand-navy" /> Raise a correction
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-slate">
              Write to the editorial desk with the article title, the specific wording you believe
              is wrong and the evidence that supports your reading. The desk records the request,
              decides it against this policy and publishes the outcome — including where the article
              stands unchanged and why.
            </p>
            <p className="mt-4 text-sm">
              <a
                href={`mailto:${editorial.email}`}
                className="font-semibold text-brand-navy hover:underline"
              >
                {editorial.email}
              </a>{" "}
              <span className="text-brand-slate">· {editorial.telephone}</span>
            </p>
            <p className="mt-1 text-xs text-brand-slate">
              Expected response: {editorial.responseTime}. Escalation: the editorial board reviews
              any decision a requester disputes.
            </p>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-brand-charcoal">
              <Scale className="h-5 w-5 text-brand-navy" /> Paid contributions
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-slate">
              Where F.M.I.E staff contribute to third-party platforms on a paid basis — including
              encyclopaedic reference work — the contribution is declared on the relevant talk page
              and in the editor's disclosure record, in line with the platform's own
              paid-contribution rules.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-brand-slate">
              F.M.I.E never promises the creation, retention, survival or approval of an article on
              any third-party platform, and declines engagements whose only purpose is promotion
              that the platform's policies forbid.
            </p>
            <Link
              to="/services/$slug"
              params={{ slug: "wikipedia-research-editorial-advisory" }}
              className="mt-4 inline-block text-sm font-semibold text-brand-navy hover:underline"
            >
              Read the Wikipedia advisory service →
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ComplianceBanner variant="survey" />
          <ComplianceBanner variant="distribution" />
        </section>

        <section className="rounded-lg border border-brand-border bg-brand-cream p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-brand-charcoal">
            <ShieldCheck className="h-5 w-5 text-brand-navy" /> Standing notices
          </h2>
          <ul className="mt-4 space-y-3">
            {legal.notices.map((notice) => (
              <li key={notice} className="flex gap-3 text-sm leading-relaxed text-brand-slate">
                <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold-dark" />
                {notice}
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-brand-border pt-4 text-xs leading-relaxed text-brand-slate">
            {legal.copyright} {legal.registeredOffice} This build is a demonstration preview:{" "}
            {site.previewNotice}
          </p>
        </section>
      </div>
    </div>
  );
}

export default EditorialPolicyPage;
