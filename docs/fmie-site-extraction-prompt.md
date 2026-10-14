# F.M.I.E site extraction prompt

Paste everything inside the fenced block below into a new chat that has live web
browsing, then paste that chat's output back here (in parts if needed).

```text
You are a meticulous web-extraction specialist. Your only job is to produce a
complete, verbatim, structured record of the website https://fmie.co.uk (and
https://www.fmie.co.uk if it differs), so a developer with NO internet access
can rebuild the site faithfully, word for word and image for image.

CRAWL RULES
1. Begin with /robots.txt and /sitemap.xml. Then crawl EVERY internal URL you
   can find: header nav, footer links, in-body links, sitemap entries.
2. Record the HTTP status of every URL you visit. If a page is behind a login,
   is JavaScript-rendered and empty, or errors, say so explicitly. NEVER
   invent, guess or "reconstruct" content that you did not actually see.
3. Copy everything VERBATIM: no paraphrasing, no summarising, no grammar
   cleanup, no reordering. Preserve line breaks, punctuation, £ symbols and
   numbering exactly. If text is illegible or truncated, write
   [UNCLEAR: reason] instead of guessing.
4. Absence is data. If something does not exist on the site, write
   "[not present on site]" rather than omitting the field.

OUTPUT FORMAT
One document with the numbered sections below, in this exact order. Use fenced
code blocks for verbatim copy. If you reach your message limit, stop at a
section boundary, write "[PART n END - reply continue]" and wait.

SECTION 0 - IDENTITY AND BRAND
- Business name, tagline(s), mission statement(s) exactly as displayed.
- Logo: every variant found (header, footer, favicon, OG/social image): file
  URL, background colour, ink colour, and a precise description of the mark
  and wordmark.
- Colours: read the CSS and list every hex/rgb value with where it is used
  (header background, buttons, links, borders, footer, accents).
- Typography: font-family stacks from CSS / @font-face, and which weights and
  sizes are used for headings versus body text.
- Layout and style notes: container widths, section rhythm, card and button
  shapes, imagery style, light/dark behaviour.

SECTION 1 - SITEMAP
A table: URL | HTTP status | page title | meta description | H1 text.

SECTION 2 - PAGE-BY-PAGE CONTENT
One subsection per URL from Section 1, in that order, each containing:
- Heading hierarchy H1 to H3, verbatim.
- Body copy verbatim, paragraph by paragraph.
- Lists, tables, statistics, pull-quotes and testimonials verbatim.
- Every button and link CTA with its exact label and destination URL.
- Forms: each field's label, name, type, option list, placeholder, helper
  text, and any consent checkbox wording, verbatim.
- Breadcrumbs, badges and tags exactly as displayed.

SECTION 3 - IMAGE MANIFEST
A table, one row per image: page URL | absolute image URL | alt text | visible
caption | visible credit or licence note | usage (hero, article thumbnail,
team portrait, product, logo, background) | approximate pixel dimensions.
Number the rows IMG-001, IMG-002, ... If you are able to download or attach
files, attach every image named to match its row number; otherwise deliver the
table alone. Never emit hotlinked image URLs inside code.

SECTION 4 - CONTACT AND CORPORATE IDENTITY
Addresses, telephone numbers, email addresses, registered company number, VAT
number, opening hours, social profile URLs and map links, exactly as
displayed, each with the page it appears on.

SECTION 5 - SERVICES, TIERS AND PRICING
Every service, plan, tier and add-on: name, price with currency and billing
period, what is included, what is excluded, process steps, timelines, FAQs and
any disclaimer wording, verbatim.

SECTION 6 - EDITORIAL
Categories or desks with their descriptions; every article: title, URL,
author, date, category, tags and standfirst/excerpt verbatim; author bios
verbatim; and any disclosure, corrections or editorial-independence statements
verbatim.

SECTION 7 - LEGAL AND POLICY PAGES
Full verbatim text of privacy, terms, cookies, editorial policy,
advertising/sponsorship and any survey-ethics or consent pages.

SECTION 8 - COMPLIANCE FLAGS [REVIEW-REQUIRED]
Quote verbatim, with the page URL, any copy that: promises guaranteed
placement, publication, coverage or ranking; names or implies partnership
with third-party publishers, broadcasters or newswires; claims endorsement or
affiliation; presents survey or market statistics without methodology; or uses
third-party trademarks. Do NOT rewrite these - only flag them; a human will
rewrite them later.

SECTION 9 - BEHAVIOUR NOTES
Plain-sentence notes on what a visitor can DO on each page: menus, filters,
search, sliders, account areas, checkout steps, animations, hover behaviour.

FINAL RULES
- End the document with the extraction date and the exact list of URLs visited.
- Keep every image URL absolute (https://...).
- If the site blocks automated access or renders nothing, say so in the first
  line and stop; do not fabricate a site from memory.
```

## Returning the results to this repo

1. Paste the sections back here in order (multiple messages are fine).
2. Download the images listed in SECTION 3 and upload them into this repo
   (for example a `brand-assets/` folder), exactly as you did with the logo,
   or attach them in chat; I will place them under `public/art/` using the
   manifest row names.
3. I map the copy into `src/config/site.ts` and the pages, and I rewrite
   anything flagged in SECTION 8 so the preview keeps the brief's compliance
   rules (no guaranteed-placement promises, no implied affiliations, all
   sample content labelled) before it goes live.
