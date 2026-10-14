import type {
  Article,
  DistributionChannel,
  Invoice,
  Order,
  Organization,
  PressReleaseBooking,
  Product,
  ProfessionalService,
  Survey,
  SurveyPlan,
  SurveyResponse,
  User,
} from "@/types";

import rawArticles from "./articles.json";
import rawChannels from "./distribution-channels.json";
import rawOrders from "./orders.json";
import rawOrganizations from "./organizations.json";
import rawPressReleases from "./press-releases.json";
import rawProducts from "./products.json";
import rawServices from "./services.json";
import rawSurveyPlans from "./survey-plans.json";
import rawSurveys from "./surveys.json";
import rawUsers from "./users.json";

/**
 * Seed datasets.
 *
 * The JSON files are the single place where sample content lives, so that a real
 * backend can replace them without touching a single component. Each import is
 * narrowed to its domain type here — and only here.
 */
export const seedUsers = rawUsers as unknown as User[];
export const seedOrganizations = rawOrganizations as unknown as Organization[];
export const seedArticles = rawArticles as unknown as Article[];
export const seedSurveys = rawSurveys as unknown as Survey[];
export const seedSurveyPlans = rawSurveyPlans as unknown as SurveyPlan[];
export const seedPressReleases = rawPressReleases as unknown as PressReleaseBooking[];
export const seedDistributionChannels = rawChannels as unknown as DistributionChannel[];
export const seedServices = rawServices as unknown as ProfessionalService[];
export const seedProducts = rawProducts as unknown as Product[];
export const seedOrders = rawOrders as unknown as Order[];

/* ------------------------------------------------------------------ */
/* Deterministic respondent-level sample data                          */
/* ------------------------------------------------------------------ */

/**
 * Aggregate distributions are authored by hand in `surveys.json` so that the
 * charts always tell a coherent story. Respondent-level records — needed for
 * filters, date ranges, completion rate and CSV export — are derived from those
 * distributions with a seeded pseudo-random generator, so the same survey
 * always produces the same sample on every load and on every machine.
 */

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

const SAMPLE_COUNTRIES = [
  "United Kingdom",
  "Nigeria",
  "Kenya",
  "Germany",
  "Ghana",
  "South Africa",
  "France",
  "Netherlands",
  "Egypt",
  "Rwanda",
  "Ireland",
  "United States",
  "United Arab Emirates",
  "Poland",
  "Sweden",
];

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 — small, fast and reproducible. */
function createRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** How many respondent-level records are generated per survey. */
export const RESPONSE_SAMPLE_CAP = 140;

function pickWeighted(random: () => number, buckets: { label: string; value: number }[]): string {
  if (buckets.length === 0) return "";
  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0) || 1;
  const target = random() * total;
  let running = 0;
  for (const bucket of buckets) {
    running += bucket.value;
    if (target <= running) return bucket.label;
  }
  return buckets[buckets.length - 1]?.label ?? "";
}

export function generateSurveyResponses(surveys: Survey[]): SurveyResponse[] {
  const responses: SurveyResponse[] = [];

  for (const survey of surveys) {
    if (survey.responseCount === 0 || !survey.distribution) continue;

    const random = createRandom(hashString(survey.id));
    const distributionByQuestion = new Map(
      survey.distribution.map((entry) => [entry.questionId, entry]),
    );
    const sampleSize = Math.min(survey.responseCount, RESPONSE_SAMPLE_CAP);
    const openedAt = new Date(survey.openingDate).getTime();
    const closesAt = new Date(survey.closingDate).getTime();
    const windowEnd = Math.min(closesAt, Date.now());
    const span = Math.max(windowEnd - openedAt, 86_400_000);

    for (let index = 0; index < sampleSize; index += 1) {
      const answers: Record<string, string | string[] | number> = {};
      const submittedAt = new Date(openedAt + random() * span).toISOString();

      for (const question of survey.questions) {
        const distribution = distributionByQuestion.get(question.id);
        const buckets = distribution?.buckets ?? [];

        if (question.type === "multi_choice") {
          const selected: string[] = [];
          const pool = question.options ?? buckets.map((bucket) => bucket.label);
          for (const option of pool) {
            const bucket = buckets.find((entry) => entry.label === option);
            const weight = bucket ? bucket.value / 100 : 0.3;
            if (random() < weight) selected.push(option);
          }
          answers[question.id] = selected.length > 0 ? selected : [pool[0] ?? "No answer"];
          continue;
        }

        if (question.type === "rating") {
          const max = question.ratingMax ?? 10;
          const mean = distribution?.mean ?? max * 0.6;
          const spread = (random() + random() + random() - 1.5) * (max * 0.35);
          answers[question.id] = Math.min(max, Math.max(1, Math.round(mean + spread)));
          continue;
        }

        if (question.type === "likert") {
          const pool = question.options ?? buckets.map((bucket) => bucket.label);
          const label = pickWeighted(
            random,
            buckets.length > 0 ? buckets : pool.map((p) => ({ label: p, value: 1 })),
          );
          answers[question.id] = label || pool[2] || pool[0] || "Neutral";
          continue;
        }

        if (question.type === "short_text" || question.type === "long_text") {
          // Free-text answers are summarised rather than fabricated verbatim,
          // so the export contains a coded theme instead of invented quotations.
          const themes = [
            "Cost and pricing pressure",
            "Interoperability with existing systems",
            "Time and administrative burden",
            "Trust in the reported output",
            "Skills and internal capability",
            "Regulatory or compliance uncertainty",
            "No material issue reported",
          ];
          answers[question.id] =
            random() < 0.58 ? themes[Math.floor(random() * themes.length)]! : "";
          continue;
        }

        const pool = question.options ?? buckets.map((bucket) => bucket.label);
        const label = pickWeighted(
          random,
          buckets.length > 0 ? buckets : pool.map((p) => ({ label: p, value: 1 })),
        );
        answers[question.id] = label || pool[0] || "";
      }

      responses.push({
        id: `${survey.id}-r${String(index + 1).padStart(4, "0")}`,
        surveyId: survey.id,
        submittedAt,
        answers,
        completed: random() < 0.86,
        durationSeconds: Math.round(120 + random() * 540),
        respondentSegment: SEGMENTS[Math.floor(random() * SEGMENTS.length)]!,
        respondentCountry: SAMPLE_COUNTRIES[Math.floor(random() * SAMPLE_COUNTRIES.length)]!,
      });
    }
  }

  return responses.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export const seedSurveyResponses = generateSurveyResponses(seedSurveys);

/* ------------------------------------------------------------------ */
/* Derived seed collections                                            */
/* ------------------------------------------------------------------ */

export const allSeedInvoices: Invoice[] = seedOrganizations.flatMap(
  (organization) => organization.invoices,
);

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
