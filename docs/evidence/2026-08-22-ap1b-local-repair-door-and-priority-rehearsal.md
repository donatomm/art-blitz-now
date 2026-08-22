# AP1B local repair-door and priority rehearsal

## Result

The local safety preparation now has two distinct decisions:

- `P0 Repair Admission` accepts a red-store repair only when at least one existing P0 condition is removed and no new P0 condition is introduced.
- `P0 Live Store Safety` remains red until the candidate has no P0 condition.

Neither decision is active outside the local worktree.

The false P0 classification for the owner-authored `2x90x60` label is removed. Non-public artwork records and drafts without sellable sizes are kept out of the P0 release result. Repeated identical page-identity text is kept out of P0, while missing or conflicting page identity remains P0.

The final strict reports were generated against committed safety code `0c168bcbdcdda63ae83d30f26438f3919e80a5c4`:

| Result | Availability | Discoverability | Transaction readiness | Total |
| --- | ---: | ---: | ---: | ---: |
| Source | 0 | 2 | 6 | 8 |
| Built store | 0 | 65 | 0 | 65 |
| Combined | 0 | 67 | 6 | 73 |

The built-store discoverability result consists of 31 conflicting titles, 32 conflicting descriptions and two missing shared identity images. The source discoverability result consists of the intended-article redirect and broad false-homepage rule. The six transaction findings are the already detected missing payment connections. Payment work remained paused.

## Test-first evidence

The following controlled examples were observed failing before their minimum implementation:

1. A mapped positive `2x90x60` owner label produced `CATALOG_INVALID_DIMENSION` before the classification was narrowed.
2. The old single result lacked separate repair and live-store jobs.
3. A red-store proposal with no improvement, a proposal swapping one old finding for a new one, and a worsening count required explicit rejection behavior.
4. Repeated identical title, description and primary-heading text was promoted to P0 before page identity was compared by value.
5. Non-public and no-sellable-size draft records produced P0 findings before they were separated from public purchase failures.

After the minimum changes, `npm run test:safety` exited `0` with 51 passing examples and no failed, skipped or cancelled example. `npm run typecheck:safety` exited `0`.

Final verification also established:

- the saved-data build exited `0` and produced the expected 83 files;
- all post-build steps completed, although the build reported that its process was still running after 15 seconds and force-exited it. This is recorded as a P1 investigation, not hidden as a clean result;
- the full application type check exited `0`;
- the untouched application quality baseline remained exactly 67 errors and 7 warnings;
- application, public-asset, database-function, hosting, middleware, build and catalogue-generation paths still had no difference from the verified live source commit.

The prepared workflow example also verifies that:

- repair and live-store results have distinct names;
- the repair result runs only for reviewed proposals;
- the strict result runs for proposals, the main version and manual rehearsal;
- repository access is read-only;
- every checkout discards its write credential;
- no command can push, publish, deploy, roll back, call production data or send an alert.

## Before-and-after repair rehearsal

The original private reports contained 98 combined conditions: 11 source and 87 built-store conditions.

After only the `2x90x60` correction and before the later severity refinements, the compatible candidate contained 97 conditions. The repair result exited `0` with:

- reason: `improved-without-regression`;
- baseline findings: 98;
- candidate findings: 97;
- introduced findings: 0;
- resolved finding: `CATALOG_INVALID_DIMENSION` on the affected public product.

This proves the comparison behavior against a real preserved before-and-after pair. It is not production proof.

## Judge-change limitation

The later move from 97 to the current 73 conditions includes changes to the severity judge itself:

- 21 repeated identical primary headings moved from P0 to P1;
- one repeated identical homepage title moved below P0;
- two deliberate draft/non-public conditions moved to owner review;
- conflicting identity now carries a stable content hash so a different conflict cannot masquerade as the same condition.

Because the old baseline and current candidate use different finding definitions, subtracting 73 from 98 is not a valid repair claim. A proposal that changes the judge requires independent technical review and a one-time bootstrap. After that bootstrap, ordinary repairs must compare baseline and candidate with the same judge version.

## Evidence protection

- Generated reports remain in the ignored `.safety-evidence/` folder.
- The folder remains owner-only and report files remain owner read/write only.
- Report evidence is restricted to approved fields, redacts sensitive-looking values and does not include private contact, customer, card or secret values.
- The preserved original baseline copy is private temporary evidence and is not committed.

## Changes not made

- No application, route, page, sitemap, image, catalogue, payment or production-data repair was made.
- No branch was pushed and no review request was opened.
- No GitHub, Vercel, Checkly, Meta, WhatsApp, Resend, DNS, Supabase or Stripe setting changed.
- No deployment, alert, checkout, purchase, refund, rollback or indexing request occurred.
- Automatic rollback remained disabled.
- Release reopening remained manual.

## Next approval boundary

The next proposed work is documented in `docs/2026-08-22-bug-priorities-and-staged-repair-plan.md`.

If Donato approves that plan, the next milestone is preparation only: present the exact Stage 0 outside settings and the Stage 1 route/article implementation plan. No outside setting or application repair is authorized by this evidence note.
