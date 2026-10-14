import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  GripVertical,
  Plus,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { ComplianceBanner } from "@/components/common/ComplianceBanner";
import { InfoNote } from "@/components/common/Primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, surveyCategories } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import type {
  LogicOperator,
  SurveyCategory,
  SurveyPlan,
  SurveyQuestion,
  SurveyQuestionType,
} from "@/types";
import { cn } from "@/lib/utils";

const DEFAULT_CONSENT =
  "Your responses are anonymous and will be reported only in aggregate. Do not enter personal, medical or financial identifiers. Participation is voluntary and you may stop at any point without giving a reason.";

const QUESTION_TYPES: { id: SurveyQuestionType; label: string; hint: string }[] = [
  { id: "single_choice", label: "Single choice", hint: "One option from a list" },
  { id: "multi_choice", label: "Multiple choice", hint: "Any number of options" },
  { id: "rating", label: "Rating scale", hint: "1–10 numeric scale" },
  { id: "likert", label: "Likert scale", hint: "Agreement scale, five points" },
  { id: "short_text", label: "Short answer", hint: "One sentence" },
  { id: "long_text", label: "Long answer", hint: "Free text paragraph" },
];

const LIKERT_DEFAULT = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

interface BuilderDraft {
  title: string;
  category: string;
  objective: string;
  audience: string;
  planId: string;
  isAnonymous: boolean;
  isBranded: boolean;
  openingDate: string;
  closingDate: string;
  consentNotice: string;
  tags: string;
  questions: SurveyQuestion[];
}

function blankQuestion(type: SurveyQuestionType, index: number): SurveyQuestion {
  const base: SurveyQuestion = {
    id: `q-${Date.now().toString(36)}-${index}`,
    prompt: "",
    type,
    required: true,
  };
  if (type === "single_choice" || type === "multi_choice") {
    base.options = ["Option one", "Option two", "Option three"];
  }
  if (type === "likert") {
    base.options = [...LIKERT_DEFAULT];
    base.scaleLabels = { left: "Strongly disagree", right: "Strongly agree" };
  }
  if (type === "rating") {
    base.ratingMax = 10;
    base.scaleLabels = { left: "Low", right: "High" };
  }
  return base;
}

export function SurveyBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [plans, setPlans] = useState<SurveyPlan[]>([]);
  const [saving, setSaving] = useState<"draft" | "moderation" | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draft, setDraft] = useState<BuilderDraft>(() => {
    const today = new Date();
    const closing = new Date(today.getTime() + 90 * 86_400_000);
    return {
      title: "",
      category: surveyCategories[0] ?? "Consumer Behaviour",
      objective: "",
      audience: "",
      planId: "plan-free",
      isAnonymous: true,
      isBranded: false,
      openingDate: today.toISOString().slice(0, 10),
      closingDate: closing.toISOString().slice(0, 10),
      consentNotice: DEFAULT_CONSENT,
      tags: "",
      questions: [],
    };
  });

  // Plan limits are administrator-configurable, so they are read from the
  // service layer after mount rather than hardcoded in the builder.
  useEffect(() => {
    let alive = true;
    api.surveys.plans().then((result) => {
      if (alive) setPlans(result);
    });
    return () => {
      alive = false;
    };
  }, []);

  const plan = plans.find((candidate) => candidate.id === draft.planId);
  const questionLimit = plan?.questionLimit ?? null;
  const overLimit = questionLimit !== null && draft.questions.length > questionLimit;

  const patch = (next: Partial<BuilderDraft>) => setDraft((current) => ({ ...current, ...next }));

  const patchQuestion = (id: string, next: Partial<SurveyQuestion>) => {
    patch({
      questions: draft.questions.map((question) =>
        question.id === id ? { ...question, ...next } : question,
      ),
    });
  };

  const moveQuestion = (id: string, direction: -1 | 1) => {
    const index = draft.questions.findIndex((question) => question.id === id);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= draft.questions.length) return;
    const next = [...draft.questions];
    const [moved] = next.splice(index, 1);
    if (moved) next.splice(target, 0, moved);
    patch({ questions: next });
  };

  const validateStep = (target: number): string[] => {
    const problems: string[] = [];
    if (target >= 1) {
      if (draft.title.trim().length < 8)
        problems.push("Give the survey a descriptive title (at least 8 characters).");
      if (draft.objective.trim().length < 30)
        problems.push("State the research objective in at least one full sentence.");
      if (draft.audience.trim().length < 10) problems.push("Describe who the survey is for.");
      if (new Date(draft.closingDate).getTime() <= new Date(draft.openingDate).getTime()) {
        problems.push("The closing date must be after the opening date.");
      }
    }
    if (target >= 3) {
      if (draft.questions.length === 0) problems.push("Add at least one question.");
      if (draft.questions.some((question) => question.prompt.trim().length < 5)) {
        problems.push("Every question needs a prompt of at least 5 characters.");
      }
      if (
        draft.questions.some(
          (question) =>
            (question.type === "single_choice" || question.type === "multi_choice") &&
            (question.options?.length ?? 0) < 2,
        )
      ) {
        problems.push("Choice questions need at least two options.");
      }
      if (overLimit) {
        problems.push(
          `The ${plan?.name ?? "selected"} plan allows ${questionLimit} questions. Upgrade the tier or remove questions.`,
        );
      }
    }
    return problems;
  };

  const goTo = (target: number) => {
    const problems = validateStep(target);
    setErrors(problems);
    if (problems.length > 0) return;
    setStep(target);
  };

  const persist = async (submitForModeration: boolean) => {
    if (!user) return;
    const problems = submitForModeration ? validateStep(4) : validateStep(1);
    setErrors(problems);
    if (problems.length > 0) {
      setStep(
        problems.some(
          (problem) =>
            problem.includes("question") ||
            problem.includes("Choice") ||
            problem.includes("plan allows"),
        )
          ? 2
          : 0,
      );
      return;
    }
    setSaving(submitForModeration ? "moderation" : "draft");
    const organization = user.organization
      ? await api.users.organizationByName(user.organization)
      : undefined;
    const created = await api.surveys.create({
      title: draft.title.trim(),
      category: draft.category as SurveyCategory,
      objective: draft.objective.trim(),
      audience: draft.audience.trim(),
      planId: draft.planId,
      isAnonymous: draft.isAnonymous,
      isBranded: draft.isBranded && plan?.tier !== "free",
      closingDate: new Date(`${draft.closingDate}T23:59:59`).toISOString(),
      openingDate: new Date(`${draft.openingDate}T00:00:00`).toISOString(),
      consentNotice: draft.consentNotice.trim() || DEFAULT_CONSENT,
      tags: draft.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      questions: draft.questions,
      creatorId: user.id,
      creatorName: user.name,
      organizationId: organization?.id,
      submitForModeration,
    });
    setSaving(null);
    toast.success(submitForModeration ? "Submitted for editorial moderation" : "Draft saved", {
      description: submitForModeration
        ? `${created.title} is queued for review. You will see status changes in your dashboard.`
        : `${created.title} is saved privately in your dashboard.`,
    });
    void navigate({ to: "/dashboard", search: { tab: "surveys" } });
  };

  const steps = ["Details", "Plan & tier", "Questions", "Review & submit"];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="rounded-lg border border-brand-border bg-white">
        <ol className="flex flex-wrap items-center gap-1 border-b border-brand-border px-5 py-4">
          {steps.map((label, index) => (
            <li key={label} className="flex items-center">
              <button
                type="button"
                onClick={() => (index < step ? setStep(index) : goTo(index))}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold",
                  index === step
                    ? "bg-brand-navy text-white"
                    : index < step
                      ? "bg-brand-navy/10 text-brand-navy"
                      : "text-brand-slate",
                )}
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px]">
                  {index < step ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                {label}
              </button>
              {index < steps.length - 1 ? (
                <span className="mx-1 h-px w-4 bg-brand-border" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>

        <div className="p-5 sm:p-7">
          {errors.length > 0 ? (
            <ul className="mb-5 space-y-1 rounded-md border border-danger/40 bg-danger/8 px-4 py-3 text-sm text-danger">
              {errors.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          ) : null}

          {step === 0 ? (
            <div className="space-y-5">
              <Field label="Survey title" required>
                <input
                  value={draft.title}
                  onChange={(event) => patch({ title: event.target.value })}
                  placeholder="e.g. 2026 Regional Adoption of Instant Payment Rails"
                  className={inputClass}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Category" required>
                  <select
                    value={draft.category}
                    onChange={(event) => patch({ category: event.target.value })}
                    className={inputClass}
                  >
                    {surveyCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tags (comma separated)">
                  <input
                    value={draft.tags}
                    onChange={(event) => patch({ tags: event.target.value })}
                    placeholder="payments, treasury, cross-border"
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field
                label="Research objective"
                required
                hint="What decision will this research inform? A reviewer reads this first."
              >
                <textarea
                  rows={4}
                  value={draft.objective}
                  onChange={(event) => patch({ objective: event.target.value })}
                  placeholder="Establish how… so that… can decide…"
                  className={inputClass}
                />
              </Field>
              <Field label="Target audience & eligibility" required>
                <textarea
                  rows={2}
                  value={draft.audience}
                  onChange={(event) => patch({ audience: event.target.value })}
                  placeholder="Finance leads and treasury managers at organisations transacting in…"
                  className={inputClass}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Opens">
                  <input
                    type="date"
                    value={draft.openingDate}
                    onChange={(event) => patch({ openingDate: event.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Closes" required>
                  <input
                    type="date"
                    value={draft.closingDate}
                    onChange={(event) => patch({ closingDate: event.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field
                label="Consent notice shown to respondents"
                hint="A compliant default is provided. Edit only if your legal review requires it."
              >
                <textarea
                  rows={3}
                  value={draft.consentNotice}
                  onChange={(event) => patch({ consentNotice: event.target.value })}
                  className={inputClass}
                />
              </Field>
              <ToggleRow
                label="Collect responses anonymously"
                description="No segment or location is stored with answers. Recommended unless organisational attribution is required."
                checked={draft.isAnonymous}
                onChange={(value) => patch({ isAnonymous: value })}
              />
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-brand-slate">
                Plans set question limits, response caps and available features. They are configured
                by the F.M.I.E administrator, not hardcoded — what you see here is the live
                configuration.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {plans.map((option) => {
                  const selected = option.id === draft.planId;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        patch({
                          planId: option.id,
                          isBranded: option.tier === "free" ? false : draft.isBranded,
                        })
                      }
                      className={cn(
                        "rounded-lg border p-4 text-left transition-colors",
                        selected
                          ? "border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy"
                          : "border-brand-border hover:border-brand-navy/50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-lg font-semibold text-brand-charcoal">
                          {option.name}
                        </span>
                        {selected ? <Check className="h-4 w-4 text-brand-navy" /> : null}
                      </div>
                      <p className="mt-1 font-display text-2xl font-bold text-brand-navy">
                        {option.price === 0 ? "Free" : formatCurrency(option.price)}
                        <span className="ml-1 text-xs font-normal text-brand-slate">
                          {option.price === 0
                            ? ""
                            : option.billingPeriod === "annual"
                              ? "/ year"
                              : "one-off"}
                        </span>
                      </p>
                      <ul className="mt-3 space-y-1 text-xs text-brand-slate">
                        <li>
                          {option.questionLimit === null ? "Unlimited" : option.questionLimit}{" "}
                          questions ·{" "}
                          {option.responseLimit === null
                            ? "unlimited"
                            : option.responseLimit.toLocaleString("en-GB")}{" "}
                          responses
                        </li>
                        <li>{option.features.length} included features</li>
                        {option.tier !== "free" ? (
                          <li>Conditional logic, export & branding</li>
                        ) : null}
                      </ul>
                    </button>
                  );
                })}
              </div>
              {plan ? (
                <InfoNote>
                  Selected: {plan.name} —{" "}
                  {plan.questionLimit === null
                    ? "unlimited questions"
                    : `up to ${plan.questionLimit} questions`}
                  ,{" "}
                  {plan.responseLimit === null
                    ? "unlimited responses"
                    : `${plan.responseLimit.toLocaleString("en-GB")} responses per survey`}
                  .
                  {plan.exclusions.length > 0
                    ? ` Not included: ${plan.exclusions.join("; ").toLowerCase()}.`
                    : ""}
                </InfoNote>
              ) : null}
              <ToggleRow
                label="Brand the survey environment"
                description="Premium and Corporate plans can apply your organisation's logo mark and colour treatment."
                checked={draft.isBranded && plan?.tier !== "free"}
                disabled={plan?.tier === "free"}
                onChange={(value) => patch({ isBranded: value })}
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-brand-slate">
                  {draft.questions.length} question{draft.questions.length === 1 ? "" : "s"}
                  {questionLimit !== null
                    ? ` of ${questionLimit} allowed on the ${plan?.name} plan`
                    : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      disabled={overLimit}
                      onClick={() =>
                        patch({
                          questions: [
                            ...draft.questions,
                            blankQuestion(type.id, draft.questions.length),
                          ],
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-white px-3 py-1.5 text-xs font-medium text-brand-charcoal hover:border-brand-navy hover:bg-brand-cream disabled:opacity-40"
                      title={type.hint}
                    >
                      <Plus className="h-3 w-3" /> {type.label}
                    </button>
                  ))}
                </div>
              </div>
              {overLimit ? (
                <p className="rounded-md border border-warning/40 bg-warning/10 px-4 py-2 text-sm text-warning">
                  Question limit exceeded for the {plan?.name} plan. Remove questions or choose a
                  higher tier.
                </p>
              ) : null}
              {draft.questions.length === 0 ? (
                <p className="rounded-md border border-dashed border-brand-border bg-brand-cream px-4 py-8 text-center text-sm text-brand-slate">
                  No questions yet. Add a question type above — the live preview on the right
                  updates as you build.
                </p>
              ) : null}

              <ul className="space-y-4">
                {draft.questions.map((question, index) => (
                  <li
                    key={question.id}
                    className="rounded-lg border border-brand-border bg-brand-cream/60 p-4"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-1 h-4 w-4 shrink-0 text-brand-slate/60" />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="navy">Q{index + 1}</Badge>
                          <Badge tone="cream">{question.type.replace(/_/g, " ")}</Badge>
                          {question.required ? (
                            <Badge tone="muted">required</Badge>
                          ) : (
                            <Badge tone="muted">optional</Badge>
                          )}
                          <div className="ml-auto flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQuestion(question.id, -1)}
                              disabled={index === 0}
                              aria-label="Move up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveQuestion(question.id, 1)}
                              disabled={index === draft.questions.length - 1}
                              aria-label="Move down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-danger hover:text-danger"
                              onClick={() =>
                                patch({
                                  questions: draft.questions.filter(
                                    (entry) => entry.id !== question.id,
                                  ),
                                })
                              }
                              aria-label="Delete question"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <input
                          value={question.prompt}
                          onChange={(event) =>
                            patchQuestion(question.id, { prompt: event.target.value })
                          }
                          placeholder="Question prompt"
                          className={inputClass}
                        />
                        {question.type === "single_choice" ||
                        question.type === "multi_choice" ||
                        question.type === "likert" ? (
                          <div>
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-slate">
                              Options
                            </p>
                            <ul className="space-y-1.5">
                              {(question.options ?? []).map((option, optionIndex) => (
                                <li
                                  key={`${question.id}-opt-${optionIndex}`}
                                  className="flex gap-1.5"
                                >
                                  <input
                                    value={option}
                                    disabled={question.type === "likert"}
                                    onChange={(event) => {
                                      const options = [...(question.options ?? [])];
                                      options[optionIndex] = event.target.value;
                                      patchQuestion(question.id, { options });
                                    }}
                                    className={cn(
                                      inputClass,
                                      question.type === "likert" && "opacity-70",
                                    )}
                                  />
                                  {question.type !== "likert" ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label="Remove option"
                                      onClick={() =>
                                        patchQuestion(question.id, {
                                          options: (question.options ?? []).filter(
                                            (_, i) => i !== optionIndex,
                                          ),
                                        })
                                      }
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                            {question.type !== "likert" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() =>
                                  patchQuestion(question.id, {
                                    options: [
                                      ...(question.options ?? []),
                                      `Option ${(question.options?.length ?? 0) + 1}`,
                                    ],
                                  })
                                }
                              >
                                <Plus className="h-3 w-3" /> Add option
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="flex items-center gap-2 text-xs text-brand-slate">
                            <Switch
                              checked={question.required}
                              onCheckedChange={(value) =>
                                patchQuestion(question.id, { required: value })
                              }
                            />
                            Required
                          </label>
                          <input
                            value={question.helpText ?? ""}
                            onChange={(event) =>
                              patchQuestion(question.id, { helpText: event.target.value })
                            }
                            placeholder="Helper text (optional)"
                            className={cn(inputClass, "text-xs")}
                          />
                        </div>
                        {plan?.tier !== "free" ? (
                          <details className="rounded-md border border-brand-border bg-white p-3">
                            <summary className="cursor-pointer text-xs font-semibold text-brand-navy">
                              Conditional logic (Premium feature)
                            </summary>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                              <label className="text-[11px] text-brand-slate">
                                Show when question
                                <select
                                  value={question.logic?.questionId ?? ""}
                                  onChange={(event) => {
                                    const questionId = event.target.value;
                                    patchQuestion(question.id, {
                                      logic: questionId
                                        ? {
                                            questionId,
                                            operator: question.logic?.operator ?? "equals",
                                            value: question.logic?.value ?? "",
                                            description:
                                              question.logic?.description ?? "Shown conditionally.",
                                          }
                                        : undefined,
                                    });
                                  }}
                                  className={cn(inputClass, "mt-1 text-xs")}
                                >
                                  <option value="">No condition</option>
                                  {draft.questions
                                    .filter((entry) => entry.id !== question.id)
                                    .map((entry, entryIndex) => (
                                      <option key={entry.id} value={entry.id}>
                                        Q{entryIndex + 1}
                                      </option>
                                    ))}
                                </select>
                              </label>
                              <label className="text-[11px] text-brand-slate">
                                Operator
                                <select
                                  value={question.logic?.operator ?? "equals"}
                                  onChange={(event) =>
                                    patchQuestion(question.id, {
                                      logic: question.logic
                                        ? {
                                            ...question.logic,
                                            operator: event.target.value as LogicOperator,
                                          }
                                        : undefined,
                                    })
                                  }
                                  className={cn(inputClass, "mt-1 text-xs")}
                                  disabled={!question.logic}
                                >
                                  {(
                                    [
                                      "equals",
                                      "not_equals",
                                      "contains",
                                      "greater_than",
                                      "is_answered",
                                    ] as LogicOperator[]
                                  ).map((operator) => (
                                    <option key={operator} value={operator}>
                                      {operator.replace(/_/g, " ")}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="text-[11px] text-brand-slate">
                                Value
                                <input
                                  value={question.logic?.value ?? ""}
                                  disabled={!question.logic}
                                  onChange={(event) =>
                                    patchQuestion(question.id, {
                                      logic: question.logic
                                        ? { ...question.logic, value: event.target.value }
                                        : undefined,
                                    })
                                  }
                                  className={cn(inputClass, "mt-1 text-xs")}
                                />
                              </label>
                            </div>
                            {question.logic ? (
                              <p className="mt-2 text-[11px] text-brand-slate">
                                Respondents see this question only when the condition above is met.
                                The condition is shown to them as a note, and hidden questions drop
                                their answers automatically.
                              </p>
                            ) : null}
                          </details>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div className="rounded-lg border border-brand-border bg-brand-cream p-5">
                <h3 className="font-display text-xl font-semibold text-brand-charcoal">
                  {draft.title || "Untitled survey"}
                </h3>
                <p className="mt-2 text-sm text-brand-slate">{draft.objective}</p>
                <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="inline font-semibold text-brand-charcoal">Category: </dt>
                    <dd className="inline text-brand-slate">{draft.category}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-brand-charcoal">Plan: </dt>
                    <dd className="inline text-brand-slate">{plan?.name}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-brand-charcoal">Window: </dt>
                    <dd className="inline text-brand-slate">
                      {draft.openingDate} → {draft.closingDate}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-brand-charcoal">Anonymous: </dt>
                    <dd className="inline text-brand-slate">{draft.isAnonymous ? "Yes" : "No"}</dd>
                  </div>
                </dl>
              </div>
              <ol className="space-y-2">
                {draft.questions.map((question, index) => (
                  <li
                    key={question.id}
                    className="flex gap-3 rounded-md border border-brand-border bg-white px-4 py-3 text-sm"
                  >
                    <span className="font-semibold text-brand-navy">Q{index + 1}</span>
                    <span className="min-w-0 flex-1 text-brand-charcoal">
                      {question.prompt}
                      {question.logic ? (
                        <span className="mt-1 block text-[11px] text-brand-slate">
                          Conditional: {question.logic.operator.replace(/_/g, " ")} on{" "}
                          {question.logic.questionId}
                        </span>
                      ) : null}
                    </span>
                    <Badge tone="cream">{question.type.replace(/_/g, " ")}</Badge>
                  </li>
                ))}
              </ol>
              <ComplianceBanner variant="survey" />
              <InfoNote>
                Submitting sends this survey to the F.M.I.E editorial moderation queue. An
                administrator checks the objective, consent wording and question design before it
                goes live. Saving as a draft keeps it private.
              </InfoNote>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-5">
            <Button
              variant="outline"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => void persist(false)}
                disabled={saving !== null}
              >
                <Save className="h-4 w-4" /> {saving === "draft" ? "Saving…" : "Save draft"}
              </Button>
              {step < 3 ? (
                <Button
                  className="bg-brand-navy text-white hover:bg-brand-navy-light"
                  onClick={() => goTo(step + 1)}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  className="bg-brand-navy text-white hover:bg-brand-navy-light"
                  onClick={() => void persist(true)}
                  disabled={saving !== null}
                >
                  <Send className="h-4 w-4" />{" "}
                  {saving === "moderation" ? "Submitting…" : "Submit for moderation"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-brand-border bg-white">
          <button
            type="button"
            onClick={() => setPreviewOpen((open) => !open)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-brand-charcoal"
          >
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-brand-navy" /> Live respondent preview
            </span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", previewOpen && "rotate-180")}
            />
          </button>
          <div
            className={cn(
              "border-t border-brand-border px-4 py-4",
              !previewOpen && "hidden lg:block",
            )}
          >
            {draft.questions.length === 0 ? (
              <p className="text-xs text-brand-slate">
                Questions appear here exactly as respondents will see them.
              </p>
            ) : (
              <ol className="space-y-4">
                {draft.questions.map((question, index) => (
                  <li key={question.id}>
                    <p className="text-sm font-medium text-brand-charcoal">
                      {index + 1}. {question.prompt || "Untitled question"}
                      {question.required ? <span className="text-danger"> *</span> : null}
                    </p>
                    <p className="mt-1 text-[11px] text-brand-slate">
                      {question.type.replace(/_/g, " ")}
                      {question.options ? ` · ${question.options.length} options` : ""}
                      {question.logic ? " · conditional" : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-brand-border bg-white p-4">
          <h4 className="text-sm font-semibold text-brand-charcoal">Moderation checklist</h4>
          <ul className="mt-2 space-y-1.5 text-xs text-brand-slate">
            <li>· Objective states the decision the research informs</li>
            <li>· Consent notice present and comprehensible</li>
            <li>· No personally identifying or sensitive questions without justification</li>
            <li>· Response limits realistic for the stated audience</li>
            <li>· Results will be reported with the representativeness limitation</li>
          </ul>
          <p className="mt-3 text-[11px] text-brand-slate">
            Not signed in as a creator?{" "}
            <Link to="/signin" className="font-semibold text-brand-navy hover:underline">
              Sign in
            </Link>{" "}
            or switch persona from the header.
          </p>
        </div>
      </aside>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-slate/60 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy/30";

function Field({
  label,
  children,
  hint,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-slate">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint ? <span className="mt-1 block text-[11px] text-brand-slate">{hint}</span> : null}
    </label>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-brand-border bg-brand-cream px-4 py-3">
      <div>
        <p className="text-sm font-medium text-brand-charcoal">{label}</p>
        <p className="mt-0.5 text-xs text-brand-slate">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

export default SurveyBuilder;
