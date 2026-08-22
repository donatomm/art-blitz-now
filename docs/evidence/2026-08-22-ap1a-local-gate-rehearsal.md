# AP1A local safety-gate rehearsal

## Quick orientation

The local safety system worked as intended. It accepted 41 controlled examples, built a finished local copy from the already saved store data, and then stopped that copy with two honest red results. The source inspection found 11 conditions. The finished-site inspection found 87 conditions. A red result here means the inspection found current risks; it does not mean the inspection itself failed.

This was a local rehearsal only. It is not production proof. Nothing was published, no outside account changed and no customer or payment action occurred.

Subsequent status: this document preserves the original 11 and 87 results as historical evidence. The corrected current definitions and current 8-source plus 65-built-store results are recorded in `docs/evidence/2026-08-22-ap1b-local-repair-door-and-priority-rehearsal.md`. Do not use the historical raw counts as the current priority count.

## Result

The saved source result was red with 11 findings:

- 0 availability findings. This source-only result does not prove availability.
- 2 discoverability findings: the required article is redirected to the blog, and a broad fallback can replace unrelated addresses with homepage content.
- 9 transaction-readiness findings: one active artwork has no public address, the same artwork has no visible positive-price size, six visible sizes have no payment connection, and one visible size has a malformed dimension.

Subsequent owner correction: the `2x90x60` value was Donato's deliberate catalogue choice, not a software bug. Donato will revoke that choice directly. In this historical report the raw source result remains 11, but the occurrence must not be counted as a P0 bug. The rule was later narrowed before activation; the current result is routed through the subsequent evidence note above.

The finished local website result was red with 87 discoverability findings:

- 32 of 32 intended pages contain two document titles.
- 32 of 32 intended pages contain two descriptions.
- 21 intended pages contain two primary headings.
- The two required shared image files are absent: `/logo.png` and `/artworks/octoheaded.jpg`.

No expected built page was missing. The finished sitemap contained every expected address exactly once and contained no unexpected address. These local results do not prove that the live store serves the same files or responses.

The duplicate page identity is a proven defect, but this original count alone was not a proven explanation for differential indexing. Earlier live evidence found the same duplication on indexed control pages. Later full-build comparison showed that descriptions conflict on all 32 routes and titles conflict on 31, while repeated primary headings use the same words. The current severity decisions are recorded in the subsequent priority plan. The missing shared images are unconditional defects and agree with the earlier live observations: the logo address returned homepage HTML and the default social image address returned a missing-file response.

Payment-provider and payment-confirmation inspection remained paused. Only missing local payment connections were detected.

## Checks run

| Check | Exit code | Observed result |
| --- | ---: | --- |
| `npm run test:safety` | 0 | All 41 controlled examples passed. |
| `npm run typecheck:safety` | 0 | The safety files agreed with their declared data shapes. |
| `npm run build:committed` | 0 | The saved-data build completed and produced 83 files. It did not refresh catalogue or page data. |
| `npm run p0:check:source` | 1 | Correct red result with 11 findings: 0 availability, 2 discoverability and 9 transaction readiness. |
| `npm run p0:check:artifact` | 1 | Correct red result with 87 findings: 0 availability, 87 discoverability and 0 transaction readiness. |
| Private-evidence pattern scan | 1 | Expected no-match result. Neither evidence file matched the tested contact, card or secret patterns. |

Both private evidence files identify local commit `ad5356a370960af623146803aa898522b7378f42`. The store application files remain unchanged from verified production-source commit `ffe0b380166bd6b9bae7e3d89711a1078867e41d`.

The private evidence folder has owner-only access (`0700`), and both evidence files have owner-only read/write access (`0600`). The build folder and evidence folder are excluded from Git.

### Build warnings recorded separately

The build completed with exit code 0, but it reported these warning categories:

- the browser-reference list is 14 months old;
- one missing optional image-optimizer package prevented optimization of `placeholder.svg`;
- one large script bundle exceeded the build tool's advisory size;
- the missing-page component is imported in two different ways, so it cannot be separated into its own smaller file;
- one notification import is unused in the server build;
- repeated server-rendering notices warned that one layout effect could cause a difference between initial and interactive rendering;
- the page generator reported that it was still running after 15 seconds and forced its own exit, after which all finishing steps completed and the overall command exited 0.

These warnings are recorded for later causal review. They are not automatically severe merely because they are unusual, and no warning was repaired during this rehearsal.

## Changes not made

- Nothing was pushed, merged, deployed or published.
- No GitHub, Vercel, Checkly, Meta, Resend, DNS, Supabase or Stripe setting changed.
- No production data changed.
- No message was sent.
- No checkout, purchase, payment, refund or indexing request occurred.
- No application, page, sitemap, image or hosting repair was made.
- Release unfreeze remained manual.
- Automatic rollback remained disabled.

## Next approval boundary

Before any outside release protection or watcher connection is applied, Donato must receive the exact proposed setting changes, required account access, required secret names without their values, expected behavior, failure behavior and reversal procedure.

The next local task may prepare the release check and the plain-English outside-change package. Preparation does not authorize pushing the check, activating it, connecting a watcher, sending an alert or enabling rollback.
