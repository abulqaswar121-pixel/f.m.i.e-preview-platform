import { useSyncExternalStore } from "react";

import {
  marketIndicesSeed,
  prAddOns,
  prStatuses,
  surveyEconomyDefaults,
  surveyPointPacks,
} from "@/config/site";
import {
  deepClone,
  seedArticles,
  seedDistributionChannels,
  seedOrders,
  seedOrganizations,
  seedPressReleases,
  seedProducts,
  seedServices,
  seedSurveyPlans,
  seedSurveyResponses,
  seedSurveys,
  seedUsers,
} from "@/data";
import { clearCartStorage } from "@/hooks/useCart";
import type {
  Article,
  CashWallet,
  DailyPoll,
  KitRequest,
  PayoutRequest,
  PlatformSettings,
  PointsWallet,
  WalletTransaction,
  Author,
  CartItem,
  ContactDepartment,
  ContactMessage,
  ConsultationBooking,
  Database,
  DistributionChannel,
  MarketIndex,
  NewsletterSubscription,
  NewsCategory,
  Order,
  OrderAddress,
  OrderStatus,
  Organization,
  PressReleaseBooking,
  PRTier,
  PRStatus,
  Product,
  ProductCategory,
  ProfessionalService,
  ServiceEnquiry,
  Survey,
  SurveyCategory,
  SurveyPlan,
  SurveyQuestion,
  SurveyResponse,
  SurveyStatus,
  User,
} from "@/types";

/* ================================================================== */
/* Simulated backend                                                   */
/* ================================================================== */

/**
 * F.M.I.E simulated backend.
 *
 * Every view reaches data through the asynchronous functions on the exported
 * `api` object — never by importing a seed file directly. State lives in a
 * single in-memory database that is mirrored to `localStorage`, seeded from the
 * JSON datasets in `src/data`. Replacing this module with real HTTP calls is
 * the only change required to move to a production backend.
 *
 * Server-side rendering never mutates or persists state: the seed snapshot is
 * returned so that the HTML sent to the browser matches the client's first
 * render exactly.
 */

const STORAGE_KEY = "fmie.platform.database.v1";
const DB_VERSION = 3;
const LATENCY_MS = 70;

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined" &&
    typeof document !== "undefined"
  );
}

function createSeedDatabase(): Database {
  return {
    version: DB_VERSION,
    users: deepClone(seedUsers),
    organizations: deepClone(seedOrganizations),
    articles: deepClone(seedArticles),
    surveys: deepClone(seedSurveys),
    surveyPlans: deepClone(seedSurveyPlans),
    surveyResponses: deepClone(seedSurveyResponses),
    pressReleases: deepClone(seedPressReleases),
    distributionChannels: deepClone(seedDistributionChannels),
    services: deepClone(seedServices),
    serviceEnquiries: [],
    consultationBookings: [],
    products: deepClone(seedProducts),
    orders: deepClone(seedOrders),
    newsletterSubscriptions: [
      {
        id: "nl-seed-1",
        email: "research.desk@fmie.co.uk",
        preferences: ["morning-brief", "weekly-insight"],
        frequency: "Daily",
        consentGiven: true,
        createdAt: "2026-01-06T08:00:00.000Z",
      },
    ],
    contactMessages: [],
    transactions: [],
    payouts: [
      {
        id: "pay-seed-1",
        userId: "user-earner",
        earnerName: "Chidera Umeh",
        bankName: "Guaranty Trust Bank",
        accountNumber: "0123456789",
        accountName: "Chidera Umeh",
        amountNaira: 4000,
        status: "pending",
        requestedAt: new Date(Date.now() - 86_400_000).toISOString(),
      },
    ],
    polls: [
      {
        id: "poll-daily",
        question: "Which desk should lead this week's member brief?",
        options: [
          { id: "opt-markets", label: "Global Markets", votes: 132 },
          { id: "opt-energy", label: "Energy & Oil", votes: 97 },
          { id: "opt-tech", label: "Tech & AI", votes: 154 },
          { id: "opt-trade", label: "African Trade", votes: 88 },
        ],
        closesAt: new Date(Date.now() + 86_400_000).toISOString(),
      },
    ],
    pollVotes: {},
    pollLastOption: {},
    kitRequests: [],
    settings: { ...surveyEconomyDefaults },
    sessionUserId: null,
    updatedAt: new Date().toISOString(),
  };
}

let database: Database = createSeedDatabase();
let hydrated = false;
const listeners = new Set<() => void>();

function persist(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  } catch {
    // Private browsing or quota exhaustion: the simulation keeps working in memory.
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

/** Load persisted state from `localStorage`, falling back to the seed datasets. */
export function hydrateDatabase(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isBrowser()) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<Database>;
    if (parsed.version !== DB_VERSION) return;
    database = { ...createSeedDatabase(), ...parsed, version: DB_VERSION };
  } catch {
    // Corrupt or partial payload — keep the seed database.
  }
}

function commit(): void {
  database = { ...database, updatedAt: new Date().toISOString() };
  persist();
  emit();
}

/** Subscribe to database changes (used by `useDatabase`). */
export function subscribeDatabase(listener: () => void): () => void {
  hydrateDatabase();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDatabaseSnapshot(): Database {
  return database;
}

/**
 * Hydration-safe reactive read of the whole database.
 *
 * The server snapshot and the client's first render are both the seed database,
 * so markup matches; persisted state is swapped in after hydration.
 */
export function useDatabase(): Database {
  return useSyncExternalStore(subscribeDatabase, getDatabaseSnapshot, getDatabaseSnapshot);
}

/** Reset the preview to its shipped sample data. */
export function resetDemoData(): void {
  database = createSeedDatabase();
  hydrated = true;
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  // The basket lives in its own storage key, so a reset clears it too.
  clearCartStorage();
  commit();
}

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

function delay(ms = LATENCY_MS): Promise<void> {
  // Any asynchronous API call guarantees the client database is hydrated first.
  hydrateDatabase();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  const stamp = Date.now().toString(36).slice(-5);
  return `${prefix}-${stamp}${idCounter.toString(36).padStart(3, "0")}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 72);
}

function nowIso(): string {
  return new Date().toISOString();
}

function nextReference(prefix: string, existing: string[]): string {
  const year = new Date().getFullYear();
  const numbers = existing
    .map((reference) => Number(reference.split("-").pop()))
    .filter((value) => Number.isFinite(value)) as number[];
  const next = (numbers.length > 0 ? Math.max(...numbers) : 100) + 1;
  return `${prefix}-${year}-${next}`;
}

/** Escape a CSV cell to RFC 4180 rules. */
function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0] ?? {});
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvCell(row[header])).join(","));
  }
  return lines.join("\n");
}

/** Trigger a client-side download of a generated file (CSV export, invoices). */
export function downloadTextFile(
  filename: string,
  contents: string,
  mime = "text/csv;charset=utf-8",
): void {
  if (!isBrowser()) return;
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function matchesQuery(value: string, query: string): boolean {
  if (!query.trim()) return true;
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

/* ------------------------------------------------------------------ */
/* Input contracts                                                     */
/* ------------------------------------------------------------------ */

export interface ArticleFilter {
  query?: string;
  category?: NewsCategory | "All categories";
  contentType?: Article["contentType"];
  limit?: number;
}

export interface SurveyFilter {
  query?: string;
  category?: SurveyCategory | "All categories";
  tier?: Survey["tier"] | "all";
  status?: SurveyStatus | "all";
  creatorId?: string;
  limit?: number;
}

export interface CreateSurveyInput {
  /** Cash reward paid to each respondent on submission (₦). */
  rewardNaira?: number;
  title: string;
  category: SurveyCategory;
  objective: string;
  audience: string;
  planId: string;
  isAnonymous: boolean;
  isBranded: boolean;
  closingDate: string;
  openingDate: string;
  consentNotice: string;
  tags: string[];
  questions: SurveyQuestion[];
  creatorId: string;
  creatorName: string;
  organizationId?: string | undefined;
  submitForModeration: boolean;
}

export interface CreatePressReleaseInput {
  title: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  industry: string;
  websiteUrl: string;
  tier: PRTier;
  targetAudience: string;
  distributionRegions: string[];
  targetDate: string;
  contentDraft: string;
  mediaAttachments: string[];
  addOnIds: string[];
  disclosureAcknowledged: boolean;
  consentToProcessing: boolean;
  userId?: string | undefined;
}

export interface CreateOrderInput {
  items: CartItem[];
  email: string;
  address: OrderAddress;
  paymentMethod: string;
  promoCode?: string | undefined;
  discount: number;
  shipping: number;
  userId?: string | undefined;
}

export interface ServiceEnquiryInput {
  serviceId: string;
  name: string;
  email: string;
  organization: string;
  country: string;
  budgetBand: string;
  preferredDate: string;
  message: string;
}

export interface ConsultationInput {
  serviceId: string;
  name: string;
  email: string;
  organization: string;
  timezone: string;
  preferredSlot: string;
  agenda: string;
}

/* ------------------------------------------------------------------ */
/* Articles                                                            */
/* ------------------------------------------------------------------ */

function sortArticles(articles: Article[]): Article[] {
  return [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

const articles = {
  async list(filter: ArticleFilter = {}): Promise<Article[]> {
    await delay();
    let result = database.articles.filter((article) => {
      if (
        filter.category &&
        filter.category !== "All categories" &&
        article.category !== filter.category
      ) {
        return false;
      }
      if (filter.contentType && article.contentType !== filter.contentType) return false;
      if (filter.query) {
        const haystack = [
          article.title,
          article.subtitle,
          article.author.name,
          article.category,
          article.tags.join(" "),
        ].join(" ");
        if (!matchesQuery(haystack, filter.query)) return false;
      }
      return true;
    });
    result = sortArticles(result);
    if (filter.limit) result = result.slice(0, filter.limit);
    return result;
  },

  async featured(): Promise<Article[]> {
    await delay();
    return sortArticles(database.articles.filter((article) => article.isFeatured));
  },

  async editorialChoice(): Promise<Article[]> {
    await delay();
    return sortArticles(database.articles.filter((article) => article.isEditorialChoice));
  },

  async getBySlug(slug: string): Promise<Article | undefined> {
    await delay();
    return database.articles.find((article) => article.slug === slug);
  },

  async related(article: Article, limit = 3): Promise<Article[]> {
    await delay();
    const sameCategory = database.articles.filter(
      (candidate) => candidate.id !== article.id && candidate.category === article.category,
    );
    const others = database.articles.filter(
      (candidate) =>
        candidate.id !== article.id &&
        candidate.category !== article.category &&
        candidate.tags.some((tag) => article.tags.includes(tag)),
    );
    return sortArticles([...sameCategory, ...others]).slice(0, limit);
  },

  async byCategoryCounts(): Promise<Record<string, number>> {
    await delay();
    const counts: Record<string, number> = {};
    for (const article of database.articles) {
      counts[article.category] = (counts[article.category] ?? 0) + 1;
    }
    return counts;
  },

  /** Unique bylines across the archive, used on the About page. */
  async authors(): Promise<Author[]> {
    await delay();
    const byName = new Map<string, Author>();
    for (const article of database.articles) {
      if (!byName.has(article.author.name)) byName.set(article.author.name, article.author);
    }
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  },
};

/* ------------------------------------------------------------------ */
/* Surveys                                                             */
/* ------------------------------------------------------------------ */

function evaluateLogic(
  survey: Survey,
  question: SurveyQuestion,
  answers: Record<string, unknown>,
): boolean {
  if (!question.logic) return true;
  const dependency = survey.questions.find(
    (candidate) => candidate.id === question.logic?.questionId,
  );
  if (!dependency) return true;
  const given = answers[question.logic.questionId];
  const expected = question.logic.value;

  switch (question.logic.operator) {
    case "is_answered":
      return given !== undefined && given !== "" && !(Array.isArray(given) && given.length === 0);
    case "equals":
      return given === expected;
    case "not_equals":
      return given !== expected;
    case "greater_than":
      return typeof given === "number" && given > Number(expected);
    case "contains": {
      if (Array.isArray(given)) return given.some((entry) => String(entry).includes(expected));
      return String(given ?? "").includes(expected);
    }
    default:
      return true;
  }
}

/** The questions a respondent actually sees, given the answers so far. */
export function visibleQuestions(
  survey: Survey,
  answers: Record<string, unknown>,
): SurveyQuestion[] {
  return survey.questions.filter((question) => evaluateLogic(survey, question, answers));
}

/** Locks the researcher's points for respondent payouts up front (escrow). */
function lockEscrow(surveyId: string): void {
  const survey = database.surveys.find((candidate) => candidate.id === surveyId);
  if (!survey || survey.escrowPoints > 0) return;
  const required = (survey.responseLimit - survey.responseCount) * survey.rewardPoints;
  if (required <= 0) return;
  const creator = database.users.find((user) => user.id === survey.creatorId);
  const wallet: PointsWallet = creator?.pointsWallet ?? { balance: 0, purchasedNaira: 0 };
  const locked = Math.min(wallet.balance, required);
  database = {
    ...database,
    users: database.users.map((user) =>
      user.id === survey.creatorId
        ? { ...user, pointsWallet: { ...wallet, balance: wallet.balance - locked } }
        : user,
    ),
    surveys: database.surveys.map((candidate) =>
      candidate.id === surveyId ? { ...candidate, escrowPoints: locked } : candidate,
    ),
    transactions: [
      {
        id: nextId("txn"),
        userId: survey.creatorId,
        kind: "escrow_lock" as const,
        naira: 0,
        points: -locked,
        note: `Escrow locked for “${survey.title}” (${locked} pts)`,
        createdAt: nowIso(),
      },
      ...database.transactions,
    ],
  };
}

/** Returns unused escrow points when a survey closes before its quota. */
function refundEscrow(surveyId: string): void {
  const survey = database.surveys.find((candidate) => candidate.id === surveyId);
  if (!survey || survey.escrowPoints <= 0) return;
  const refund = survey.escrowPoints;
  database = {
    ...database,
    users: database.users.map((user) =>
      user.id === survey.creatorId
        ? {
            ...user,
            pointsWallet: {
              balance: (user.pointsWallet?.balance ?? 0) + refund,
              purchasedNaira: user.pointsWallet?.purchasedNaira ?? 0,
            },
          }
        : user,
    ),
    surveys: database.surveys.map((candidate) =>
      candidate.id === surveyId ? { ...candidate, escrowPoints: 0 } : candidate,
    ),
    transactions: [
      {
        id: nextId("txn"),
        userId: survey.creatorId,
        kind: "escrow_refund" as const,
        naira: 0,
        points: refund,
        note: `Unused escrow returned for “${survey.title}” (${refund} pts)`,
        createdAt: nowIso(),
      },
      ...database.transactions,
    ],
  };
}

const surveys = {
  async list(filter: SurveyFilter = {}): Promise<Survey[]> {
    await delay();
    const result = database.surveys.filter((survey) => {
      if (
        filter.category &&
        filter.category !== "All categories" &&
        survey.category !== filter.category
      ) {
        return false;
      }
      if (filter.tier && filter.tier !== "all" && survey.tier !== filter.tier) return false;
      if (filter.status && filter.status !== "all" && survey.status !== filter.status) return false;
      if (filter.creatorId && survey.creatorId !== filter.creatorId) return false;
      if (filter.query) {
        const haystack = [
          survey.title,
          survey.objective,
          survey.creatorName,
          survey.category,
          survey.tags.join(" "),
        ].join(" ");
        if (!matchesQuery(haystack, filter.query)) return false;
      }
      return true;
    });
    const sorted = [...result].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
    return filter.limit ? sorted.slice(0, filter.limit) : sorted;
  },

  async publicList(filter: SurveyFilter = {}): Promise<Survey[]> {
    // The marketplace only ever exposes surveys that are live, closed with
    // published results, or awaiting moderation (visible to staff only).
    return surveys
      .list({ ...filter, status: filter.status ?? "all" })
      .then((list) =>
        list.filter((survey) => survey.status === "active" || survey.status === "closed"),
      );
  },

  async getById(id: string): Promise<Survey | undefined> {
    await delay();
    return database.surveys.find((survey) => survey.id === id);
  },

  async getBySlug(slug: string): Promise<Survey | undefined> {
    await delay();
    return database.surveys.find((survey) => survey.slug === slug);
  },

  async plans(): Promise<SurveyPlan[]> {
    await delay();
    return database.surveyPlans;
  },

  async getPlan(planId: string): Promise<SurveyPlan | undefined> {
    await delay();
    return database.surveyPlans.find((plan) => plan.id === planId);
  },

  async updatePlan(planId: string, patch: Partial<SurveyPlan>): Promise<SurveyPlan | undefined> {
    await delay();
    const index = database.surveyPlans.findIndex((plan) => plan.id === planId);
    if (index === -1) return undefined;
    const updated: SurveyPlan = { ...database.surveyPlans[index]!, ...patch, id: planId };
    const next = [...database.surveyPlans];
    next[index] = updated;
    database = { ...database, surveyPlans: next };
    commit();
    return updated;
  },

  async create(input: CreateSurveyInput): Promise<Survey> {
    await delay();
    const plan = database.surveyPlans.find((candidate) => candidate.id === input.planId);
    const responseLimit = plan?.responseLimit ?? 100;
    const survey: Survey = {
      id: nextId("srv"),
      title: input.title,
      slug: slugify(input.title) || nextId("survey"),
      category: input.category,
      objective: input.objective,
      audience: input.audience,
      creatorId: input.creatorId,
      creatorName: input.creatorName,
      organizationId: input.organizationId,
      tier: plan?.tier ?? "free",
      planId: input.planId,
      status: input.submitForModeration ? "pending_moderation" : "draft",
      responseCount: 0,
      rewardNaira: input.rewardNaira ?? 400,
      rewardPoints: Math.max(
        1,
        Math.ceil((input.rewardNaira ?? 400) / database.settings.pointToNaira),
      ),
      escrowPoints: 0,
      responseLimit,
      openingDate: input.openingDate,
      closingDate: input.closingDate,
      isAnonymous: input.isAnonymous,
      isBranded: input.isBranded,
      consentNotice: input.consentNotice,
      estimatedMinutes: Math.max(1, Math.round(input.questions.length * 0.8)),
      tags: input.tags,
      questions: input.questions,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    database = { ...database, surveys: [survey, ...database.surveys] };
    if (input.submitForModeration) lockEscrow(survey.id);
    commit();
    return survey;
  },

  async update(id: string, patch: Partial<Survey>): Promise<Survey | undefined> {
    await delay();
    const index = database.surveys.findIndex((survey) => survey.id === id);
    if (index === -1) return undefined;
    const updated: Survey = {
      ...database.surveys[index]!,
      ...patch,
      id,
      updatedAt: nowIso(),
    };
    const next = [...database.surveys];
    next[index] = updated;
    database = { ...database, surveys: next };
    commit();
    return updated;
  },

  async setStatus(
    id: string,
    status: SurveyStatus,
    moderationNote?: string,
  ): Promise<Survey | undefined> {
    const before = database.surveys.find((candidate) => candidate.id === id);
    const updated = await surveys.update(id, {
      status,
      ...(moderationNote ? { moderationNote } : {}),
    });
    if (!before || !updated) return updated;
    if (status === "active" && before.status !== "active") lockEscrow(id);
    if (status === "closed" && before.status !== "closed") refundEscrow(id);
    commit();
    return updated;
  },

  async submitResponse(
    surveyId: string,
    answers: Record<string, string | string[] | number>,
    meta: { completed: boolean; durationSeconds: number; segment: string; country: string },
  ): Promise<SurveyResponse | undefined> {
    await delay();
    const survey = database.surveys.find((candidate) => candidate.id === surveyId);
    if (!survey) return undefined;

    const response: SurveyResponse = {
      id: nextId("rsp"),
      surveyId,
      submittedAt: nowIso(),
      answers,
      completed: meta.completed,
      durationSeconds: meta.durationSeconds,
      respondentSegment: survey.isAnonymous ? "Anonymous respondent" : meta.segment,
      respondentCountry: survey.isAnonymous ? "Not recorded" : meta.country,
    };

    const nextResponses = [response, ...database.surveyResponses];
    const nextSurveys = database.surveys.map((candidate) =>
      candidate.id === surveyId
        ? {
            ...candidate,
            responseCount: candidate.responseCount + 1,
            updatedAt: nowIso(),
            status:
              candidate.responseCount + 1 >= candidate.responseLimit &&
              candidate.status === "active"
                ? ("closed" as SurveyStatus)
                : candidate.status,
          }
        : candidate,
    );

    const released = Math.min(survey.rewardPoints, survey.escrowPoints);
    const finalSurveys = nextSurveys.map((candidate) =>
      candidate.id === surveyId
        ? { ...candidate, escrowPoints: survey.escrowPoints - released }
        : candidate,
    );

    const respondentId = database.sessionUserId;
    const respondent = database.users.find((user) => user.id === respondentId);
    const reward = survey.rewardNaira;
    const nextUsers =
      respondent?.role === "earner"
        ? database.users.map((user) =>
            user.id === respondentId
              ? {
                  ...user,
                  cashWallet: {
                    availableNaira: (user.cashWallet?.availableNaira ?? 0) + reward,
                    totalEarnedNaira: (user.cashWallet?.totalEarnedNaira ?? 0) + reward,
                    completedSurveys: (user.cashWallet?.completedSurveys ?? 0) + 1,
                  },
                }
              : user,
          )
        : database.users;

    const rewardTxn: WalletTransaction[] =
      respondent?.role === "earner"
        ? [
            {
              id: nextId("txn"),
              userId: respondentId!,
              kind: "survey_reward" as const,
              naira: reward,
              points: 0,
              note: `Reward for completing “${survey.title}”`,
              createdAt: nowIso(),
            },
          ]
        : [];

    database = {
      ...database,
      users: nextUsers,
      surveyResponses: nextResponses,
      surveys: finalSurveys,
      transactions: [...rewardTxn, ...database.transactions],
    };
    commit();
    return response;
  },

  async responses(surveyId: string): Promise<SurveyResponse[]> {
    await delay();
    return database.surveyResponses.filter((response) => response.surveyId === surveyId);
  },

  async analytics(
    surveyId: string,
    filters: {
      from?: string | undefined;
      to?: string | undefined;
      segment?: string | undefined;
      country?: string | undefined;
    } = {},
  ): Promise<{
    survey: Survey | undefined;
    responses: SurveyResponse[];
    completionRate: number;
    averageDurationSeconds: number;
    segments: { label: string; count: number }[];
    countries: { label: string; count: number }[];
    perQuestion: {
      question: SurveyQuestion;
      buckets: { label: string; value: number; count: number }[];
      mean: number | undefined;
      answered: number;
    }[];
  }> {
    await delay();
    const survey = database.surveys.find((candidate) => candidate.id === surveyId);
    if (!survey) {
      return {
        survey: undefined,
        responses: [],
        completionRate: 0,
        averageDurationSeconds: 0,
        segments: [],
        countries: [],
        perQuestion: [],
      };
    }

    const responses = database.surveyResponses
      .filter((response) => response.surveyId === surveyId)
      .filter((response) => {
        if (
          filters.from &&
          new Date(response.submittedAt).getTime() < new Date(filters.from).getTime()
        )
          return false;
        if (
          filters.to &&
          new Date(response.submittedAt).getTime() > new Date(`${filters.to}T23:59:59`).getTime()
        )
          return false;
        if (
          filters.segment &&
          filters.segment !== "All segments" &&
          response.respondentSegment !== filters.segment
        )
          return false;
        if (
          filters.country &&
          filters.country !== "All countries" &&
          response.respondentCountry !== filters.country
        )
          return false;
        return true;
      });
    const completed = responses.filter((response) => response.completed).length;
    const completionRate =
      responses.length > 0 ? Math.round((completed / responses.length) * 100) : 0;
    const averageDurationSeconds =
      responses.length > 0
        ? Math.round(
            responses.reduce((sum, response) => sum + response.durationSeconds, 0) /
              responses.length,
          )
        : 0;

    const countBy = (key: "respondentSegment" | "respondentCountry") => {
      const map = new Map<string, number>();
      for (const response of responses) {
        const value = response[key];
        map.set(value, (map.get(value) ?? 0) + 1);
      }
      return [...map.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    };

    const perQuestion = survey.questions.map((question) => {
      const authored = survey.distribution?.find((entry) => entry.questionId === question.id);
      let answered = 0;
      const tally = new Map<string, number>();
      let numericSum = 0;
      let numericCount = 0;

      for (const response of responses) {
        const value = response.answers[question.id];
        if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0))
          continue;
        answered += 1;
        if (typeof value === "number") {
          numericSum += value;
          numericCount += 1;
          const bucket = String(value);
          tally.set(bucket, (tally.get(bucket) ?? 0) + 1);
          continue;
        }
        const values = Array.isArray(value) ? value : [value];
        for (const entry of values) {
          const label = String(entry);
          tally.set(label, (tally.get(label) ?? 0) + 1);
        }
      }

      // Where a response sample exists, report the live tally; otherwise fall
      // back to the authored aggregate distribution so the preview never shows
      // an empty chart for a survey that has reported totals.
      let buckets: { label: string; value: number; count: number }[];
      if (answered > 0 && question.type !== "rating") {
        const entries = [...tally.entries()].sort((a, b) => b[1] - a[1]);
        const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1;
        buckets = entries.map(([label, count]) => ({
          label,
          count,
          value: Math.round((count / total) * 100),
        }));
        if (question.type === "single_choice" || question.type === "likert") {
          const order = question.options ?? [];
          if (order.length > 0) {
            buckets.sort(
              (a, b) =>
                (order.indexOf(a.label) === -1 ? 99 : order.indexOf(a.label)) -
                (order.indexOf(b.label) === -1 ? 99 : order.indexOf(b.label)),
            );
          }
        }
      } else {
        buckets = authored?.buckets ?? [];
      }

      const mean =
        numericCount > 0
          ? Number((numericSum / numericCount).toFixed(1))
          : question.type === "rating"
            ? authored?.mean
            : undefined;

      return { question, buckets, mean, answered };
    });

    return {
      survey,
      responses,
      completionRate,
      averageDurationSeconds,
      segments: countBy("respondentSegment"),
      countries: countBy("respondentCountry"),
      perQuestion,
    };
  },

  async exportCsv(surveyId: string): Promise<string> {
    const survey = await surveys.getById(surveyId);
    const responses = await surveys.responses(surveyId);
    if (!survey) return "";
    const headers = [
      "response_id",
      "submitted_at",
      "completed",
      "duration_seconds",
      "segment",
      "country",
      ...survey.questions.map(
        (question) => `q_${question.id}_${slugify(question.prompt).slice(0, 40)}`,
      ),
    ];
    const rows = responses.map((response) => {
      const row: Record<string, unknown> = {
        response_id: response.id,
        submitted_at: response.submittedAt,
        completed: response.completed,
        duration_seconds: response.durationSeconds,
        segment: response.respondentSegment,
        country: response.respondentCountry,
      };
      for (const question of survey.questions) {
        const value = response.answers[question.id];
        row[`q_${question.id}_${slugify(question.prompt).slice(0, 40)}`] = Array.isArray(value)
          ? value.join(" | ")
          : (value ?? "");
      }
      return row;
    });
    void headers;
    return toCsv(rows);
  },

  async categoryCounts(): Promise<Record<string, number>> {
    await delay();
    const counts: Record<string, number> = {};
    for (const survey of database.surveys) {
      if (survey.status !== "active" && survey.status !== "closed") continue;
      counts[survey.category] = (counts[survey.category] ?? 0) + 1;
    }
    return counts;
  },

  async delete(id: string): Promise<boolean> {
    await delay();
    const exists = database.surveys.some((survey) => survey.id === id);
    if (!exists) return false;
    database = {
      ...database,
      surveys: database.surveys.filter((survey) => survey.id !== id),
      surveyResponses: database.surveyResponses.filter((response) => response.surveyId !== id),
    };
    commit();
    return true;
  },
};

/* ------------------------------------------------------------------ */
/* Press releases                                                      */
/* ------------------------------------------------------------------ */

const pressReleases = {
  async list(
    filter: {
      status?: PRStatus | "all";
      userId?: string;
      tier?: PRTier | "all";
      query?: string;
    } = {},
  ): Promise<PressReleaseBooking[]> {
    await delay();
    const result = database.pressReleases.filter((booking) => {
      if (filter.status && filter.status !== "all" && booking.status !== filter.status)
        return false;
      if (filter.userId && booking.userId !== filter.userId) return false;
      if (filter.tier && filter.tier !== "all" && booking.tier !== filter.tier) return false;
      if (filter.query) {
        const haystack = [
          booking.title,
          booking.companyName,
          booking.referenceNumber,
          booking.industry,
        ].join(" ");
        if (!matchesQuery(haystack, filter.query)) return false;
      }
      return true;
    });
    return [...result].sort(
      (a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime(),
    );
  },

  async getById(id: string): Promise<PressReleaseBooking | undefined> {
    await delay();
    return database.pressReleases.find(
      (booking) => booking.id === id || booking.referenceNumber === id,
    );
  },

  async create(input: CreatePressReleaseInput): Promise<PressReleaseBooking> {
    await delay();
    const selectedAddOns = prAddOns
      .filter((addOn) => input.addOnIds.includes(addOn.id))
      .map((addOn) => ({ id: addOn.id, label: addOn.label, price: addOn.price, selected: true }));

    const booking: PressReleaseBooking = {
      id: nextId("pr"),
      referenceNumber: nextReference(
        "FMIE-PR",
        database.pressReleases.map((item) => item.referenceNumber),
      ),
      title: input.title,
      companyName: input.companyName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      country: input.country,
      industry: input.industry,
      websiteUrl: input.websiteUrl,
      tier: input.tier,
      status: "submitted",
      targetAudience: input.targetAudience,
      distributionRegions: input.distributionRegions,
      submittedDate: nowIso(),
      targetDate: input.targetDate,
      currency: "GBP",
      contentDraft: input.contentDraft,
      mediaAttachments: input.mediaAttachments,
      addOns: selectedAddOns,
      userId: input.userId,
      disclosureAcknowledged: input.disclosureAcknowledged,
      consentToProcessing: input.consentToProcessing,
      timeline: [
        {
          at: nowIso(),
          status: "submitted",
          note: "Booking received through the F.M.I.E press release portal and queued for editorial and compliance review.",
          actor: "F.M.I.E Press Desk",
        },
      ],
    };

    database = { ...database, pressReleases: [booking, ...database.pressReleases] };
    commit();
    return booking;
  },

  async updateStatus(
    id: string,
    status: PRStatus,
    note: string,
    actor = "F.M.I.E Press Desk",
  ): Promise<PressReleaseBooking | undefined> {
    await delay();
    const index = database.pressReleases.findIndex((booking) => booking.id === id);
    if (index === -1) return undefined;
    const current = database.pressReleases[index]!;
    const definition = prStatuses.find((entry) => entry.id === status);
    const updated: PressReleaseBooking = {
      ...current,
      status,
      timeline: [
        ...current.timeline,
        {
          at: nowIso(),
          status,
          note: note || `Status moved to ${definition?.label ?? status}.`,
          actor,
        },
      ],
    };
    const next = [...database.pressReleases];
    next[index] = updated;
    database = { ...database, pressReleases: next };
    commit();
    return updated;
  },

  async setQuote(
    id: string,
    amount: number,
    note?: string,
  ): Promise<PressReleaseBooking | undefined> {
    await delay();
    const index = database.pressReleases.findIndex((booking) => booking.id === id);
    if (index === -1) return undefined;
    const current = database.pressReleases[index]!;
    const updated: PressReleaseBooking = {
      ...current,
      quoteAmount: amount,
      status: "quote_sent",
      timeline: [
        ...current.timeline,
        {
          at: nowIso(),
          status: "quote_sent",
          note:
            note ??
            `Quotation issued at ${amount.toFixed(2)} GBP for the selected tier and add-ons, excluding VAT.`,
          actor: "F.M.I.E Commercial Desk",
        },
      ],
    };
    const next = [...database.pressReleases];
    next[index] = updated;
    database = { ...database, pressReleases: next };
    commit();
    return updated;
  },

  async markPaid(id: string): Promise<PressReleaseBooking | undefined> {
    await delay();
    const index = database.pressReleases.findIndex((booking) => booking.id === id);
    if (index === -1) return undefined;
    const current = database.pressReleases[index]!;
    const updated: PressReleaseBooking = {
      ...current,
      status: "approved",
      paidAt: nowIso(),
      timeline: [
        ...current.timeline,
        {
          at: nowIso(),
          status: "awaiting_payment",
          note: "Quotation accepted by the client; invoice issued with a seven-day term.",
          actor: "F.M.I.E Commercial Desk",
        },
        {
          at: nowIso(),
          status: "approved",
          note: "Simulated payment cleared. Release approved for production.",
          actor: "F.M.I.E Commercial Desk",
        },
      ],
    };
    const next = [...database.pressReleases];
    next[index] = updated;
    database = { ...database, pressReleases: next };
    commit();
    return updated;
  },

  async addPublishedUrl(id: string, url: string): Promise<PressReleaseBooking | undefined> {
    await delay();
    const index = database.pressReleases.findIndex((booking) => booking.id === id);
    if (index === -1) return undefined;
    const current = database.pressReleases[index]!;
    const published = [...(current.publishedUrls ?? []), url];
    const updated: PressReleaseBooking = { ...current, publishedUrls: published };
    const next = [...database.pressReleases];
    next[index] = updated;
    database = { ...database, pressReleases: next };
    commit();
    return updated;
  },

  async channels(): Promise<DistributionChannel[]> {
    await delay();
    return database.distributionChannels;
  },

  async updateChannel(
    id: string,
    patch: Partial<DistributionChannel>,
  ): Promise<DistributionChannel | undefined> {
    await delay();
    const index = database.distributionChannels.findIndex((channel) => channel.id === id);
    if (index === -1) return undefined;
    const updated: DistributionChannel = { ...database.distributionChannels[index]!, ...patch, id };
    const next = [...database.distributionChannels];
    next[index] = updated;
    database = { ...database, distributionChannels: next };
    commit();
    return updated;
  },
};

/* ------------------------------------------------------------------ */
/* Professional services                                               */
/* ------------------------------------------------------------------ */

const services = {
  async list(): Promise<ProfessionalService[]> {
    await delay();
    return database.services;
  },

  async getBySlug(slug: string): Promise<ProfessionalService | undefined> {
    await delay();
    return database.services.find((service) => service.slug === slug);
  },

  async submitEnquiry(input: ServiceEnquiryInput): Promise<ServiceEnquiry> {
    await delay();
    const service = database.services.find((candidate) => candidate.id === input.serviceId);
    const enquiry: ServiceEnquiry = {
      id: nextId("enq"),
      serviceId: input.serviceId,
      serviceTitle: service?.title ?? "Professional service enquiry",
      name: input.name,
      email: input.email,
      organization: input.organization,
      country: input.country,
      budgetBand: input.budgetBand,
      preferredDate: input.preferredDate,
      message: input.message,
      status: "received",
      createdAt: nowIso(),
    };
    database = { ...database, serviceEnquiries: [enquiry, ...database.serviceEnquiries] };
    commit();
    return enquiry;
  },

  async bookConsultation(input: ConsultationInput): Promise<ConsultationBooking> {
    await delay();
    const service = database.services.find((candidate) => candidate.id === input.serviceId);
    const booking: ConsultationBooking = {
      id: nextId("csl"),
      serviceId: input.serviceId,
      serviceTitle: service?.title ?? "Professional service consultation",
      name: input.name,
      email: input.email,
      organization: input.organization,
      timezone: input.timezone,
      preferredSlot: input.preferredSlot,
      agenda: input.agenda,
      createdAt: nowIso(),
      status: "requested",
    };
    database = { ...database, consultationBookings: [booking, ...database.consultationBookings] };
    commit();
    return booking;
  },

  async enquiries(): Promise<ServiceEnquiry[]> {
    await delay();
    return database.serviceEnquiries;
  },

  async consultations(): Promise<ConsultationBooking[]> {
    await delay();
    return database.consultationBookings;
  },
};

/* ------------------------------------------------------------------ */
/* Shop                                                                */
/* ------------------------------------------------------------------ */

const products = {
  async list(
    filter: { category?: ProductCategory | "All products"; query?: string; limit?: number } = {},
  ): Promise<Product[]> {
    await delay();
    const result = database.products.filter((product) => {
      if (
        filter.category &&
        filter.category !== "All products" &&
        product.category !== filter.category
      ) {
        return false;
      }
      if (
        filter.query &&
        !matchesQuery(`${product.name} ${product.description} ${product.material}`, filter.query)
      ) {
        return false;
      }
      return true;
    });
    return filter.limit ? result.slice(0, filter.limit) : result;
  },

  async getById(id: string): Promise<Product | undefined> {
    await delay();
    return database.products.find((product) => product.id === id || product.slug === id);
  },

  async featured(limit = 3): Promise<Product[]> {
    await delay();
    return database.products.filter((product) => product.badge).slice(0, limit);
  },
};

const orders = {
  async list(userId?: string): Promise<Order[]> {
    await delay();
    const result = userId
      ? database.orders.filter((order) => order.userId === userId)
      : database.orders;
    return [...result].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    );
  },

  async getById(id: string): Promise<Order | undefined> {
    await delay();
    return database.orders.find((order) => order.id === id || order.reference === id);
  },

  async create(input: CreateOrderInput): Promise<Order> {
    await delay();
    const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order: Order = {
      id: nextId("ord"),
      reference: nextReference(
        "FMIE-ORD",
        database.orders.map((item) => item.reference),
      ),
      userId: input.userId,
      email: input.email,
      items: input.items,
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(input.discount.toFixed(2)),
      shipping: Number(input.shipping.toFixed(2)),
      total: Number((subtotal - input.discount + input.shipping).toFixed(2)),
      currency: "GBP",
      promoCode: input.promoCode,
      status: "paid",
      placedAt: nowIso(),
      address: input.address,
      paymentMethod: input.paymentMethod,
      paymentReference: `SIM-${input.paymentMethod === "bank_transfer" ? "BACS" : "CARD"}-${Math.floor(
        10000 + Math.random() * 89999,
      )}`,
    };

    // Decrement stock so the preview behaves like a real catalogue.
    const nextProducts = database.products.map((product) => {
      const line = input.items.find((item) => item.productId === product.id);
      if (!line) return product;
      const stockLevel = Math.max(0, product.stockLevel - line.quantity);
      return { ...product, stockLevel, inStock: stockLevel > 0 };
    });

    database = { ...database, orders: [order, ...database.orders], products: nextProducts };
    commit();
    return order;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    await delay();
    const index = database.orders.findIndex((order) => order.id === id);
    if (index === -1) return undefined;
    const updated: Order = { ...database.orders[index]!, status };
    const next = [...database.orders];
    next[index] = updated;
    database = { ...database, orders: next };
    commit();
    return updated;
  },

  async invoiceText(order: Order): Promise<string> {
    await delay();
    const lines = [
      "F.M.I.E MEDIA & RESEARCH LTD",
      "124 City Road, London, EC1V 2NX, United Kingdom",
      "contact@fmie.co.uk",
      "",
      `INVOICE ${order.reference}`,
      `Issued: ${order.placedAt.slice(0, 10)}`,
      `Status: ${order.status.toUpperCase()}`,
      "",
      `Bill to: ${order.address.fullName}`,
      order.address.line1,
      order.address.line2 ?? "",
      `${order.address.city} ${order.address.postcode}`,
      order.address.country,
      "",
      "ITEM                                    VARIANT      QTY     UNIT      LINE",
      ...order.items.map((item) =>
        [
          item.name.slice(0, 38).padEnd(38),
          item.variant.slice(0, 10).padEnd(10),
          String(item.quantity).padStart(4),
          item.price.toFixed(2).padStart(9),
          (item.price * item.quantity).toFixed(2).padStart(9),
        ].join("  "),
      ),
      "",
      `Subtotal: ${order.subtotal.toFixed(2)} ${order.currency}`,
      `Discount: -${order.discount.toFixed(2)} ${order.currency}${order.promoCode ? ` (${order.promoCode})` : ""}`,
      `Shipping: ${order.shipping.toFixed(2)} ${order.currency}`,
      `Total:    ${order.total.toFixed(2)} ${order.currency}`,
      "",
      `Payment method: ${order.paymentMethod}`,
      `Payment reference: ${order.paymentReference}`,
      "",
      "SIMULATED DOCUMENT — demonstration preview. No payment has been taken and no",
      "goods will be dispatched. Prices include UK VAT where applicable.",
    ];
    return lines.filter((line) => line !== "").join("\n");
  },
};

/* ------------------------------------------------------------------ */
/* Users, organisations & session                                      */
/* ------------------------------------------------------------------ */

const users = {
  async list(): Promise<User[]> {
    await delay();
    return database.users;
  },

  async getById(id: string): Promise<User | undefined> {
    await delay();
    return database.users.find((user) => user.id === id);
  },

  async getByEmail(email: string): Promise<User | undefined> {
    await delay();
    return database.users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase());
  },

  async current(): Promise<User | undefined> {
    await delay();
    if (!database.sessionUserId) return undefined;
    return database.users.find((user) => user.id === database.sessionUserId);
  },

  /**
   * Simulated sign-in. Any valid-looking email is accepted: a matching demo
   * persona is used when one exists, otherwise a registered member profile is
   * created on the fly. No credentials are checked because none exist.
   */
  async signIn(email: string, name?: string): Promise<User> {
    await delay();
    const normalised = email.trim().toLowerCase();
    const existing = database.users.find((user) => user.email.toLowerCase() === normalised);
    if (existing) {
      database = { ...database, sessionUserId: existing.id };
      commit();
      return existing;
    }

    const derivedName =
      name?.trim() ||
      normalised
        .split("@")[0]!
        .split(/[._-]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

    const created: User = {
      id: nextId("user"),
      name: derivedName,
      email: normalised,
      role: "registered_user",
      avatarUrl: "/art/avatars/member.svg",
      jobTitle: "Registered member",
      location: "Not disclosed",
      joinedAt: nowIso(),
      notificationPreferences: {
        editorialDigest: true,
        surveyActivity: true,
        pressReleaseUpdates: true,
        orderAndInvoice: true,
        commercialOffers: false,
      },
    };

    database = {
      ...database,
      users: [...database.users, created],
      sessionUserId: created.id,
    };
    commit();
    return created;
  },

  async switchPersona(userId: string): Promise<User | undefined> {
    await delay();
    const user = database.users.find((candidate) => candidate.id === userId);
    if (!user) return undefined;
    database = { ...database, sessionUserId: user.id };
    commit();
    return user;
  },

  async signOut(): Promise<void> {
    await delay();
    database = { ...database, sessionUserId: null };
    commit();
  },

  async updateProfile(
    id: string,
    patch: Partial<Omit<User, "id" | "role">>,
  ): Promise<User | undefined> {
    await delay();
    const index = database.users.findIndex((user) => user.id === id);
    if (index === -1) return undefined;
    const updated: User = { ...database.users[index]!, ...patch, id };
    const next = [...database.users];
    next[index] = updated;
    database = { ...database, users: next };
    commit();
    return updated;
  },

  async organizations(): Promise<Organization[]> {
    await delay();
    return database.organizations;
  },

  async organizationById(id: string): Promise<Organization | undefined> {
    await delay();
    return database.organizations.find((organization) => organization.id === id);
  },

  async organizationByName(name: string): Promise<Organization | undefined> {
    await delay();
    return database.organizations.find(
      (organization) => organization.name.toLowerCase() === name.trim().toLowerCase(),
    );
  },
};

/* ------------------------------------------------------------------ */
/* Audience, messaging & market data                                   */
/* ------------------------------------------------------------------ */

const audience = {
  async subscribeNewsletter(
    email: string,
    preferences: string[],
    frequency: string,
  ): Promise<NewsletterSubscription> {
    await delay();
    const subscription: NewsletterSubscription = {
      id: nextId("nl"),
      email: email.trim().toLowerCase(),
      preferences,
      frequency,
      consentGiven: true,
      createdAt: nowIso(),
    };
    database = {
      ...database,
      newsletterSubscriptions: [subscription, ...database.newsletterSubscriptions],
    };
    commit();
    return subscription;
  },

  async newsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    await delay();
    return database.newsletterSubscriptions;
  },

  async submitContactMessage(input: {
    department: ContactDepartment;
    name: string;
    email: string;
    organization?: string | undefined;
    subject: string;
    message: string;
  }): Promise<ContactMessage> {
    await delay();
    const message: ContactMessage = {
      id: nextId("msg"),
      department: input.department,
      name: input.name,
      email: input.email.trim().toLowerCase(),
      organization: input.organization,
      subject: input.subject,
      message: input.message,
      status: "received",
      createdAt: nowIso(),
    };
    database = { ...database, contactMessages: [message, ...database.contactMessages] };
    commit();
    return message;
  },

  async contactMessages(): Promise<ContactMessage[]> {
    await delay();
    return database.contactMessages;
  },
};

/**
 * Market ticker. The preview has no live data feed, so index values are derived
 * from the configured seed with a small bounded drift — enough for the ticker to
 * behave like a ticker, never enough to be mistaken for a real quote.
 */
const market = {
  async indices(): Promise<MarketIndex[]> {
    await delay(30);
    return marketIndicesSeed.map((index, position) => {
      const drift = ((Date.now() / 60000 + position * 7) % 11) / 1000;
      const value = Number((index.value * (1 + drift)).toFixed(index.value < 10 ? 4 : 2));
      const change = Number((index.change + index.value * drift).toFixed(index.value < 10 ? 4 : 2));
      return {
        symbol: index.symbol,
        name: index.name,
        value,
        change,
        changePercent: Number(((change / index.value) * 100).toFixed(2)),
        unit: index.unit,
      } satisfies MarketIndex;
    });
  },
};

/* ------------------------------------------------------------------ */
/* Cross-cutting search & administration                               */
/* ------------------------------------------------------------------ */

const search = {
  async all(query: string): Promise<{
    articles: Article[];
    surveys: Survey[];
    pressReleases: PressReleaseBooking[];
    services: ProfessionalService[];
    products: Product[];
  }> {
    await delay();
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return { articles: [], surveys: [], pressReleases: [], services: [], products: [] };
    }
    return {
      articles: database.articles
        .filter((article) =>
          matchesQuery(`${article.title} ${article.subtitle} ${article.tags.join(" ")}`, trimmed),
        )
        .slice(0, 6),
      surveys: database.surveys
        .filter((survey) => matchesQuery(`${survey.title} ${survey.objective}`, trimmed))
        .slice(0, 5),
      pressReleases: database.pressReleases
        .filter((booking) => matchesQuery(`${booking.title} ${booking.companyName}`, trimmed))
        .slice(0, 5),
      services: database.services
        .filter((service) => matchesQuery(`${service.title} ${service.tagline}`, trimmed))
        .slice(0, 4),
      products: database.products
        .filter((product) => matchesQuery(product.name, trimmed))
        .slice(0, 4),
    };
  },
};

const admin = {
  async overview(): Promise<{
    surveys: { total: number; active: number; pendingModeration: number; responses: number };
    pressReleases: {
      total: number;
      awaitingAction: number;
      inDistribution: number;
      completed: number;
      pipelineValue: number;
      realisedValue: number;
    };
    commerce: { orders: number; revenue: number; unitsSold: number; lowStock: number };
    audience: { newsletter: number; contactMessages: number; serviceEnquiries: number };
  }> {
    await delay();
    const activeSurveys = database.surveys.filter((survey) => survey.status === "active");
    const pending = database.surveys.filter((survey) => survey.status === "pending_moderation");
    const awaitingAction = database.pressReleases.filter((booking) =>
      [
        "submitted",
        "under_review",
        "additional_info_required",
        "quote_sent",
        "awaiting_payment",
      ].includes(booking.status),
    );
    const inDistribution = database.pressReleases.filter((booking) =>
      ["approved", "in_production", "distribution_in_progress"].includes(booking.status),
    );
    const completedCampaigns = database.pressReleases.filter(
      (booking) => booking.status === "completed",
    );
    const pipelineValue = database.pressReleases
      .filter((booking) => booking.quoteAmount !== undefined && booking.status !== "completed")
      .reduce((sum, booking) => sum + (booking.quoteAmount ?? 0), 0);
    const realisedValue = database.pressReleases
      .filter((booking) => booking.paidAt !== undefined)
      .reduce((sum, booking) => sum + (booking.quoteAmount ?? 0), 0);
    const revenue = database.orders.reduce((sum, order) => sum + order.total, 0);
    const unitsSold = database.orders.reduce(
      (sum, order) => sum + order.items.reduce((line, item) => line + item.quantity, 0),
      0,
    );

    return {
      surveys: {
        total: database.surveys.length,
        active: activeSurveys.length,
        pendingModeration: pending.length,
        responses: database.surveys.reduce((sum, survey) => sum + survey.responseCount, 0),
      },
      pressReleases: {
        total: database.pressReleases.length,
        awaitingAction: awaitingAction.length,
        inDistribution: inDistribution.length,
        completed: completedCampaigns.length,
        pipelineValue: Number(pipelineValue.toFixed(2)),
        realisedValue: Number(realisedValue.toFixed(2)),
      },
      commerce: {
        orders: database.orders.length,
        revenue: Number(revenue.toFixed(2)),
        unitsSold,
        lowStock: database.products.filter((product) => product.stockLevel < 50).length,
      },
      audience: {
        newsletter: database.newsletterSubscriptions.length,
        contactMessages: database.contactMessages.length,
        serviceEnquiries: database.serviceEnquiries.length,
      },
    };
  },

  async reset(): Promise<void> {
    await delay();
    resetDemoData();
  },
};

/* ------------------------------------------------------------------ */
/* Public API boundary                                                 */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/* Wallets, payouts, polls, kit requests and platform settings        */
/* ================================================================== */

const wallets = {
  async summary(userId: string): Promise<{
    cash: CashWallet;
    points: PointsWallet;
    transactions: WalletTransaction[];
  }> {
    await delay();
    const user = database.users.find((candidate) => candidate.id === userId);
    return {
      cash: user?.cashWallet ?? { availableNaira: 0, totalEarnedNaira: 0, completedSurveys: 0 },
      points: user?.pointsWallet ?? { balance: 0, purchasedNaira: 0 },
      transactions: database.transactions.filter((txn) => txn.userId === userId),
    };
  },

  /** Simulated Paystack checkout: points land in the researcher wallet instantly. */
  async purchasePoints(userId: string, packId: string): Promise<PointsWallet> {
    await delay();
    const pack = surveyPointPacks.find((candidate) => candidate.id === packId);
    if (!pack) throw new Error("Unknown point pack.");
    const user = database.users.find((candidate) => candidate.id === userId);
    if (!user) throw new Error("Sign in to purchase survey points.");
    const wallet: PointsWallet = user.pointsWallet ?? { balance: 0, purchasedNaira: 0 };
    const next: PointsWallet = {
      balance: wallet.balance + pack.points,
      purchasedNaira: wallet.purchasedNaira + pack.naira,
    };
    database = {
      ...database,
      users: database.users.map((candidate) =>
        candidate.id === userId ? { ...candidate, pointsWallet: next } : candidate,
      ),
      transactions: [
        {
          id: nextId("txn"),
          userId,
          kind: "points_purchase" as const,
          naira: -pack.naira,
          points: pack.points,
          note: `Paystack (simulated): ₦${pack.naira.toLocaleString()} for ${pack.points} points`,
          createdAt: nowIso(),
        },
        ...database.transactions,
      ],
    };
    commit();
    return next;
  },

  async withdraw(
    userId: string,
    details: { bankName: string; accountNumber: string; accountName: string; amountNaira: number },
  ): Promise<PayoutRequest> {
    await delay();
    const user = database.users.find((candidate) => candidate.id === userId);
    if (!user) throw new Error("Sign in to withdraw earnings.");
    const available = user.cashWallet?.availableNaira ?? 0;
    const min = database.settings.minWithdrawalNaira;
    if (details.amountNaira < min) {
      throw new Error(`Minimum withdrawal is ₦${min.toLocaleString()}.`);
    }
    if (details.amountNaira > available) {
      throw new Error("Amount exceeds your available balance.");
    }
    const payout: PayoutRequest = {
      id: nextId("pay"),
      userId,
      earnerName: details.accountName,
      bankName: details.bankName,
      accountNumber: details.accountNumber,
      accountName: details.accountName,
      amountNaira: details.amountNaira,
      status: "pending",
      requestedAt: nowIso(),
    };
    database = {
      ...database,
      users: database.users.map((candidate) =>
        candidate.id === userId
          ? {
              ...candidate,
              cashWallet: {
                availableNaira: available - details.amountNaira,
                totalEarnedNaira: candidate.cashWallet?.totalEarnedNaira ?? 0,
                completedSurveys: candidate.cashWallet?.completedSurveys ?? 0,
              },
            }
          : candidate,
      ),
      payouts: [payout, ...database.payouts],
      transactions: [
        {
          id: nextId("txn"),
          userId,
          kind: "withdrawal" as const,
          naira: -details.amountNaira,
          points: 0,
          note: `Withdrawal to ${details.bankName} •••${details.accountNumber.slice(-4)}`,
          createdAt: nowIso(),
        },
        ...database.transactions,
      ],
    };
    commit();
    return payout;
  },
};

const payouts = {
  async list(): Promise<PayoutRequest[]> {
    await delay();
    return database.payouts;
  },

  async markPaid(id: string): Promise<PayoutRequest | undefined> {
    await delay();
    const payout = database.payouts.find((candidate) => candidate.id === id);
    if (!payout) return undefined;
    const paid = { ...payout, status: "paid" as const, paidAt: nowIso() };
    database = {
      ...database,
      payouts: database.payouts.map((candidate) => (candidate.id === id ? paid : candidate)),
    };
    commit();
    return paid;
  },
};

const polls = {
  async today(): Promise<{
    poll: DailyPoll;
    votedOptionId: string | undefined;
    hasVoted: boolean;
  }> {
    await delay();
    const poll = database.polls[0]!;
    const userId = database.sessionUserId;
    const hasVoted = !!userId && (database.pollVotes[poll.id] ?? []).includes(userId);
    return {
      poll,
      hasVoted,
      votedOptionId: userId ? database.pollLastOption[userId] : undefined,
    };
  },

  async vote(pollId: string, optionId: string, userId: string): Promise<DailyPoll> {
    await delay();
    const already = (database.pollVotes[pollId] ?? []).includes(userId);
    if (already) throw new Error("You have already voted in today's poll.");
    database = {
      ...database,
      polls: database.polls.map((poll) =>
        poll.id === pollId
          ? {
              ...poll,
              options: poll.options.map((option) =>
                option.id === optionId ? { ...option, votes: option.votes + 1 } : option,
              ),
            }
          : poll,
      ),
      pollVotes: {
        ...database.pollVotes,
        [pollId]: [...(database.pollVotes[pollId] ?? []), userId],
      },
      pollLastOption: { ...(database.pollLastOption ?? {}), [userId]: optionId },
    };
    commit();
    return database.polls[0]!;
  },
};

const kits = {
  async list(): Promise<KitRequest[]> {
    await delay();
    return database.kitRequests;
  },

  async submit(input: Omit<KitRequest, "id" | "status" | "createdAt">): Promise<KitRequest> {
    await delay();
    const request: KitRequest = {
      ...input,
      id: nextId("kit"),
      status: "requested",
      createdAt: nowIso(),
    };
    database = { ...database, kitRequests: [request, ...database.kitRequests] };
    commit();
    return request;
  },

  async quote(id: string, quoteNaira: number, quoteNote: string): Promise<KitRequest | undefined> {
    await delay();
    const request = database.kitRequests.find((candidate) => candidate.id === id);
    if (!request) return undefined;
    const quoted = { ...request, status: "quoted" as const, quoteNaira, quoteNote };
    database = {
      ...database,
      kitRequests: database.kitRequests.map((candidate) =>
        candidate.id === id ? quoted : candidate,
      ),
    };
    commit();
    return quoted;
  },
};

const settings = {
  async get(): Promise<PlatformSettings> {
    await delay();
    return database.settings;
  },

  async update(patch: Partial<PlatformSettings>): Promise<PlatformSettings> {
    await delay();
    database = { ...database, settings: { ...database.settings, ...patch } };
    commit();
    return database.settings;
  },
};

export const api = {
  articles,
  wallets,
  payouts,
  polls,
  kits,
  settings,
  surveys,
  pressReleases,
  services,
  products,
  orders,
  users,
  audience,
  market,
  search,
  admin,
};

export type Api = typeof api;
