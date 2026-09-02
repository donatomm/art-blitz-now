# OctoWonders continuity package

**Prepared:** 2026-08-27, Europe/Rome
**Purpose:** Preserve exact current context, decisions, release procedure, technical-SEO scope and unresolved boundaries for a new chat.
**Authority:** This is a current overlay. It does not replace the 2026-08-21 controlling handoff. Donato's newest explicit instruction remains first in the controlling authority order.

## Quick orientation

- The MVP works in production and must be disturbed as little as possible.
- Stage 0 release containment is substantially in place.
- Vercel Production tracks GitHub branch `production`, not GitHub branch `main`.
- Lovable may continue writing to GitHub `main`. Those changes create non-public Vercel Previews.
- GitHub branch `production` is protected. GitHub branch `main` protection was explicitly postponed so Lovable can continue its current direct-to-main workflow.
- The unresolved Vercel deploy hook used by Admin `Sync & Deploy` still references GitHub `main` and can bypass the intended release path. Do not use `Sync & Deploy` until that route is separately resolved or explicitly approved.
- Payment work is paused. Do not run checkout, purchase, refund or payment-setting changes.
- Automatic rollback remains disabled. Reopening releases remains Donato's manual decision.
- The next product work is the bounded technical-SEO stabilization described below, within a 20-hour ceiling. Automation and the intermittent refresh-cleared navigation 404 are excluded.

## 1. Mandatory priming

Start from:
`/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/CONTINUITY.md`

Read every file listed there completely and in order. Do not infer current state from the 2026-08-23 handoff alone because several of its pending steps are now complete.

During priming:

- do not edit store code;
- do not deploy;
- do not change GitHub, Vercel, Supabase, Stripe, DNS, Lovable, GSC or any other outside setting;
- do not mutate production data;
- do not request indexing;
- do not perform checkout, purchase or refund;
- recheck current GitHub, Vercel and public-site evidence before relying on recorded identifiers.

## 2. Current authority and working locations

- Authoritative GitHub repository: `donatomm/art-blitz-now`
- Public Vercel project: `art-blitz-now`
- Vercel project ID: `prj_RQiswgJu779Ix9Lb0ffAIExPkzFh`
- Vercel team ID: `team_7lQ6krgKtZ3LWkZ3E8GWlPu7`
- Isolated worktree: `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/art-blitz-now/.worktrees/ap1a-local-safety-gate`
- Safety branch: `codex/ap1a-local-safety-gate`

Do not touch the duplicate Vercel project `project-7k6aq`, ID `prj_VGbGjB0mV38hWzQ87gBbQyLdcTpJ`.

## 3. Verified state on 2026-08-27

### GitHub

- GitHub `main`: `0c850417164622de7cf1b7aeace7831bc1d85c79`
- GitHub `production`: `063cf2a3dbadd913e5e37c11703d52b52a82a340`
- Safety branch: `db3bc316c46a926e57637230d397029a26dc140f`
- Pull request 1 is merged: `https://github.com/donatomm/art-blitz-now/pull/1`
- Pull request 1 merge commit: `0c850417164622de7cf1b7aeace7831bc1d85c79`
- GitHub `main` is not protected. This is intentional and explicitly postponed.
- GitHub `production` is protected with:
  - a required pull request;
  - zero required approving reviews;
  - required status check `P0 Live Store Safety`;
  - strict latest-branch requirement;
  - resolved conversations;
  - enforcement for administrators;
  - force pushes disabled;
  - deletion disabled.

### Vercel and public site

- The Vercel Production environment's tracked GitHub branch was changed from `main` to `production` and verified after the change on 2026-08-23.
- Current public deployment: `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo`
- Public deployment source: GitHub `main` at `063cf2a3dbadd913e5e37c11703d52b52a82a340`, created before Branch Tracking was changed.
- Public aliases remain attached to that deployment, including `octowonders.com` and `www.octowonders.com`.
- Latest intended-project deployment: `dpl_4xbWfHDBUHvyL2rcfxJ4FCFVL7qj`, READY, Preview target, GitHub `main` at `0c850417164622de7cf1b7aeace7831bc1d85c79`.
- Read-only checks on 2026-08-27 returned `200 text/html` for the homepage and the checked product page.
- The checked product page still contained the owner-approved label `2x9060`.

The connected Vercel read-only project response on 2026-08-27 did not expose the Branch Tracking field. Therefore the `production` value is the last directly verified setting from 2026-08-23, not a newly re-read dashboard value. Recheck it before any action that depends on that field.

## 4. Stage 0 history

Completed:

1. Created GitHub branch `production` at the then-public source.
2. Changed the Vercel Production environment's tracked GitHub branch from GitHub `main` to GitHub `production` for project `art-blitz-now` only.
3. Reconciled the safety branch onto the then-current GitHub `main`.
4. Corrected workflow triggers and evidence upload behavior.
5. Ran the safety suite: 55 of 55 passed at the final pre-merge verification.
6. Passed the safety type check.
7. Completed `npm run build:committed` successfully with only known existing warnings.
8. Merged pull request 1 into GitHub `main`.
9. Confirmed that the merge produced only a Vercel Preview and did not move the public aliases.
10. Protected GitHub `production` with the exact rules recorded above.

Explicitly postponed:

- protecting GitHub `main`;
- disabling or redesigning the Admin deploy hook;
- monitoring and alert-channel activation;
- automatic rollback;
- payment work;
- Stage 1 public release.

Stage 0 must not be described as fully closed while the Admin `Sync & Deploy` hook can bypass the GitHub `production` pull-request path.

## 5. Normal editing and safe release procedure

### Editing

1. Donato makes UI changes in Lovable.
2. Lovable commits them to GitHub `main`.
3. Vercel builds a non-public Preview from GitHub `main`.
4. Donato may save a price change in Admin. The database change is stored immediately, but production pages receive it when Vercel Production rebuilds the static store.
5. Do not press Admin `Sync & Deploy`.

### When a release is ready

`Ready` means all five conditions hold:

1. the intended Lovable edits are finished;
2. Lovable committed them to GitHub `main`;
3. any intended Admin price change is saved;
4. the Vercel Preview has been checked;
5. Donato wants the changes published on `octowonders.com`.

Start the controlled release request with:

```bash
gh pr create --repo donatomm/art-blitz-now --base production --head main --title "Release main to production" --body "Controlled production release. Payment remains paused."
```

This command does not publish. It opens a pull request from GitHub `main` to GitHub `production`. Then:

1. wait for `P0 Live Store Safety`;
2. inspect the complete change set and Preview;
3. present the proposed merge to Donato and request approval;
4. merge only after that approval;
5. allow the Vercel Production environment to build from GitHub `production`;
6. verify the public homepage, intended pages, commercial facts and deployment identity;
7. keep payment paused and reopening manual unless Donato separately changes those decisions.

Do not use `vercel --prod`. Do not use Admin `Sync & Deploy`.

Safe Lovable instruction:

> Make these changes and commit them to GitHub main only. Do not deploy, publish, merge into production, or use Sync & Deploy.

## 6. Approved bounded technical-SEO direction

The three phrases below describe narrow repairs, not a complete SEO architecture overhaul.

### Known SEO routes and intended article working

- The intended article has its own indexable URL and returns its own content.
- `/blog` remains a separate blog-index page rather than impersonating the article.
- Known old URLs redirect once to the correct destination.
- Product UUID URLs continue redirecting safely.
- Trailing-slash variants behave consistently.
- Intentionally nonexistent pages and assets return real `404` or `410` responses instead of homepage content.
- Googlebot, Bingbot and ordinary browsers receive the same page identity.

The intermittent navigation 404 reported by Donato is entirely excluded. This work does not build a better blog. It only repairs the existing article and blog identities.

### Major page-identity conflicts repaired

- Each of the 32 intended public routes has one effective title.
- Each has one effective meta description.
- Route-specific information replaces the generic fallback where available.
- Every page retains its canonical URL, robots instructions, structured data and meaningful server-rendered HTML.
- A missing page cannot accidentally inherit the homepage title and description.
- Repeated builds produce the same identities.

This does not authorize rewriting all page copy. Poor route-specific wording must be flagged for Donato to change. Codex repairs the mechanism and must not silently rewrite the content.

### Shared identity images restored

Two declared resources need to become real, stable public images:

- the organization logo used by structured data;
- the default image used when a page is shared socially.

Before touching either resource, Donato must confirm the exact approved file and address. Do not rename, optimize, delete or otherwise modify product artwork. These images are deferred unless they are trivial and time remains after higher-risk SEO containment.

## 7. Code brittleness, SSG, blog and sitemap boundaries

### Code brittleness

Broad code brittleness is outside scope. Do not clean up code merely because it is old, strange, inefficient or fragile-looking. Repair only credible failure paths within the approved SEO and release-safety scope.

### Fragile SSG

SSG fragility is in scope only because it can silently remove titles, descriptions, canonicals or entire document heads.

Within the 20-hour ceiling:

- test the historical complete-head-loss failure;
- test empty, missing, partial and malformed build data;
- compare repeated builds for inconsistent output;
- verify every intended page has its required SEO identity;
- make publication fail closed when critical SEO output is missing.

A complete SSG architecture rewrite is not authorized within this ceiling.

### Blog

Included:

- fix the intended article route;
- keep `/blog` as a separate identity;
- preserve indexability and article metadata.

Excluded:

- blog tiles or collection redesign;
- new CMS fields;
- draft and publication workflows;
- authoring automation;
- navigation changes;
- a general-purpose blog platform.

### Sitemap

The full desired redesign remains:

- one authoritative route registry;
- one reviewed catalogue snapshot;
- one sitemap generator;
- one tested artifact published by Vercel;
- removal or demotion of competing sitemap writers.

This is the largest SEO repair and is not promised within the 20-hour ceiling. The bounded goal is aggressive testing and minimum containment of the current sitemap publication path, not a full architectural replacement.

## 8. Twenty-hour ceiling

The agreed allocation is:

| Work | Cap |
|---|---:|
| Finish release protection | 2 hours |
| Aggressively test routes, SSG and sitemap output | 4 hours |
| Repair proven route, article and page-identity failures | 6 hours |
| Add minimum SSG/sitemap containment, not a redesign | 4 hours |
| Controlled release and live verification | 4 hours |
| **Total** | **20 hours** |

This is a ceiling and prioritization device, not proof of elapsed or remaining time. Remaining time has not been measured in this handoff.

Target after this bounded program:

- protected releases;
- known article and route identities repaired;
- major title and description conflicts repaired;
- fragile SSG failures detected before publication;
- current sitemap output verified and contained;
- full SSG rewrite, unified sitemap architecture and full blog system deferred.

## 9. Explicit exclusions and owner parallel work

Excluded from the bounded technical work unless Donato separately reopens them:

- the intermittent navigation 404 that clears on refresh;
- cart-price failure;
- SKU price-propagation redesign;
- checkout and payment;
- automation and distribution-channel publication;
- blog expansion;
- broad refactoring, redesign or cleanup;
- performance work except SEO/loading speed or unacceptable pauses;
- GitHub `main` protection;
- destructive image operations.

Donato may work in parallel through Lovable on:

- navigation labels and ordering, without changing route destinations during route repair;
- visual GUI changes that do not touch routing, SSG, sitemap, SEO mechanism, checkout or cart;
- route-specific titles, descriptions and page/product copy, without changing slugs;
- the extra FAQ H1, by changing content hierarchy rather than the SEO mechanism;
- approved shared identity files after confirming exact files and addresses.

Use one logical Lovable change per commit and preserve the commit SHA. Before technical work begins or resumes, reconcile any new Lovable commits so parallel edits are not overwritten.

## 10. SKU and price behavior already traced

- SKU prices are stored in `products.sizes` JSONB.
- Saving an Admin price edit updates Supabase immediately.
- Enabled positive `deal_price` values override ordinary prices.
- Homepage and product-page prices are rebuilt from live Supabase data during deployment.
- The cart fetches prices through a separate live path and is the only price surface Donato currently reports as failing.
- Checkout separately fetches live data and creates Stripe Checkout price data dynamically.

Donato confirmed that editing the SKU table and deploying correctly updates homepage and product-page prices. Treat that propagation as intended behavior, not a defect. Cart remains excluded unless separately requested.

## 11. Known SEO baseline retained for remeasurement

The last recorded public discoverability baseline had 65 observed conditions grouped into four root repair groups:

- one intended-article redirect condition;
- one false-homepage fallback root condition;
- 30 conflicting title conditions;
- 31 conflicting description conditions;
- two shared identity-asset conditions.

These are conditions, not 65 independent bugs. Remeasure before implementation because production evidence can change.

Known route and asset examples retained as regression evidence:

- `/storie-fatti-scientifici-polpo` redirected to `/blog`;
- unknown sitemap-like and page routes could return homepage HTML with status `200`;
- `/logo.png` returned homepage HTML rather than an image;
- `/artworks/octoheaded.jpg` returned `404`.

Repeated-H1 conditions are P1 and not automatically part of the mechanism repair. Content-level H1 cleanup may be handled by Donato.

## 12. Exact next task for a fresh chat

After mandatory priming and read-only remeasurement:

1. state the current GitHub `main`, GitHub `production`, Vercel Production deployment and Branch Tracking evidence;
2. reconcile any Lovable changes made after `0c850417...` without publishing them;
3. remeasure the approved technical-SEO route, document-head, SSG and sitemap baseline;
4. produce the smallest test-first repair package within the 20-hour ceiling;
5. identify exactly what Codex would edit and what Donato may safely edit in Lovable;
6. pause and obtain Donato's approval before the first repair code change or any outside-setting change.

Do not start by redesigning the sitemap, rewriting the SSG, fixing the excluded refresh-cleared 404, changing cart or checkout, or publishing a release.

## 13. Milestone and approval rules

- Pause at each meaningful milestone.
- Report what changed, what was learned, any contradiction or unknown, and the next exact action.
- Ask for Donato's approval before each outside-setting change and before production publication.
- For an outside-setting change, present the current value, proposed value, exact scope, business outcome, worst credible risk, recovery and verification.
- Keep explanations in plain non-engineering English. Clearly distinguish GitHub branch names from Vercel environments.
- Do not represent a Preview, plan, local test or design as production proof.
- Stop rather than infer when current evidence conflicts with this package or a safe reversal is unclear.

## 14. New-chat bootstrap prompt

> Continue OctoWonders from `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/CONTINUITY.md`. Read every required file completely and in order before substantive action. Treat `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/art-blitz-now/.worktrees/ap1a-local-safety-gate/docs/handoffs/2026-08-27-continuity-package.md` as the current overlay while preserving the 2026-08-21 controlling handoff's authority order. Do not edit store code or change any outside setting during priming. Recheck GitHub, Vercel and public-site state because recorded identifiers may have changed. Payment remains paused, automatic rollback remains disabled and release reopening remains manual. The bounded next program is technical SEO only: route and article identity, page titles/descriptions, SSG failure detection and minimum sitemap containment within the 20-hour ceiling. Exclude the refresh-cleared navigation 404, cart, checkout, payment, automation, blog expansion, full SSG rewrite, full sitemap redesign and broad cleanup. Reconcile any newer Lovable commits, present the smallest test-first repair package and pause for Donato's approval before code edits, outside-setting changes or publication.

## 15. Acceptance check for the receiving chat

Before claiming readiness, the receiving chat must be able to state accurately:

1. what controls when documents conflict;
2. what Stage 0 changes are complete;
3. which GitHub branch Lovable writes and which GitHub branch feeds Vercel Production;
4. why GitHub `main` is intentionally unprotected;
5. why Admin `Sync & Deploy` remains prohibited;
6. the exact safe release sequence;
7. what the 20-hour technical-SEO scope includes and excludes;
8. why the intermittent navigation 404 and cart are excluded;
9. what Donato may change safely in Lovable;
10. what remains paused and requires fresh approval.

## 16. 2026-08-29 price-only production rebuild

Donato edited and saved the Admin SKU table. The first saved table contained an accidental `75x100 = 1103`; Donato corrected and saved it before deployment.

The normal GitHub `production` release path was not used because the strict P0 gate remained red on already known SEO and Stripe-mapping conditions. GitHub protection was not weakened and no pull request was created. Donato specifically approved a one-time Vercel Production redeploy of the existing public deployment as the exceptional price-only path.

Executed outside change:

- Vercel project: `art-blitz-now` (`prj_RQiswgJu779Ix9Lb0ffAIExPkzFh`) only;
- original and recovery deployment: `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo`;
- new production deployment: `dpl_DsY7SnNTgskyZShXrXLUdmfSr7kg`;
- action: Vercel redeploy of the original deployment to the Production environment;
- build cache: not selected;
- source commit retained: `063cf2a3dbadd913e5e37c11703d52b52a82a340`;
- result: `READY`, with `octowonders.com`, `www.octowonders.com` and the project production aliases assigned;
- duplicate Vercel project, GitHub branches, GitHub protection, payment settings, database settings and Admin `Sync & Deploy` were not changed.

Live verification after the rebuild:

- homepage returned the expected OctoWonders identity and showed the rebuilt price catalogue;
- `75x100` showed `EUR 103`, not the accidental `EUR 1,103`;
- `2x9060` showed `EUR 189`;
- the checked Octocups Antanis product page showed `75x100 EUR 103`, `40x60 EUR 59` and `50x75 EUR 61`;
- Vercel reported no runtime-error clusters in the selected one-hour range;
- the build completed successfully. The existing React SSR stack warning remained in the build output and was not changed.

Payment remains paused, automatic rollback remains disabled, and release reopening remains manual. The later technical SEO remeasurement and implementation approval are recorded in Sections 17 and 18.

## 17. 2026-08-29 technical SEO remeasurement

Donato approved a read-only technical SEO remeasurement and smallest-repair proposal. The evidence is recorded in `docs/evidence/2026-08-29-technical-seo-remeasurement.md`.

No store code or outside setting changed. The live and committed evidence groups the current SEO failures into four roots:

- hosting redirects and false-success rewrites;
- base HTML identity duplicated with route-specific SSG identity;
- SSG checks that log but do not fail publication;
- several sitemap mechanisms with only the Vite build artifact currently serving the Vercel public site.

The public sitemap currently has 32 unique addresses and the repeated committed-build route set is deterministic. The intended article still redirects to `/blog`; unknown page paths can still return homepage HTML with `200`; all 32 intended pages have duplicate descriptions and all have two titles in raw HTML; `/logo.png` is homepage HTML and `/artworks/octoheaded.jpg` is missing.

The smallest proposed code package is tests first, minimum hosting repair, removal of generic base title/description, fail-closed postbuild validation and immutable Preview verification. Estimated focused engineering magnitude is 8 to 12 hours, excluding approval waits and Donato's content work.

Donato approved local-only, test-first implementation on 2026-08-29. That approval does not authorize a commit, push, pull request, Vercel Preview, production deployment, image change or outside-setting change.

## 18. Usage-limit halt before implementation

Donato reported less than 10% Codex usage remaining and instructed Codex to plan for a halt. Codex stopped before writing any test or changing any store-code file. There is no partial implementation to reconcile.

The approved local implementation sequence on resumption is:

1. read the test-writing reference required by the already selected test-driven-development procedure;
2. add focused failing tests for the hosting and route contract, and prove that they fail for the expected current behavior;
3. apply only the minimum hosting repair and return those tests to green;
4. repeat the red-green cycle for one effective title and one effective description per intended public route;
5. repeat the red-green cycle for fail-closed SSG and sitemap structural validation without weakening the existing missing-image evidence;
6. run the full local safety suite, committed build, source check and artifact check;
7. present the exact local diff and test results, then stop for fresh approval.

The first exact technical action is test-only: add the focused hosting regression tests. No production code may change before those tests have been observed failing for the expected reason.

The next approval boundary remains after the complete local diff and verification results. Commit, push, pull request, Preview, production deployment, image changes and all outside-setting changes remain unapproved. Payment remains paused, automatic rollback remains disabled and release reopening remains manual.

## 19. 2026-09-02 local minimum SEO repair complete

Donato resumed the approved local-only implementation. The test-first repair is complete and its exact evidence is in `docs/evidence/2026-09-02-local-seo-minimum-repair.md`.

Local outcomes:

- intended-article and legacy-route hosting rules repaired;
- broad unknown-route homepage substitution removed from Vercel rules;
- existing internal routes explicitly preserved with their generated files;
- generic base title and description removed;
- all 32 intended generated pages reduced to exactly one title, one description and one canonical;
- route/head/sitemap structural validation made an automatic postbuild failure boundary;
- 64 safety tests and safety type checking passed;
- a fresh committed-data build passed and ended with `BUILD SEO STRUCTURE: GREEN`;
- the source gate now has zero availability and zero discoverability findings, while retaining six excluded transaction mapping findings;
- the strict artifact gate retains only the two deferred shared-image findings.

The repair and evidence were recorded in one local commit on `codex/ap1a-local-safety-gate`; the branch is one commit ahead of its remote counterpart. No push, pull request, Preview, production deployment, image change or outside-setting change occurred.

A read-only Vercel recheck confirmed that the Vercel Production environment still tracks GitHub `production`. Vercel Preview Branch Tracking is enabled for all unassigned GitHub branches and has no domain attached. Pushing the repair branch will therefore create an automatic Vercel Preview but will not update the public shop. The next possible action is this combined GitHub branch push and automatic Vercel Preview, requiring fresh approval. Pull request and production remain separate later approval boundaries. Payment remains paused, automatic rollback remains disabled and release reopening remains manual.
