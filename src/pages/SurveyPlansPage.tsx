import { Link } from "@tanstack/react-router";
import { Check, Minus, Settings2 } from "lucide-react";

import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { InfoNote, PageHeader } from "@/components/common/Primitives";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/config/site";
import { useAsyncResource } from "@/hooks/useAsync";
import { api } from "@/services/api";

export function SurveyPlansPage() {
  const plans = useAsyncResource(() => api.surveys.plans(), [], []);

  return (
    <div>
      <PageHeader
        eyebrow="Plans & pricing"
        title="Research plans, configured by the platform administrator"
        description="Limits, pricing and feature sets are stored in the platform configuration and edited from the admin control panel — they are never hardcoded in the interface."
        breadcrumb={[
          { label: "Home", to: "/" },
          { label: "Surveys" },
          { label: "Plans & pricing" },
        ]}
      />

      <div className="fmie-container py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.data.map((plan) => (
            <article
              key={plan.id}
              className={`flex flex-col rounded-lg border bg-white p-6 shadow-sm ${
                plan.highlighted
                  ? "border-brand-gold ring-2 ring-brand-gold/40"
                  : "border-brand-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-brand-charcoal">
                  {plan.name}
                </h2>
                {plan.highlighted ? <Badge tone="gold">Most chosen</Badge> : null}
              </div>
              <p className="mt-2 font-display text-3xl font-bold text-brand-navy">
                {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
                <span className="ml-1 text-sm font-normal text-brand-slate">
                  {plan.price === 0
                    ? "forever"
                    : plan.billingPeriod === "annual"
                      ? "per year"
                      : "per survey programme"}
                </span>
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-brand-border py-3 text-center">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.1em] text-brand-slate">
                    Questions
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-brand-charcoal">
                    {plan.questionLimit === null ? "∞" : plan.questionLimit}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.1em] text-brand-slate">
                    Responses
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-brand-charcoal">
                    {plan.responseLimit === null ? "∞" : plan.responseLimit.toLocaleString("en-GB")}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.1em] text-brand-slate">Seats</dt>
                  <dd className="mt-1 text-sm font-bold text-brand-charcoal">
                    {plan.seatsIncluded}
                  </dd>
                </div>
              </dl>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-xs leading-relaxed text-brand-slate">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
                {plan.exclusions.map((exclusion) => (
                  <li
                    key={exclusion}
                    className="flex gap-2 text-xs leading-relaxed text-brand-slate/70"
                  >
                    <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-slate/50" />
                    {exclusion}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-6 bg-brand-navy text-white hover:bg-brand-navy-light"
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link to="/surveys/create">Start with {plan.name}</Link>
              </Button>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <InfoNote>
            <Settings2 className="mr-1 inline h-3.5 w-3.5" />
            Administrators can adjust limits, pricing and feature sets from the admin control panel.
            Changes apply to newly created surveys immediately and are recorded against the plan
            configuration.
          </InfoNote>
          <InfoNote>
            Premium plans include data export. Every export carries a methodology note: response
            count, completion rate, collection window and the representativeness limitation.
          </InfoNote>
        </div>

        <div className="mt-8">
          <ComplianceBanner variant="survey" />
        </div>
      </div>
    </div>
  );
}

export default SurveyPlansPage;
