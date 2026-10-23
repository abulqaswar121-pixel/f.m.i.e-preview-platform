export const LIFE_STAGES = ["Student", "Employed", "Self-employed", "Parent", "Nursing mother", "Retired"];

/** A survey with no target groups is open to everyone; otherwise the member's life stage must match. */
export function surveyFitsMember(targets: string[] | undefined, lifeStage: string | undefined): boolean {
  if (!targets || targets.length === 0) return true;
  return !!lifeStage && targets.includes(lifeStage);
}
