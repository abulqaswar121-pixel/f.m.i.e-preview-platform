/**
 * F.M.I.E — Core domain types.
 *
 * Every entity below is persisted by the simulated backend in
 * `src/services/api.ts`. When a real backend replaces the simulation, these
 * interfaces become the API contract and only the service layer changes.
 */

/* ------------------------------------------------------------------ */
/* Taxonomies                                                          */
/* ------------------------------------------------------------------ */

export type NewsCategory =
  "Finance" | "Energy & Oil" | "Tech & AI" | "African Trade" | "Policy" | "Global Markets";

export type SurveyCategory =
  | "Consumer Behaviour"
  | "Business & Market Research"
  | "Finance & Investment"
  | "Technology"
  | "Education"
  | "Healthcare Research"
  | "Public Opinion"
  | "Entrepreneurship"
  | "Product Feedback"
  | "Employee / Organisation Surveys";

export type PRStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "additional_info_required"
  | "quote_sent"
  | "awaiting_payment"
  | "approved"
  | "in_production"
  | "distribution_in_progress"
  | "completed"
  | "rejected"
  | "cancelled";

export type PRTier = "tier_3_emerging" | "tier_2_business" | "tier_1_premium";

export type UserRole =
  | "earner"
  | "visitor"
  | "registered_user"
  | "survey_creator"
  | "premium_customer"
  | "corporate_account"
  | "contributor"
  | "administrator";

export type DisclosureTag = "Independent Editorial" | "Sponsored Research" | "Partner Dispatch";

export type ContentType =
  | "news_report"
  | "business_feature"
  | "interview"
  | "opinion"
  | "research_report"
  | "press_release"
  | "sponsored";

/* ------------------------------------------------------------------ */
/* People & accounts                                                   */
/* ------------------------------------------------------------------ */

export interface CashWallet {
  availableNaira: number;
  totalEarnedNaira: number;
  completedSurveys: number;
}

export interface PointsWallet {
  balance: number;
  purchasedNaira: number;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  kind: "survey_reward" | "withdrawal" | "points_purchase" | "escrow_lock" | "escrow_refund";
  naira: number;
  points: number;
  note: string;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  earnerName: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amountNaira: number;
  status: "pending" | "paid";
  requestedAt: string;
  paidAt?: string;
}

export interface DailyPollOption {
  id: string;
  label: string;
  votes: number;
}

export interface DailyPoll {
  id: string;
  question: string;
  options: DailyPollOption[];
  closesAt: string;
}

export interface KitRosterRow {
  name: string;
  number: string;
  size: "S" | "M" | "L" | "XL" | "XXL";
}

export interface KitRequest {
  id: string;
  clubName: string;
  sport: "Football" | "Basketball" | "Corporate";
  crestFileName?: string;
  primaryColor: string;
  secondaryColor: string;
  roster: KitRosterRow[];
  quantity: number;
  deliveryDate: string;
  deliveryAddress: string;
  notes: string;
  status: "requested" | "quoted";
  quoteNaira?: number;
  quoteNote?: string;
  createdAt: string;
}

export interface PlatformSettings {
  pointToNaira: number;
  minWithdrawalNaira: number;
  heroVideoUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cashWallet?: CashWallet;
  pointsWallet?: PointsWallet;
  organization?: string | undefined;
  avatarUrl: string;
  jobTitle?: string | undefined;
  location?: string | undefined;
  joinedAt?: string | undefined;
  notificationPreferences?: NotificationPreferences | undefined;
}

export interface NotificationPreferences {
  editorialDigest: boolean;
  surveyActivity: boolean;
  pressReleaseUpdates: boolean;
  orderAndInvoice: boolean;
  commercialOffers: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "administrator" | "researcher" | "billing" | "viewer";
  joinedAt: string;
  status: "active" | "invited";
}

export interface Invoice {
  id: string;
  reference: string;
  issuedAt: string;
  description: string;
  amount: number;
  currency: string;
  status: "paid" | "due" | "scheduled" | "refunded";
  method?: string | undefined;
}

export interface Organization {
  id: string;
  name: string;
  planId: string;
  sector: string;
  country: string;
  logoMark: string;
  brandColour: string;
  teamMembers: TeamMember[];
  invoices: Invoice[];
  seatsUsed: number;
  seatsIncluded: number;
}

/* ------------------------------------------------------------------ */
/* Editorial                                                           */
/* ------------------------------------------------------------------ */

export interface Author {
  name: string;
  title: string;
  avatarUrl: string;
  credential?: string | undefined;
  bio?: string | undefined;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: NewsCategory;
  contentType: ContentType;
  author: Author;
  publishedAt: string;
  updatedAt?: string | undefined;
  readTime: string;
  featuredImage: string;
  imageCredit: string;
  content: string;
  tags: string[];
  isFeatured?: boolean | undefined;
  isEditorialChoice?: boolean | undefined;
  disclosureTag?: DisclosureTag | undefined;
  correctionNote?: string | undefined;
}

/* ------------------------------------------------------------------ */
/* Survey marketplace                                                  */
/* ------------------------------------------------------------------ */

export type SurveyQuestionType =
  "single_choice" | "multi_choice" | "rating" | "likert" | "short_text" | "long_text";

export type LogicOperator = "equals" | "not_equals" | "contains" | "greater_than" | "is_answered";

export interface QuestionLogic {
  /** Show this question only when the referenced question matches. */
  questionId: string;
  operator: LogicOperator;
  value: string;
  description: string;
}

export interface SurveyQuestion {
  id: string;
  prompt: string;
  type: SurveyQuestionType;
  options?: string[] | undefined;
  required: boolean;
  helpText?: string | undefined;
  /** Rating scale ceiling (rating questions only). */
  ratingMax?: number | undefined;
  /** Anchor labels for Likert / rating scales. */
  scaleLabels?: { left: string; right: string } | undefined;
  logic?: QuestionLogic | undefined;
}

export type SurveyTier = "free" | "premium" | "corporate";
export type SurveyStatus = "draft" | "pending_moderation" | "active" | "closed";

export interface SurveyResponse {
  id: string;
  surveyId: string;
  submittedAt: string;
  answers: Record<string, string | string[] | number>;
  completed: boolean;
  durationSeconds: number;
  respondentSegment: string;
  respondentCountry: string;
}

export interface Survey {
  id: string;
  title: string;
  slug: string;
  category: SurveyCategory;
  objective: string;
  audience: string;
  creatorId: string;
  creatorName: string;
  organizationId?: string | undefined;
  tier: SurveyTier;
  planId: string;
  status: SurveyStatus;
  responseCount: number;
  responseLimit: number;
  openingDate: string;
  closingDate: string;
  isAnonymous: boolean;
  isBranded: boolean;
  consentNotice: string;
  estimatedMinutes: number;
  /** Cash reward credited to an earner's wallet per completed response (₦). */
  rewardNaira: number;
  /** Points locked per response in the researcher's escrow. */
  rewardPoints: number;
  /** Points currently held in escrow for outstanding respondent payouts. */
  escrowPoints: number;
  incentive?: string | undefined;
  tags: string[];
  questions: SurveyQuestion[];
  /** Aggregated sample distribution used by the preview analytics view. */
  distribution?: QuestionDistribution[] | undefined;
  moderationNote?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionDistribution {
  questionId: string;
  /** Option label → percentage (0–100). */
  buckets: { label: string; value: number; count: number }[];
  mean?: number | undefined;
}

export interface SurveyPlan {
  id: string;
  name: string;
  tier: SurveyTier;
  price: number;
  currency: string;
  billingPeriod: "one_off" | "monthly" | "annual";
  questionLimit: number | null;
  responseLimit: number | null;
  surveyLimit: number | null;
  seatsIncluded: number;
  features: string[];
  exclusions: string[];
  highlighted: boolean;
  /** Plans are administrator-configurable, never hardcoded in the UI. */
  adminConfigurable: boolean;
}

/* ------------------------------------------------------------------ */
/* Press release portal                                                */
/* ------------------------------------------------------------------ */

export interface PRTimelineEvent {
  at: string;
  status: PRStatus;
  note: string;
  actor: string;
}

export interface PRAddOn {
  id: string;
  label: string;
  price: number;
  selected: boolean;
}

export interface PressReleaseBooking {
  id: string;
  referenceNumber: string;
  title: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  country: string;
  industry: string;
  websiteUrl: string;
  tier: PRTier;
  status: PRStatus;
  targetAudience: string;
  distributionRegions: string[];
  submittedDate: string;
  targetDate: string;
  quoteAmount?: number | undefined;
  currency: string;
  contentDraft: string;
  mediaAttachments: string[];
  addOns: PRAddOn[];
  publishedUrls?: string[] | undefined;
  notes?: string | undefined;
  userId?: string | undefined;
  organizationId?: string | undefined;
  disclosureAcknowledged: boolean;
  consentToProcessing: boolean;
  paidAt?: string | undefined;
  timeline: PRTimelineEvent[];
}

export type DistributionChannelType =
  "owned_media" | "partner_distribution" | "syndication_wire" | "regional_desk";

export type DistributionChannelGroup = "nigerian-national" | "premium-nigerian" | "international";

export interface DistributionChannel {
  id: string;
  label: string;
  group: DistributionChannelGroup;
  type: DistributionChannelType;
  priceNaira?: number | undefined;
  priceUsd?: number | undefined;
  region: string;
  audience: string;
  status: "verified" | "pending_verification" | "suspended";
  verifiedOn?: string | undefined;
  indicativePrice: number;
  currency: string;
  administratorNote: string;
}

/* ------------------------------------------------------------------ */
/* Professional services                                               */
/* ------------------------------------------------------------------ */

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  duration: string;
}

export interface ProfessionalService {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  targetAudience: string;
  deliverables: string[];
  processSteps: ProcessStep[];
  timeline: string;
  pricingNote: string;
  complianceWarning?: string | undefined;
  disclosure: string;
  engagementTypes: string[];
}

export interface ServiceEnquiry {
  id: string;
  serviceId: string;
  serviceTitle: string;
  name: string;
  email: string;
  organization: string;
  country: string;
  budgetBand: string;
  preferredDate: string;
  message: string;
  status: "received" | "in_review" | "proposal_sent" | "closed";
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Commerce                                                            */
/* ------------------------------------------------------------------ */

export type ProductCategory = "Apparel" | "Stationery" | "Accessories";

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  priceNaira?: number | undefined;
  currency: string;
  description: string;
  material: string;
  variants: string[];
  variantLabel: string;
  inStock: boolean;
  stockLevel: number;
  imageUrl: string;
  detail: string[];
  careNotes?: string | undefined;
  badge?: string | undefined;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  variant: string;
  quantity: number;
  imageUrl: string;
}

export type OrderStatus =
  "pending_payment" | "paid" | "in_fulfilment" | "shipped" | "delivered" | "cancelled" | "refunded";

export interface OrderAddress {
  fullName: string;
  line1: string;
  line2?: string | undefined;
  city: string;
  postcode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  reference: string;
  userId?: string | undefined;
  email: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
  promoCode?: string | undefined;
  status: OrderStatus;
  placedAt: string;
  address: OrderAddress;
  paymentMethod: string;
  paymentReference: string;
}

/* ------------------------------------------------------------------ */
/* Audience & messaging                                                */
/* ------------------------------------------------------------------ */

export interface NewsletterSubscription {
  id: string;
  email: string;
  preferences: string[];
  frequency: string;
  consentGiven: boolean;
  createdAt: string;
}

export type ContactDepartment = "general" | "editorial" | "press" | "services";

export interface ContactMessage {
  id: string;
  department: ContactDepartment;
  name: string;
  email: string;
  organization?: string | undefined;
  subject: string;
  message: string;
  status: "received" | "assigned" | "answered";
  createdAt: string;
}

export interface ConsultationBooking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  name: string;
  email: string;
  organization: string;
  timezone: string;
  preferredSlot: string;
  agenda: string;
  createdAt: string;
  status: "requested" | "confirmed" | "completed";
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  unit?: string | undefined;
}

/* ------------------------------------------------------------------ */
/* Persistence shape                                                   */
/* ------------------------------------------------------------------ */

export interface Database {
  version: number;
  users: User[];
  organizations: Organization[];
  articles: Article[];
  surveys: Survey[];
  surveyPlans: SurveyPlan[];
  surveyResponses: SurveyResponse[];
  pressReleases: PressReleaseBooking[];
  distributionChannels: DistributionChannel[];
  services: ProfessionalService[];
  serviceEnquiries: ServiceEnquiry[];
  consultationBookings: ConsultationBooking[];
  products: Product[];
  orders: Order[];
  newsletterSubscriptions: NewsletterSubscription[];
  contactMessages: ContactMessage[];
  transactions: WalletTransaction[];
  payouts: PayoutRequest[];
  polls: DailyPoll[];
  pollVotes: Record<string, string[]>;
  pollLastOption: Record<string, string>;
  kitRequests: KitRequest[];
  settings: PlatformSettings;
  sessionUserId: string | null;
  updatedAt: string;
}
