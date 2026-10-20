# Priority 3: Wallet and verified payments

## Goal
Replace demo-only wallet and payment behavior with account-linked records and verified settlement, while keeping the current client rule that press-release content is written and polished before payment.

## Build steps
1. **Move wallet reads to saved records.** Load each signed-in member's cash balance, survey-point balance, transaction history, and withdrawal history from Lovable Cloud. Keep account identity from the signed-in session; never accept a client-supplied user ID as authority.
2. **Secure point-pack purchases.** Add server-side Paystack checkout initialization and a verified return/webhook flow. Credit points only after server-side verification of a successful matching payment. Store amounts as minor units and use a unique payment event key so retries cannot double-credit.
3. **Settle survey activity safely.** Migrate survey creation/response paths needed for point escrow and cash rewards. Lock creator points when a paid survey is activated; on each eligible completed response, atomically save the answer, release the corresponding escrow, and credit the respondent once. Return unused escrow when a survey closes. Never let the browser write wallet balances or ledger entries.
4. **Save withdrawal requests.** Validate available cash and the configured minimum on the trusted side, save requests in Lovable Cloud, and expose pending requests to administrators for approval or rejection. Do not send money automatically until a transfer setup is available and explicitly verified.
5. **Connect press-release payment after the draft.** Persist the selected outlets, article draft, quote, and booking status. Keep the order: select outlet, write/polish draft, review, then initialize payment. Mark the booking paid only after Paystack verification; preserve editorial review and tracking states.
6. **Tests and checks.** Add focused tests for payment verification/idempotency, point credit, response reward settlement, unused escrow return, and minimum-withdrawal enforcement. Run the existing test suite and database permission checks; verify the signed-in wallet flow in the preview.

## Access and safeguards
- Use authenticated server functions for member actions and a signed public webhook route that verifies Paystack's signature before processing.
- Keep secret payment credentials out of browser code and source files. Ask for them through Lovable's secure secret form only after the server endpoints are ready.
- Treat this first pass as test-mode until real payment credentials and business checks are supplied. Do not represent simulated or unverified payments as successful.
- Do not migrate shop checkout in this priority; leave it clearly separate until its payment and fulfillment rules are confirmed.

## Technical details
- Use existing `wallet_accounts`, `wallet_transactions`, `withdrawals`, `surveys`, `survey_answers`, and `press_releases` tables and their protected policies; add only the minimum schema changes required for secure settlement.
- Use TanStack Start `createServerFn` for internal authenticated operations and a TanStack public API route for Paystack callbacks. Load privileged database access only inside a handler, after verifying the caller or webhook.
- Preserve integer minor-unit money, unique ledger event keys, the existing auth middleware, and the private account-role table. Client state is presentation only, never the source of financial truth.
