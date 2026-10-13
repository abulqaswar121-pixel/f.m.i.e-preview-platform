# F.M.I.E Preview Platform

**F.M.I.E Means Business** — `fmie.co.uk`

> Connecting Ideas, Insights & Global Opportunities.

A complete, clickable **demonstration preview** of the F.M.I.E platform: international business
media, an independent survey marketplace, press-release booking and distribution, executive
professional services, and branded commerce — running on a simulated backend with no live
database, payments, email or file storage.

---

## What this build is

Everything looks and behaves like the real product, but every record is sample data held in
`src/data/*.json` and persisted to your browser's `localStorage`. Sign-in accepts any
valid-looking email and lands on a pre-filled dashboard; four one-click demo personas
(Guest reader, Survey Creator, Corporate account, Administrator) switch permissions,
navigation and dashboard contents instantly, without a page reload.

Nothing here is published journalism, live market data, a real transaction or a real individual.
The footer carries that notice on every page.

## Running it

```bash
npm install --legacy-peer-deps   # plain `npm install` hits an npm 10 arborist peer-resolution bug
npm run dev                      # Vite on http://localhost:8080 (bound to 0.0.0.0)
npm run lint                     # eslint + prettier — zero errors, zero warnings
npx tsc --noEmit                 # strict TypeScript, clean
npm run test                     # route-tree + service-layer (13 assertions suites) tests
npm run build                    # production SSR build via nitro
```

## Architecture

```
src/
  config/site.ts          single source of truth: brand, contacts, nav, taxonomies,
                          PR tiers/statuses/add-ons, compliance copy, commerce, legal,
                          formatters. No email address or price is hardcoded in a component.
  types/index.ts          every domain type (articles, surveys, press releases, orders, …)
  data/*.json + index.ts  seed records; index.ts is the only JSON import point and casts
                          seeds to the domain types, plus deterministic response samples
  services/api.ts         the simulated backend. Namespaced async functions
                          (api.articles.list(), api.surveys.create(), api.pressReleases.updateStatus(), …)
                          over a versioned localStorage store with seed fallback, artificial
                          latency, an SSR-safe useSyncExternalStore hook and resetDemoData()
  hooks/                  useAuth.ts, useCart.ts, useAsync.ts (useAsyncResource, useDebouncedValue)
  lib/                    rich-text parser, tone helpers, utils
  components/             brand/, common/, layout/, press/, shop/, surveys/, providers/, ui/
  pages/                  page-level components (plain React, not routes)
  routes/                 TanStack Start file-based routing. `_site.tsx` is a pathless layout
                          wrapping AppLayout; `_site/*` files are thin route definitions that
                          render the matching page component and set head() metadata
  scripts/                generate-artwork.mjs — regenerates every brand SVG in public/art/
```

**API boundary rule:** UI code never touches `localStorage` or seed JSON directly. Components and
pages call the async service functions in `src/services/api.ts`, so a real backend can replace the
simulated one without touching a single component.

**Routing rule:** routes live only in `src/routes/` (file-based). `src/pages/` holds plain
components that those route files import; `src/routeTree.gen.ts` is generated and never hand-edited.

## Modules

| Module | Routes | Depth |
| --- | --- | --- |
| News & Insights | `/news`, `/news/$slug` | 11-article archive across the editorial desks, named authors with credentials, disclosure tags, corrections, sharing, related reading |
| Survey marketplace | `/surveys`, `/surveys/create`, `/surveys/plans`, `/surveys/$id` | **Deepest module.** Seven question types incl. Likert and long text, conditional logic, live preview, draft saving, scheduling, consent notice, moderation, admin-configurable plans, response capture, analytics with date range / segment / country filters, completion rate, mean duration, CSV export, corporate team + billing views |
| Press releases | `/press-releases`, `/press-releases/book`, `/press-releases/$id` | Three tiers, five add-ons, twelve-state workflow with a dated event log, four-step booking wizard, quotations, simulated payment, completion dossier, administrator-verified channel catalogue |
| Professional services | `/services`, `/services/$slug` | Four engagements with workflows, deliverables, timelines, consultation booking and enquiry routing |
| Commerce | `/shop`, `/shop/$slug`, `/checkout` | Six product lines with variants and stock levels, basket with promo codes, shipping methods, simulated payment, invoices, admin fulfilment states |
| Account & admin | `/dashboard`, `/admin`, `/signin`, `/register` | Member dashboard (overview / surveys / press / orders / account) and an admin panel (moderation queue, plan configuration, campaign oversight, channel verification, commerce, audience) |
| Standards | `/about`, `/contact`, `/editorial-policy`, `/privacy`, `/terms`, `/advertising`, `/survey-ethics` | Mission, values, editorial team, desk routing, disclosure taxonomy, corrections, privacy, terms, rate card, ethics checklist |

## Design system

Editorial serif display type (Playfair Display) over a neo-grotesque body face (Inter), on a
light-first palette: brand navy `#0A2E68`, navy dark `#071E43`, navy light `#14428B`, gold
`#C5A869`, cream `#F8F9FA`, slate `#334155`, charcoal `#0F172A`, border `#E2E8F0`. Tailwind v4
tokens live in `src/styles.css` (`font-display`, `font-sans`, `.fmie-container`, `.fmie-prose`,
`.fmie-dropcap`, `.fmie-ticker-track`, reduced-motion handling). The logo — a serif **F** whose top
arm brackets an overlapping capital **M**, with punctuated capitals `F.M.I.E` beneath — is drawn as
SVG in `src/components/brand/Logo.tsx` and `public/art/logo*.svg`.

All imagery is original brand SVG artwork generated by `scripts/generate-artwork.mjs`
(covers, products, avatars, hero, logo). No stock photography, no AI-generated photos,
no external image CDNs.

## Compliance rules baked into the product

- No guaranteed placement in any named third-party publication, ever. Owned media, partner
  distribution, syndication and earned media are described and priced separately, and earned
  media is never sold or invoiced.
- No real outlets are named, and no affiliation with or endorsement by any publisher,
  broadcaster or newswire is implied.
- Independent editorial and paid promotional content are produced separately and labelled at the
  point of publication (`Independent Editorial`, `Sponsored Research`, `Partner Dispatch`).
- Survey results are self-selected and are never presented as population-representative; export is
  demo-only and carries the limitation.
- Free / Premium / Corporate plan limits are administrator-configurable at runtime, not hardcoded.
- Distribution channels carry an admin-controlled status, region, pricing and verification record;
  unverified channels are shown for transparency but excluded from quotations.
- Wikipedia advisory work follows paid-contribution disclosure and never promises article
  creation, retention or approval.

## Demonstration-preview limits

No real database, authentication, payment processing, email delivery or file uploads. Orders,
bookings, surveys and messages are recorded locally so the full lifecycle can be exercised, and
the administrator panel can reset everything to the shipped sample set at any time.
