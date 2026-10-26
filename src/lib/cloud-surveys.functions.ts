import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { surveyRewardMinor } from "@/lib/survey-points";

const surveyInput = z.object({
  creatorName: z.string().max(120),
  title: z.string().trim().min(3).max(200),
  category: z.string().max(80),
  objective: z.string().max(2000),
  audience: z.string().max(1000),
  targetLifeStages: z.array(z.string().max(60)).max(20),
  questions: z.array(z.record(z.string(), z.unknown())).min(1).max(100),
  tags: z.array(z.string().max(40)).max(20),
  consentNotice: z.string().max(4000),
  isAnonymous: z.boolean(),
  openingDate: z.string().datetime(),
  closingDate: z.string().datetime(),
  rewardPoints: z.number().int().min(1).max(10_000),
  responseLimit: z.number().int().min(1).max(100_000),
});

async function isAdmin(context: { supabase: { rpc: (name: "has_role", args: { _user_id: string; _role: "administrator" }) => PromiseLike<{ data: boolean | null; error: unknown }> }; userId: string }): Promise<boolean> {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "administrator" });
  return !error && data === true;
}

/** Saves a survey for review and holds the creator's points for every wanted answer. */
export const submitCloudSurvey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => surveyInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: id, error } = await supabaseAdmin.rpc("submit_cloud_survey", {
      _creator: context.userId,
      _creator_name: data.creatorName,
      _title: data.title,
      _category: data.category,
      _objective: data.objective,
      _audience: data.audience,
      _target: data.targetLifeStages,
      _questions: data.questions as never,
      _tags: data.tags,
      _consent: data.consentNotice,
      _anonymous: data.isAnonymous,
      _opening: data.openingDate,
      _closing: data.closingDate,
      _reward_points: data.rewardPoints,
      _reward_minor: surveyRewardMinor(data.rewardPoints),
      _response_limit: data.responseLimit,
    });
    if (error || !id) {
      throw new Error(error?.message.includes("Not enough points") ? "You do not have enough points in your wallet. Buy points, then try again." : "Your survey could not be sent. Please try again.");
    }
    return { id };
  });

export const moderateCloudSurvey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ surveyId: z.string().uuid(), decision: z.enum(["approve", "reject"]), note: z.string().max(1000).default("") }).parse(input))
  .handler(async ({ data, context }) => {
    if (!(await isAdmin(context))) throw new Error("Administrator access required.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ok, error } = await supabaseAdmin.rpc("moderate_cloud_survey", { _survey_id: data.surveyId, _decision: data.decision, _note: data.note });
    if (error || !ok) throw new Error("This survey was already handled.");
    return { ok: true };
  });

export const closeCloudSurvey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ surveyId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const admin = await isAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ok, error } = await supabaseAdmin.rpc("close_cloud_survey", { _survey_id: data.surveyId, _actor: context.userId, _is_admin: admin });
    if (error || !ok) throw new Error("This survey could not be closed.");
    return { ok: true };
  });

/** Saves one answer and pays the person who answered, once per survey. */
export const answerCloudSurvey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      surveyId: z.string().uuid(),
      answers: z.record(z.string(), z.union([z.string().max(5000), z.number(), z.array(z.string().max(500)).max(50)])),
      durationSeconds: z.number().int().min(0).max(86_400),
      segment: z.string().max(120),
      country: z.string().max(80),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: paid, error } = await supabaseAdmin.rpc("settle_survey_answer", {
      _survey_id: data.surveyId,
      _respondent: context.userId,
      _answers: data.answers,
      _duration: data.durationSeconds,
      _segment: data.segment,
      _country: data.country,
    });
    if (error) {
      const message = error.message.includes("already answered") ? "You have already answered this survey." : error.message.includes("own survey") ? "You cannot answer your own survey." : "This survey is no longer open.";
      throw new Error(message);
    }
    return { rewardMinor: Number(paid ?? 0) };
  });
