import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Scale } from "lucide-react";

import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { PageHeader } from "@/components/common/Primitives";
import { Badge } from "@/components/common/Badge";
import { useAsyncResource } from "@/hooks/useAsync";
import { api } from "@/services/api";

export function ProfessionalServicesPage() {
  const services = useAsyncResource(() => api.services.list(), [], []);

  return (
    <div>
      <PageHeader
        eyebrow="Professional services"
        title="Executive and professional services consultancy"
        description="Four structured engagements, each with a documented workflow, named deliverables, a published timeline and an explicit statement of what is not guaranteed."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Professional Services" }]}
      />

      <div className="fmie-container space-y-8 py-10">
        {services.data.map((service, index) => (
          <article
            key={service.id}
            className={`grid gap-6 rounded-lg border border-brand-border bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1.5fr_1fr] ${
              index % 2 === 1 ? "lg:bg-brand-cream/40" : ""
            }`}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="navy">Service {String(index + 1).padStart(2, "0")}</Badge>
                {service.complianceWarning ? (
                  <Badge tone="warning">Compliance-reviewed</Badge>
                ) : null}
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold text-brand-charcoal">
                {service.title}
              </h2>
              <p className="mt-2 font-display text-lg italic text-brand-gold-dark">
                {service.tagline}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-brand-slate">{service.description}</p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {service.deliverables.slice(0, 6).map((deliverable) => (
                  <li
                    key={deliverable}
                    className="flex gap-2 text-xs leading-relaxed text-brand-slate"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                    {deliverable}
                  </li>
                ))}
              </ul>
              {service.complianceWarning ? (
                <p className="mt-5 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/8 px-4 py-3 text-xs leading-relaxed text-brand-charcoal">
                  <Scale className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  {service.complianceWarning}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-4 rounded-lg border border-brand-border bg-white p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-brand-charcoal">
                <Clock className="h-4 w-4 text-brand-navy" /> {service.timeline}
              </p>
              <p className="text-xs leading-relaxed text-brand-slate">{service.pricingNote}</p>
              <div className="rounded-md bg-brand-cream px-3 py-2 text-[11px] leading-relaxed text-brand-slate">
                {service.processSteps.length}-stage workflow:{" "}
                {service.processSteps.map((step) => step.title).join(" → ")}
              </div>
              <Link
                to="/services/$slug"
                params={{ slug: service.slug }}
                className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:underline"
              >
                View deliverables & book a consultation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}

        <div className="grid gap-4 lg:grid-cols-2">
          <ComplianceBanner variant="pitching" />
          <ComplianceBanner variant="wikipedia" />
        </div>
      </div>
    </div>
  );
}

export default ProfessionalServicesPage;
