# F.M.I.E live-site extraction — adoption record

Extraction date: 2026-10-14 (Africa/Lagos). Source: verbatim extraction of
`https://fmie.co.uk` supplied by the client, plus the client-uploaded archive
`fmie_images_IMG-001_to_IMG-026.zip` (26 files, mirrored on `main`).

This document records, for every extracted element, whether the preview
**adopted**, **rewrote** or **rejected** it, and why. The client brief outranks
the live site: it forbids guaranteed-placement promises, naming real outlets,
unsubstantiated reach claims, Lorem ipsum, and unlabelled sample content.

## Adopted as-is (client's own claim-free copy and facts)

| Element | Live-site value | Where it lives now |
| --- | --- | --- |
| Wordmark / mark | `F.M.I.E` monogram lockup | `public/art/logo-source.jpg` + derived lockups (header, footer, favicon, OG) |
| Homepage headline | `Unlock Your Story. Amplify Your Impact.` | Home hero H1 (`livePositioning.heroLine`) |
| Positioning band title | `Feature Local. Impact Global.` | Home positioning band (`livePositioning.bandTitle`) |
| Service pillar names | `PR and Media Placement`, `Paid Surveys Platform`, `Pitching and Representation` | Home positioning band cards, linking to `/press-releases`, `/surveys`, `/services` |
| Copyright line | `© 2026 FMIE` | footer legal copyright (already `© 2026` + legal name) |
| Category awareness | Local, Top News, Sports, News, National, Lifestyle, Archive, Uncategorized | **not merged** — see rejections |

## Rewritten (flagged copy replaced with compliant equivalents)

| Live-site line (flagged) | Problem | Preview replacement |
| --- | --- | --- |
| "FMIE is your dedicated marketplace for guaranteed media placements on premier local and international news outlets." | guaranteed placement | "Campaigns are planned around owned F.M.I.E channels and administrator-verified distribution partners… Placement in a named third-party publication is never promised, sold or implied." (`livePositioning.bandBody`) |
| "From Punch to Forbes, our press release distribution service gets your brand story guaranteed placements on top African and international platforms in 24 hours" | names real publishers; guarantee; 24-hour promise | Pillar card: "Structured press-release booking through owned and verified channels, with dated workflows, tiered quotations and no guaranteed pickup." |
| "Get Your Brand Featured on 20,000+ News Platforms Across Nigeria, Africa, and the Globe – Fast" / "Trusted by Brands. Featured Everywhere." / "Tier 1 global news leaders" | unsubstantiated reach; coverage promise | Not reproduced anywhere; reach is described qualitatively and channel-by-channel in the verified catalogue (`/press-releases`) |
| "Join our exclusive panel and get paid to influence the next generation of products and services. Hundreds of new survey opportunities added daily." | unsubstantiated volume claim | Pillar card: "An independent survey marketplace where panellists take part voluntarily and every result is published with its limitations." |
| "FMIE provides expert representatives to speak for you, secure funding, and close deals." | outcome promise | Pillar card: "Executive representation and advisory engagements with documented scopes; we prepare and present, never promise outcomes." |

## Rejected (with reason)

| Element | Reason |
| --- | --- |
| Carousel slides containing `Lorem ipsum dolor sit amet…` | Brief: zero placeholder text |
| Dead CTAs (`href="#"` for all three service buttons; "Click Here" divs) | Preview must be fully clickable; cards link to real routes |
| `Big Brother Naija 2025` post and third-party show trademark | Third-party trademark; stub content with no editorial value |
| Live category list merged into news desks | Six of eight categories are empty ("Nothing Found"); merging would ship empty archives. Preview keeps the brief's ten editorial desks |
| Live footer (Categories/Pages/Archives + GeneratePress credit) | Brief requires contact desks, standards pages and the demonstration notice in the footer |
| Absent contact/legal details on live site (no address, email, phone, privacy, terms) | Brief mandates them; preview keeps `src/config/site.ts` contacts and the seven standards pages |
| `/checkout/` redirecting to homepage, empty `/shop/` | Brief requires a working simulated commerce module |
| WordPress comment form, myCred slots, Gravatar silhouettes (IMG-025/026) | Not part of the preview's account model |
| noindex/canonical/OG inconsistencies on author, date-archive and lost-password routes | SPA metadata is generated per route; nothing to port |

## Image decisions (26 uploaded files)

| Rows | File(s) | Decision | Reason |
| --- | --- | --- | --- |
| IMG-001 | header logo PNG 300×157 | not used | Client's higher-resolution upload already derives every lockup |
| IMG-002…004 | favicon / apple-touch JPEGs | not used | Same mark on navy; preview regenerates icons from the client upload |
| IMG-005 | homepage hero (2560×1707) | **rejected** | Microphone carries a visible Nine Network ("9 NEWS / NEWS.com.au") broadcaster mark — using it would imply affiliation/endorsement, which the brief forbids |
| IMG-006…011 | 100/150/300px thumbs | not used | Responsive duplicates of the two feature photos below |
| IMG-012 | journalist interview 1200×900 | **used, cropped** | Right-hand crop (`public/media/newsroom-portrait.webp`) keeps the interviewee and removes the outlet mic flag, branded camera and event wristband; captioned as labelled sample photography on the home positioning band |
| IMG-013…016 | responsive crops of IMG-012 | not used | Duplicates |
| IMG-017 | stage performer 960×715 | **rejected** | Recognisable real performer; personality rights, and the live post tied it to a third-party show trademark |
| IMG-018…020 | responsive crops of IMG-017 | rejected | Duplicates of a rejected image |
| IMG-021 | identifiable private individual 960×720 | **held** | Real, identifiable person; no sample article matches the subject, and pairing him with fictional news would misrepresent him. Held pending client confirmation of rights/consent |
| IMG-022…024 | responsive crops of IMG-021 | held | Duplicates |
| IMG-025/026 | Gravatar silhouettes | not used | Generic placeholders; preview uses brand avatars |

Originals remain in the client-uploaded zip on `main`; only the derived,
trademark-free crop ships in `public/media/`.

## Compliance flags carried forward

The extraction's SECTION 8 flags are all addressed above: guaranteed-placement
and reach claims rewritten, named publishers removed, third-party marks
(broadcaster mic, show name, theme credit) not reproduced, and the metadata
quirks noted as not applicable. Nothing from SECTION 8 appears verbatim
anywhere in the preview.

## 9. Client-directed revisions (2026-10-14, follow-up instruction)

The client asked that the preview visibly carry the former site's own photography
("I want the client to see everything in that their former one here"), a typed
hero headline, and a footer that does not repeat on app-like surfaces. Applied as
follows, with the master brief's compliance rules still governing:

- **Article covers (news section):** all 11 `featuredImage` values now point at
  crops of the former site's own stock photography under `public/media/`
  (`cover-interview*.webp`, `cover-rig.webp`, `cover-field-*.webp`,
  `newsroom-portrait.webp`) instead of generated SVG illustration. Every crop of
  IMG-012 excludes the broadcast mic flag, the camera body marking and the event
  wristband verified in section 3, so no third-party trademark ships. Each article
  keeps a visible `imageCredit` caption: "Sample stock photography supplied with
  the client's former site — demonstration only."
- **IMG-017..020 (woman on stage) remain REJECTED:** the subject is a globally
  recognisable performer; shipping her likeness on a business-news demo would
  imply endorsement/affiliation, which the client's own master brief forbids.
  This is the single former-site asset deliberately not mirrored, and the reason
  is recorded here for the client conversation.
- **IMG-021..024 (field portrait) now USED** as labelled sample stock per the
  client's explicit instruction (earlier "hold pending consent" lifted by the
  client directing their use); crops carry the same sample-stock credit.
- **Hero:** background is now `public/media/hero-field.webp` (former-site stock,
  navy gradient overlay for contrast) with a small on-image credit line, and the
  headline types out, holds, wipes back and retypes the next line in a loop
  (`livePositioning.heroRotatingLines` in `src/config/site.ts`, rendered by
  `src/components/ui/Typewriter.tsx`, static under `prefers-reduced-motion`,
  screen readers get the first line via `sr-only`).
- **Footer:** omitted on task-focused surfaces — `/signin`, `/register`,
  `/dashboard`, `/admin`, `/checkout` (and their children) — via
  `FOOTERLESS_PREFIXES` in `src/components/layout/AppLayout.tsx`; public
  editorial, market, commerce-browse and legal pages keep it, including the
  demonstration-preview notice.
