/** Website of each partner outlet, used to show its official site icon as a logo. */
const OUTLET_DOMAINS: Record<string, string> = {
  "ch-001": "independent.ng",
  "ch-002": "sunnewsonline.com",
  "ch-003": "tribuneonlineng.com",
  "ch-004": "pmnewsnigeria.com",
  "ch-005": "thisdaylive.com",
  "ch-006": "vanguardngr.com",
  "ch-007": "leadership.ng",
  "ch-008": "newtelegraphng.com",
  "ch-009": "guardian.ng",
  "ch-010": "blueprint.ng",
  "ch-011": "thenationonlineng.net",
  "ch-012": "legit.ng",
  "ch-013": "businessday.ng",
  "ch-014": "allure.vanguardngr.com",
  "ch-015": "punchng.com",
  "ch-016": "londonjournal.co.uk",
  "ch-017": "digitaljournal.com",
  "ch-018": "africa.businessinsider.com",
  "ch-019": "businessinsider.com",
  "ch-020": "forbesafrica.com",
  "ch-021": "thenewyorkjournal.com",
  "ch-022": "marketwatch.com",
  "ch-023": "theustimes.com",
  "ch-024": "newsnetmedia.com",
  "ch-025": "streetinsider.com",
  "ch-026": "apnews.com",
  "ch-027": "newsmax.com",
  "ch-028": "businesstimes.com.sg",
  "ch-029": "dowjones.com",
  "ch-030": "benzinga.com",
  "ch-031": "londondailypost.com",
  "ch-032": "influencerdaily.net",
  "ch-033": "nytimes.com",
  "ch-034": "nasdaq.com",
  "ch-035": "moguls-of-business.com",
  "ch-036": "starsofentrepreneurship.com",
  "ch-037": "hustleweekly.com",
  "ch-038": "newyorkbusinessnow.com",
  "ch-039": "entrepreneur.com",
  "ch-040": "finance.yahoo.com",
  "ch-041": "news.yahoo.com",
  "ch-042": "bloomberg.com",
  "ch-043": "forbes.com",
  "ch-044": "cnn.com",
};

/** Outlets with no findable logo; they show initials instead of a blank globe. */
const NO_LOGO = new Set(["ch-021", "ch-024", "ch-032", "ch-035"]);

/** Every logo is a small file saved on our own site, so it shows instantly (no outside service). */
export function outletLogoUrl(channelId: string): string | null {
  if (NO_LOGO.has(channelId) || !OUTLET_DOMAINS[channelId]) return null;
  return `/outlet-logos/${channelId}.webp`;
}
