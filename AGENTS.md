<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Live account roles belong in protected `public.user_roles`, never profiles or the demo store, to prevent self-granted administrator access.
- Cloud foundation tables remain separate from the legacy simulated API until each flow is explicitly migrated; connecting Cloud alone does not make demo operations live.
- Money is stored in integer minor units and ledger event keys are unique; verified server operations must settle balances and payments atomically.
- Member uploads use the private `member-files` bucket under `<auth user id>/`; authenticated ownership policies prevent cross-account file access.
- Run `src/test/backend-foundation.sql` through the database read tool after permission changes; every returned `passed` value must be true.
- Identity comes only from Cloud auth via `AuthProvider`; pages not yet migrated keep reading the legacy local store, which the provider binds to the signed-in email, so demo personas must not return as a way to change identity or role.
- Signed-in-only pages live under `src/routes/_site/_authenticated/` (client-only gate redirecting to `/signin?next=`), keeping the shared site layout while blocking visitors.
- Wallet lifetime totals use a database-side, signed-in-owner aggregate so the transaction history display can stay paginated without misreporting lifetime figures.
- Serve the homepage showcase film in browser-compatible WebM first with MP4 fallback, because the preview browser cannot decode the supplied MP4 codec.
- Survey point packs and spending rules live only in `surveyPointPacks`/`surveyPointRules` in the site config with math in `src/lib/survey-points.ts`, so prices change in one place; packs show in USD and Paystack charges the naira equivalent at the price-sheet rate.
- Press booking prices are recomputed on the server from the outlet catalogue (`src/lib/press-booking-rules.ts`) and bookings become paid only through the service-only settle function after Paystack verification (return page or webhook), so a browser can never set a price or mark itself paid.
