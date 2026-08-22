# OctoWonders SEO Differential and Repair Brief

**Original date:** 2026-08-21  
**Last reconciled:** 2026-08-22  
**Workstream:** WS1, SEO, routing, indexability and citability  
**Status:** Read-only differential and bounded technical AEO/GEO baseline complete. P0 discoverability/citability outcome and comprehensive repair plan decided. No implementation, deployment or production verification has begun.  
**Controlling handoff:** `docs/handoffs/2026-08-21-stabilization-handoff.md`
**Comprehensive action plan:** `docs/2026-08-22-stabilization-action-plan.md`

> This brief does not authorize code changes, deployment, GSC validation, indexing requests, sitemap submission, production-data mutation, external-setting changes, or a purchase/refund.

## Quick orientation

This differential follows a confirmed historical sitewide indexability outage. From approximately 2025-12-22 through 2026-03-10, the production SSG output omitted the complete `<head>` across the site, including titles, descriptions, canonicals and structured data. OctoWonders was effectively down to Google and organic search for about 77 days while still appearing live to human visitors. That outage and its business impact are the primary incident facts. The differential below addresses the residual indexing state after the outage; it does not qualify whether the outage occurred.

The governing priority model was clarified on 2026-08-22. Availability, discoverability/citability and the complete artwork-to-confirmed-payment path are equal P0 outcomes. The historical full-head outage was a P0 discoverability incident. A newly introduced failure of the same governing outcome is a P0 regression. The protection requirement is to block bad releases, detect live failure, preserve evidence and begin root-cause isolation automatically, then roll back an eligible post-deployment P0 regression and notify Donato by WhatsApp and email.

The current store normally works and must be preserved. This is minimal hardening, not a redesign or an assumed platform migration. The broader recovery, transaction, admin, image and Lovable-independence workstreams remain governed by the controlling handoff and action plan. Current reachable admin outcomes must be preserved through recoverable equivalents; the proposed production-app mirror was withdrawn. The complete code review occurs as a current-store safety check before application changes, independently for each repair package, and again before go-live.

The basic blog is not P0. The shared routing and sitemap mechanisms that currently redirect the intended article and return homepage HTML for missing sitemap-like paths are part of the P0 discoverability-risk repair. The tile UI and editorial workflow follow the P0 safeguards.

After all three P0 outcomes have active safeguards, the business program shifts to measured distribution: SEO, AEO, GEO, Pinterest, selected Facebook groups, selected Instagram audiences and other evidence-backed channels. This repair brief supplies the SEO/AEO/GEO technical foundation; it does not authorize distribution execution.

The 25 indexed sitemap URL identities were obtained from the GSC Page Indexing report scoped to `/sitemap.xml`, last updated 2026-08-17. They were compared with the six intended indexable exclusions: five products and `/artista`.

The six exclusions do not form a distinct current technical class. At measurement time, the five excluded products and all 15 indexed product controls returned the same core contract: `200 text/html`, self-canonical, no observed robots exclusion, stable server HTML for ordinary and Googlebot smartphone requests, unique product metadata and image identity, Product plus Breadcrumb structured data, positive price/availability signals, and active purchase controls. `/artista` also returned stable, indexable, self-canonical HTML. GSC recorded its Google-selected canonical as the inspected URL.

The remaining observed separation is historical crawl state:

- four products have never been crawled;
- the fifth product was last crawled on 2026-04-20;
- `/artista` was last crawled on 2026-04-09;
- the Page Indexing report's indexed examples were crawled from 2026-04-19 through 2026-08-17;
- a later URL Inspection record for an indexed low-link control showed a newer crawl on 2026-08-20, confirming that URL Inspection can be fresher than the aggregate report.

Current page correctness therefore does not explain Google's historical decisions. The evidence supports repairing unconditional architecture defects and then observing a small, stratified post-repair cohort. It does not support content growth, backlink work, broad AEO/GEO content expansion, or an indexing request in the present task. A bounded technical AEO/GEO baseline was added after Donato asked whether answer-engine readiness had been checked; it is reported separately below and does not authorize implementation.

Read-only Lovable database evidence also removes current lifecycle state as a discriminator. All five excluded products are active, each has three size rows, complete dedicated SEO fields and `updated_at` `2026-05-17`. All 15 indexed product controls are active, range from one to five size rows, and include indexed `/product/octocubist`, which has no dedicated database SEO title or description.

## Scope and method

Evidence was gathered read-only from:

1. GSC Page Indexing scoped to `/sitemap.xml`, including all 25 indexed examples and both exclusion groups.
2. Cached GSC URL Inspection records for `/artista`, the crawled excluded product, two never-crawled products, and an indexed low-link control. No live test or indexing request was run in this task.
3. The production sitemap and production HTML for all 32 submitted URLs.
4. Two ordinary production fetches and one Googlebot smartphone user-agent fetch for all 20 product pages plus `/artista`.
5. The primary image URL used by each of the 20 Product structured-data objects.
6. The authoritative GitHub repository at the handoff's verified commit, plus sampled historical commits.
7. Read-only Lovable production database queries for current lifecycle state, size-row count, SEO-field presence and modification timestamps across all 20 submitted products, plus `/artista` and `/blog`.

Product-description similarity was measured only as token cosine similarity over the visible Product description after common Italian function words were removed. This is a bounded comparison, not a model of Google's index-selection system.

## Production sitemap and repository reconciliation on 2026-08-22

Donato confirmed that the intended endpoint is `https://octowonders.com/sitemap.xml`; `sitemsp.xml` was a typing error. Read-only remeasurement found:

- live `/sitemap.xml`: `200 application/xml`, 6,281 bytes, 32 unique URLs, SHA-256 `68d054bf4be66c700fe23c8c0118bbbe64e7381b4813a650224b35d30a9c0cc5`;
- the live body is byte-identical to the local `public/sitemap.xml` in the examined export;
- all 32 listed URLs currently return `200 text/html` except `/storie-fatti-scientifici-polpo`, which returns `308 text/plain` to `/blog`;
- live `/sitemsp.xml`: `200 text/html`, 45,629 bytes, homepage body SHA-256 `d352c686da082f9c66e862b2633c96478c5f696569b2268a43de9e6d535ed17d`;
- `/sitemap.json` and `/llms.txt` are the same class of false-`200` route defect;
- `robots.txt` correctly advertises `https://octowonders.com/sitemap.xml`;
- no GSC submission, validation or indexing request was performed.

The current sitemap is improved relative to the 34-URL Storage backup copy, but it is not the final required system. The older copy included obsolete English routes, `/sitemap` and three retired product slugs. The current copy adds the Italian destinations, `/faqs`, `/blog` and the intended article. Improvement in membership does not eliminate the current redirect or the conflicting generation paths.

### Multiple competing authorities

The repository contains all of these sitemap mechanisms:

1. a Vite plugin that reads generated product/page JSON and writes both tracked `public/sitemap.xml` and the deployment artifact;
2. a `sitemap` Edge Function that queries live pages/products and returns dynamic XML;
3. a `regenerate-sitemap` Edge Function that uses a different static-page list and uploads `product-images/sitemap.xml` to Storage;
4. a database trigger that invokes `regenerate-sitemap` after product INSERT, UPDATE or DELETE;
5. an admin product-save invocation of `regenerate-sitemap`;
6. a stale `_redirects` rule that proposes proxying `/sitemap.xml` to the dynamic Edge Function.

These mechanisms disagree about active products, CMS pages, legacy routes and the public destination. On the current Vercel deployment, the admin and database-trigger path can update the Storage object without updating the production sitemap. An admin success message therefore does not prove public sitemap propagation.

The build generator also:

- includes every CMS row without an explicit publication lifecycle;
- fabricates today's date when a timestamp is absent;
- emits `priority` and `changefreq`, which Google ignores;
- interpolates values without a dedicated XML/URL validation layer;
- writes into tracked source output during a build;
- catches generation errors without failing the build.

The repair must replace these paths with one route-registry-derived deployment artifact and fail the build on mismatch. This is a full sitemap-authority repair, not an edit to one URL.

### Repository and review state

- GitHub `main` still points to `ffe0b380166bd6b9bae7e3d89711a1078867e41d`.
- No GitHub issue, pull request or scheduled comprehensive code review was found.
- The repository has no `test` or type-check script and no application test suite.
- The only workflow regenerates generated data, commits it directly and relies on the push to deploy. It does not run protected SEO, route, transaction or security checks.

No controlling handoff claim was contradicted. These findings expand the build-state-divergence, admin-publication and release-safety requirements.

## GSC indexed sitemap set

The following is the complete set shown in GSC's 25-row indexed examples table scoped to `/sitemap.xml`. Crawl dates are those displayed in the aggregate Page Indexing report last updated 2026-08-17.

| # | Indexed URL | Last crawled shown in aggregate report |
|---:|---|---|
| 1 | `https://octowonders.com/` | 2026-08-17 |
| 2 | `https://octowonders.com/product/pesce-pescetto-astratto-colori-brillanti-stampa-tela-canvas` | 2026-08-16 |
| 3 | `https://octowonders.com/product/4-acciughe-sardine-andy-wharol-stampa-tela` | 2026-08-16 |
| 4 | `https://octowonders.com/product/polpo-octopus-blue-wow-stampa-tela` | 2026-08-07 |
| 5 | `https://octowonders.com/product/octocubist` | 2026-08-01 |
| 6 | `https://octowonders.com/product/ventose-bolle-effetto-cangianti-stampa-tela` | 2026-08-01 |
| 7 | `https://octowonders.com/product/trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas` | 2026-07-27 |
| 8 | `https://octowonders.com/faqs` | 2026-07-23 |
| 9 | `https://octowonders.com/spedizione` | 2026-07-22 |
| 10 | `https://octowonders.com/product/mistero-comfort-food-brodino-stampa-tela` | 2026-07-17 |
| 11 | `https://octowonders.com/ordine-personalizzato` | 2026-07-13 |
| 12 | `https://octowonders.com/product/sardine-acciughe-gruppo-stampa-tela-alta-qualita` | 2026-07-05 |
| 13 | `https://octowonders.com/blog` | 2026-07-05 |
| 14 | `https://octowonders.com/terms` | 2026-06-25 |
| 15 | `https://octowonders.com/pricing-policy` | 2026-06-24 |
| 16 | `https://octowonders.com/privacy` | 2026-06-24 |
| 17 | `https://octowonders.com/product/astratto-su-tela-stampa-colori-immagine-nascosta` | 2026-06-21 |
| 18 | `https://octowonders.com/product/polpo-braccia-surreale-inquietante-stampa-tela` | 2026-06-18 |
| 19 | `https://octowonders.com/product/polpo-octopus-ventose-psichedeliche-stampa-tela` | 2026-06-04 |
| 20 | `https://octowonders.com/contatti` | 2026-05-12 |
| 21 | `https://octowonders.com/product/polpo-octopus-braccia-ventose-stampa-tela` | 2026-04-30 |
| 22 | `https://octowonders.com/product/polpo-abissale-trasparente-stampa-tela` | 2026-04-29 |
| 23 | `https://octowonders.com/resi-rimborsi` | 2026-04-28 |
| 24 | `https://octowonders.com/product/acciuga-sardina-testa-occhio-creature-marine-stampa-tela-canvas` | 2026-04-21 |
| 25 | `https://octowonders.com/product/acciuga-sarda-testa-effetto-colori-stampa-tela-canvas` | 2026-04-19 |

Later evidence nuance: cached URL Inspection for `ventose-bolle-effetto-cangianti-stampa-tela` showed a 2026-08-20 Googlebot smartphone crawl. This does not contradict the table. The aggregate report was last updated on 2026-08-17.

## Six intended exclusions

Current homepage rank counts unique product cards in server HTML, from 1 through 20. Each product card generates two anchor occurrences. Current submitted-source count is the number of other submitted HTML pages that contain a link to the target.

| Intended URL | GSC state | GSC historical evidence | Current internal-link evidence | Current production identity |
|---|---|---|---|---|
| `/product/polpo-octopus-ventose-colori-accesi-stampa-tela` | Discovered, not indexed | Never crawled. Cached Inspection reported the sitemap as both sitemap and referring page. | Homepage rank 16; 2 homepage anchors; linked from 11 other submitted HTML pages. | `200 text/html`, self-canonical, stable ordinary/Googlebot body, Product plus Breadcrumb, InStock, unique primary image returning `200 image/webp`. |
| `/product/polpo-octopus-ventose-rosa-digitale-stampa-tela` | Discovered, not indexed | Never crawled. Cached Inspection reported both the homepage and sitemap as referring pages. | Homepage rank 1; 2 homepage anchors; linked from 11 other submitted HTML pages. | Same current technical class as indexed products. |
| `/product/polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela` | Discovered, not indexed | Never crawled. | Homepage rank 17; 2 homepage anchors; homepage is its only other submitted HTML source. | Same current technical class as indexed products. |
| `/product/trota-salmone-pesce-temporale-stampa-tela-canvas` | Discovered, not indexed | Never crawled. | Homepage rank 20; 2 homepage anchors; linked from 3 other submitted HTML pages. | Same current technical class as indexed products. |
| `/product/polpo-octopus-effetto-pescato-ventose-stampa-tela` | Crawled, not indexed | Last crawled 2026-04-20 by Googlebot smartphone. Crawl allowed, fetch successful, indexing allowed, user canonical and Google canonical were the inspected URL. Cached Inspection reported the sitemap as referring page. | Homepage rank 13; 2 homepage anchors; homepage is its only other submitted HTML source. | Same current technical class as indexed products. |
| `/artista` | Crawled, not indexed | Last crawled 2026-04-09 by Googlebot smartphone. Crawl allowed, fetch successful, indexing allowed, user canonical and Google canonical were `/artista`. GSC reported `/blog` and the sitemap as referring pages. | Linked from the homepage and all 20 submitted product pages, 21 submitted sources in total. | `200 text/html`, self-canonical, stable ordinary/Googlebot body, WebPage plus Breadcrumb structured data. |

The seventh submitted exclusion, `/storie-fatti-scientifici-polpo`, is not part of the six-way index-selection comparison because it is not presently a valid destination. It returns `308 text/plain` to `/blog` despite being submitted as the intended standalone first article. That is an unconditional contract defect.

## Differential findings

### 1. Current internal-link prominence does not separate the groups

- Every product, indexed or excluded, has a direct current homepage card with two anchor occurrences.
- Excluded product ranks span 1, 13, 16, 17 and 20. Indexed product ranks span 2 through 19.
- The never-crawled pink product is the first homepage product and is linked from 11 submitted pages.
- The indexed `ventose-bolle-effetto-cangianti-stampa-tela` control is rank 19 and has only the homepage as another submitted HTML source.
- `/artista` is linked from 21 submitted pages. `/blog` has the same current submitted-source count and is indexed.
- Cached Inspection for the indexed low-link control reported no detected referring page, while it remains indexed.

Counterexample: an indexed product has weaker current submitted-link coverage than four of the five excluded products. Current link count or rank is not a sufficient explanation.

Historical qualification: GSC proves that the never-crawled pink product was discovered from the homepage and sitemap, while the never-crawled `Octosuckers` record reports only the sitemap. The complete historical homepage order and link deployment timeline cannot be reconstructed from available evidence.

### 2. Sitemap `lastmod` does not separate the groups

- Nineteen of the 20 product URLs have the identical `lastmod` value `2026-05-17`. That includes all five excluded products and 14 indexed products.
- The remaining product, indexed `/product/octocubist`, has `lastmod` `2026-05-04`.
- `/artista` has `lastmod` `2026-02-19`, shared by six indexed informational pages: `/contatti`, `/ordine-personalizzato`, `/pricing-policy`, `/privacy`, `/resi-rimborsi` and `/spedizione`.
- Indexed `/blog` has an older `lastmod`, `2026-01-17`.

Counterexample: indexed pages share the excluded pages' exact `lastmod` values, and one indexed page is older. `lastmod` is not a sufficient explanation.

Read-only production database evidence confirms that these sitemap dates match `products.updated_at` for all 20 products: 19 rows are `2026-05-17`, while indexed `/product/octocubist` is `2026-05-04`. The dates are therefore traceable to current row timestamps, but remain low-signal because almost the whole catalogue shares one value. Whether each timestamp represents a material public-page change remains unproven.

### 3. Visible product description uniqueness does not separate the groups

- All 20 Product names and structured-data descriptions are exact-unique.
- The excluded products' content-bearing description-token counts range from 38 to 57. Indexed products range from 11 to 84.
- The highest nearest-neighbour description similarity among excluded products was 0.26.
- Indexed controls reach 0.31 similarity.
- Indexed `/product/octocubist` has only 11 content-bearing description tokens, less than every excluded product.

Counterexamples: an indexed product is materially thinner than all excluded products, and an indexed product pair is more textually similar than the nearest excluded pair. Current visible description length or measured textual similarity is not a sufficient explanation.

Remaining qualification: all product pages share a common commerce template. Google's assessment of visual similarity, information gain, image semantics or broader page value is not reproduced by this token comparison.

### 4. Titles and descriptions are unique, but document-head duplication is universal

- All 20 primary product titles are exact-unique.
- All 20 primary product meta descriptions are exact-unique.
- Every product page emits two `<title>` elements, two meta descriptions and two H1 elements.
- `/artista` emits two titles and two descriptions but one H1.
- Indexed product controls have the same two-title/two-description/two-H1 defects.
- Indexed `/blog` has the same two-title/two-description pattern as `/artista`.

Counterexamples: indexed pages have the same architectural metadata duplication. Duplication is a proven defect but not a sufficient explanation for the differential.

### 5. Primary product image identity and accessibility do not separate the groups

- Each of the 20 products uses a different primary Product image URL.
- All 20 primary image URLs returned `200 image/webp` on GET.
- The excluded image sizes observed in the response fell within the broader indexed image-size range.

Counterexample: no excluded product has a missing or shared primary image while indexed controls have accessible unique images.

Unconditional asset defects remain:

- `https://octowonders.com/artworks/octoheaded.jpg`, used by homepage and informational Open Graph metadata, returned `404 text/plain`.
- `https://octowonders.com/logo.png`, used as the Organization structured-data logo, returned `200 text/html` containing application HTML rather than an image.
- The homepage is indexed despite the broken default Open Graph image, so this asset defect is not a sufficient explanation for differential indexing.

### 6. Structured data, price and availability do not separate the products

- All 20 product pages expose Product and Breadcrumb structured data.
- All Product objects report `AggregateOffer`, `InStock`, positive low/high EUR prices and a positive offer count.
- Excluded products have 2 to 3 reported offers. Indexed products range from 1 to 5.
- Excluded low/high price signals sit inside the indexed range.

Counterexample: indexed products exist with fewer offers and thinner visible content.

Read-only production database evidence confirms that all five excluded products are active, each has three size rows and complete dedicated SEO fields. All 15 indexed controls are also active but range from one to five size rows. Indexed `/product/octocubist` has one size row and no dedicated database SEO title or description, while its public page remains indexed through fallback page identity. Current active state, size count and populated dedicated SEO fields are not sufficient explanations for the differential.

Lifecycle qualification: the wider contract for active, purchasable, retired and invalid-variant states remains undefined even though the current 20-product cohort is active.

### 7. Current response stability does not separate the groups

For all 20 products plus `/artista`:

- the first ordinary fetch, a repeated ordinary fetch and a Googlebot smartphone user-agent fetch returned identical body hashes;
- every response was `200 text/html; charset=utf-8`;
- every response emitted its own canonical;
- no robots meta exclusion or `X-Robots-Tag` exclusion was observed.

This is present-time evidence only. It does not establish what Googlebot received on the April crawl dates, across earlier deployments, or from earlier cache/build states.

### 8. Crawl history is the only measured group-level separation

- Four excluded products have no crawl.
- The crawled excluded product and `/artista` were last crawled in April.
- Current GSC Inspection for both crawled exclusions shows successful Googlebot smartphone fetch, crawl allowed, indexing allowed and Google canonical equal to the inspected URL.
- Many indexed examples were crawled weeks or months later.
- The excluded product's April crawl predates the current repository snapshot's 2026-05-17 product SEO update timestamp.

Supported hypothesis: Google's exclusion records may describe earlier page/build/link states rather than the current production documents.

Counterexample: age alone is not sufficient. Two indexed product examples were crawled on 2026-04-19 and 2026-04-21, adjacent to the excluded product's 2026-04-20 crawl.

## Repository-history result

Historical prominence could not be reconstructed reliably from the authoritative repository:

- sampled historical refs from March, April, the sitemap-submission eve and the 2026-05-17 SEO update contain `src/generated/products.json` as an empty array because production data was generated at build time;
- the current repository snapshot contains product data, but its `display_order` does not match the current production homepage order;
- the live homepage order is therefore the current authority, while the repository proves that stored/generated/build/public surfaces can diverge.

This corroborates the handoff's build-state-divergence warning. It is not a contradiction with the handoff and is not proof that Googlebot saw a particular alternate order.

## Candidate explanations

### Supported, but not proven causal

1. **Stale Google observation.** The two crawled exclusions have April records, while current product metadata reflects a later state and current responses are stable.
2. **Historical discovery and crawl-priority differences.** Four URLs were discovered but never crawled. Current prominence does not explain the group, but the complete historical link and deployment timeline is unavailable.
3. **Low-signal sitemap freshness.** Nineteen product URLs share one `lastmod`, so the sitemap provides almost no product-level change discrimination.
4. **Historical build/cache divergence.** Current repository order and live homepage order disagree, and historical generated data is absent from Git. Google may have observed a different build state, but no historical response body or server log proves this.
5. **Page-value or visual-similarity selection.** Google can choose not to index technically eligible pages. Product-template similarity remains plausible, but current descriptions and primary images are unique, and stronger indexed similarity/thinness counterexamples exist.

### Falsified as sufficient explanations

1. Current robots, `noindex`, fetch failure, status, content type or self-canonical failure.
2. Current internal-link count or homepage position.
3. Sitemap inclusion or the present `lastmod` value alone.
4. Exact duplicate primary titles, descriptions, product descriptions or primary images.
5. Current visible description thinness or measured description similarity alone.
6. Missing Product/Breadcrumb structured data, unavailable primary image, missing price or out-of-stock Product signal.
7. Duplicate titles, descriptions or H1s alone.
8. A successful sitemap status implying that every submitted page is indexed.

### Remaining unknowns

1. Exact HTML, headers, canonical, metadata, product state and internal links served on each historical GSC crawl date.
2. Historical homepage order and the deployment date on which each product first acquired a server-rendered homepage link.
3. Googlebot/server logs, if any exist, including crawl attempts that are not represented in GSC.
4. Whether current database `updated_at` and sitemap `lastmod` values represent actual material public-page changes.
5. Whether the four never-crawled products would be indexed after an ordinary recrawl without content changes.
6. Google's current selected canonical for never-crawled URLs, which is necessarily unavailable until a crawl occurs.
7. Full-page visual and semantic differentiation beyond the bounded visible-description comparison.
8. Whether current Product structured-data non-critical issues differ materially across all products. GSC validates representative indexed and excluded controls but a complete issue-field export was not taken.

## SEO repair brief

### Decision recorded

Donato approved the revised repair scope on 2026-08-21 as the evidence basis for WS1 implementation planning. He approved despite the full AEO/GEO evidence pass remaining pending. That pending pass is not a prerequisite for preparing the repair, but it remains an explicit unknown and must not be represented as complete.

The governing priority model was subsequently clarified on 2026-08-22. Availability, discoverability/citability and the complete artwork-to-confirmed-payment path are equal P0 outcomes. Within the discoverability repair, eliminating overall SSG/build/serve brittleness through adversarial characterization and stress testing is the leading technical priority. It is not a higher business priority than availability or transaction integrity. The historical document-head serialization failure is one mandatory regression case within that broader requirement. The March `postbuild-inject-head.cjs` repair is temporary containment, not the final architecture. This does not authorize implementation.

This approval authorizes planning only. It does not authorize application-code changes, deployment, GSC validation, indexing requests, sitemap submission, production-data mutation or external-setting changes. The controlling next task is AP0 in `docs/2026-08-22-stabilization-action-plan.md`: establish exact code/deployment authority and prepare the current-store safety-check and P0 canary/incident-response approval package. Implementation remains blocked until the AP0 gates are satisfied and Donato separately approves an implementation package.

### User-visible issue

Google and other crawlers can receive contradictory route, page, metadata and asset identities. A submitted article redirects away from its intended destination, unknown routes and assets can return homepage HTML with `200`, product documents emit duplicate head/H1 signals, and shared social/organization assets are invalid. These defects make the site harder to crawl, diagnose and trust even though they do not by themselves explain which current products Google indexed.

### P0 discoverability repair: eliminate overall SSG/build/serve brittleness

Before secondary SEO repairs, the implementation plan must characterize and adversarially stress the complete path from source data through prebuild, SSG, HTML transformation, Vercel routing, caching and served response. It must not assume that the already observed head-loss mechanism is the only failure mode. The target is deterministic, internally consistent direct build output from one authoritative path, with `postbuild-inject-head.cjs` treated only as temporary containment until the broader system contract is proven.

The mandatory acceptance gate is generated-file-wide, not sample-based: every intended destination must have the correct status, content type, route identity, visible content, head, canonical, robots state, structured data and asset references before deployment. The build must fail closed on absence, duplication, wrong-route fallback, stale-state divergence or identity mismatch. The original sitewide head-loss symptom must be retained as a regression fixture with red, green and rollback proof, but passing that fixture alone is insufficient.

### Proposed engineering outcome

Implement one explicit routing and document-identity contract generated from one authoritative route registry:

1. One typed route registry defines route, route kind, publication/indexability state, canonical target, content identity, sitemap membership and material-change timestamp. The build, router, SSG, sitemap, navigation and tests consume the same registry.
2. Every sitemap page is a real destination returning `200 indexable text/html`, a self-canonical, one effective title, one description and one primary H1.
3. Redirects, retired resources, malformed URLs and nonexistent routes are absent from the sitemap.
4. Unknown routes and assets return real `404/410`; missing assets never return application HTML.
5. Product noncanonical variants redirect directly to the canonical slug.
6. `/storie-fatti-scientifici-polpo` becomes the standalone first article. `/blog` becomes its own minimal index page and links to the article.
7. Product and Breadcrumb structured data are derived from the same canonical lifecycle, size, price, availability and image interpretation used by the visible page.
8. The article emits visible and structured title, author, publication date, modification date, thumbnail and description from the same CMS record. The approved first-article values are recorded in the controlling handoff and action plan.
9. Open Graph and Organization image URLs return valid, relevant images with correct content types.
10. Sitemap `lastmod` is emitted only from an authoritative material-change timestamp. If no trustworthy timestamp exists, omit it rather than fabricating freshness.
11. Sitemap output is one validated deployment artifact. The Supabase `sitemap` and `regenerate-sitemap` functions, database trigger, Storage copy, admin regeneration control and stale proxy must be removed as competing production authorities or converted to non-authoritative observability surfaces. An admin action must never report a production sitemap change that it did not cause.
12. Current server-rendered navigation retains meaningful links to every intended product and article.

### Required characterization and falsification tests before implementation

1. Capture route manifests and raw HTML after prebuild, SSG serialization, every HTML mutation, final build packaging and the served preview response. Identify every stage capable of removing, duplicating, replacing or desynchronizing route identity, visible content, the document head, structured data or asset references.
2. Reproduce the original silent full-head loss without touching production. Retain it as one mandatory regression fixture, not as the complete stress model.
3. Assert every generated HTML destination before deployment: one effective title, one description, one canonical, required structured data, declared charset/viewport, correct visible identity and no missing or duplicated `<head>`.
4. Assert the route matrix for every current sitemap URL and every route class: homepage, product, single-segment CMS page, nested CMS/article page, redirect, trailing-slash variant, UUID product URL, obsolete URL, admin/tool route, checkout-success route, missing page and missing static asset.
5. Repeat the matrix with ordinary browser, Googlebot smartphone, Bingbot and OAI-SearchBot user agents before hydration. Compare status, content type, redirects, body hash, canonical, robots, title count, description count, H1 count, structured-data identity and meaningful navigation.
6. Exercise adverse build-data states in an isolated environment: unavailable or partial database reads, empty collections, missing optional SEO fields, malformed/special-character content, newly added/updated/retired products and pages, missing referenced assets and stale generated data. A failed authoritative input must not silently publish a plausible but wrong site.
7. Run clean and incremental builds repeatedly from the same inputs and compare route manifests and content fingerprints. Then change one authoritative record and prove that only the intended outputs change.
8. Exercise preview, production-like routing, cache/cold-cache behavior and rollback artifacts. A valid route must never be replaced by the homepage shell, and a missing route or asset must never become a false `200`.
9. Assert that every generated sitemap URL is a real indexable destination and that no redirect/404/410 appears in the sitemap.
10. Assert that Product, Breadcrumb, Organization/WebSite and later Article structured data use the same canonical URL, names, images, authorship, availability and commercial facts as the visible page and authoritative records.
11. Assert that every referenced OG image and Organization logo returns a valid image content type.
12. Preserve at least these indexed counterexamples as controls: the thin `/product/octocubist`, the low-link `/product/ventose-bolle-effetto-cangianti-stampa-tela`, and the duplicate-metadata indexed product `/product/polpo-octopus-ventose-psichedeliche-stampa-tela`.

Breaker win condition: one intended URL is missing or stale, redirects unexpectedly, declares another canonical, emits `noindex`, returns the wrong content type, loses its route-specific content/head/schema/image, differs improperly by crawler user agent, or is replaced by homepage HTML. One silent partial build, nondeterministic repeat build or false-success build also breaks the system contract.

### Bounded AEO/GEO technical baseline

No dedicated AEO/GEO audit had been completed before Donato asked on 2026-08-21. The indexed-versus-excluded differential measured several prerequisites, including server HTML, crawlability, canonicals, structured data, internal links and sitemap identity, but it did not measure answer-engine citations, entity comprehension, editorial citability or referral outcomes.

The following read-only checks were added on 2026-08-21:

1. Ordinary, Googlebot and OAI-SearchBot requests received byte-identical `200 text/html` bodies on the homepage and one excluded-product sample. Ordinary and OAI-SearchBot requests also received byte-identical `200 text/html` bodies on `/blog`. This is positive crawler-parity evidence for those samples only.
2. Production `robots.txt` allows `Googlebot` and `Bingbot` explicitly and permits all other agents through `User-agent: *`, which presently includes OAI-SearchBot. No WAF/CDN block was observed in the sampled OAI-SearchBot requests.
3. The intended standalone article `/storie-fatti-scientifici-polpo` returns `308 text/plain` to `/blog` for both ordinary and OAI-SearchBot requests. The intended article identity is therefore unavailable to answer engines as well as search crawlers.
4. `/llms.txt` is not a real text resource. It returns `200 text/html` with the exact homepage body. This is a false-`200` routing counterexample. Neither Google nor OpenAI identifies `llms.txt` as a requirement for inclusion in their search or AI answers, so creating one is not a priority substitute for fixing routing and content identity.
5. The homepage emits Organization JSON-LD, but its declared `logo` URL returns the homepage HTML rather than an image. It has a founder and contact point but no measured `sameAs` identity links. This makes entity identity incomplete and internally contradictory.
6. The sampled product emits Product plus Breadcrumb JSON-LD with its visible name, dedicated image and aggregate EUR offer. The broader differential already established that Product schema and primary-image identity are unique across all 20 products, while accuracy across every commercial field and variant remains part of the proposed engineering contract.
7. `/blog` emits WebPage plus Breadcrumb schema. Because the standalone article currently redirects away, there is no currently measured Article/BlogPosting object at the intended article URL with stable headline, author, publication/modification dates and image identity.
8. Current metadata defects remain visible to answer engines: two title elements on the sampled homepage, product and `/blog`; two H1 elements on the sampled product; the invalid Organization logo; and a default social image returning `404`.

Official platform guidance does not define a separate magic AEO schema. Google states that its AI search features use the same SEO foundations and require indexed, snippet-eligible pages; important content must be available as text and structured data must match visible content. OpenAI states that OAI-SearchBot must be allowed for pages to be included in ChatGPT search summaries and snippets. These are eligibility conditions, not a promise of citation or ranking.

Primary guidance checked:

- Google Search Central, [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- Google Search Central, [Optimizing your website for generative AI experiences](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- OpenAI, [Publishers and Developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)

Still unmeasured:

- whether and for which questions OctoWonders is currently cited by Google AI features, ChatGPT search, Bing/Copilot or other answer engines;
- OAI-SearchBot and Bingbot parity across the complete route and asset matrix;
- consistency of the OctoWonders, Marco De Francesco, artist, publisher and store identities across visible pages, structured data and authoritative external profiles;
- article-level factual sourcing, author provenance and citation-ready answer structure;
- ChatGPT/AI referral traffic and conversions, if analytics can distinguish them;
- product shipping, return-policy and variant semantics across visible content, structured data, catalogue state and merchant surfaces.

The full AEO/GEO evidence pass therefore remains pending. It must begin with crawler parity, entity accuracy, article/product schema and citation-quality evidence. Broad content production is outside this repair brief and must not precede SSG/routing reliability.

### Smallest controlled post-repair test

Use a four-URL cohort because it is the smallest set that represents the three exclusion classes plus an indexed control:

1. Never crawled, strongest current prominence: `/product/polpo-octopus-ventose-rosa-digitale-stampa-tela`.
2. Crawled product, not indexed: `/product/polpo-octopus-effetto-pescato-ventose-stampa-tela`.
3. Crawled informational page, not indexed: `/artista`.
4. Indexed low-link control: `/product/ventose-bolle-effetto-cangianti-stampa-tela`.

After a separately approved production deployment:

1. Verify the entire production route/asset contract immediately with HTTP and clean-browser evidence. Preview success is not production proof.
2. Record cached GSC state for the four-URL cohort.
3. Do not request indexing automatically. Monitor ordinary sitemap-driven recrawl first, because a manual request would confound crawl-priority evidence.
4. If no recrawl occurs within an agreed observation window, request separate approval for one controlled indexing request and define the interpretation before submitting it.
5. Treat indexing as delayed external evidence, not an immediate release gate.

Immediate falsifier: any repaired sitemap destination fails the production route/identity contract, regardless of whether Google indexes it.

### Risk, rollback and unaffected behavior

**Risk tier:** High SEO/release-surface risk, with no intended production-data mutation. Routing and SSG mistakes can affect every public URL and can conceal product pages behind false `404`, false `200`, redirects or wrong canonicals.

**Worst credible outcome:** a broad route or build change makes valid products non-indexable or unreachable while Preview appears correct.

**Required review:** independent technical review of routing, SSG output, sitemap generation and regression tests before production. A senior human engineer is required if the implementation expands into authentication, database, payments or infrastructure authority.

**Rollback policy:** specified but not yet implemented or proven. A confirmed post-deployment P0 regression may roll back automatically only when it is attributable to the new release, the target previously passed the same P0 contract, rollback is available and rehearsed, no irreversible database/payment/external-system change would be crossed, no rollback is already in progress, and one automatic attempt cannot loop. Provider outages, pre-existing incidents, unknown data corruption and irreversible stateful changes freeze releases and start diagnosis but do not auto-rollback. The exact healthy deployment and technical rollback path must still be established in AP0. Their absence remains a stop-ship condition.

**Affected behavior:** crawler and visitor behavior for routes, redirects, missing resources, article/blog destinations, server-rendered document metadata, structured data, sitemap entries and shared SEO/social assets.

**Unaffected behavior in this repair package:** checkout logic, Stripe mappings, mobile purchase behavior, destructive admin/media behavior, production database contents, homepage ordering behavior, Lovable removal, supplier automation and distribution execution. The basic blog tiles and editorial convenience are a later package; only the shared route, sitemap, document identity and first-article data contract belong here.

## Contradictions and status update

No controlling handoff claim was contradicted.

New evidence that qualifies or extends the handoff:

1. `/artista` was last crawled on 2026-04-09. Its cached GSC record shows `/blog` and the sitemap as referring pages, successful fetch, indexing allowed and Google-selected canonical `/artista`.
2. The crawled excluded product's cached record reports the sitemap as referring page and confirms the inspected URL as Google's canonical.
3. The never-crawled pink product was discovered from both the homepage and sitemap despite never being crawled.
4. An indexed low-link product has no referring page detected in cached URL Inspection and was nevertheless indexed.
5. The current authoritative repository's generated product order does not match the live homepage order. This corroborates, rather than contradicts, the handoff's build-state-divergence and homepage-ordering warnings.
6. The GSC aggregate report and cached URL Inspection have different freshness. The aggregate report was updated 2026-08-17; one indexed control's Inspection record shows a 2026-08-20 crawl.
7. Read-only production database evidence confirms that all 20 submitted products are active. All five excluded products have three size rows and complete dedicated SEO fields, while indexed controls include one to five size rows and indexed `/product/octocubist` lacks dedicated SEO fields. Current lifecycle, size count and SEO-field population do not separate the groups.
8. Product sitemap `lastmod` values match current `products.updated_at` dates across the complete 20-product cohort. Their provenance is now measured, but material-change accuracy remains unknown.
9. On 2026-08-22, production `/sitemap.xml` was byte-identical to local `public/sitemap.xml`: 32 unique URLs, `6281` bytes, SHA-256 `68d054bf4be66c700fe23c8c0118bbbe64e7381b4813a650224b35d30a9c0cc5`. Every listed URL returned `200 text/html` except the intended article, which returned `308 text/plain` to `/blog`.
10. `/sitemsp.xml`, `/sitemap.json` and `/llms.txt` are false-success routes rather than valid resources. The first two sitemap-like counterexamples and `/llms.txt` return homepage content instead of a real missing-resource status or intended resource.
11. Six competing sitemap mechanisms were identified. They can disagree, and the current admin regeneration path can report success without changing the production Vercel sitemap. This extends the earlier build-state-divergence finding.
12. The repository still has no test or typecheck script, no test suite and no scheduled comprehensive review. Its only workflow regenerates and commits source data. This makes the three safety checks and protected P0 contract new work, not existing controls.
13. The `trigger-deploy` Edge Function has permissive CORS, no explicit source authorization check and `verify_jwt = false`. This is a proven authorization-review requirement, not a tested exploit.

These additions do not contradict the controlling handoff. They narrow the repair target and expose additional stop-ship conditions.

## Workstream ledger consequence

WS1 evidence is **Read-only baseline complete for the current evidence set**. The revised repair scope is incorporated into the comprehensive action plan. The full AEO/GEO evidence pass remains pending. Implementation and production verification remain **not started**.

This does not authorize code changes. The controlling next task is AP0: establish exact Git/deployment/recovery/rollback authority and prepare the current-production P0 safety and incident-response approval package. The SSG/sitemap implementation package follows only after those gates and its independent safety check.
