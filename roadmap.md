# Backend foundation
- [x] Create protected member profiles and separate account roles.
- [x] Create storage for surveys, answers, press releases, orders, kit requests, and wallet records.
- [x] Set up private file storage.
- [x] Verify storage access rules.

# Priority 2: Real accounts and roles
- [x] Email/password sign-up with email confirmation, Google and Lovable sign-in, password reset.
- [x] Saved member profiles (name, organisation, job title, country, preferences).
- [x] Dashboard, wallet and admin only open when signed in; admin only for approved administrator accounts.
- [x] Remove demo persona switching.
- [x] Give administrator access to the owner's signed-up account; add Francis after his signup email is known.

# Priority 3: Wallet and verified payments
- [x] Replace browser-only wallet balances and history with Lovable Cloud records; add private lifetime totals and cloud-backed withdrawal review.
- [ ] Verified Paystack checkout is coded, but needs a safely saved key and a real test payment before it is ready.
- [x] Save survey point escrow and respondent cash rewards atomically with each completed response.
- [x] Save withdrawal requests, enforce the ₦2,000 minimum, and let administrators approve or reject them (approval does not send a transfer).
- [x] Keep press-release writing and AI polishing before payment; save bookings and confirm payment only after verification. Needs a real Paystack test payment.
- [ ] Add focused tests for point credit, escrow/reward settlement, idempotency, and withdrawal rules.
- [ ] Keep shop payment migration for a later step unless needed to safely complete these flows.

# Client update (22 Oct)
- [x] Replace yearly survey plans with pay-as-you-go point packs in dollars; builder asks points per answer and answers wanted, and blocks review when points are short.
- [x] Hold points when a survey is sent for review, pay answerers per completed answer, return unused points on reject/close. Needs a real test with bought points.
- [ ] Confirm suggested point prices and answerer share with the client.

# Later priorities
- [ ] Publication logos and shop content.
- [x] Remove sample-data reset buttons and correct notices that wrongly call all records fake; keep sample-content labels.
- [x] Use the client's phone (+234 810 395 4351) with official @fmie.co.uk emails as site contact details.
- [ ] Confirm domain before launch.

# QA round (26–27 Oct)
- [x] Keep one close button in each phone menu and close the menu when any link is selected.
- [x] Point the social links at F.M.I.E's own LinkedIn, Facebook, TikTok and YouTube pages.
- [x] Keep contact emails as official @fmie.co.uk addresses; Francis's personal email removed from the site.
- [x] Show the press logo strip after the video and office details, before "Feature Local. Impact Global."
- [x] Put the outlet list and prices before the "write with AI help" step in press booking.
- [x] Let signed-in members use the logo to visit the homepage without signing out.
- [x] Add the corporate points range ($999–$4,999) and the $599 student/academic pack (5,000 points) with ID upload before purchase.
- [x] Add the government agency yearly plan ($10,000/year) as a "talk to our team" plan.
- [ ] Client to confirm corporate point amounts and permission before showing big-brand or government logos.
- [x] Save team kit requests and private crest uploads, show member quote replies and connect the admin kit desk; hide sample merchandise and disable sample checkout.

# Final launch checks
- [ ] Test Paystack checkout, payment read-back, academic ID purchase, survey rewards and kit requests with signed-in accounts.
- [ ] Receive live Paystack credentials before switching out of test mode.
- [ ] Connect fmie.co.uk when the owner is ready; official email boxes are not active yet.
- [ ] Replace sample editorial content and review privacy/terms for the live service before public launch.

# Final fixes (29 Oct)
- [x] One standard upload box with previews on press booking, team kits and student ID; team can open press files.
- [x] Real AI writer on press booking: "Write with AI" and "Polish with AI" (fresh version each time, shows a done tag).
- [x] Payment return reads the payment code correctly for points and press bookings; buttons say "Pay $X securely".
- [x] Contact bar and price ticker scroll away; only the main menu bar stays fixed; tidier signed-in account button.

# Phone layout and link sharing (29 Oct)
- [x] Fix overflowing dashboard, campaign details and admin controls; check other pages at phone widths.
- [x] Add the existing F.M.I.E share artwork to each content page and verify its tags.

# Branded sportswear shop (30 Oct)
- [x] Nike/Adidas-style shop page with F.M.I.E-branded kit photos; sport tiles open the kit form with that sport chosen. Stays quote-led (no online checkout).
- [ ] Client to approve the design-idea photos or send real product photos.
