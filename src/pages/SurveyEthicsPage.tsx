import { Link } from "@tanstack/react-router";
import { FlaskConical, ShieldAlert, ShieldCheck, UserX } from "lucide-react";

import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { PageHeader } from "@/components/common/Primitives";
import { Badge } from "@/components/common/Badge";
import { contactRoutes } from "@/config/site";

const PRINCIPLES = [
  {
    title: "Informed consent before the first question",
    body: "Every survey displays a consent notice before any question is answered, stating who is collecting the data, what is collected, how long it takes, whether responses are anonymous, and what will be done with the answers. Consent is recorded against each response and cannot be bypassed by a direct link to question one.",
  },
  {
    title: "Anonymity by default",
    body: "Sample instruments collect a respondent segment, a country, a completion flag and a duration. They do not collect names, email addresses, employer identifiers or free-text fields that would identify an individual. A survey that intends to collect identifying information must say so in its consent notice and is moderated against that statement.",
  },
  {
    title: "Answerable, neutral, non-leading questions",
    body: "Questions must be answerable by the target respondent without speculation, must not embed the answer they hope for, and must offer a genuine range of responses including an explicit neutral point on rating scales. Double-barrelled questions are returned at moderation.",
  },
  {
    title: "Transparent conditional logic",
    body: "Skip logic and conditional display are shown to the creator in the builder and are described in the survey record. Respondents are never routed by hidden profiling, and no branch is used to screen out answers that would weaken a preferred conclusion.",
  },
  {
    title: "Proportionate incentives",
    body: "Where an incentive is offered it is stated in the consent notice and the survey listing, is proportionate to the time required, and is never conditioned on answering in a particular way or on completing a survey the respondent finds objectionable.",
  },
  {
    title: "Protection of vulnerable respondents",
    body: "No sample instrument is directed at children or at adults in a dependent relationship with the researcher. Surveys touching health, finances, employment security or personal safety must include a signposting note and a route to withdraw without completing.",
  },
  {
    title: "Honest reporting of what a sample can support",
    body: "Results describe the people who answered. Base sizes, field dates and collection method accompany every published figure, and no percentage is presented as a population estimate without a documented probability sampling method, weighting frame and achieved sample.",
  },
  {
    title: "Right to withdraw",
    body: "A respondent may stop at any point; an incomplete submission is recorded as incomplete rather than discarded, so completion rates remain honest. Withdrawal requests for stored responses are handled by the desk that owns the instrument.",
  },
];

const MODERATION = [
  {
    label: "Consent notice present and accurate",
    detail: "Collector, purpose, duration, anonymity and use of answers.",
  },
  {
    label: "Question integrity",
    detail: "Answerable, neutral, single-barrelled, with a genuine response range.",
  },
  {
    label: "Claims and framing",
    detail: "No representativeness claim without a stated sampling method.",
  },
  {
    label: "Data minimisation",
    detail: "No identifying fields beyond what the notice describes and justifies.",
  },
  { label: "Incentive proportionality", detail: "Disclosed, proportionate and unconditional." },
  {
    label: "Vulnerable respondents",
    detail: "Age-appropriate, with signposting and a withdrawal route.",
  },
];

export function SurveyEthicsPage() {
  const editorial = contactRoutes.find((route) => route.id === "editorial") ?? contactRoutes[1]!;

  return (
    <div>
      <PageHeader
        eyebrow="Survey ethics & consent"
        title="The standard every instrument must meet before publication"
        description="Applied by the administrator moderation queue and published here so creators, respondents and readers hold the platform to the same test."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Survey Ethics & Consent" }]}
      />

      <div className="fmie-container space-y-10 py-10">
        <ComplianceBanner variant="survey" />

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-brand-charcoal">
              Eight operating principles
            </h2>
            {PRINCIPLES.map((principle, index) => (
              <article
                key={principle.title}
                className="flex gap-4 rounded-lg border border-brand-border bg-white p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-cream font-display text-sm font-bold text-brand-navy">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-brand-charcoal">
                    {principle.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-slate">
                    {principle.body}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-brand-border bg-white p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-brand-charcoal">
                <ShieldCheck className="h-4 w-4 text-brand-navy" /> Moderation checklist
              </h2>
              <ul className="mt-3 space-y-3">
                {MODERATION.map((item) => (
                  <li
                    key={item.label}
                    className="rounded-md border border-brand-border bg-brand-cream/40 px-3 py-2"
                  >
                    <p className="text-xs font-semibold text-brand-charcoal">{item.label}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-brand-slate">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-brand-border pt-3 text-[11px] leading-relaxed text-brand-slate">
                Surveys that fail a check are returned to the creator with a written note that
                appears in their dashboard. Approval publishes the instrument to the marketplace.
              </p>
              <Link
                to="/admin"
                search={{ tab: "moderation" }}
                className="mt-3 inline-block text-xs font-semibold text-brand-navy hover:underline"
              >
                Open the moderation queue (administrator persona) →
              </Link>
            </div>

            <div className="rounded-lg border border-brand-border bg-white p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-brand-charcoal">
                <UserX className="h-4 w-4 text-brand-navy" /> What is never collected
              </h2>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-brand-slate">
                <li>· Names, email addresses or telephone numbers in anonymous instruments.</li>
                <li>
                  · Employer identifiers that would single out an individual in a small
                  organisation.
                </li>
                <li>
                  · Device fingerprints, location precision beyond country, or third-party tracking
                  identifiers.
                </li>
                <li>· Free-text answers solicited for the purpose of identifying a person.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-brand-border bg-white p-6">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-brand-charcoal">
                <FlaskConical className="h-4 w-4 text-brand-navy" /> Publishing results elsewhere
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-brand-slate">
                Any republication of F.M.I.E survey data must carry the representativeness
                limitation, the achieved sample, the field dates and the collection method. Export
                from this preview is a demonstration-only feature producing a CSV of aggregated
                distributions — it contains no respondent identifiers.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="info">Demo-only export</Badge>
                <Badge tone="muted">No identifiers</Badge>
                <Badge tone="warning">Self-selected sample</Badge>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-lg border border-brand-border bg-brand-cream p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-brand-charcoal">
            <ShieldAlert className="h-5 w-5 text-brand-gold-dark" /> Raise an ethics concern
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-slate">
            If a live survey appears to breach this standard — through its consent wording, its
            questions, its incentives or the claims made from its results — write to the editorial
            desk. Concerns are logged, assessed against the checklist above, and the outcome is
            recorded. A survey may be suspended while a concern is examined.
          </p>
          <p className="mt-4 text-sm">
            <a
              href={`mailto:${editorial.email}`}
              className="font-semibold text-brand-navy hover:underline"
            >
              {editorial.email}
            </a>{" "}
            <span className="text-brand-slate">
              · {editorial.telephone} · response within {editorial.responseTime.toLowerCase()}
            </span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/surveys/create">
              <Badge tone="navy">Create a compliant survey</Badge>
            </Link>
            <Link to="/surveys">
              <Badge tone="cream">Browse the marketplace</Badge>
            </Link>
            <Link to="/editorial-policy">
              <Badge tone="cream">Editorial & media policy</Badge>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SurveyEthicsPage;
