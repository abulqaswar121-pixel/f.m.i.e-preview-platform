import { Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/Primitives";
import { contactEmail, headquarters, legal, site } from "@/config/site";

const SECTIONS = [
  {
    title: "What this preview collects",
    body: "This build is a design and workflow demonstration. It has no server, no analytics provider and no third-party tracking. Anything you type — an account name, a survey response, a booking, a delivery address — is written to your browser's local storage on your own device and is never transmitted anywhere.",
  },
  {
    title: "Local storage and session data",
    body: "The platform stores a single versioned data object containing the sample records plus anything you create, together with your basket and your current session identifier. Clearing your browser storage, or using the administrator reset action, removes it permanently and restores the shipped sample data.",
  },
  {
    title: "Account and profile data",
    body: "Registration accepts any valid-looking email address and does not verify it. A profile record holds your name, email, organisation, job title, location and notification preferences. Because no email is sent, no confirmation, password reset or marketing message is ever generated from that address.",
  },
  {
    title: "Survey responses",
    body: "Responses are stored with the answers given, a respondent segment, a country, a completion flag and a duration. Surveys on this platform are configured as anonymous by default: no response is linked to an identifiable account unless a survey explicitly states that it collects identifying information in its consent notice.",
  },
  {
    title: "Press release and commercial records",
    body: "Bookings retain the company profile you supply, contact details, a content draft, the chosen tier and add-ons, quotations, payment states and a dated workflow log naming the actor for each event. Completion dossiers record only confirmed placements.",
  },
  {
    title: "Commerce records",
    body: "Orders retain the delivery address, contact email, line items, totals, a promo code if applied, a payment method and a generated simulated payment reference. No card data is requested, captured or stored, and no payment processor is involved.",
  },
  {
    title: "Cookies",
    body: "No cookies are set by this preview. Session continuity is achieved entirely through local storage on your device.",
  },
  {
    title: "Your rights in a live deployment",
    body: "A production deployment of this platform would give you the right to access, rectify, erase, restrict and port personal data, and to object to processing, in line with UK data protection law. Requests would be acknowledged within one month. This preview implements none of that machinery because it processes no real personal data.",
  },
  {
    title: "Children and restricted audiences",
    body: "The platform is intended for business and professional users. No survey instrument in the sample set is directed at children, and any live survey aimed at under-18 respondents would require documented guardian consent and an ethical review record before publication.",
  },
  {
    title: "Data retention in this preview",
    body: "Records persist until you clear your browser storage or reset the preview. There is no automated deletion schedule, no backup and no export to any external system.",
  },
];

export function PrivacyPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Privacy notice"
        title="How this preview handles the data you enter"
        description="Plain-language summary of what is stored, where it lives and what a production deployment would be required to do. Nothing you submit here leaves your device."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Privacy Notice" }]}
      />

      <div className="fmie-container space-y-8 py-10">
        <div className="rounded-lg border border-brand-border bg-white p-6">
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

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-brand-border bg-brand-cream p-6">
            <h2 className="font-display text-base font-semibold text-brand-charcoal">
              Questions about data
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-brand-slate">
              Write to{" "}
              <a
                href={`mailto:${contactEmail.privacy}`}
                className="font-semibold text-brand-navy hover:underline"
              >
                {contactEmail.privacy}
              </a>{" "}
              or to the head office. In this preview your message is stored locally and shown in the
              administrator panel rather than being sent.
            </p>
            <address className="mt-4 not-italic text-xs leading-relaxed text-brand-slate">
              {site.legalName}
              <br />
              {headquarters.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <br />
              {headquarters.telephone}
            </address>
            <Link
              to="/contact"
              className="mt-4 inline-block text-xs font-semibold text-brand-navy hover:underline"
            >
              Open the contact form →
            </Link>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="font-display text-base font-semibold text-brand-charcoal">
              Standing notices
            </h2>
            <ul className="mt-3 space-y-2">
              {legal.notices.map((notice) => (
                <li key={notice} className="flex gap-2 text-xs leading-relaxed text-brand-slate">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                  {notice}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-brand-border pt-3 text-[11px] leading-relaxed text-brand-slate">
              {legal.copyright} {legal.registeredOffice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
