import { Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/Primitives";
import { contactEmail, headquarters, legal, site } from "@/config/site";

const SECTIONS = [
  { title: "Accounts and profiles", body: "Lovable Cloud stores your account and saved profile, including your name, email, country, job and any survey profile details you provide. Your profile helps match you with suitable surveys. Sign-in providers also handle your login." },
  { title: "Browser storage", body: "Your browser keeps sign-in information, unfinished drafts and some preview content. Clearing browser storage does not delete your saved Cloud account, bookings, kit requests or wallet records." },
  { title: "Survey answers and rewards", body: "Completed answers and reward records are saved in Lovable Cloud. An account link is needed to prevent repeat rewards. Read each survey's consent notice before answering; do not assume your answers are fully anonymous." },
  { title: "Press bookings and team kits", body: "We save the contact details, story, selected outlets, payment status and request details you submit. Team kit requests can include delivery details, a crest and player names. Approved administrators can review these records to handle your request." },
  { title: "Student IDs and private uploads", body: "Student IDs and team crests are stored privately under your account. Approved administrators can view them when needed to check a purchase or prepare a quote. Do not upload documents belonging to someone else without permission." },
  { title: "Payments", body: "Paystack handles checkout in test mode. The site saves payment references, amounts and verification status, not your card details. No real charges are made while test mode is active." },
  { title: "Email and contact forms", body: "Email briefings are not open yet. The preview contact form saves messages in this browser; it does not send them to the team. Use the listed phone number for help while official email boxes are being set up." },
  { title: "Data requests and retention", body: "You can edit your profile from your dashboard. Contact F.M.I.E by phone for help with access, corrections or deletion. Clearing browser storage does not erase Cloud records. The team must confirm a retention schedule and the full data-request process before live launch." },
  { title: "Children and sensitive details", body: "This platform is for adult business and research users. Only share details needed for the survey or request. Research involving children or sensitive health information needs proper consent and review before it opens." },
];

export function PrivacyPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Privacy notice"
        title="How we handle your information"
        description="What we save, where we save it, and what is still being prepared before launch."
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
              or call the listed phone number. Official email boxes are still being set up; the preview contact form does not send a message to the team.
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
