import { LIFE_STAGES } from "@/lib/audience";
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
import { useServerFn } from "@tanstack/react-start";

import { surveyCategories, surveyPointRules } from "@/config/site";
import { formatUsd } from "@/lib/outlet-pricing";
import {
  earnerRewardUsd,
  isValidResponseTarget,
  isValidReward,
  pointsNeeded,
  pointsShortfall,
} from "@/lib/survey-points";
import { getWalletSummary } from "@/lib/wallet.functions";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import type { LogicOperator, SurveyCategory, SurveyQuestion, SurveyQuestionType } from "@/types";
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
  targetLifeStages: string[];
  rewardPoints: number;
  responseTarget: number;
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
  const loadWallet = useServerFn(getWalletSummary);
  const [pointBalance, setPointBalance] = useState<number | null>(null);
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
      targetLifeStages: [],
      rewardPoints: surveyPointRules.defaultRewardPoints,
      responseTarget: surveyPointRules.defaultResponses,
      isAnonymous: true,
      isBranded: false,
      openingDate: today.toISOString().slice(0, 10),
      closingDate: closing.toISOString().slice(0, 10),
      consentNotice: DEFAULT_CONSENT,
      tags: "",
      questions: [],
    };
  });

  // The researcher's saved point balance decides whether a survey can be sent for review.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    loadWallet()
      .then((summary) => {
        if (alive) setPointBalance(summary.points);
      })
      .catch(() => {
        if (alive) setPointBalance(0);
      });
    return () => {
      alive = false;
    };
  }, [user, loadWallet]);

  const totalPoints = pointsNeeded(draft.rewardPoints, draft.responseTarget);
  const shortfall =
    pointBalance === null
      ? 0
      : pointsShortfall(pointBalance, draft.rewardPoints, draft.responseTarget);

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
    }
    if (target >= 2) {
      if (!isValidReward(draft.rewardPoints)) {
        problems.push(
          `Each answer must pay between ${surveyPointRules.minRewardPoints} and ${surveyPointRules.maxRewardPoints} points.`,
        );
      }
      if (!isValidResponseTarget(draft.responseTarget)) {
        problems.push(
          `Ask for between ${surveyPointRules.minResponses} and ${surveyPointRules.maxResponses.toLocaleString("en-US")} answers.`,
        );
      }
    }
    if (target >= 4 && shortfall > 0) {
      problems.push(
        `You need ${shortfall.toLocaleString("en-US")} more points to pay for these answers. Buy points in your wallet, or save as a draft.`,
      );
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
      const pointsProblem = problems.some(
        (problem) => problem.includes("points") || problem.includes("answers"),
      );
      const questionProblem = problems.some(
        (problem) => problem.includes("question") || problem.includes("Choice"),
      );
      setStep(questionProblem ? 2 : pointsProblem ? 1 : 0);
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
      targetLifeStages: draft.targetLifeStages,
      planId: "pay-as-you-go",
      rewardPoints: draft.rewardPoints,
      responseLimit: draft.responseTarget,
      isAnonymous: draft.isAnonymous,
      isBranded: draft.isBranded,
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

  const steps = ["Details", "Points & answers", "Questions", "Review & submit"];

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
              <Field label="Who can answer? (leave empty for everyone)">
                <div className="flex flex-wrap gap-2">
                  {LIFE_STAGES.map((stage) => {
                    const on = draft.targetLifeStages.includes(stage);
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() =>
                          patch({
                            targetLifeStages: on
                              ? draft.targetLifeStages.filter((item) => item !== stage)
                              : [...draft.targetLifeStages, stage],
                          })
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${on ? "border-brand-navy bg-brand-navy text-brand-cream" : "border-border text-brand-slate"}`}
                      >
                        {stage}
                      </button>
                    );
                  })}
                </div>
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
                Pay as you go. Choose how many points each completed answer pays and how many
                answers you want. Every survey tool is included.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Points paid per answer"
                  hint={`At least ${surveyPointRules.minRewardPoints}. The person answering gets ${formatUsd(earnerRewardUsd(draft.rewardPoints))}.`}
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    min={surveyPointRules.minRewardPoints}
                    max={surveyPointRules.maxRewardPoints}
                    value={Number.isFinite(draft.rewardPoints) ? draft.rewardPoints : ""}
                    onChange={(event) =>
                      patch({ rewardPoints: Math.floor(Number(event.target.value)) })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field
                  label="Answers wanted"
                  hint={`Between ${surveyPointRules.minResponses} and ${surveyPointRules.maxResponses.toLocaleString("en-US")}. The survey closes when it reaches this number.`}
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    min={surveyPointRules.minResponses}
                    max={surveyPointRules.maxResponses}
                    value={Number.isFinite(draft.responseTarget) ? draft.responseTarget : ""}
                    onChange={(event) =>
                      patch({ responseTarget: Math.floor(Number(event.target.value)) })
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
              <div className="grid gap-3 rounded-lg border border-brand-border bg-brand-cream p-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-brand-slate">
                    Points needed
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-brand-navy">
                    {totalPoints.toLocaleString("en-US")}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-brand-slate">
                    Your points
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-brand-charcoal">
                    {pointBalance === null ? "…" : pointBalance.toLocaleString("en-US")}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-brand-slate">
                    Still needed
                  </p>
                  <p
                    className={cn(
                      "mt-1 font-display text-xl font-bold",
                      shortfall > 0 ? "text-warning" : "text-success",
                    )}
                  >
                    {shortfall > 0 ? shortfall.toLocaleString("en-US") : "None"}
                  </p>
                </div>
              </div>
              {shortfall > 0 ? (
                <InfoNote>
                  You can keep building and save a draft now. Before sending it for review, top up
                  your points.{" "}
                  <Link to="/wallet" className="font-semibold text-brand-navy underline">
                    Buy points
                  </Link>{" "}
                  ·{" "}
                  <Link to="/surveys/plans" className="font-semibold text-brand-navy underline">
                    See point prices
                  </Link>
                </InfoNote>
              ) : (
                <InfoNote>
                  When your survey is approved, these points are held for it. Each completed answer
                  uses its points. Points not used when it closes come back to you.
                </InfoNote>
              )}
              <ToggleRow
                label="Add your brand"
                description="Show your organisation's logo and colours on the survey."
                checked={draft.isBranded}
                onChange={(value) => patch({ isBranded: value })}
              />
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-brand-slate">
                  {draft.questions.length} question{draft.questions.length === 1 ? "" : "s"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
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
                        <details className="rounded-md border border-brand-border bg-white p-3">
                          <summary className="cursor-pointer text-xs font-semibold text-brand-navy">
                            Skip logic (show this question only when…)
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
                    <dt className="inline font-semibold text-brand-charcoal">Points: </dt>
                    <dd className="inline text-brand-slate">
                      {draft.rewardPoints} per answer × {draft.responseTarget} answers ={" "}
                      {totalPoints.toLocaleString("en-US")}
                    </dd>
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
            with a member account to publish.
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
