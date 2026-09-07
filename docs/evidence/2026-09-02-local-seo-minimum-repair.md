# 2026-09-02 local minimum SEO repair evidence

## Boundary

Donato approved local-only, test-first implementation of the minimum hosting repair, single-title/single-description mechanism and fail-closed SSG/sitemap validation. The implementation itself changed no outside setting. At later explicit approval boundaries, it was committed, pushed to its GitHub repair branch and verified on the automatically created Vercel Preview. No pull request, merge or production deployment occurred.

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

## Immutable Preview verification

Donato specifically approved pushing GitHub branch `codex/ap1a-local-safety-gate` and allowing its automatic Vercel Preview. The normal, non-force push advanced the remote branch from `db3bc316c46a926e57637230d397029a26dc140f` to repair commit `8547d8f74e7688e62ccf486c91acdf3701aa5cb1`.

Vercel created Preview deployment `dpl_EWG7648S9wZUaWhPjuAUfqbh5FLA` from that exact GitHub branch and commit. It reached `READY` with Preview target and no public domain attached.

Authenticated HTTP and browser checks against the immutable Preview proved:

- homepage, intended article and checked product returned `200` and rendered their expected content;
- `/Octopus-Facts` made one redirect to `/storie-fatti-scientifici-polpo`;
- the intended article returned its own content and canonical rather than `/blog`;
- an unknown page, `/sitemap.json`, `/logo.png` and `/artworks/octoheaded.jpg` returned real `404` responses rather than homepage HTML;
- `/sitemap.xml` returned `200` XML with 32 addresses, 32 unique addresses and the intended article present;
- homepage, article and checked product raw HTML each contained exactly one title, one description and one canonical, with server-rendered content.

The two shared identity images remain deliberately deferred. Their real `404` responses confirm that the false-homepage substitution was removed; they are not evidence that the image work is complete.

## Current approval boundary

GitHub branch heads after the push are:

- GitHub `main`: `0c850417164622de7cf1b7aeace7831bc1d85c79`;
- GitHub `production`: `063cf2a3dbadd913e5e37c11703d52b52a82a340`;
- GitHub `codex/ap1a-local-safety-gate`: `8547d8f74e7688e62ccf486c91acdf3701aa5cb1`.

The repair branch is one repair commit ahead of GitHub `main` and one merge-history commit behind it. GitHub's comparison reports one proposed commit and the 17 intended repair/evidence files.

The Vercel Production environment still serves `dpl_DsY7SnNTgskyZShXrXLUdmfSr7kg`, sourced from commit `063cf2a3dbadd913e5e37c11703d52b52a82a340`, with `octowonders.com`, `www.octowonders.com` and the existing production aliases unchanged. Production did not move when the Preview was created.

The next possible outside action is creating a GitHub pull request from `codex/ap1a-local-safety-gate` into GitHub `main`. It requires Donato's fresh approval. Creating it would request review and run checks; it would not publish to the public shop because Vercel Production tracks GitHub `production`. Merging that pull request, opening the later release pull request from GitHub `main` to GitHub `production`, merging into GitHub `production`, and public verification are separate approval boundaries. Payment remains paused, automatic rollback remains disabled and release reopening remains manual.
