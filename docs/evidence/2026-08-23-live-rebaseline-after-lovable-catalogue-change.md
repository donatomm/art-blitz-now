# Live rebaseline after the Lovable catalogue change

**Subsequent public change:** this is exact evidence for the build created at 23:44. A newer build, `dpl_6s4aHvu6dSYRLw1jvQZ88YcgPRt2`, became public at 00:30 on 23 August and includes an application change. The 64-condition count below is therefore historical until the newer build is rebaselined. See `docs/evidence/2026-08-23-stage0-stop-new-lovable-public-build.md`.

**Evidence time:** 23 August 2026, 00:00 Rome time

**Public build being checked:** 22 August 2026, 23:44 Rome time

**Status:** read-only evidence. No store, account, setting, data, payment or publication change was made during this check.

## Quick orientation

The build checked here was not the earlier build used by the local AP1A rehearsal. Lovable's catalogue change caused a new GitHub version and two new Vercel builds. At this evidence time, the OctoWonders public domains pointed to the build created at 23:44 Rome time.

The current public shop remained reachable in this check. The exact owner label `2x9060` was visible on the checked product page. The known search problems remained present. The old local count of 73 P0 conditions is therefore historical evidence, not a current-production total.

## 1. Exact public build checked

| Item | Read-only evidence |
| --- | --- |
| GitHub main version | `9760359b429fe34c979bdf3c9af420b9c42216bd` |
| GitHub message | `Fixed listino SKU entry` |
| Version time | 22 August 2026, 23:27:50 Rome time |
| Public Vercel build | `dpl_DT1LdiLZ4TD3WAseAFb4GrgatjQo` |
| Permanent Vercel address | `art-blitz-narcoyk3o-dmm-projects.vercel.app` |
| Build creation time | 22 August 2026, 23:44:10 Rome time |
| Ready time | 22 August 2026, 23:44:49 Rome time |
| Public project | `art-blitz-now`, project `prj_RQiswgJu779Ix9Lb0ffAIExPkzFh` |
| Public domains confirmed on this build | `octowonders.com`, `www.octowonders.com`, and the project's Vercel addresses |
| Trigger evidence | Vercel records the GitHub `main` version above and a hook named `Deploy-Hook-synch-CMS` |

The 39-second difference between creation and ready time is ordinary build completion time. The build is classified by its creation time, so Donato's stated time of 22 August 2026 at 23:44 is exact.

## 2. What changed in GitHub and what changed in the built store

The new GitHub `main` version is 14 versions after the previously verified `ffe0b380166bd6b9bae7e3d89711a1078867e41d`. GitHub's comparison showed only these two repository files added or changed across that range:

- `.lovable/plan/add-a-visible-last-updated-badge-2026-08-22.md`
- `.lovable/plan/fix-the-2x90x60-default-price-key-2026-08-22.md`

No application file changed in that GitHub comparison. However, the Vercel build process reads the live catalogue while building. A new public build can therefore contain changed catalogue data even when the GitHub comparison contains only Lovable planning files.

This is a concrete example of the already documented build-data protection gap. A saved local copy and the public build can differ without an application-code change.

## 3. Current public route check

The public sitemap returned successfully as XML. It contained 32 addresses and no duplicate address. All 32 intended addresses were requested without changing the store.

| Public result | Count | Meaning |
| --- | ---: | --- |
| Intended addresses checked | 32 | Every address currently listed by the public sitemap |
| Intended addresses returning their own page successfully | 31 | The shop and product pages checked were reachable |
| Intended article returning its own page | 0 of 1 | `/storie-fatti-scientifici-polpo` still redirects to `/blog` |
| Addresses with two titles | 32 | 30 contain conflicting title text |
| Addresses with two descriptions | 32 | 30 contain conflicting description text |
| Addresses with other-than-one primary heading | 22 | The repeated headings use agreeing words and remain P1, not P0 |
| Intended addresses with a missing or wrong self-address | 1 | The redirected article |

A deliberately nonexistent page, a misspelled sitemap address and a nonexistent image address returned successful homepage HTML. This confirms that the false-success rule remains active. It can conceal a missing page or asset from a simple monitor.

The shared address `/logo.png` returned HTML rather than an image. `/artworks/octoheaded.jpg` returned `404`. These remain two missing or invalid shared identity images.

## 4. Current search-safety count and its limits

The read-only public check found 64 P0 discoverability conditions:

| Root group | Conditions |
| --- | ---: |
| Intended article redirected elsewhere | 1 |
| Unknown pages and assets falsely replaced by the homepage | 1 |
| Conflicting titles | 30 |
| Conflicting descriptions | 30 |
| Missing or invalid shared identity images | 2 |
| **Current public discoverability total** | **64** |

These are conditions, not 64 separate root bugs. They group into four current repair roots: route continuity, false success, shared page identity and shared identity images.

The earlier local result of 73 combined P0 conditions remains valid for the saved copy that produced it: 67 discoverability and 6 transaction-readiness conditions. It must no longer be described as the exact current public total. The public build now has 64 independently rechecked discoverability conditions. The six missing payment connections are the last-known saved-source result and were not rechecked because Donato paused payment work. No current combined total is claimed.

## 5. Catalogue evidence

The checked current product page returned successfully and visibly contained the exact owner-defined label `2x9060`.

This evidence does not reinterpret that label. Donato's rule remains controlling:

- `2x9060` is valid owner-defined catalogue content;
- ordinary two-number dimensions are orientation-equivalent, for example `120x80` equals `80x120`;
- the safety check must not silently rewrite the label or classify it as a software P0 merely because of its form.

No checkout was started and no payment connection was inspected or changed.

## 6. Duplicate Vercel project

A second Vercel project remains connected to the same GitHub repository:

| Item | Evidence |
| --- | --- |
| Project | `project-7k6aq` |
| Project ID | `prj_VGbGjB0mV38hWzQ87gBbQyLdcTpJ` |
| New build | `dpl_3XuSA8CfhenX4hG8gLFCHr5andZW` |
| GitHub version | `9760359b429fe34c979bdf3c9af420b9c42216bd` |
| OctoWonders public domains | None found on this project |

This duplicate did not own the public OctoWonders domains in the evidence gathered. It still creates a second build from the same repository and remains an authority and cost-clarity issue. No project was disconnected or deleted.

## 7. Counterexamples and unknowns

- This check did not find a whole-store availability outage. Thirty-one intended addresses returned their own HTML successfully.
- The new build did not prove a new P0 regression. It reproduced known search failures and changed the measured page-identity counts.
- A successful HTTP response alone is not proof of the correct page. The deliberately false addresses prove that point.
- The public check does not prove purchase completion, payment recording, administrator tools, email, WhatsApp or recovery behavior.
- The Vercel connection proves that `main` currently produces public builds. The exact Vercel settings screen did not load reliably enough to claim that every available control was directly observed.
- The duplicate Vercel project has no public OctoWonders domains in the gathered evidence, but its intended future purpose remains unknown.

## 8. Changes not made

- No application code or catalogue value was edited.
- No branch was pushed and no review request was opened.
- No GitHub, Vercel, Lovable, Supabase, Stripe, DNS, monitoring, email or WhatsApp setting changed.
- No publication, rollback, alert, indexing request, checkout, purchase or refund occurred.
- Automatic rollback remained disabled and release reopening remained manual.
