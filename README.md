# F.M.I.E Preview Platform

I need you to act as a technical planner and architect. Do NOT build anything, scaffold, or write application code. Your job is to study everything I attach and give me a plan, ending with one complete, ready-to-paste prompt for a separate tool called Arena, which will do 100% of the actual building (design, pages, and a simulated backend).



PROJECT

F.M.I.E ("F.M.I.E Means Business"), domain fmie.co.uk. A global business media, survey, press-release booking, professional services and merchandise platform. The full client brief is attached (F_M_I_E_Prompt.docx). Read all of it.



WHAT THIS BUILD IS

A PREVIEW for the client to approve, not the production platform. Everything must look and feel real and be fully clickable, but nothing reads from or writes to a real database, and no real payments, emails or file uploads happen. All data is hardcoded sample data kept in clearly separated data files so it can be swapped for a real backend later without rebuilding the UI. Sign up and sign in accept any valid-looking input and land on a pre-filled dashboard. Add one-click demo presets: Individual member, Survey Creator, Corporate account, and Administrator.



PRIORITY

The client says the survey platform matters most, because professionals and corporates will be giving F.M.I.E survey contracts. Build the survey platform in the greatest depth, and the other modules at a lighter but still convincing level.



SURVEY PLATFORM (deepest)

- Survey explore page: categories, search, filters, free vs premium badges, sample surveys across the categories in the brief

- Survey creator: multi-step builder with title, objective, audience, question types (single choice, multiple choice, rating, Likert, short and long text), conditional logic shown in the UI, live preview, save draft, schedule and close dates, anonymous option, consent notice

- Taking a survey: a clean respondent flow with progress and a thank-you screen

- Results dashboard: total responses, completion rate, per-question charts, filters, date range, export buttons (demo only), and a short note that results are not representative of a population unless a proper sampling method is used

- Plans and pricing: Free vs Premium vs Corporate, shown as configurable by admin

- Corporate account view: team members, billing history, branded surveys

- Admin: survey moderation queue and plan configuration



OTHER MODULES (lighter)

- Home: hero ("Where Global Business, Ideas & Opportunities Meet"), featured news, survey spotlight, services, newsletter signup, merchandise showcase

- News and Insights: article list, category pages, article page with author, date, reading time, related stories, and clear labels for Editorial, Sponsored and Press Release content

- Global Press Releases: service tiers, booking form, and a request tracker showing the statuses in the brief (Draft through Completed)

- Professional Services: three service pages (autobiography and executive profile writing, digital marketing, pitching and representation) with deliverables, process, timeline and an enquiry form

- Shop: products, product page, cart and a mock checkout

- User dashboard and Admin panel with the sections listed in the brief

- About, Contact, and policy pages (privacy, terms, editorial, advertising)



CONTENT RULES TAKEN FROM THE CLIENT'S OWN BRIEF

- Never promise guaranteed publication in any named outlet, and never use real outlet names or logos (Forbes, BBC, Bloomberg, Punch and similar) or imply endorsement or affiliation

- Never present survey results as statistically representative

- Label all sample articles, reviews, statistics, prices and people as sample, with a visible "Demonstration preview" note in the footer

- Keep paid and promotional content clearly separated from editorial content

- The existing site at fmie.co.uk makes guaranteed-placement claims. Do not copy its wording



DESIGN DIRECTION

Premium, international, trustworthy, light-first business-media feel, with an original identity that does not copy any publisher. Propose a colour palette and typography. If I attach a logo, use it. If not, create a simple placeholder wordmark and tell me.



WHAT I NEED FROM YOU

1. The best architecture for a hardcoded preview, including how to structure mock data and the mock auth so a real backend can replace them later

2. The exact list of pages and flows for this preview, in priority order

3. Risks or scope problems you see, and what you would cut or simplify

4. A complete Arena prompt as the last part of your answer, in one code block, which includes: tech and folder structure, the mock data entities and sample records, the demo personas, a page-by-page specification, and an acceptance checklist



The Arena prompt must require: tests and build pass; all contact details and brand settings in one config file; no placeholder or example email addresses, no Lorem ipsum, and no personal notes left in the repo or README.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/76c0595e-687c-43a5-a45c-006c26ab6e95).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
