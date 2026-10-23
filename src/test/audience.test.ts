import { describe, expect, it } from "vitest";
import { surveyFitsMember } from "@/lib/audience";

describe("survey targeting", () => {
  it("shows untargeted surveys to everyone", () => expect(surveyFitsMember([], undefined)).toBe(true));
  it("hides a nursing-mothers survey from a lecturer", () =>
    expect(surveyFitsMember(["Nursing mother"], "Employed")).toBe(false));
  it("shows a nursing-mothers survey to a nursing mother", () =>
    expect(surveyFitsMember(["Nursing mother"], "Nursing mother")).toBe(true));
});
