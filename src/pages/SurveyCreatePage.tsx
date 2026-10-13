import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { SurveyBuilder } from "@/components/surveys/SurveyBuilder";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function SurveyCreatePage() {
  const { user, canCreateSurveys, roleLabel } = useAuth();

  if (!canCreateSurveys) {
    return (
      <div className="fmie-container max-w-2xl py-20">
        <div className="rounded-lg border border-brand-border bg-white p-8 text-center">
          <Lock className="mx-auto h-10 w-10 text-brand-slate" />
          <h1 className="mt-4 font-display text-2xl font-bold text-brand-charcoal">
            Survey creation needs an account
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-brand-slate">
            You are browsing as {roleLabel.toLowerCase()}. Sign in with any valid email, or switch
            to the Survey Creator persona from the header, to open the interactive builder.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
              <Link to="/signin" search={{ next: "/surveys/create" }}>
                Sign in to continue
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/surveys">Browse surveys instead</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fmie-container py-10">
      <div className="mb-8 max-w-3xl">
        <p className="fmie-eyebrow">Interactive survey builder</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-brand-charcoal sm:text-4xl">
          Build a survey that will survive review
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-brand-slate">
          Four steps: details, plan and tier, questions with conditional logic, then review and
          submit. Signed in as {user?.name} — everything you save appears in your dashboard
          immediately.
        </p>
      </div>
      <SurveyBuilder />
    </div>
  );
}

export default SurveyCreatePage;
