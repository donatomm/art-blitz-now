# Stage 1 Route and Article Continuity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkboxes so progress survives handoffs.

**Goal:** Restore the intended article as its own successful page and make nonexistent pages and assets return a real not-found result, while preserving every current intended store and internal-tool route.

**Architecture:** Keep the current prebuilt-page system. Change only the hosting address rules and the safety judge needed to prove them. Do not redesign routing, move content, change page components or unify sitemap authority in this stage. The saved route contract remains the source for intended public pages; explicit hosting rules preserve the few internal routes that are not in the public sitemap.

**Tech Stack:** Vite, React Router, vite-react-ssg, Vercel routing, TypeScript safety checks, Node test runner.

**Spec:** `docs/2026-08-22-bug-priorities-and-staged-repair-plan.md`

## Global constraints

- Do not start until Stage 0 holds public releases and the safety-only bootstrap has independent approval.
- Do not publish to the OctoWonders public domains during implementation.
- Use the saved catalogue build for local and GitHub comparison. Do not make a live-data build the repair proof.
- Make no payment, catalogue, content, shared-title, shared-description, image, sitemap-authority or application-page repair in this stage.
- Preserve the exact owner label `2x9060`. Preserve orientation equivalence for ordinary two-number dimensions.
- Keep the current React page components and prebuilt-page generator unless a failing test proves that a minimum change is required.
- A non-public Vercel preview is required before this stage can be called ready for publication.
- Automatic rollback remains disabled. Donato alone gives the later manual publication approval.

---

## Task 1: Freeze the exact route contract before changing hosting

**Files:**

- Modify: `safety/p0/routes.ts:5-86`
- Modify: `safety/p0/routes.test.ts:5-78`
- Create: `safety/p0/hosting-route-contract.test.ts`
- Read only: `src/routes.tsx:44-161`
- Read only: `src/generated/pages.json`
- Read only: `src/generated/products.json`

- [ ] Add a failing route-contract example that lists every non-public but intended prebuilt address that the broad homepage fallback currently keeps reachable:

  - `/checkout/success`
  - `/image-rename`
  - `/image-rename-tool`
  - `/.lovable/oauth/consent`

- [ ] Keep these addresses outside the public sitemap contract. Mark them as internal or post-purchase routes so the test does not accidentally make them indexable pages.

- [ ] Add a failing example proving that the intended public article `/storie-fatti-scientifici-polpo` is in the saved CMS route contract.

- [ ] Add a failing example proving that the legacy `/Octopus-Facts` address is a redirect source, not a second canonical page.

- [ ] Run the focused tests and record the expected failure:

  ```bash
  npx tsx --test safety/p0/routes.test.ts safety/p0/hosting-route-contract.test.ts
  ```

- [ ] Add the minimum typed route categories to `safety/p0/routes.ts`. Do not copy full page content or product data into the judge.

- [ ] Re-run the focused tests and require all to pass.

- [ ] Commit only the route-contract characterization:

  ```bash
  git add safety/p0/routes.ts safety/p0/routes.test.ts safety/p0/hosting-route-contract.test.ts
  git commit -m "test: preserve intended hosting routes"
  ```

## Task 2: Make the desired hosting decision fail first

**Files:**

- Modify: `safety/p0/hosting.ts:9-50`
- Modify: `safety/p0/hosting.test.ts:5-30`
- Modify: `safety/p0/hosting-route-contract.test.ts`
- Read only: `vercel.json:1-50`
- Read only: `public/_redirects:1-12`

- [ ] Add a failing example requiring the article itself to have an explicit prebuilt-page rule and forbidding a redirect from that address.

- [ ] Add a failing example requiring `/Octopus-Facts` to redirect directly to `/storie-fatti-scientifici-polpo`, not to `/blog` and not through two redirects.

- [ ] Add a failing example that supplies every current public and internal route, then proves each one resolves only to its own prebuilt file or its declared final redirect.

- [ ] Add negative examples for:

  - `/this-page-must-not-exist`
  - `/sitemap.json`
  - `/images/this-image-must-not-exist.webp`

  Each must remain unmatched by a homepage rule. An unknown address may be unmatched or sent to a missing same-address file, but must never resolve to `/index.html`.

- [ ] Add a failing agreement example for `vercel.json` and `public/_redirects`. Their article redirect and false-homepage policy must not contradict one another.

- [ ] Run the focused tests and confirm the new desired-state examples fail against current rules:

  ```bash
  npx tsx --test safety/p0/hosting.test.ts safety/p0/hosting-route-contract.test.ts
  ```

- [ ] Implement only the rule interpretation needed by these examples. Keep `HOSTING_ARTICLE_REDIRECT` and `HOSTING_FALSE_200_CATCHALL` stable so before-and-after evidence remains comparable.

- [ ] Re-run the focused tests. The desired examples may remain red until Task 3 changes the actual hosting files; the controlled rule examples must pass.

- [ ] Commit only the judge and its examples:

  ```bash
  git add safety/p0/hosting.ts safety/p0/hosting.test.ts safety/p0/hosting-route-contract.test.ts
  git commit -m "test: define safe article and not-found routing"
  ```

## Task 3: Apply the minimum hosting repair

**Files:**

- Modify: `vercel.json:3-38`
- Modify: `public/_redirects:1-12`
- Do not modify: `src/routes.tsx`
- Do not modify: `src/pages/CMSPage.tsx`
- Do not modify: `src/pages/NestedCMSPage.tsx`
- Do not modify: `src/pages/NotFound.tsx`

- [ ] In `vercel.json`, remove the redirect from `/storie-fatti-scientifici-polpo` to `/blog`.

- [ ] Change the legacy `/Octopus-Facts` redirect destination from `/blog` to `/storie-fatti-scientifici-polpo`.

- [ ] Add an explicit rewrite from `/storie-fatti-scientifici-polpo` to `/storie-fatti-scientifici-polpo/index.html`.

- [ ] Add explicit same-address prebuilt rewrites for the current internal and post-purchase routes:

  - `/checkout/success` → `/checkout/success/index.html`
  - `/image-rename` → `/image-rename/index.html`
  - `/image-rename-tool` → `/image-rename-tool/index.html`
  - `/.lovable/oauth/consent` → `/.lovable/oauth/consent/index.html`

- [ ] Remove the broad rule that rewrites nearly every other address to `/index.html`.

- [ ] In `public/_redirects`, preserve the already-correct direct `/Octopus-Facts` redirect to the article.

- [ ] Replace the `/* /index.html 200` fallback with the explicit current equivalents below. Do not introduce another broad homepage fallback under different syntax:

  ```text
  /product/* /product/:splat/index.html 200
  /artista /artista/index.html 200
  /contatti /contatti/index.html 200
  /spedizione /spedizione/index.html 200
  /pricing-policy /pricing-policy/index.html 200
  /resi-rimborsi /resi-rimborsi/index.html 200
  /blog /blog/index.html 200
  /privacy /privacy/index.html 200
  /terms /terms/index.html 200
  /ordine-personalizzato /ordine-personalizzato/index.html 200
  /storie-fatti-scientifici-polpo /storie-fatti-scientifici-polpo/index.html 200
  /sitemap /sitemap/index.html 200
  /colors /colors/index.html 200
  /faqs /faqs/index.html 200
  /cookies /cookies/index.html 200
  /checkout/success /checkout/success/index.html 200
  /image-rename /image-rename/index.html 200
  /image-rename-tool /image-rename-tool/index.html 200
  /.lovable/oauth/consent /.lovable/oauth/consent/index.html 200
  ```

  The saved public route contract and generated build must prove this list still covers every current CMS page and public product pattern. If a current intended page is absent, stop and update the explicit list plus its test before continuing.

- [ ] Do not add a redirect from the article to the blog, a second article address, a trailing-slash chain or a page-component change.

- [ ] Run the route and hosting tests:

  ```bash
  npx tsx --test safety/p0/routes.test.ts safety/p0/hosting.test.ts safety/p0/hosting-route-contract.test.ts
  ```

- [ ] Run the current source result:

  ```bash
  npm run p0:check:source
  ```

  Expected change: the two current route findings are resolved. No new availability, discoverability or transaction finding is introduced.

- [ ] Inspect the complete change and confirm it contains only the two hosting files plus the approved safety files:

  ```bash
  git diff --stat HEAD~2
  git diff -- vercel.json public/_redirects safety/p0/routes.ts safety/p0/routes.test.ts safety/p0/hosting.ts safety/p0/hosting.test.ts safety/p0/hosting-route-contract.test.ts
  ```

- [ ] Commit the minimum hosting repair:

  ```bash
  git add vercel.json public/_redirects
  git commit -m "fix: restore article and real not-found routes"
  ```

## Task 4: Prove the built files before any preview

**Files:**

- Modify: `safety/p0/artifact.test.ts:8-114`
- Modify only if a failing example requires it: `safety/p0/artifact.ts:7-130`
- Generated but do not commit blindly: `dist/`

- [ ] Add the article to the controlled artifact fixture and first prove the test fails when its `index.html` is absent.

- [ ] Add controlled fixtures for the four intended internal routes. Prove the test notices a missing prebuilt file without adding those addresses to the public sitemap.

- [ ] Add a controlled negative fixture proving a missing image is not accepted merely because homepage HTML exists elsewhere in the artifact.

- [ ] Run the artifact examples and record the expected failure before changing the checker:

  ```bash
  npx tsx --test safety/p0/artifact.test.ts
  ```

- [ ] Add only the minimum distinction between public sitemap routes and intended non-sitemap prebuilt routes.

- [ ] Re-run the artifact examples and require them to pass.

- [ ] Build from the committed saved data:

  ```bash
  npm run build:committed
  ```

- [ ] Require these files to exist after the build:

  ```text
  dist/storie-fatti-scientifici-polpo/index.html
  dist/checkout/success/index.html
  dist/image-rename/index.html
  dist/image-rename-tool/index.html
  dist/.lovable/oauth/consent/index.html
  ```

- [ ] Run the built-store result:

  ```bash
  npm run p0:check:artifact
  ```

  The known shared-title, shared-description and identity-image P0 conditions remain expected in Stage 1. No new condition may appear.

- [ ] Commit only the artifact-check refinement if it was needed:

  ```bash
  git add safety/p0/artifact.ts safety/p0/artifact.test.ts
  git commit -m "test: verify article and internal route artifacts"
  ```

## Task 5: Run the complete local repair decision

**Files:**

- Evidence only: `.safety-evidence/` remains ignored and private.

- [ ] Run all safety examples:

  ```bash
  npm run test:safety
  ```

- [ ] Run safety-file agreement:

  ```bash
  npm run typecheck:safety
  ```

- [ ] Run the full application type check without editing application files:

  ```bash
  npx tsc --noEmit
  ```

- [ ] Re-run the untouched code-quality baseline:

  ```bash
  npm run lint
  ```

  Expected baseline before Stage 1: 67 errors and 7 warnings. A different result must be explained; it is not automatically a Stage 1 failure unless the changed files caused the difference.

- [ ] Generate candidate source and artifact evidence from the saved build.

- [ ] Compare against the same-version accepted baseline with:

  ```bash
  npm run p0:check:repair -- \
    .repair-baseline/.safety-evidence/p0-source.json \
    .repair-baseline/.safety-evidence/p0-artifact.json \
    .safety-evidence/p0-source.json \
    .safety-evidence/p0-artifact.json
  ```

- [ ] Require the repair decision to report:

  - both route conditions removed;
  - no new P0 condition;
  - no worsened known condition;
  - all remaining shared identity and image conditions still honestly red.

- [ ] Stop if the safety judge itself changed after the accepted Stage 0 bootstrap without another independent review.

## Task 6: Prove the non-public Vercel preview

**Files:**

- Create: `docs/evidence/2026-08-23-stage1-route-preview-evidence.md`
- Do not change any public domain.

- [ ] Open a reviewed proposal into `main` only after Stage 0 proves `main` creates previews, not public builds.

- [ ] Require `P0 Repair Admission` to pass.

- [ ] Expect `P0 Live Store Safety` to remain red because Stage 2 and Stage 3 are not yet complete.

- [ ] On the immutable preview address, request every public sitemap address and record status, final address, content type, canonical, title count, description count and primary-heading count.

- [ ] Require `/storie-fatti-scientifici-polpo` to return `200` at its own address with its own canonical identity.

- [ ] Require `/Octopus-Facts` to make one permanent redirect directly to `/storie-fatti-scientifici-polpo`.

- [ ] Require all current product addresses and fixed pages to return their own HTML successfully.

- [ ] Require the four intended internal routes to remain reachable on the preview without appearing in the public sitemap.

- [ ] Require each negative address below to return a genuine not-found result and never homepage HTML:

  - `/this-page-must-not-exist`
  - `/sitemap.json`
  - `/images/this-image-must-not-exist.webp`

- [ ] Recheck the public OctoWonders domains and prove they still point to the held 23:44 build. A Preview result is not public-production proof.

- [ ] Record counterexamples, remaining P0 conditions and all unknowns in the evidence document. Do not call Stage 1 published or complete.

## Task 7: Independent review and publication decision package

**Files:**

- Create: `docs/approvals/2026-08-23-stage1-route-publication-package.md`
- Update: `docs/handoffs/CURRENT.md`

- [ ] Have the named senior engineer review the final hosting rules, negative-address evidence and complete changed-file list.

- [ ] Present Donato with plain-English before and after behavior:

  - article currently goes to the blog, proposed article stays on itself;
  - fake pages currently look successful, proposed fake pages are honestly not found;
  - all intended product, store and internal routes remain reachable;
  - known title, description and shared-image failures remain and are not hidden;
  - payment is untouched.

- [ ] Record the exact candidate GitHub version and immutable preview address.

- [ ] State that publishing Stage 1 alone will reduce current route failures but will not make the strict public-store result green.

- [ ] Stop for Donato's separate publication decision. Do not move `production`, promote a build, change a domain or request indexing.

## Completion criteria

Stage 1 preparation is ready for a publication decision only when:

- the article returns its own prebuilt page on the immutable preview;
- the legacy article address redirects directly once;
- every current intended route is preserved;
- deliberately false pages and assets return a real not-found result;
- the repair decision shows an improvement with no new P0 condition;
- the strict result remains honestly red for all unrepaired P0 conditions;
- the public domains still serve the held 23:44 build;
- the named senior engineer has independently approved the evidence;
- Donato receives a separate plain-English publication package.
