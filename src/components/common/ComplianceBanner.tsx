import { Info, Scale, ShieldAlert, ShieldCheck, FlaskConical } from "lucide-react";

import { compliance } from "@/config/site";
import { cn } from "@/lib/utils";

export type ComplianceVariant =
  "distribution" | "survey" | "wikipedia" | "editorial" | "pitching" | "sample";

const variants: Record<
  ComplianceVariant,
  { title: string; body: string; notice: string; icon: typeof Info; tone: string }
> = {
  distribution: {
    title: compliance.distributionTransparency.title,
    body: compliance.distributionTransparency.body,
    notice: compliance.distributionTransparency.notice,
    icon: ShieldAlert,
    tone: "border-brand-gold bg-brand-gold/10",
  },
  survey: {
    title: compliance.surveyRepresentativeness.title,
    body: compliance.surveyRepresentativeness.body,
    notice: compliance.surveyRepresentativeness.notice,
    icon: FlaskConical,
    tone: "border-info/40 bg-info/8",
  },
  wikipedia: {
    title: compliance.wikipediaAdvisory.title,
    body: compliance.wikipediaAdvisory.body,
    notice: compliance.wikipediaAdvisory.notice,
    icon: Scale,
    tone: "border-brand-navy/30 bg-brand-navy/5",
  },
  editorial: {
    title: "Editorial independence",
    body: compliance.editorialSeparation,
    notice: compliance.noAffiliation,
    icon: ShieldCheck,
    tone: "border-success/40 bg-success/8",
  },
  pitching: {
    title: "No guaranteed outcomes",
    body: compliance.pitchingDisclaimer,
    notice:
      "F.M.I.E is not authorised under the Financial Services and Markets Act 2000 and receives no success fee, carry or commission from any introduction.",
    icon: ShieldAlert,
    tone: "border-warning/40 bg-warning/8",
  },
  sample: {
    title: "Demonstration preview",
    body: "Every article, survey, statistic, price, reference number and person on this platform is fictional sample data, shown to demonstrate design and workflow.",
    notice: "No live payments, emails, wire transmissions or database writes occur in this build.",
    icon: Info,
    tone: "border-brand-border bg-white",
  },
};

interface ComplianceBannerProps {
  variant: ComplianceVariant;
  className?: string;
  /** Show the full bullet list for the distribution transparency notice. */
  showPoints?: boolean;
}

export function ComplianceBanner({
  variant,
  className,
  showPoints = false,
}: ComplianceBannerProps) {
  const definition = variants[variant];
  const Icon = definition.icon;

  return (
    <aside
      className={cn("rounded-lg border-l-4 border p-5 sm:p-6", definition.tone, className)}
      aria-label={definition.title}
    >
      <div className="flex gap-4">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-navy" aria-hidden="true" />
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-brand-charcoal">
            {definition.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-brand-slate">{definition.body}</p>
          {showPoints && variant === "distribution" ? (
            <ul className="mt-3 grid gap-2 text-sm text-brand-slate sm:grid-cols-2">
              {compliance.distributionTransparency.points.map((point) => (
                <li key={point} className="rounded-md bg-white/70 px-3 py-2">
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 border-t border-brand-border/70 pt-3 text-xs font-medium leading-relaxed text-brand-charcoal">
            {definition.notice}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default ComplianceBanner;
