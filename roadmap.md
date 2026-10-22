# Backend foundation
- [x] Create protected member profiles and separate account roles.
- [x] Create storage for surveys, answers, press releases, orders, kit requests, and wallet records.
- [x] Set up private file storage.
- [x] Verify storage access rules.

# Current preview fixes
- [x] Make the homepage film play in browsers that do not support its original video format.
- [ ] Redirect the stray `/index` address to the homepage and confirm it works.

# Priority 2: Real accounts and roles
- [x] Email/password sign-up with email confirmation, Google and Lovable sign-in, password reset.
- [x] Saved member profiles (name, organisation, job title, country, preferences).
- [x] Dashboard, wallet and admin only open when signed in; admin only for approved administrator accounts.
- [x] Remove demo persona switching.
- [x] Give administrator access to the owner's signed-up account; add Francis after his signup email is known.

# Priority 3: Wallet and verified payments
- [x] Replace browser-only wallet balances and history with Lovable Cloud records; add private lifetime totals and cloud-backed withdrawal review.
- [ ] Verified Paystack checkout is coded, but needs a safely saved key and a real test payment before it is ready.
- [ ] Save survey point escrow and respondent cash rewards atomically with each completed response.
- [x] Save withdrawal requests, enforce the ₦2,000 minimum, and let administrators approve or reject them (approval does not send a transfer).
- [ ] Keep press-release writing and AI polishing before payment; save bookings and confirm payment only after verification.
- [ ] Add focused tests for point credit, escrow/reward settlement, idempotency, and withdrawal rules.
- [ ] Keep shop payment migration for a later step unless needed to safely complete these flows.

# Later priorities
- [ ] Publication logos and shop content.
- [ ] Remove remaining demo notices and the sample-data reset button.
- [ ] Confirm business details, emails, and domain before launch.
