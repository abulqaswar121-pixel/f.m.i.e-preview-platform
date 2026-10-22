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

/** Outlets whose logo is saved locally because the online icon service only returns a blank globe. */
const LOCAL_LOGOS = new Set([
  "ch-002", "ch-006", "ch-009", "ch-019", "ch-025", "ch-027", "ch-029", "ch-034", "ch-041", "ch-043",
]);

/** Outlets with no findable logo; they show initials instead of a blank globe. */
const NO_LOGO = new Set(["ch-021", "ch-024", "ch-032", "ch-035"]);

export function outletLogoUrl(channelId: string): string | null {
  if (LOCAL_LOGOS.has(channelId)) return `/outlet-logos/${channelId}.png`;
  if (NO_LOGO.has(channelId)) return null;
  const domain = OUTLET_DOMAINS[channelId];
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;
}
