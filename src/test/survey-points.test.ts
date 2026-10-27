import { describe, expect, it } from "vitest";

import { governmentPlan, surveyPointPacks } from "@/config/site";
import {
  earnerRewardUsd,
  findPointPack,
  isValidReward,
  packChargeKobo,
  pointsNeeded,
  pointsShortfall,
} from "@/lib/survey-points";

describe("pay-as-you-go survey points", () => {
  it("sells point packs in dollars, with no yearly plans", () => {
    expect(surveyPointPacks.filter((pack) => pack.group === "standard").map((pack) => [pack.points, pack.usd])).toEqual([
      [100, 12],
      [500, 55],
      [2000, 200],
    ]);
  });

  it("a survey needs reward × wanted answers in points", () => {
    expect(pointsNeeded(10, 100)).toBe(1000);
    expect(pointsShortfall(500, 10, 100)).toBe(500);
    expect(pointsShortfall(1500, 10, 100)).toBe(0);
  });

  it("each answer must pay at least 5 points", () => {
    expect(isValidReward(5)).toBe(true);
    expect(isValidReward(4)).toBe(false);
  });

  it("pays the person answering $0.08 per point", () => {
    expect(earnerRewardUsd(10)).toBe(0.8);
  });

  it("charges the naira equivalent at ₦1,600 per $1 on Paystack", () => {
    expect(packChargeKobo(findPointPack("pack-100")!)).toBe(1_920_000);
  });
});

import { surveyRewardMinor } from "@/lib/survey-points";
describe("answer reward paid to the wallet", () => {
  it("pays 10 points as ₦1,280 (128,000 kobo)", () => {
    expect(surveyRewardMinor(10)).toBe(128_000);
  });
});

describe("corporate, academic and government plans", () => {
  it("offers corporate packs from $999 to $4,999", () => {
    const corporate = surveyPointPacks.filter((pack) => pack.group === "corporate").map((pack) => pack.usd);
    expect(Math.min(...corporate)).toBe(999);
    expect(Math.max(...corporate)).toBe(4999);
  });

  it("sells the academic pack at $599 for 5,000 points, only with a student ID", () => {
    const pack = findPointPack("academic-599");
    expect(pack?.usd).toBe(599);
    expect(pack?.points).toBe(5000);
    expect(pack?.requiresStudentId).toBe(true);
  });

  it("prices the government plan at $10,000 a year", () => {
    expect(governmentPlan.usdPerYear).toBe(10000);
  });
});

