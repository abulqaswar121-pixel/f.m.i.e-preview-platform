import type {
  ContactDepartment,
  DistributionChannelType,
  MarketIndex,
  NewsCategory,
  PRTier,
  PRStatus,
  SurveyCategory,
  UserRole,
} from "@/types";

/**
 * SINGLE SOURCE OF TRUTH.
 *
 * Brand identity, contact routing, addresses, navigation, taxonomies, pricing
 * copy and every legal / compliance notice live here. Components must import
 * from this module — no email address, address or tier price is ever hardcoded
 * inside a component or page.
 */

export const site = {
  name: "F.M.I.E",
  legalName: "F.M.I.E Media & Research Ltd",
  wordmark: "F.M.I.E",
  tagline: "F.M.I.E Means Business",
  mission: "Connecting Ideas, Insights & Global Opportunities.",
  domain: "fmie.co.uk",
  url: "https://fmie.co.uk",
  description:
    "F.M.I.E is an international business media platform, independent survey marketplace, press release booking and distribution network, executive professional services consultancy and branded digital commerce platform.",
  founded: 2019,
  companyNumber: "Sample registration — demonstration preview",
  vatNumber: "Sample VAT registration — demonstration preview",
  previewNotice:
    "Demonstration preview. Every article, survey, price, order and person here is sample data made for this design. Nothing is real journalism, live data or a real transaction.",
} as const;

export const headquarters = {
  label: "Head Office",
  lines: ["124 City Road", "London", "EC1V 2NX", "United Kingdom"],
  addressOneLine: "124 City Road, London, EC1V 2NX, United Kingdom",
  telephone: "+44 20 7946 0100",
  hours: "Monday to Friday, 09:00–18:00 GMT",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=124+City+Road+London+EC1V+2NX",
} as const;

export const westAfricaDesk = {
  label: "West Africa Desk",
  lines: ["Victoria Island", "Lagos", "Nigeria"],
  addressOneLine: "Victoria Island, Lagos, Nigeria",
  hours: "Monday to Friday, 09:00–18:00 WAT",
} as const;

export const offices = [headquarters, westAfricaDesk] as const;

export interface ContactRoute {
  id: ContactDepartment;
  label: string;
  email: string;
  telephone: string;
  description: string;
  responseTime: string;
  handles: string[];
}

/** All outbound contact addresses. Only `@fmie.co.uk` is permitted. */
export const contactRoutes: ContactRoute[] = [
  {
    id: "general",
    label: "General Enquiries",
    email: "contact@fmie.co.uk",
    telephone: "+44 20 7946 0100",
    description:
      "Account help, platform questions, membership, partnership enquiries and anything that does not belong to a specialist desk.",
    responseTime: "One working day",
    handles: ["Accounts & access", "Membership", "Partnerships", "General feedback"],
  },
  {
    id: "editorial",
    label: "Editorial & Journalism",
    email: "editorial@fmie.co.uk",
    telephone: "+44 20 7946 0112",
    description:
      "News tips, corrections, contributor pitches, right of reply requests and editorial standards questions.",
    responseTime: "Two working days",
    handles: ["News tips", "Corrections & clarifications", "Contributor pitches", "Right of reply"],
  },
  {
    id: "press",
    label: "Press Releases & Media Distribution",
    email: "press@fmie.co.uk",
    telephone: "+44 20 7946 0134",
    description:
      "Press release bookings, tier selection, distribution scope, quotation requests and campaign reporting.",
    responseTime: "Four working hours",
    handles: ["Booking a release", "Quotes & tiers", "Distribution scope", "Campaign reports"],
  },
  {
    id: "services",
    label: "Executive & Professional Services",
    email: "services@fmie.co.uk",
    telephone: "+44 20 7946 0156",
    description:
      "Autobiography and executive profile writing, digital marketing contracting, pitching and representation, and Wikipedia policy advisory.",
    responseTime: "One working day",
    handles: [
      "Executive profile writing",
      "Digital marketing contracts",
      "Pitching & representation",
      "Wikipedia advisory",
    ],
  },
];

export const contactEmail = {
  general: "contact@fmie.co.uk",
  editorial: "editorial@fmie.co.uk",
  press: "press@fmie.co.uk",
  surveys: "survey@fmie.co.uk",
  services: "services@fmie.co.uk",
  privacy: "contact@fmie.co.uk",
  abuse: "editorial@fmie.co.uk",
} as const;

export const socialLinks = [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@hague_digital",
    url: "https://www.instagram.com/hague_digital?stkn=cDRveGtjdW0yY25i",
  },
  {
    id: "facebook",
    label: "Facebook",
    handle: "F.M.I.E",
    url: "https://www.facebook.com/profile.php?id=100085736047647",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "The Hague Digital Company",
    url: "https://www.linkedin.com/company/the-hague-digital-company",
  },
  {
    id: "tiktok",
    label: "TikTok",
    handle: "@haguecoofficial",
    url: "https://www.tiktok.com/@haguecoofficial?lang=en",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  /** Plain path only — query parameters live in `search`. */
  to: string;
  search?: Record<string, string>;
  hash?: string;
  description?: string;
  children?: NavChild[];
}

export interface NavChild {
  label: string;
  to: string;
  search?: Record<string, string>;
  hash?: string;
  description: string;
}

export interface PositioningPillar {
  title: string;
  blurb: string;
  to: string;
}

/**
 * Positioning adopted from the client's live site (extracted 2026-10-14).
 *
 * The live homepage also carried guaranteed-placement wording, named
 * third-party publishers and unsubstantiated reach figures; those are
 * deliberately NOT reproduced here. Every line below is either the client's
 * own claim-free copy or a compliant rewrite — see
 * docs/fmie-live-site-review.md for the full adoption record.
 */
export const livePositioning: {
  heroLine: string;
  bandTitle: string;
  bandBody: string;
  photoCredit: string;
  /** Lines the homepage hero types out, wipes back and retypes in a loop. */
  heroRotatingLines: string[];
  heroCredit: string;
  pillars: PositioningPillar[];
} = {
  heroLine: "Unlock Your Story. Amplify Your Impact.",
  bandTitle: "Feature Local. Impact Global.",
  bandBody:
    "We plan every campaign on owned F.M.I.E channels and verified partner desks, with a clear workflow and an honest quote. No publication is ever promised — editors always decide.",
  photoCredit:
    "Sample photography: public-domain stock supplied with the client's live site, labelled for demonstration only.",
  heroRotatingLines: [
    "Unlock Your Story. Amplify Your Impact.",
    "Feature Local. Impact Global.",
    "Connecting Ideas, Insights & Global Opportunities.",
  ],
  heroCredit:
    "Background: sample stock photography supplied with the client's former site, labelled for demonstration only.",
  pillars: [
    {
      title: "PR and Media Placement",
      blurb:
        "Structured press-release booking through owned and verified channels, with dated workflows, tiered quotations and no guaranteed pickup.",
      to: "/press-releases",
    },
    {
      title: "Paid Surveys Platform",
      blurb:
        "An independent survey marketplace where panellists take part voluntarily and every result is published with its limitations.",
      to: "/surveys",
    },
    {
      title: "Pitching and Representation",
      blurb:
        "Executive representation and advisory engagements with documented scopes; we prepare and present, never promise outcomes.",
      to: "/services",
    },
  ],
};

export const mainNavigation: NavItem[] = [
  { label: "Home", to: "/" },
  {
    label: "News & Insights",
    to: "/news",
    description: "Independent business journalism across ten editorial desks.",
    children: [
      {
        label: "All News & Insights",
        to: "/news",
        description: "Latest reporting, features and analysis.",
      },
      {
        label: "Business & Finance",
        to: "/news",
        search: { category: "Business & Finance" },
        description: "Corporate earnings, banking and capital markets.",
      },
      {
        label: "Global Economy",
        to: "/news",
        search: { category: "Global Economy" },
        description: "Trade policy, macro cycles and supply chains.",
      },
      {
        label: "Africa & Emerging Markets",
        to: "/news",
        search: { category: "Africa & Emerging Markets" },
        description: "Frontier-market investment and industrialisation.",
      },
      {
        label: "Opinions & Analysis",
        to: "/news",
        search: { category: "Opinions & Analysis" },
        description: "Columnists and long-read interpretation.",
      },
    ],
  },
  {
    label: "Surveys",
    to: "/surveys",
    description: "The F.M.I.E independent survey marketplace.",
    children: [
      {
        label: "Explore Surveys",
        to: "/surveys",
        description: "Take part in live free and premium research.",
      },
      {
        label: "Create a Survey",
        to: "/surveys/create",
        description: "Multi-step builder with logic and live preview.",
      },
      {
        label: "Plans & Pricing",
        to: "/surveys/plans",
        description: "Free, Premium and Corporate research plans.",
      },
    ],
  },
  {
    label: "Press Releases",
    to: "/press-releases",
    description: "Global booking, distribution and campaign tracking.",
    children: [
      {
        label: "Distribution Tiers",
        to: "/press-releases",
        description: "Emerging, Business & Finance, Premium International.",
      },
      {
        label: "Book a Release",
        to: "/press-releases/book",
        description: "Four-step booking wizard with disclosure terms.",
      },
      {
        label: "Track a Campaign",
        to: "/dashboard",
        search: { tab: "press" },
        description: "Follow all twelve workflow states.",
      },
    ],
  },
  {
    label: "Services",
    to: "/services",
    description: "Executive and professional services consultancy.",
  },
  {
    label: "Shop",
    to: "/shop",
    description: "F.M.I.E branded merchandise.",
  },
  {
    label: "About",
    to: "/about",
    description: "Mission, governance and editorial standards.",
    children: [
      {
        label: "About F.M.I.E",
        to: "/about",
        description: "Vision, mission and seven core values.",
      },
      {
        label: "Editorial & Media Policy",
        to: "/editorial-policy",
        description: "Disclosures, corrections and conflicts of interest.",
      },
      {
        label: "Contact",
        to: "/contact",
        description: "Departmental routing and London head office.",
      },
    ],
  },
];

export interface FooterLink {
  label: string;
  to: string;
  search?: Record<string, string> | undefined;
  hash?: string | undefined;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const footerNavigation: FooterColumn[] = [
  {
    title: "Platform",
    links: [
      { label: "News & Insights", to: "/news" },
      { label: "Survey Marketplace", to: "/surveys" },
      { label: "Global Press Releases", to: "/press-releases" },
      { label: "Professional Services", to: "/services" },
      { label: "F.M.I.E Shop", to: "/shop" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", to: "/signin" },
      { label: "Register", to: "/register" },
      { label: "My Dashboard", to: "/dashboard" },
      { label: "Administrator Panel", to: "/admin" },
      { label: "Checkout", to: "/checkout" },
    ],
  },
  {
    title: "Standards & Policy",
    links: [
      { label: "Editorial & Media Policy", to: "/editorial-policy" },
      { label: "Privacy Notice", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Advertising & Sponsorship", to: "/advertising" },
      { label: "Survey Ethics & Consent", to: "/survey-ethics" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About F.M.I.E", to: "/about" },
      { label: "Contact Us", to: "/contact" },
      { label: "Corrections Desk", to: "/contact", search: { department: "editorial" } },
      { label: "Press Desk", to: "/contact", search: { department: "press" } },
      { label: "Distribution Catalogue", to: "/press-releases", hash: "catalogue" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Taxonomies                                                          */
/* ------------------------------------------------------------------ */

export const newsCategories: NewsCategory[] = [
  "Finance",
  "Energy & Oil",
  "Tech & AI",
  "African Trade",
  "Policy",
  "Global Markets",
];

export const newsCategoryDescriptions: Record<NewsCategory, string> = {
  Finance: "Banking, capital, corporate performance and the balance sheets behind them.",
  "Energy & Oil": "Upstream, downstream, transition finance and the economics of power.",
  "Tech & AI": "Enterprise compute, applied research and the industrialisation of new tools.",
  "African Trade": "Corridors, cross-border company building and regional integration.",
  Policy: "Governance, regulation, board design and executive accountability.",
  "Global Markets": "Allocation, yields, risk pricing and the desks that trade them.",
};

export const surveyCategories: SurveyCategory[] = [
  "Consumer Behaviour",
  "Business & Market Research",
  "Finance & Investment",
  "Technology",
  "Education",
  "Healthcare Research",
  "Public Opinion",
  "Entrepreneurship",
  "Product Feedback",
  "Employee / Organisation Surveys",
];

export const roleLabels: Record<UserRole, string> = {
  earner: "Survey Earner",
  visitor: "Public Reader",
  registered_user: "Registered Member",
  survey_creator: "Researcher",
  premium_customer: "PR Client",
  corporate_account: "Corporate Account",
  contributor: "Contributor",
  administrator: "Super Admin",
};

export const roleDescriptions: Record<UserRole, string> = {
  earner: "Answer surveys, earn cash, withdraw to your bank.",
  visitor: "Read-only access to public journalism, surveys and the shop.",
  registered_user: "Saved reading list, survey participation and order history.",
  survey_creator: "Buy points, launch surveys, read live results.",
  premium_customer: "Book press coverage and track it live.",
  corporate_account: "Multi-seat research account with billing history and branded surveys.",
  contributor: "Submit pitches, drafts and interview requests to the editorial desk.",
  administrator: "Full control of surveys, payouts, press, kits and settings.",
};

/* ------------------------------------------------------------------ */
/* Survey economy (defaults; the live values are admin-configurable)   */
/* ------------------------------------------------------------------ */

export interface SurveyPointPack {
  id: string;
  naira: number;
  points: number;
  blurb: string;
}

export const surveyPointPacks: SurveyPointPack[] = [
  { id: "pack-50", naira: 5000, points: 50, blurb: "Starter block for a single pilot survey." },
  { id: "pack-250", naira: 20000, points: 250, blurb: "Most popular — funds a full quota run." },
  {
    id: "pack-1000",
    naira: 75000,
    points: 1000,
    blurb: "Programme pricing for continuous research.",
  },
];

/** Indicative per-kit price used by the team-kit builder's instant quote. */
export const teamKitUnitNaira = 25000;

export const surveyEconomyDefaults = {
  pointToNaira: 100,
  minWithdrawalNaira: 2000,
  heroVideoUrl: "",
  showcaseVideoUrl: "/media/showcase-film.mp4",
  showcaseAudioUrl: "/media/showcase-voiceover.mp3",
} as const;

/** Exact disclaimer line required on the demonstration preview. */
export const demoBadgeDisclaimer =
  "F.M.I.E Demonstration Preview — Sample Editorial & Media Services";

/* ------------------------------------------------------------------ */
/* Press release tiers & workflow                                      */
/* ------------------------------------------------------------------ */

export interface PRTierDefinition {
  id: PRTier;
  name: string;
  shortName: string;
  priceFrom: number;
  currency: string;
  turnaround: string;
  summary: string;
  includes: string[];
  bestFor: string;
  regions: string[];
}

export const prTiers: PRTierDefinition[] = [
  {
    id: "tier_3_emerging",
    name: "Tier 3 — Emerging",
    shortName: "Emerging",
    priceFrom: 950,
    currency: "GBP",
    turnaround: "5–7 working days",
    summary:
      "Entry-level release preparation and owned-media publication for founders, associations and early-stage companies announcing a first milestone.",
    includes: [
      "Editorial review of a 400–600 word release",
      "One revision round",
      "Publication on the F.M.I.E commercial dispatch desk",
      "Standard headline and boilerplate formatting",
      "Campaign reference number and PDF record",
    ],
    bestFor: "First announcements, funding rounds under £1m, regional associations.",
    regions: ["United Kingdom", "Owned-media network"],
  },
  {
    id: "tier_2_business",
    name: "Tier 2 — Business & Finance",
    shortName: "Business & Finance",
    priceFrom: 1850,
    currency: "GBP",
    turnaround: "3–5 working days",
    summary:
      "Commercial desk preparation plus coordinated distribution to verified business and finance channels across selected regions.",
    includes: [
      "Sub-editing to house style with two revision rounds",
      "Quotations checked for attribution and disclosure",
      "Distribution to verified business and finance channels",
      "Regional targeting across up to three territories",
      "Media attachment handling (up to five assets)",
      "Post-campaign distribution report with confirmed URLs",
    ],
    bestFor: "Product launches, trading updates, appointments, logistics and industrial news.",
    regions: ["United Kingdom", "DACH", "Benelux", "Nordics", "Ireland"],
  },
  {
    id: "tier_1_premium",
    name: "Tier 1 — Premium International",
    shortName: "Premium International",
    priceFrom: 3400,
    currency: "GBP",
    turnaround: "2–4 working days",
    summary:
      "Full communications engagement: message architecture, multilingual preparation, international distribution and an earned-media outreach attempt logged transparently.",
    includes: [
      "Message architecture workshop and headline testing",
      "Senior sub-edit and legal-disclosure review",
      "International distribution across up to eight territories",
      "Translation preparation for two languages (add-on priced separately)",
      "Named journalist outreach logged with outcome for each contact",
      "Executive briefing note and completion dossier",
    ],
    bestFor: "Group announcements, cross-border transactions, regulated-sector disclosures.",
    regions: [
      "United Kingdom",
      "DACH",
      "Benelux",
      "France",
      "Nordics",
      "North America",
      "Gulf Cooperation Council",
      "West Africa",
    ],
  },
];

export const prAddOns = [
  { id: "proofread", label: "Senior proofread & house-style edit", price: 180 },
  { id: "translation", label: "Translation preparation (per language)", price: 420 },
  { id: "multimedia", label: "Multimedia asset package (images, captions, credits)", price: 260 },
  { id: "embargo", label: "Embargo management & journalist briefing note", price: 210 },
  { id: "extended_report", label: "Extended distribution report with outreach log", price: 150 },
] as const;

export const prStatusOrder: PRStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "additional_info_required",
  "quote_sent",
  "awaiting_payment",
  "approved",
  "in_production",
  "distribution_in_progress",
  "completed",
  "rejected",
  "cancelled",
];

export interface PRStatusDefinition {
  id: PRStatus;
  label: string;
  description: string;
  tone: "neutral" | "info" | "warning" | "success" | "danger" | "muted";
  stage: number;
  terminal?: boolean;
}

/** The twelve-state press release workflow, in presentation order. */
export const prStatuses: PRStatusDefinition[] = [
  {
    id: "draft",
    label: "Draft",
    description: "Saved privately by the client. Not visible to the F.M.I.E desk.",
    tone: "muted",
    stage: 0,
  },
  {
    id: "submitted",
    label: "Submitted",
    description: "Received by the press desk and queued with a reference number.",
    tone: "info",
    stage: 1,
  },
  {
    id: "under_review",
    label: "Under Review",
    description: "Editorial and compliance review of claims, quotations and disclosure.",
    tone: "info",
    stage: 2,
  },
  {
    id: "additional_info_required",
    label: "Additional Information Required",
    description: "The desk has requested verification, assets or clarification.",
    tone: "warning",
    stage: 3,
  },
  {
    id: "quote_sent",
    label: "Quote Sent",
    description: "A priced quotation for the selected tier and add-ons has been issued.",
    tone: "warning",
    stage: 4,
  },
  {
    id: "awaiting_payment",
    label: "Awaiting Payment",
    description: "Quotation accepted; payment outstanding before production begins.",
    tone: "warning",
    stage: 5,
  },
  {
    id: "approved",
    label: "Approved",
    description: "Payment cleared and the release is cleared for production.",
    tone: "success",
    stage: 6,
  },
  {
    id: "in_production",
    label: "In Production",
    description: "Sub-editing, formatting, asset handling and channel scheduling.",
    tone: "info",
    stage: 7,
  },
  {
    id: "distribution_in_progress",
    label: "Distribution in Progress",
    description: "Live transmission to confirmed owned and partner channels.",
    tone: "info",
    stage: 8,
  },
  {
    id: "completed",
    label: "Completed",
    description: "Distribution closed and the completion dossier has been issued.",
    tone: "success",
    stage: 9,
    terminal: true,
  },
  {
    id: "rejected",
    label: "Rejected",
    description: "Declined on editorial, legal or disclosure grounds. Reason recorded.",
    tone: "danger",
    stage: -1,
    terminal: true,
  },
  {
    id: "cancelled",
    label: "Cancelled",
    description: "Withdrawn by the client or closed at the client's request.",
    tone: "muted",
    stage: -1,
    terminal: true,
  },
];

export const prWorkflowStages: { stage: number; label: string; statuses: PRStatus[] }[] = [
  { stage: 1, label: "Intake", statuses: ["draft", "submitted"] },
  {
    stage: 2,
    label: "Editorial & Compliance Review",
    statuses: ["under_review", "additional_info_required"],
  },
  { stage: 3, label: "Commercial", statuses: ["quote_sent", "awaiting_payment"] },
  {
    stage: 4,
    label: "Production & Distribution",
    statuses: ["approved", "in_production", "distribution_in_progress"],
  },
  { stage: 5, label: "Closure", statuses: ["completed", "rejected", "cancelled"] },
];

export const distributionChannelTypes: Record<
  DistributionChannelType,
  { label: string; explanation: string }
> = {
  owned_media: {
    label: "Owned Media",
    explanation:
      "F.M.I.E commercial desks that we operate directly. Placement here is confirmed on payment and always carries a paid-content disclosure.",
  },
  partner_distribution: {
    label: "Partner Distribution",
    explanation:
      "Third-party channels with which F.M.I.E holds a current written distribution arrangement. Status and verification date are recorded per channel by an administrator.",
  },
  syndication_wire: {
    label: "Syndication Wire",
    explanation:
      "Newswire transmission made available to subscribing newsrooms. Transmission is confirmed; pickup by any individual newsroom is never guaranteed.",
  },
  regional_desk: {
    label: "Regional Desk Outreach",
    explanation:
      "Earned-media pitching to regional journalists. Each contact and its outcome is logged. Coverage is not sold and cannot be promised.",
  },
};

/* ------------------------------------------------------------------ */
/* Compliance copy — reused verbatim across the platform               */
/* ------------------------------------------------------------------ */

export const compliance = {
  distributionTransparency: {
    title: "Distribution transparency: what you are and are not buying",
    body: "F.M.I.E sells preparation, coordination and confirmed transmission through channels it operates or holds a current written arrangement with. F.M.I.E does not sell, and cannot guarantee, independent editorial coverage in any third-party publication.",
    points: [
      "Owned Media — published on F.M.I.E commercial desks, confirmed on payment, always disclosed as paid content.",
      "Partner Distribution — transmitted to channels with a current written arrangement and a recorded verification date.",
      "Syndication Wire — transmitted to subscribing newsrooms; transmission confirmed, individual pickup never guaranteed.",
      "Earned Media — pitched, logged and reported; never sold and never promised.",
    ],
    notice:
      "No placement in a named third-party publication is guaranteed. Outlet names and logos are not used in F.M.I.E marketing unless a contractual authority is held and independently verified.",
  },
  surveyRepresentativeness: {
    title: "Survey results are not statistically representative",
    body: "Responses collected through the F.M.I.E marketplace are self-selected. Unless a documented probability sampling method, weighting frame and achieved sample size support it, results describe the people who answered — not a national, sector or global population.",
    notice:
      "Any republication of F.M.I.E survey data must carry this limitation. Do not present a percentage as a population estimate without a stated sampling methodology.",
  },
  wikipediaAdvisory: {
    title: "Wikipedia advisory ethics",
    body: "F.M.I.E strictly adheres to the Wikimedia Foundation Terms of Use and paid-contribution disclosure policies. We do not guarantee article creation, retention, or survival, and we do not engage in unauthorized promotional editing.",
    notice:
      "All contributions are declared on the relevant talk page and in the editor's disclosure record. Notability is determined by Wikipedia editors, not by F.M.I.E.",
  },
  pitchingDisclaimer:
    "Pitching & Representation does not guarantee capital investment, funding success, or guaranteed media placement. Introductions are made where a genuine editorial or commercial fit exists, and every outreach attempt is logged with its outcome.",
  editorialSeparation:
    "Independent editorial content and paid promotional content are produced by separate desks, labelled at the point of publication, and never sold as journalism. Payment for a press release does not buy editorial coverage, an interview, or an opinion column.",
  sampleData:
    "Sample data. Names, organisations, statistics, prices, reference numbers and coverage links in this preview are fictional and exist to demonstrate the interface.",
  noAffiliation:
    "F.M.I.E is an independent platform. It is not owned by, endorsed by, or editorially affiliated with any third-party publisher, broadcaster or newswire.",
} as const;

export const coreValues = [
  {
    id: "integrity",
    title: "Integrity",
    body: "Editorial judgement is never sold. Commercial activity is disclosed at the point of publication, and the newsroom holds the final word on what is labelled journalism.",
  },
  {
    id: "transparency",
    title: "Transparency",
    body: "Clients see exactly which channels are owned, which are partnered, and which are pitched. Verification dates and outreach outcomes are recorded, not implied.",
  },
  {
    id: "innovation",
    title: "Innovation",
    body: "We build research and distribution tooling that lets a small team operate to institutional standards, with data structures designed to be handed to a real backend unchanged.",
  },
  {
    id: "professionalism",
    title: "Professionalism",
    body: "Named accountability on every engagement: a desk editor, a documented workflow, a dated deliverable and a written record of what was and was not achieved.",
  },
  {
    id: "accessibility",
    title: "Accessibility",
    body: "Research and business media should not require an institutional budget. Free survey tiers, plain-language disclosure and readable design keep the platform open.",
  },
  {
    id: "responsible-communication",
    title: "Responsible Communication",
    body: "We do not overstate reach, we do not present self-selected samples as populations, and we decline engagements that cannot be communicated honestly.",
  },
  {
    id: "global-collaboration",
    title: "Global Collaboration",
    body: "London-headquartered with desks focused on Africa, the Gulf and European emerging markets, working with local researchers and regional distribution partners.",
  },
] as const;

/* ------------------------------------------------------------------ */
/* Commerce                                                            */
/* ------------------------------------------------------------------ */

export const commerce = {
  currency: "GBP",
  currencySymbol: "£",
  freeShippingThreshold: 150,
  standardShipping: 6.95,
  internationalShipping: 18.5,
  promoCodes: [
    {
      code: "FMIE2026",
      type: "percent" as const,
      value: 10,
      description: "10% off the merchandise basket",
      minimumSubtotal: 0,
      active: true,
    },
    {
      code: "EXECUTIVE25",
      type: "percent" as const,
      value: 5,
      description: "5% loyalty reduction for corporate account holders",
      minimumSubtotal: 100,
      active: true,
    },
  ],
  paymentMethods: [
    {
      id: "card",
      label: "Debit or credit card",
      detail: "Simulated — no card is charged in this preview.",
    },
    {
      id: "bank_transfer",
      label: "Bank transfer (BACS)",
      detail: "Simulated instruction, no funds move.",
    },
    {
      id: "purchase_order",
      label: "Corporate purchase order",
      detail: "Requires an approved corporate account.",
    },
  ],
  shopCategories: ["Apparel", "Stationery", "Accessories"] as const,
  vatNote:
    "Prices include UK VAT where applicable. This preview does not calculate real tax, duty or shipping charges.",
} as const;

export const newsletterPreferences = [
  {
    id: "morning-brief",
    label: "The Morning Brief",
    detail: "Weekday 07:00 GMT — markets, policy and the day's agenda.",
  },
  {
    id: "weekly-insight",
    label: "Weekly Insight",
    detail: "Friday long-read features and analysis.",
  },
  {
    id: "research-alerts",
    label: "Research Alerts",
    detail: "New surveys closing soon in your selected categories.",
  },
  {
    id: "emerging-markets",
    label: "Emerging Markets Dispatch",
    detail: "Fortnightly Africa, Gulf and frontier-market briefing.",
  },
  {
    id: "commercial",
    label: "Commercial & Events",
    detail: "Services, distribution offers and F.M.I.E events. Optional.",
  },
] as const;

export const newsletterFrequencies = ["Daily", "Weekly", "Fortnightly"] as const;

export const marketIndicesSeed: MarketIndex[] = [
  { symbol: "USD/NGN", name: "US Dollar / Naira", value: 1545.0, change: 6.5, changePercent: 0.42 },
  {
    symbol: "GBP/NGN",
    name: "Pound Sterling / Naira",
    value: 2065.0,
    change: -4.25,
    changePercent: -0.21,
  },
  { symbol: "FTSE 100", name: "FTSE 100", value: 8412.66, change: 24.18, changePercent: 0.29 },
  { symbol: "S&P 500", name: "S&P 500", value: 6188.4, change: -12.75, changePercent: -0.21 },
  {
    symbol: "NASDAQ",
    name: "NASDAQ Composite",
    value: 20114.8,
    change: 88.32,
    changePercent: 0.44,
  },
  { symbol: "NIKKEI 225", name: "Nikkei 225", value: 39884.11, change: 316.5, changePercent: 0.8 },
  { symbol: "DAX", name: "DAX 40", value: 18902.45, change: -41.09, changePercent: -0.22 },
  {
    symbol: "STOXX 600",
    name: "STOXX Europe 600",
    value: 528.31,
    change: 1.94,
    changePercent: 0.37,
  },
  {
    symbol: "BRENT",
    name: "Brent Crude",
    value: 78.42,
    change: -0.63,
    changePercent: -0.8,
    unit: "USD/bbl",
  },
  {
    symbol: "GOLD",
    name: "Gold Spot",
    value: 2418.9,
    change: 14.2,
    changePercent: 0.59,
    unit: "USD/oz",
  },
  { symbol: "GBPUSD", name: "GBP / USD", value: 1.2718, change: 0.0021, changePercent: 0.17 },
  { symbol: "EURUSD", name: "EUR / USD", value: 1.0864, change: -0.0012, changePercent: -0.11 },
] as const;

export const countries = [
  "United Kingdom",
  "Ireland",
  "Germany",
  "France",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Spain",
  "Portugal",
  "Italy",
  "Poland",
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Egypt",
  "Morocco",
  "Rwanda",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "United States",
  "Canada",
  "Brazil",
  "India",
  "Singapore",
  "Japan",
  "Australia",
] as const;

export const industries = [
  "Financial Services",
  "Technology & Software",
  "Energy & Utilities",
  "Manufacturing & Industrials",
  "Logistics & Transport",
  "Healthcare & Life Sciences",
  "Professional Services",
  "Retail & Consumer Goods",
  "Real Estate & Construction",
  "Education & Research",
  "Public Sector & Associations",
  "Media & Communications",
  "Agriculture & Food",
  "Mining & Materials",
] as const;

export const distributionRegions = [
  "United Kingdom",
  "Ireland",
  "DACH",
  "Benelux",
  "France",
  "Nordics",
  "Southern Europe",
  "Central & Eastern Europe",
  "North America",
  "Gulf Cooperation Council",
  "West Africa",
  "East Africa",
  "Southern Africa",
  "North Africa",
  "South Asia",
  "Southeast Asia",
  "Australasia",
] as const;

export const budgetBands = [
  "Under £2,500",
  "£2,500 – £10,000",
  "£10,000 – £25,000",
  "£25,000 – £75,000",
  "Above £75,000",
  "To be scoped",
] as const;

export const legal = {
  copyright: `© ${new Date().getFullYear()} ${site.legalName}. All rights reserved.`,
  registeredOffice: `Registered office: ${headquarters.addressOneLine}.`,
  notices: [
    "F.M.I.E is an independent business media and research platform. It is not affiliated with, endorsed by, or sponsored by any third-party publisher, broadcaster, newswire or social platform.",
    "Press release distribution is a paid commercial service. Paid content is labelled at the point of publication and is produced separately from the editorial newsroom.",
    "Survey results published on this platform are self-selected and are not presented as statistically representative of any population.",
    "This build is a design and workflow preview. No live payments, emails, file uploads, wire transmissions or database writes occur.",
  ],
} as const;

export const quickActions = [
  {
    label: "Publish a Survey",
    to: "/surveys/create",
    description: "Free and premium research plans",
  },
  {
    label: "Book a Press Release",
    to: "/press-releases/book",
    description: "Three distribution tiers",
  },
] as const;

export function formatCurrency(amount: number, currency = commerce.currency): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelative(iso: string): string {
  const date = new Date(iso).getTime();
  if (Number.isNaN(date)) return iso;
  const diff = date - Date.now();
  const abs = Math.abs(diff);
  const day = 86_400_000;
  const rtf = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });
  if (abs < day) {
    const hours = Math.round(diff / 3_600_000);
    if (Math.abs(hours) < 1) return "just now";
    return rtf.format(hours, "hour");
  }
  if (abs < day * 30) return rtf.format(Math.round(diff / day), "day");
  if (abs < day * 365) return rtf.format(Math.round(diff / (day * 30)), "month");
  return rtf.format(Math.round(diff / (day * 365)), "year");
}
