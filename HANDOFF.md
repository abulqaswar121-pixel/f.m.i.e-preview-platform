# Lovable Handoff — F.M.I.E Preview Platform

State at handoff: branch `arena/7736f124-f-m-i-e-preview-platform`, all gates green
(`tsc --noEmit`, `eslint`, 13/13 vitest, production build). Everything below the
"Production swap-ins" section is demo-grade by design; everything in it is real
code ready to be pointed at live services.

## Architecture

- **Stack:** TanStack Start (React 19, file-based routing) + Tailwind + Lucide + vitest.
- **Routes:** `src/pages/*` (30 pages). `src/routeTree.gen.ts` is generated — never
  hand-edit; it regenerates on dev-server start / build.
- **API boundary:** ALL UI data access goes through the async service layer in
  `src/services/api.ts` (simulated backend over localStorage). Swap implementations
  here for real HTTP calls and the UI keeps working.
- **Storage versioning:** `DB_VERSION` in `api.ts`. Bump it whenever the seed shape
  or default settings change — mismatched stored databases reseed cleanly.
- **Brand single-source:** every email, address, nav link, category, tier price and
  legal notice lives in `src/config/site.ts`. Components never hardcode contact data.
- **Data seeds:** `src/data/*.json` (articles, outlets catalogue with exact spec
  prices, surveys, plans, products, services, releases, users).

## Binding design rules

1. **Logo:** stacked lockup only (symbol above "F.M.I.E"). Canonical artwork is
   `public/art/logo-source.jpg`; never redraw or re-layout it. Navbar uses the
   compact `Logo` component.
2. **Hero:** single static cover (`public/media/hero-cover.webp`). The hero never
   moves; all homepage motion lives in the showcase card, which keeps its playback
   controls BELOW the picture (no overlays on media).
3. **Surface language:** glass/soft-shadow/lift utilities in `src/styles.css`
   (`.fmie-glass`, `.fmie-glass-dark`, `.fmie-card`, `.fmie-orb`, `.fmie-gradient-text`);
   gradient buttons in `src/components/ui/button.tsx`. New UI should reuse these.
4. **Assistant & footer gating:** Ada (bottom-right, fixed) is hidden only on
   `/signin`, `/register`, `/checkout` and while taking a survey; footer is hidden on
   task-focused portals. Lists live in `src/components/layout/AppLayout.tsx`.
5. **Compliance wording (client brief):** "Partner Distribution" framing for press
   placements; editorial-discretion notice on every booking surface; never promise
   guaranteed placement; survey results never presented as population-representative
   without methodology disclosure; Wikipedia work = Wikimedia COI advisory only;
   unverified outlets stay flagged (`pending_verification`) and the test suite
   enforces this — fix data, never weaken the test.
6. **Git:** this repo syncs to Lovable on push. Never force-push, rebase, amend or
   squash pushed commits.

## Media pipeline

- Showcase film + voice-over are generated: `scripts/build-showcase-film.py`
  (needs `pip install --target /tmp/pylibs pillow numpy imageio-ffmpeg`; ffmpeg via
  `imageio_ffmpeg.get_ffmpeg_exe()`). It concatenates `/tmp/vo/seg1..8.mp3`, measures
  each segment and times each scene to its line. Always probe audio Duration before
  timing scenes.
- Current assets: `showcase-film-v4.mp4` (65 s, 8 scenes), `showcase-voiceover-60s.mp3`,
  `hero-cover.webp` (static hero), `kit-jerseys.jpg`, `story-1..10.webp`,
  `cover-*.webp` (client's former-site photography), `brand-loop.webp` (card fallback).
- Rename pattern for film re-cuts: new filename + `showcaseVideoUrl` update in
  `site.ts` + `DB_VERSION` bump, so cached players can never serve a stale cut.

## Personas (demo economy)

Survey Earner ₦6,500 (₦18,500 lifetime, 14 surveys) · Researcher 450 pts ·
PR Client (pr-2026-115 under review, pr-2026-098 completed) · Super Admin.
₦100 per point; rewards 4/8/12 pts; escrow lock → release/refund rules in `api.ts`;
withdrawals minimum ₦2,000.

## Production swap-ins (the real "finish up" list)

1. **Payments:** replace simulated Paystack in `api.ts` (point packs, PR booking,
   checkout) with live Paystack keys + server-side verification webhooks.
2. **Auth:** swap persona switcher / mock sign-in for real accounts (email + OAuth),
   keeping the persona concept as roles.
3. **Persistence:** move the simulated DB to a real backend (Postgres/Supabase);
   `api.ts` is the only file that should change.
4. **Email & uploads:** transactional email (bookings, quotes, corrections) and real
   file uploads/CDN for admin video & article images (admin upload currently
   data-URL-in-localStorage by design).
5. **SEO:** per-route `<title>`/meta/OG (root meta exists in `src/routes/__root.tsx`),
   sitemap, canonical URLs for fmie.co.uk.
6. **Content ops:** replace sample editorial with real copy; the outlet catalogue and
   prices are admin-editable already — wire them to the real commercial list.
7. **Media prune:** unused former-site spares (`hero-original.webp`, `hero-field.webp`,
   `cover-field-*.webp`, `newsroom-portrait.webp`) can be deleted or repurposed once
   real editorial photography arrives.
8. **Analytics/cookie consent** before going live in UK/Nigeria scope.
