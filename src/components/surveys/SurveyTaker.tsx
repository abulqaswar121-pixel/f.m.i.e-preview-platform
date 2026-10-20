import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { Button } from "@/components/ui/button";
import { countries } from "@/config/site";
import { api, visibleQuestions } from "@/services/api";
import type { Survey, SurveyQuestion } from "@/types";
import { cn } from "@/lib/utils";

const SEGMENTS = [
  "Owner / founder",
  "Finance lead",
  "Operations lead",
  "Consultant",
  "In-house researcher",
  "Public sector",
  "Consumer",
  "Student",
];

type Answers = Record<string, string | string[] | number>;

function QuestionControl({
  question,
  value,
  onChange,
  invalid,
}: {
  question: SurveyQuestion;
  value: string | string[] | number | undefined;
  onChange: (next: string | string[] | number) => void;
  invalid: boolean;
}) {
  const shell = cn(
    "rounded-lg border bg-white p-5",
    invalid ? "border-danger ring-1 ring-danger/40" : "border-brand-border",
  );

  if (question.type === "single_choice" || question.type === "likert") {
    return (
      <div className={shell} role="radiogroup" aria-label={question.prompt}>
        <div
          className={cn(
            "grid gap-2",
            question.type === "likert" ? "sm:grid-cols-5" : "sm:grid-cols-2",
          )}
        >
          {(question.options ?? []).map((option) => {
            const selected = value === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(option)}
                className={cn(
                  "rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                  selected
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-brand-border bg-white text-brand-charcoal hover:border-brand-navy/50 hover:bg-brand-cream",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "multi_choice") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className={shell}>
        <div className="grid gap-2 sm:grid-cols-2">
          {(question.options ?? []).map((option) => {
            const checked = selected.includes(option);
            return (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm",
                  checked
                    ? "border-brand-navy bg-brand-navy/5 text-brand-charcoal"
                    : "border-brand-border text-brand-charcoal hover:border-brand-navy/50",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    onChange(
                      event.target.checked
                        ? [...selected, option]
                        : selected.filter((entry) => entry !== option),
                    )
                  }
                  className="mt-0.5 h-4 w-4 accent-[#0A2E68]"
                />
                {option}
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "rating") {
    const max = question.ratingMax ?? 10;
    const current = typeof value === "number" ? value : undefined;
    return (
      <div className={shell}>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: max }, (_, index) => index + 1).map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              aria-pressed={current === score}
              className={cn(
                "h-10 w-10 rounded-md border text-sm font-semibold tabular-nums transition-colors",
                current === score
                  ? "border-brand-gold bg-brand-gold text-brand-navy-dark"
                  : "border-brand-border bg-white text-brand-charcoal hover:border-brand-gold",
              )}
            >
              {score}
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-[11px] text-brand-slate">
          <span>{question.scaleLabels?.left ?? "Low"}</span>
          <span>{question.scaleLabels?.right ?? "High"}</span>
        </div>
      </div>
    );
  }

  if (question.type === "short_text") {
    return (
      <div className={shell}>
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Your answer in a sentence"
          className="w-full rounded-md border border-brand-border bg-brand-cream px-3 py-2.5 text-sm text-brand-charcoal focus:border-brand-navy focus:bg-white focus:outline-none"
        />
      </div>
    );
  }

  return (
    <div className={shell}>
      <textarea
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        placeholder="Write as much or as little as you like"
        className="w-full rounded-md border border-brand-border bg-brand-cream px-3 py-2.5 text-sm leading-relaxed text-brand-charcoal focus:border-brand-navy focus:bg-white focus:outline-none"
      />
    </div>
  );
}

export function SurveyTaker({ survey }: { survey: Survey }) {
  const [stage, setStage] = useState<"intro" | "taking" | "thanks">("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [humanCheck, setHumanCheck] = useState(false);
  const [segment, setSegment] = useState(SEGMENTS[0] ?? "Consumer");
  const [country, setCountry] = useState<string>(countries[0] ?? "United Kingdom");
  const [startedAt, setStartedAt] = useState<number>(0);

  const visible = useMemo(() => visibleQuestions(survey, answers), [survey, answers]);
  const question = visible[index];
  const isLast = index === visible.length - 1;

  const setValue = (questionId: string, next: string | string[] | number) => {
    setAnswers((current) => {
      const updated: Answers = { ...current, [questionId]: next };
      // Drop answers to questions that conditional logic has now hidden.
      for (const candidate of survey.questions) {
        if (!visibleQuestions(survey, updated).some((entry) => entry.id === candidate.id)) {
          delete updated[candidate.id];
        }
      }
      return updated;
    });
    setError(undefined);
  };

  const validate = (target: SurveyQuestion): string | undefined => {
    if (!target.required) return undefined;
    const value = answers[target.id];
    if (value === undefined || value === "") return "This question is required.";
    if (Array.isArray(value) && value.length === 0) return "Select at least one option.";
    return undefined;
  };

  const next = () => {
    if (!question) return;
    const problem = validate(question);
    if (problem) {
      setError(problem);
      return;
    }
    setError(undefined);
    if (isLast) {
      void submit();
      return;
    }
    setIndex((current) => current + 1);
  };

  const back = () => {
    setError(undefined);
    if (index === 0) {
      setStage("intro");
      return;
    }
    setIndex((current) => current - 1);
  };

  const submit = async () => {
    setSubmitting(true);
    const durationSeconds = Math.max(30, Math.round((Date.now() - startedAt) / 1000));
    await api.surveys.submitResponse(survey.id, answers, {
      completed: true,
      durationSeconds,
      segment,
      country,
    });
    setSubmitting(false);
    setStage("thanks");
  };

  if (survey.status !== "active") {
    return (
      <div className="rounded-lg border border-brand-border bg-white p-8 text-center">
        <h3 className="font-display text-xl font-semibold text-brand-charcoal">
          This survey is not open for responses
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-brand-slate">
          {survey.status === "closed"
            ? "The closing date has passed. Results remain available to the survey owner and, where published, to readers."
            : "It is awaiting editorial moderation or is still in draft."}
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/surveys">Back to the marketplace</Link>
        </Button>
      </div>
    );
  }

  if (stage === "intro") {
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-brand-border bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={survey.tier === "premium" ? "gold" : "navy"}>{survey.tier} survey</Badge>
            <Badge tone="cream">{survey.category}</Badge>
            {survey.isAnonymous ? <Badge tone="success">Anonymous</Badge> : null}
            {survey.isBranded ? <Badge tone="info">Branded</Badge> : null}
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-brand-charcoal">
            {survey.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-slate">{survey.objective}</p>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-md bg-brand-cream px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-slate">
                Questions
              </dt>
              <dd className="mt-1 font-semibold text-brand-charcoal">{survey.questions.length}</dd>
            </div>
            <div className="rounded-md bg-brand-cream px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-slate">
                Est. time
              </dt>
              <dd className="mt-1 font-semibold text-brand-charcoal">
                {survey.estimatedMinutes} minutes
              </dd>
            </div>
            <div className="rounded-md bg-brand-cream px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-slate">
                Responses so far
              </dt>
              <dd className="mt-1 font-semibold text-brand-charcoal">
                {survey.responseCount.toLocaleString("en-GB")}
              </dd>
            </div>
          </dl>
          <div className="mt-5 rounded-md border border-brand-border bg-brand-cream p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-navy">
              <ShieldCheck className="h-4 w-4" /> Consent notice
            </p>
            <p className="mt-2 text-sm leading-relaxed text-brand-slate">{survey.consentNotice}</p>
          </div>
          {survey.incentive ? (
            <p className="mt-3 text-xs text-brand-slate">Incentive: {survey.incentive}</p>
          ) : null}
          <p className="mt-2 rounded-md border border-brand-gold/60 bg-brand-gold/10 px-3 py-2 text-xs font-semibold text-brand-charcoal">
            Cash reward: ₦{survey.rewardNaira.toLocaleString("en-NG")} credited to your wallet the
            moment your submission is recorded.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              className="bg-brand-navy text-white hover:bg-brand-navy-light"
              onClick={() => {
                setStage("taking");
                setStartedAt(Date.now());
                setIndex(0);
              }}
            >
              Begin survey <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline">
              <Link to="/surveys">Not now</Link>
            </Button>
          </div>
        </div>
        <ComplianceBanner variant="survey" />
      </div>
    );
  }

  if (stage === "thanks") {
    return (
      <div className="rounded-lg border border-success/40 bg-white p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h2 className="mt-4 font-display text-2xl font-bold text-brand-charcoal">
          Thank you for participating
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-brand-slate">
          Your response has been recorded against <strong>{survey.title}</strong>. Responses are
          stored in the preview database and appear immediately in the owner's analytics.
        </p>
        <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-brand-slate">
          Remember: results from self-selected respondents describe the people who answered, not a
          population. Please keep that limitation in mind if you share the findings.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
            <Link to="/surveys/$id" params={{ id: survey.id }} hash="results">
              View published results
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/surveys">Find another survey</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="rounded-lg border border-brand-border bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between text-xs font-medium text-brand-slate">
        <span>
          Question {index + 1} of {visible.length}
        </span>
        <span className="tabular-nums">
          {Math.round(((index + 1) / visible.length) * 100)}% complete
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-border">
        <div
          className="h-full rounded-full bg-brand-gold transition-all"
          style={{ width: `${((index + 1) / visible.length) * 100}%` }}
        />
      </div>

      <h3 className="mt-6 font-display text-xl font-semibold text-brand-charcoal">
        {question.prompt}
      </h3>
      {question.helpText ? (
        <p className="mt-1.5 text-sm text-brand-slate">{question.helpText}</p>
      ) : null}
      <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-brand-slate">
        {question.type.replace(/_/g, " ")}
        {question.required ? " · required" : " · optional"}
      </p>
      {question.logic ? (
        <p className="mt-2 rounded-md border border-brand-gold/50 bg-brand-gold/10 px-3 py-2 text-[11px] text-brand-charcoal">
          Conditional logic: {question.logic.description}
        </p>
      ) : null}

      <div className="mt-5">
        <QuestionControl
          question={question}
          value={answers[question.id]}
          onChange={(next) => setValue(question.id, next)}
          invalid={Boolean(error)}
        />
      </div>

      {error ? <p className="mt-3 text-sm font-medium text-danger">{error}</p> : null}

      {isLast ? (
        <div className="mt-6 rounded-md border border-brand-border bg-brand-cream p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-slate">
            About you
          </p>
          {survey.isAnonymous ? (
            <p className="mt-2 text-sm text-brand-slate">
              This survey is anonymous. No segment or location is recorded with your answers.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-brand-slate">
                Professional segment
                <select
                  value={segment}
                  onChange={(event) => setSegment(event.target.value)}
                  className="mt-1 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none"
                >
                  {SEGMENTS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-brand-slate">
                Country
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="mt-1 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none"
                >
                  {countries.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between border-t border-brand-border pt-5">
        <Button variant="outline" onClick={back}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {isLast ? (
          <label className="mb-4 flex items-start gap-3 rounded-md border border-brand-border bg-brand-cream p-3 text-xs font-medium text-brand-charcoal">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={humanCheck}
              onChange={(event) => setHumanCheck(event.target.checked)}
            />
            Bot check: confirm you are a human respondent. Automated submissions are rejected to
            protect research quality.
          </label>
        ) : null}
        <Button
          className="bg-brand-navy text-white hover:bg-brand-navy-light"
          onClick={next}
          disabled={submitting || (isLast && !humanCheck)}
        >
          {submitting ? "Recording…" : isLast ? "Submit response" : "Next question"}
          {!submitting && !isLast ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </div>
    </div>
  );
}

export default SurveyTaker;
