import { surveyPointPacks, surveyPointRules, type SurveyPointPack } from "@/config/site";
import { NGN_PER_USD } from "@/lib/outlet-pricing";

/** Points a researcher must hold to pay every wanted answer. */
export function pointsNeeded(rewardPoints: number, responses: number): number {
  if (!Number.isSafeInteger(rewardPoints) || !Number.isSafeInteger(responses)) return 0;
  if (rewardPoints <= 0 || responses <= 0) return 0;
  return rewardPoints * responses;
}

export function isValidReward(rewardPoints: number): boolean {
  return (
    Number.isSafeInteger(rewardPoints) &&
    rewardPoints >= surveyPointRules.minRewardPoints &&
    rewardPoints <= surveyPointRules.maxRewardPoints
  );
}

export function isValidResponseTarget(responses: number): boolean {
  return (
    Number.isSafeInteger(responses) &&
    responses >= surveyPointRules.minResponses &&
    responses <= surveyPointRules.maxResponses
  );
}

/** Points still missing before a survey can be sent for review (0 when covered). */
export function pointsShortfall(balance: number, rewardPoints: number, responses: number): number {
  return Math.max(0, pointsNeeded(rewardPoints, responses) - Math.max(0, balance));
}

/** Cash, in US dollars, the person answering receives for one completed answer. */
export function earnerRewardUsd(rewardPoints: number): number {
  return Math.round(rewardPoints * surveyPointRules.earnerUsdPerPoint * 100) / 100;
}

/** Same reward in naira, for the cash wallet until it switches currency. */
export function earnerRewardNaira(rewardPoints: number): number {
  return Math.round(earnerRewardUsd(rewardPoints) * NGN_PER_USD);
}

export function findPointPack(packId: string): SurveyPointPack | undefined {
  return surveyPointPacks.find((pack) => pack.id === packId);
}

/** Paystack charges in naira (kobo) at the price-sheet rate; the price shown is dollars. */
export function packChargeKobo(pack: SurveyPointPack): number {
  return Math.round(pack.usd * NGN_PER_USD * 100);
}
