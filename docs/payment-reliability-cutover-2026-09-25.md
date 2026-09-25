# Payment reliability cutover, 25 September 2026

This change is a code candidate. Production is not ready until the listed Cloud, Stripe, live checkout and store-safety checks pass. The signed-in Stripe dashboard and Lovable project are both under Octowonders account `acct_1ScYWaC7mx2GwzNR` and project `248403b8-3b63-497c-a1bd-bb25e96e0f47` respectively. Do not paste secret values into GitHub or chat.

## Current configuration found

Lovable Cloud has `STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` secret names. No `STRIPE_MODE` or `STRIPE_WEBHOOK_SECRET` was reported. The hosted Checkout flow uses the server-side secret key; the publishable key is not used by this code. The mode of the existing key is not observable from Lovable's write-only Secrets view. Confirm it with the owner before setting mode.

Git sync copies code, but does not run `supabase/migrations/` or deploy changed `supabase/functions/`. Lovable Cloud supplies its own `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. Sources: https://docs.lovable.dev/integrations/git-sync-overview and https://docs.lovable.dev/features/secrets.

## Order of operations

1. Merge the reviewed branch to the Lovable-synced GitHub branch only after the repair-admission check passes. This does not promote the Vercel Production branch. Confirm Lovable sync reaches the exact merged commit before deploying backend files.
2. Apply the reviewed `supabase/migrations/20260925093000_confirmed_orders.sql` to the Lovable Cloud database through the Cloud SQL editor or the authorized Cloud SQL connector. It creates a new receipt table only. Confirm browser roles have no access and service_role has SELECT and INSERT only.
3. In Lovable Cloud Secrets, set `STRIPE_MODE=live` only after the owner confirms the existing `STRIPE_SECRET_KEY` is a live key. Do not replace the live key with a test key. `STRIPE_PUBLISHABLE_KEY` needs no change for this flow.
4. Ask Lovable in the project chat to deploy `create-checkout`, `verify-checkout`, and `stripe-webhook` from the exact synced commit, without changing source code. Inspect the deployed function code and invocation status under Cloud → Edge functions. The shared `_shared/` modules must deploy with their importing functions. Deploy `create-checkout` only after step 3, because it fails closed without matching mode.
5. In the Stripe account's live mode, create a webhook destination using the deployed `stripe-webhook` function's copied URL. Subscribe only to `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Add that destination's signing secret as `STRIPE_WEBHOOK_SECRET` in Lovable Cloud Secrets. The test-mode dashboard has a separate signing secret and cannot stand in for this live destination.
6. Verify no-session and unpaid return pages never display success or clear carts; verify a signed event records exactly one receipt, rejects bad signatures, retries storage failures, and never exposes customer data. Confirm the exact deployed code version and inspect function logs without exposing secrets. A true paid live test and any refund are owner actions.
7. Refresh the committed catalogue snapshot after Donato has completed any mapping edits in the admin panel. The current saved snapshot still has six missing mappings. Run source and artifact gates on that exact commit. Do not bypass catalogue findings, merge the production PR or promote production until all three P0 outcomes and the payment path are verified.

## Stripe test mode

Use an isolated Lovable Cloud remix or another independent backend for a real test-mode checkout. Lovable drafts and Git branches use the original project's database and secrets, so they are not test backends. A Cloud remix copies structure and Edge Functions without data or manually added keys. It needs a deliberately created test product, its own `STRIPE_SECRET_KEY=sk_test_…`, `STRIPE_MODE=test`, an exact `CHECKOUT_ALLOWED_ORIGINS` value, and its own `STRIPE_WEBHOOK_SECRET` from a test-mode destination. Source: https://docs.lovable.dev/features/cloud and https://docs.lovable.dev/features/drafts. No remix or Stripe test session has been created by this change.

## Release evidence currently missing

- GitHub CI run for this branch.
- Live Cloud migration and Edge Function deployment.
- Signed Stripe test and live webhook deliveries against deployed functions.
- Paid receipt and cart behavior through a real browser, including return after a closed tab.
- External social-card rendering and complete authenticated Preview routes.
- Green committed source gate after the owner's catalogue fixes.
