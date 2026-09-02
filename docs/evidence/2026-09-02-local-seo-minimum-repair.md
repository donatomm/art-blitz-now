# 2026-09-02 local minimum SEO repair evidence

## Boundary

Donato approved local-only, test-first implementation of the minimum hosting repair, single-title/single-description mechanism and fail-closed SSG/sitemap validation. This work changed no outside setting and made no commit, push, pull request, Preview or production deployment.

The intermittent refresh-cleared navigation 404, cart, checkout/payment behavior, automation, shared identity images, full SSG rewrite, full sitemap redesign and broad cleanup remained excluded.

## Local repair

- The intended article is no longer redirected to `/blog` by `vercel.json`.
- `/Octopus-Facts` redirects directly to `/storie-fatti-scientifici-polpo`.
- The article and existing internal application routes have explicit rewrites to their generated files.
- The broad rewrite that served unknown pages as homepage HTML was removed.
- The generic base title and description were removed from `index.html`; route-specific SSG output remains the public identity source.
- The HTML safety check now requires exactly one title and exactly one description, including when duplicate values are identical.
- A separate build SEO structure check validates the full intended route set, page identity, canonical addresses and sitemap completeness/uniqueness/shape after every postbuild.
- The strict artifact checker still reports the two deferred shared-image findings. The new structural gate does not suppress or reclassify them.

## Test-first evidence

Each new behavior was observed failing before implementation:

- the hosting contract did not exist;
- the checked-in Vercel rules produced eight hosting findings;
- identical duplicate titles/descriptions were not detected;
- the structure-only artifact validator did not exist;
- the composed build SEO validator did not exist;
- known prebuilt internal routes were initially mapped to the homepage shell and were then tightened to their generated files.

## Final local verification

- `npm run test:safety`: 64 passed, 0 failed.
- `npm run typecheck:safety`: passed.
- `npm run build:committed`: passed and automatically ended with `BUILD SEO STRUCTURE: GREEN`.
- `npm run p0:check:source`: 0 availability findings, 0 discoverability findings and the same 6 excluded transaction/Stripe-mapping findings.
- `npm run p0:check:artifact`: 0 availability findings, 2 discoverability findings and 0 transaction findings. The only findings are missing `/logo.png` and `/artworks/octoheaded.jpg`.
- `git diff --check`: passed.

Known pre-existing build warnings remain: React SSR `useLayoutEffect` warnings, missing `svgo` optimization support for `placeholder.svg`, a large client chunk, the NotFound import warning and vite-react-ssg's delayed forced exit. None was changed because it is outside this minimum repair.

## Commit and approval boundary

The verified repair and evidence were recorded in one local commit on `codex/ap1a-local-safety-gate`. The branch is one commit ahead of its remote counterpart. Nothing was pushed, no pull request or Vercel Preview was created, and production was not affected.

A read-only Vercel recheck confirmed that the Vercel Production environment still tracks GitHub `production`. Vercel Preview Branch Tracking is enabled for all unassigned GitHub branches and has no domain attached. Therefore, pushing the repair branch will automatically create a Vercel Preview but will not update the public shop. The next possible action is the combined GitHub branch push and its automatic Vercel Preview, requiring fresh approval. Pull request and production remain separate later approval boundaries.
