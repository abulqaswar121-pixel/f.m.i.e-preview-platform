import { Link } from "@tanstack/react-router";
import { Coins, HandCoins, RefreshCw, Send, Wallet as WalletIcon } from "lucide-react";

import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { InfoNote, PageHeader } from "@/components/common/Primitives";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { governmentPlan, surveyPointRules } from "@/config/site";
import { formatUsd } from "@/lib/outlet-pricing";
import { earnerRewardUsd, packsInGroup, pointsNeeded } from "@/lib/survey-points";

const steps = [
  {
    icon: WalletIcon,
    title: "1. Buy points",
    text: "Pick a pack in your wallet and pay securely online. No yearly plan.",
  },
  {
    icon: Coins,
    title: "2. Set your reward",
    text: `Choose how many points each answer pays (at least ${surveyPointRules.minRewardPoints}) and how many answers you want.`,
  },
  {
    icon: Send,
    title: "3. Go live",
    text: "When your survey is approved, the points it needs are held for it.",
  },
  {
    icon: HandCoins,
    title: "4. Pay per answer",
    text: "Each completed answer uses its points and pays the person who answered.",
  },
  {
    icon: RefreshCw,
    title: "5. Top up or get points back",
    text: "Running low? Buy more any time. Points not used when a survey closes come back to you.",
  },
];

export function SurveyPlansPage() {
  const exampleReward = surveyPointRules.defaultRewardPoints;
  const exampleAnswers = surveyPointRules.defaultResponses;
  const examplePoints = pointsNeeded(exampleReward, exampleAnswers);

  return (
    <div>
      <PageHeader
        eyebrow="Survey points"
        title="Pay only for the answers you get"
        description="No yearly plans. Buy points when you need them and use them to pay people who answer your surveys."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Surveys" }, { label: "Point prices" }]}
      />

      <div className="fmie-container py-10">
        <section>
          <h2 className="font-display text-xl font-bold text-brand-charcoal">Point packs</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {packsInGroup("standard").map((pack, index) => (
              <article
                key={pack.id}
                className={`flex flex-col rounded-lg border bg-card p-6 shadow-sm ${
                  index === 1
                    ? "border-brand-gold ring-2 ring-brand-gold/40"
                    : "border-brand-border"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-brand-charcoal">
                    {pack.name}
                  </h3>
                  {index === 1 ? <Badge tone="gold">Most popular</Badge> : null}
                </div>
                <p className="mt-2 font-display text-3xl font-bold text-brand-navy">
                  {pack.points.toLocaleString("en-US")} pts
                </p>
                <p className="mt-1 text-lg font-semibold text-brand-charcoal">
                  {formatUsd(pack.usd)}
                </p>
                <p className="mt-1 text-xs text-brand-slate">
                  {formatUsd(pack.usd / pack.points)} per point
                </p>
                <p className="mt-3 flex-1 text-sm text-brand-slate">{pack.blurb}</p>
                <Button asChild className="mt-5 bg-brand-navy text-white hover:bg-brand-navy-light">
                  <Link to="/wallet">Buy {pack.name.toLowerCase()} pack</Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-charcoal">Corporate packs</h2>
            <p className="mt-1 text-sm text-brand-slate">For companies, brands and banks.</p>
            <ul className="mt-4 divide-y divide-brand-border rounded-lg border border-brand-border bg-card">
              {packsInGroup("corporate").map((pack) => (
                <li key={pack.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-brand-charcoal">{pack.name}</span>
                    <span className="block text-xs text-brand-slate">
                      {pack.points.toLocaleString("en-US")} pts · {pack.blurb}
                    </span>
                  </span>
                  <span className="font-display text-lg font-bold text-brand-navy">{formatUsd(pack.usd)}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-3">
              <Link to="/wallet">Buy in your wallet</Link>
            </Button>
          </div>
          <div className="space-y-6">
            {packsInGroup("academic").map((pack) => (
              <article key={pack.id} className="rounded-lg border border-brand-border bg-card p-5">
                <Badge tone="gold">Masters &amp; PhD students</Badge>
                <h3 className="mt-2 font-display text-lg font-semibold text-brand-charcoal">{pack.name}</h3>
                <p className="mt-1 font-display text-2xl font-bold text-brand-navy">
                  {pack.points.toLocaleString("en-US")} pts · {formatUsd(pack.usd)}
                </p>
                <p className="mt-2 text-sm text-brand-slate">{pack.blurb}</p>
                <Button asChild variant="outline" className="mt-3">
                  <Link to="/wallet">Upload ID and buy</Link>
                </Button>
              </article>
            ))}
            <article className="rounded-lg border-2 border-brand-gold bg-card p-5">
              <Badge tone="gold">Yearly plan</Badge>
              <h3 className="mt-2 font-display text-lg font-semibold text-brand-charcoal">{governmentPlan.name}</h3>
              <p className="mt-1 font-display text-2xl font-bold text-brand-navy">
                From {formatUsd(governmentPlan.usdPerYear)} / year
              </p>
              <p className="mt-2 text-sm text-brand-slate">{governmentPlan.summary}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-brand-slate">
                {governmentPlan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <Button asChild className="mt-4 bg-brand-navy text-white hover:bg-brand-navy-light">
                <Link to="/contact">Talk to our team</Link>
              </Button>
            </article>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold text-brand-charcoal">How points work</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step) => (
              <li key={step.title} className="rounded-lg border border-brand-border bg-card p-4">
                <step.icon className="h-5 w-5 text-brand-gold-dark" />
                <p className="mt-2 text-sm font-semibold text-brand-charcoal">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-brand-slate">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <InfoNote>
            Example: {exampleAnswers} answers × {exampleReward} points ={" "}
            {examplePoints.toLocaleString("en-US")} points. Each person who finishes gets{" "}
            {formatUsd(earnerRewardUsd(exampleReward))}.
          </InfoNote>
          <InfoNote>
            Every survey tool is included for everyone: all question types, skip logic, branding and
            results. You only pay for answers.
          </InfoNote>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
            <Link to="/surveys/create">Create a survey</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/wallet">Go to wallet</Link>
          </Button>
        </div>

        <div className="mt-8">
          <ComplianceBanner variant="survey" />
        </div>
      </div>
    </div>
  );
}

export default SurveyPlansPage;
