import { Link } from "@tanstack/react-router";

import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { PageHeader } from "@/components/common/Primitives";
import { commerce, contactEmail, headquarters, legal, site } from "@/config/site";

const SECTIONS = [
  {
    title: "1. About these terms",
    body: `These terms describe how you may use the ${site.legalName} demonstration platform at ${site.domain}. They are written for a live service, but the build you are using is a preview: it has no server, no payment processing, no email delivery and no file storage. By continuing to use the preview you accept these terms as a description of how the live platform would operate.`,
  },
  {
    title: "2. Nature of the preview",
    body: "Every article, survey, statistic, price, reference number, order, campaign and person shown on this platform is fictional sample data created to demonstrate design and workflow. Nothing here is published journalism, live market data, a real transaction or a real individual. Quotations generated in the preview are illustrative and create no contractual obligation on either side.",
  },
  {
    title: "3. Accounts and personas",
    body: "Sign-in accepts any valid-looking email address and creates or restores a local account. Four demonstration personas are provided so permissions can be exercised without registration. You remain responsible for what you create under any persona, and you may reset the platform to its shipped sample data at any time from the administrator panel.",
  },
  {
    title: "4. Editorial content",
    body: "Editorial content in the preview is sample material written for demonstration. In a live service, article text, photography, charts and the F.M.I.E marks would remain the property of the publisher, licensed for personal reading and internal reference only, with republication requiring written permission and an accompanying attribution and methodology note.",
  },
  {
    title: "5. Survey marketplace",
    body: "Survey creators are responsible for the instruments they publish: the wording, the consent notice, any incentive, and the accuracy of every claim made from the results. F.M.I.E moderates submissions before publication and may return or remove a survey that breaches the ethics and consent standard. Results derived from self-selected samples may not be presented as population estimates.",
  },
  {
    title: "6. Press release services",
    body: "Press release bookings are paid commercial services covering preparation, coordination and confirmed transmission through channels F.M.I.E operates or holds a current written arrangement with. No placement in a named third-party publication is guaranteed, and earned media is never sold, invoiced or promised. Clients warrant that submitted material is accurate, that they hold the rights to it, and that all required disclosures are made.",
  },
  {
    title: "7. Professional services",
    body: "Service engagements are scoped in writing before work begins, with a named owner, dated deliverables and a published timeline. Outcomes that depend on third parties — investment decisions, editorial commissioning, encyclopaedic notability determinations — are never guaranteed. Paid contributions to third-party platforms are disclosed in accordance with those platforms' own policies.",
  },
  {
    title: "8. Commerce",
    body: `Orders placed in the preview are simulated. No payment is taken and no goods are dispatched. In a live service, ${commerce.vatNote.toLowerCase()} Delivery charges would be standard ${commerce.currencySymbol}${commerce.standardShipping.toFixed(2)} within the United Kingdom and ${commerce.currencySymbol}${commerce.internationalShipping.toFixed(2)} internationally, free above ${commerce.currencySymbol}${commerce.freeShippingThreshold.toFixed(2)}.`,
  },
  {
    title: "9. Acceptable use",
    body: "You may not use the platform to publish material that is unlawful, defamatory, deceptive or infringing; to misrepresent an affiliation with F.M.I.E or any third-party publisher; to submit responses you know to be false; or to attempt to present simulated records as genuine commercial documents.",
  },
  {
    title: "10. Intellectual property",
    body: "The F.M.I.E name, wordmark, monogram, design system and all interface artwork in this build are original work created for the demonstration. The platform copies no third-party publisher's identity, and no third-party trade mark is used to suggest endorsement or affiliation.",
  },
  {
    title: "11. Disclaimers and liability",
    body: "The preview is supplied as-is for evaluation. No warranty is given as to fitness for a particular purpose, and no liability arises from reliance on sample data. In a live service, liability for commercial engagements would be limited to the fees paid for the engagement in question.",
  },
  {
    title: "12. Governing law",
    body: "These terms and any dispute arising from them would be governed by the laws of England and Wales, with the courts of England and Wales having exclusive jurisdiction. The registered office is the address below.",
  },
  {
    title: "13. Changes",
    body: "Terms, plan limits, tier prices and channel statuses are configured by an administrator rather than hardcoded, so they can change without a software release. Material changes would be announced on the platform and, in a live service, by email to affected accounts.",
  },
];

export function TermsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Terms & conditions"
        title="The terms that would govern this platform"
        description="Written for the live service, presented inside a demonstration preview. Read together with the privacy notice, the editorial policy and the survey ethics standard."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Terms & Conditions" }]}
      />

      <div className="fmie-container space-y-8 py-10">
        <ComplianceBanner variant="sample" />

        <div className="rounded-lg border border-brand-border bg-white p-6 sm:p-8">
          <div className="fmie-prose">
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-slate">{section.body}</p>
              </section>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="font-display text-base font-semibold text-brand-charcoal">
              Related policies
            </h2>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="font-semibold text-brand-navy hover:underline">
                  Privacy notice
                </Link>
              </li>
              <li>
                <Link
                  to="/editorial-policy"
                  className="font-semibold text-brand-navy hover:underline"
                >
                  Editorial & media policy
                </Link>
              </li>
              <li>
                <Link to="/survey-ethics" className="font-semibold text-brand-navy hover:underline">
                  Survey ethics & consent
                </Link>
              </li>
              <li>
                <Link to="/advertising" className="font-semibold text-brand-navy hover:underline">
                  Advertising & sponsorship
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="font-display text-base font-semibold text-brand-charcoal">
              Standing notices
            </h2>
            <ul className="mt-3 space-y-2">
              {legal.notices.slice(0, 3).map((notice) => (
                <li key={notice} className="flex gap-2 text-xs leading-relaxed text-brand-slate">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                  {notice}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-brand-border bg-brand-cream p-6">
            <h2 className="font-display text-base font-semibold text-brand-charcoal">
              Registered office
            </h2>
            <address className="mt-3 not-italic text-xs leading-relaxed text-brand-slate">
              {site.legalName}
              <br />
              {headquarters.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <br />
              {headquarters.telephone}
              <br />
              <a
                href={`mailto:${contactEmail.general}`}
                className="font-semibold text-brand-navy hover:underline"
              >
                {contactEmail.general}
              </a>
            </address>
            <p className="mt-4 border-t border-brand-border pt-3 text-[11px] text-brand-slate">
              {site.companyNumber} · {site.vatNumber}
            </p>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-brand-slate">
          {legal.copyright} {legal.registeredOffice}
        </p>
      </div>
    </div>
  );
}

export default TermsPage;
