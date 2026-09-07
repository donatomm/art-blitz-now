# OctoWonders technical SEO remeasurement

**Date:** 2026-08-29

**Status:** Read-only milestone complete. No store code, GitHub branch, Vercel setting, public alias, database setting, payment setting or indexing state was changed. Local builds changed only ignored build output. The documentation changes remain local and uncommitted.

## 1. Starting evidence

- GitHub `main`: `0c850417164622de7cf1b7aeace7831bc1d85c79`.
- GitHub `production`: `063cf2a3dbadd913e5e37c11703d52b52a82a340`.
- `main` is 37 commits ahead and 0 behind `production`.
- The changed files between those branches are safety, workflow, documentation and package-script files. No `src/` application file differs.
- No open GitHub pull request exists.
- Vercel Production still tracks GitHub branch `production`.
- Current public deployment: `dpl_DsY7SnNTgskyZShXrXLUdmfSr7kg`, `READY`, source commit `063cf2a3dbadd913e5e37c11703d52b52a82a340`.

## 2. Live public findings

The current public sitemap returned `200` as XML with 32 addresses and 32 unique addresses: one homepage, 11 CMS addresses and 20 product addresses.

All 32 sitemap pages were checked through raw HTTP output or direct browser fallback when the connector did not return an HTTP result. Every connector-only gap resolved to the intended product page in the browser. Ordinary-browser, Googlebot and Bingbot response hashes were identical for the checked homepage, article, product and false-page controls.

### Route and article identity

- `/storie-fatti-scientifici-polpo` returns a permanent `308` redirect to `/blog`.
- `/Octopus-Facts` also returns a permanent `308` redirect to `/blog`.
- The built artifact contains a distinct article page with its own title, description and canonical, but Vercel never serves it because the redirect wins.
- `/blog` and the intended article are distinct saved CMS records with different content hashes and different SEO fields. Both currently present the same primary heading, `La Mente del Polpo: Tra Scienza e Meraviglia`, so Donato still needs to decide what `/blog` should say as a separate index page.

### False-success routing

- `/this-page-must-not-exist` returns homepage HTML with HTTP `200`.
- `/sitemap.json` returns homepage HTML with HTTP `200`; after client hydration it visually changes to the Not Found component, but the server response remains a false success.
- `/logo.png` returns homepage HTML with HTTP `200`.
- `/images/this-image-must-not-exist.webp` and `/artworks/octoheaded.jpg` return genuine `404` responses.

### Page identity

- All 32 intended sitemap pages contain two effective document titles in raw HTML.
- All 32 intended sitemap pages contain two meta descriptions in raw HTML.
- Each intended page retains one route-specific canonical.
- The homepage has two identical titles, so the current safety judge records only its conflicting descriptions. The other 31 pages have conflicting titles and descriptions.
- Product pages and the FAQ also repeat their primary heading. That remains P1 content/layout work, not the first technical SEO repair.

### Shared identity assets

- Structured data declares `https://octowonders.com/logo.png`, but that address is homepage HTML.
- Social metadata declares `https://octowonders.com/artworks/octoheaded.jpg`, but that address is missing.

## 3. Committed SSG and artifact findings

Fresh verification:

- safety examples: 55 passed, 0 failed;
- safety typecheck: passed;
- source check: red with 2 discoverability conditions and 6 excluded transaction conditions;
- committed build: completed three times;
- artifact check: red with 65 discoverability conditions and no availability or transaction condition;
- sitemap route set and sitemap hash: identical across repeated committed builds;
- title, description and canonical multiset: identical across repeated committed builds.

An initial combined-manifest hash differed because `rg` emitted identical file results in a different order. A line-multiset comparison proved there was no identity-content difference. This was a scanner-order artifact, not an SSG nondeterminism finding.

The build still prints a `vite-react-ssg` forced-exit warning, repeated React SSR `useLayoutEffect` warnings and a missing `svgo` optimizer warning. The build nevertheless completes. These warnings are not classified as SEO failures without a credible consequence.

## 4. Four proven technical root groups

### A. Hosting rules override intended files

`vercel.json` redirects the intended article to `/blog` and applies a broad homepage rewrite to unknown addresses. The generated article file exists but is unreachable at its intended public address.

### B. The base HTML fallback is not replaced

`index.html` contains a fallback title and description. `src/components/SEO.tsx` then adds the route-specific title and description during SSG. Both survive in the published HTML. Removing only the generic fallback is likely the smallest identity correction, but it must be paired with a fail-closed public-route validator so an SSG head failure cannot publish a title-less page.

### C. SSG protection logs failures without stopping publication

- `onPageRendered` logs an empty-body condition but does not throw.
- the sitemap plugin logs missing or malformed build data and returns instead of failing the build;
- the head-injection and inline-data postbuild scripts count fallback or no-head cases but do not reject an invalid public route;
- `npm run build` does not itself run the artifact safety check.

The GitHub gate can detect known artifact failures, but a direct Vercel rebuild or deploy hook can still bypass that gate. Minimum containment must make invalid public SEO output fail the build itself after the current known identity defects are repaired.

### D. Sitemap authority is duplicated

The sitemap currently served by Vercel matches the Vite build artifact. It excludes the HTML `/sitemap` page and contains the current 32-route set.

At least three other mechanisms still exist:

- `public/_redirects` declares a proxy to a Supabase sitemap function, but Vercel follows `vercel.json`; the live result proves the Vite artifact currently wins;
- the Admin save path invokes `regenerate-sitemap`, which uploads a different sitemap to Supabase storage but does not update the public Vercel artifact;
- `scripts/generate-seo-pages.ts` is a separate dormant product-page generator and is not part of the package build scripts.

The public sitemap is currently complete, but these mechanisms disagree about fixed routes and publication. Full unification remains larger than the minimum containment package.

## 5. Content decisions for Donato

These are content problems, not code defects:

- decide and write the `/blog` index identity and content so it no longer presents itself as the intended article;
- remove embedded brand suffixes from CMS `seo_title` values where the SEO component already appends `| OctoWonders`; current examples produce titles such as `Chi Sono ... | OctoWonders | OctoWonders`;
- review route-specific wording and typos such as `tmpi`, `im mondiale`, `Trasformations`, and inconsistent brand capitalization;
- approve the exact physical files to publish at `/logo.png` and `/artworks/octoheaded.jpg`.

Do not change slugs while the routing repair is prepared.

## 6. Smallest repair proposal

This proposal is not approved for implementation.

1. Add focused failing tests for the article address, direct legacy redirect, false-success paths, one title, one description, one canonical and build rejection of invalid public output.
2. Change only the hosting rules needed to serve the existing article artifact, redirect `/Octopus-Facts` directly once, preserve intended internal routes and remove the broad homepage fallback.
3. Remove the generic title and description from the base HTML so the existing route-specific SEO component becomes the single identity source.
4. Add a postbuild public-route validation step that fails Vercel builds when an intended page, title, description, canonical, sitemap address or approved shared identity image is absent or conflicting.
5. Treat the Vite-generated `dist/sitemap.xml` as the current production artifact and test it against the route contract. Do not redesign or delete the Supabase mechanisms in this package.
6. Verify an immutable Preview across all 32 sitemap addresses, the direct legacy redirect, internal routes and negative addresses. Keep public domains unchanged.
7. Present a separate production-publication package. Publishing remains manual and requires fresh approval.

Estimated focused engineering magnitude for this minimum package, including Preview verification but excluding approval waits and Donato's content work: approximately 8 to 12 hours. This is an estimate, not elapsed-time evidence. A full sitemap-authority redesign, full SSG rewrite or blog-platform redesign remains deferred.

## 7. Boundaries retained

- intermittent refresh-cleared navigation 404 excluded;
- cart and checkout excluded;
- payment remains paused;
- automatic rollback remains disabled;
- release reopening remains manual;
- GitHub `main` protection remains postponed;
- no indexing request, production publication or outside-setting change is authorized by this document.
