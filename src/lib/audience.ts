export const GENDERS = ["Female", "Male"];
export const AGE_RANGES = ["18–24", "25–34", "35–44", "45–54", "55+"];
export const OCCUPATIONS = [
  "Student",
  "Lecturer / Teacher",
  "Researcher",
  "Healthcare / Nursing",
  "Finance / Banking",
  "Technology",
  "Business owner",
  "Civil / Public service",
  "Media / Communications",
  "Legal",
  "Engineering",
  "Sales / Marketing",
  "Agriculture",
  "Unemployed",
  "Other",
];
export const LIFE_STAGES = ["Student", "Employed", "Self-employed", "Parent", "Nursing mother", "Retired"];

/** A survey with no target groups is open to everyone; otherwise the member's life stage must match. */
export function surveyFitsMember(targets: string[] | undefined, lifeStage: string | undefined): boolean {
  if (!targets || targets.length === 0) return true;
  return !!lifeStage && targets.includes(lifeStage);
}
