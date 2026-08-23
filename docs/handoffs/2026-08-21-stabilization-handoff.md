# OctoWonders Stabilization Handoff

**Original date:** 2026-08-21  
**Last reconciled:** 2026-08-22  
**Status:** Canonical progressive handoff for the next Codex task  
**Current phase:** Governing P0 priorities and the comprehensive action plan are decided. No stabilization implementation, deployment or production verification has begun.  
**Production site:** https://octowonders.com  
**Authoritative remote:** https://github.com/donatomm/art-blitz-now  
**Last verified remote commit during the surface audit:** `ffe0b380166bd6b9bae7e3d89711a1078867e41d`

> This document transfers the current stabilization program. It does not authorize code changes, production changes, GSC submissions, indexing requests, Stripe transactions, refunds, database mutations, deployments, or supplier actions.

## Quick orientation

Donato's immediate objective is to preserve and harden the current OctoWonders store, not redesign it merely because its implementation is brittle. In ordinary customer use the production store currently works. The business problem is that prior failures were catastrophic and silent, while the broader growth constraint is distribution rather than lack of product affinity.

Three equal governing P0 outcomes control every technical priority:

1. **Available:** the shop and critical product pages remain reachable and usable.
2. **Discoverable and citable:** intended pages remain crawlable, indexable, correctly identified and technically available to search and answer engines.
3. **Transactable:** a customer can go from liking an artwork through the correct product, size and price to confirmed payment and the required post-payment result.

A failure of any one is a P0 incident. If a release or configuration change caused it, it is also a P0 regression. These are not three competing queues. A proven failure in any one stops the release and starts the incident response.

The protection model is prevention plus active response, not notification after damage. Bad releases must be blocked. Live P0 failures must be detected quickly. Evidence preservation and root-cause isolation start automatically before Donato receives the WhatsApp and email alert. A confirmed post-deployment P0 regression automatically rolls back to the last verified healthy release when the rollback safety rules are satisfied.

After P0 hardening, the program changes emphasis to distribution in this order: SEO, AEO, GEO, Pinterest, selected Facebook groups, selected Instagram audiences and other measured channels. Shopify or another platform migration remains a contingency, not the plan.

The read-only SEO differential and bounded technical AEO/GEO baseline are complete. The detailed execution sequence is in `docs/2026-08-22-stabilization-action-plan.md`. The next task is AP0: establish exact code/deployment authority, prepare the first whole-store safety check, and specify current-production P0 canaries and incident response. Do not edit application code or change external settings before the plain-English approval package.

The current application has not been stabilized yet. Discovery and design progress must never be reported as implementation progress.

## Progressive reading path

Start future tasks from `docs/handoffs/CURRENT.md`. It points to this controlling handoff, then the comprehensive action plan, then the detailed SEO evidence. This document begins with the governing course and current state, continues into measured evidence and workstream detail, and ends with the exact bootstrap prompt and acceptance questions. A new task must not skip this document or infer the next action from an isolated historical passage.

## Authority and precedence

Use this order when sources disagree:

1. Donato's newest explicit instruction.
2. This handoff's confirmed decisions and current workstream state.
3. Directly remeasured production, GSC, GitHub, Vercel, Supabase and Stripe evidence.
4. The annotated source document listed below.
5. Current repository code.
6. Historical repository documentation.

The old file `docs/chat-continuity-primer.md` is historical and non-authoritative. Its instruction to “Forget SEO” conflicts with the current equal-P0 discoverability mandate and the post-P0 distribution plan, so it must not govern new work.

## Canonical sources

| Source | Location | Use |
|---|---|---|
| Comprehensive action plan | `docs/2026-08-22-stabilization-action-plan.md` | Governing P0 definitions, execution order, canaries, incident response, rollback, review and distribution transition |
| SEO differential and repair brief | `docs/2026-08-21-seo-differential-repair-brief.md` | Complete indexed-versus-intended-excluded differential, bounded AEO/GEO baseline and WS1 repair contract |
| WS0 backup verification | `docs/2026-08-21-ws0-backup-verification.md` | Current consolidated database, Storage and local service-recovery proof plus explicit remaining gaps |
| WS0 database restore proof | `docs/2026-08-21-ws0-database-restore-proof.md` | Intermediate database-object/data restore proof; read with the later consolidated WS0 documents |
| WS0 Supabase service recovery proof | `docs/2026-08-21-ws0-supabase-service-recovery-proof.md` | Intermediate local service proof; read with backup verification for current limitations |
| User-annotated source | `/Users/donatomm/---OCTOPRO.PRO/PROJECT DOCS/PLAN FOR FIXING; PROCESS; SETOP; AND DETAILS.md` | Original comments, objections, questions and decisions |
| Lovable Storage history and admission | `docs/2026-08-21-ws4-lovable-storage-deletion-evidence.md` | Direct Lovable history: agent-created/deployed/invoked batch function on January 9; separate IMG-to-WebP self-deletion bug on January 25; later diagnostic invocation reporting 92 deletions |
| Local code export | `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/FULL-CODE-OCTOWONDERS.COM` | Read-only code and documentation inspection |
| GitHub repository | `https://github.com/donatomm/art-blitz-now` | Source of truth for version history and future work |
| GSC export | `/Users/donatomm/---OCTOPRO.PRO/https___octowonders.com_-Coverage-2026-08-21` | Aggregate Page Indexing evidence through 2026-08-17 |
| Lovable-authored SSG outage admission | `docs/2026-08-21-ws1-lovable-ssg-outage-admission.md` | Vendor-authored admission of the approximately 77-day sitewide search-indexability outage; source hashes and exact provenance preserved |
| Production sitemap | `https://octowonders.com/sitemap.xml` | Current advertised sitemap |
| Production robots | `https://octowonders.com/robots.txt` | Current crawler policy and sitemap declaration |
| Production domain configuration | `https://vercel.com/dmm-projects/art-blitz-now/settings/domains` | Apex and alias behavior |

The local code export is not a Git checkout. It has no `.git` directory. Before implementation, create or identify a proper clone, verify its remote and commit against GitHub and Vercel, and work on an isolated branch or worktree. This handoff is presently a local canonical artifact, not a committed file. Copy it into the real clone and commit it when that clone is established.

## Objective and current scope

### Immediate objective

Produce a stable version of the current production application with:

- continuously protected availability, discoverability/citability and transaction completion;
- automatic evidence capture, diagnosis start and safe rollback for eligible P0 regressions;
- correct crawl and indexing contracts;
- a verified mobile path from browse through completed payment;
- reliable, understandable admin behavior;
- safe media handling;
- one canonical catalogue and checkout interpretation of dimensions, prices and Stripe mappings;
- reversible releases and production verification;
- no dependency on Lovable for development or runtime behavior.

### Deferred objective

After P0 stabilization, prioritize the controlled distribution program. Decide whether to rebuild on Shopify, Shopify plus a custom storefront, another commerce platform, or a sound custom architecture only if evidence shows that the working store cannot support the business plan. Vercel remains acceptable for the current storefront but is not a permanent platform commitment.

Supplier automation for `stampa.su.tela.com` is deferred. The desired future model must account for manually or automatically exploiting supplier newsletter discounts without allowing a checkout test to trigger supplier fulfilment.

The longer-term platform choice remains open. Donato is not committed to Vercel, Shopify, Hostinger or another named platform. The future decision must balance sound implementation against low traffic and a limited operating budget; low cost does not authorize a substandard architecture.

Future commercial context that must not be lost:

- Alternative media such as dibond aluminium, framed canvas and other finishes may eventually use a medium suffix or separate variant dimension. Custom Orders are acceptable temporarily.
- Expected retail positioning is approximately €70–€200. The GTM strategy must not depend on price competition.
- Demand is expected from narrow audiences rather than broad social reach: octopus/art devotees, selected Pinterest and Etsy niches, relevant Facebook groups and coastal hospitality/restaurants/bars, especially in Italy, France and Spain.
- A dedicated hospitality catalogue and future comparable multi-piece quote are desired.
- Donato does not want to operate routine Pinterest/Instagram demand generation manually. Future GTM should be agent-assisted, but only after the current MVP is stable enough to expose to controlled experiments.
- The current working hypothesis is that the artwork creates unusually strong affinity in the right audience. This remains a hypothesis to test, not a validated demand claim.

## Non-negotiable decisions

1. Availability, discoverability/citability and the complete artwork-to-confirmed-payment path are equal governing P0 outcomes.
2. Prevention is required before notification: block bad releases, run current-production canaries, preserve evidence and start diagnosis automatically.
3. A confirmed post-deployment P0 regression automatically rolls back to the last verified healthy release only when attribution, target-health and state-safety rules pass. Never loop rollback or use it across irreversible state changes.
4. Donato receives WhatsApp and email incident messages containing impact, evidence, actions already taken and recovery state.
5. The current working store is preserved and minimally hardened. Broad redesign is not the default response to brittle code.
6. After P0 stabilization, distribution is the major business priority: SEO, AEO, GEO, Pinterest, selected Facebook groups, selected Instagram audiences, then other measured channels.
7. The basic blog is lower priority than the three P0 outcomes. Its shared route/sitemap defect belongs to WS1; tile and publishing convenience follow the P0 safeguards.
8. The current admin is production-critical.
9. Lovable Preview is considered permanently broken or nonexistent.
10. Vercel Preview Deployments remain valid rehearsal surfaces, but never prove production behavior.
11. Production verification is mandatory after deployment.
12. GitHub is the source of truth. The hosting provider is replaceable; reliability wins.
13. Stop asking Lovable to change the application.
14. Codex may implement. A separate Codex or Claude may review high-risk changes, but two agents must not edit the same branch.
15. Donato approves product and business outcomes. He is not expected to approve terminal output or infer technical safety from code.
16. Significant changes require a plain-language evidence brief. Routine, self-contained, non-ambiguous tasks may use a lighter brief.
17. The approved governance model is evidence-driven hybrid governance. Automated verification and independent review own routine technical assurance. A senior human engineer is reserved for high-risk payments, authentication, database or infrastructure work.
18. A controlled real purchase/refund canary is accepted in principle. Its precise product, payment, supplier-suppression and refund procedure requires separate approval immediately before execution.
19. A product size `N×M` is equivalent to `M×N`. The customer must not even glimpse duplicate orientations of the same size.
20. Medium is separate from dimensions. A future SKU may include a medium suffix, but the domain model must not conflate dimension, medium and Stripe product ID.
21. `2x90x60` is a composite/multi-panel format, not an ordinary two-dimensional size.
22. Personas are executable cognitive and falsification lenses, not decorative marketing profiles and not substitutes for customer truth.
23. Customer tests, regardless of sample size, are fallible and model-dependent. Evidence must be used only for claims it can support.
24. Universal reliability claims are handled through invariants and counterexample search. Passing examples corroborate; they never prove permanence.
25. Use adversarial review frequently to generate new requirements and knowledge.
26. `/storie-fatti-scientifici-polpo` is the first intended article, not a retired route. It should be a standalone indexable article. `/blog` should be a minimal collection/index page that can grow later.

## Current architecture: surface facts

- Frontend: React 18, Vite, React Router, Tailwind/shadcn and `vite-react-ssg`.
- Backend: Supabase database, authentication, storage and Edge Functions.
- Payments: Stripe Checkout through a Supabase Edge Function.
- Build-time content: products, pages and settings are fetched from Supabase and converted into generated TypeScript and JSON files.
- The build performs four post-build mutations/repairs. This is regression-prone.
- Routing combines explicit routes/rewrites with a broad SPA fallback.
- Sitemap authority is split across a Vite build plugin, two Supabase Edge Functions, a product database trigger, a Storage object, a stale `_redirects` proxy and an admin invocation. These paths disagree and must not survive as parallel authorities.
- Core files are oversized, including an approximately 1,591-line admin component.
- No adequate automated regression suite exists for dimensions, pricing, checkout, routes or SEO output.
- Static build data, live admin data and cache/deployment state can diverge.
- Lovable-specific packages, routes, hostname logic and checkout fallback behavior remain.
- Direct Lovable history records its agent creating, deploying and invoking `batch-rename-images` on January 9. A separate IMG-to-WebP optimizer self-deletion bug caused the earlier January 25 loss. Lovable's agent later invoked the batch function while investigating production and reported that its call deleted 92 Storage objects.
- Homepage order crosses database `display_order`, build generation, client hooks, rendering and deployment/cache state. It has allegedly been fixed approximately ten times without a durable correction.
- The `trigger-deploy` Edge Function has permissive CORS, no explicit authorization check in its source and `verify_jwt = false` in current configuration. This is a proven high-priority authorization-review requirement; exploitability was not tested.

These are surface findings. Remeasure before any implementation plan relies on exact counts or current code locations.

## Production and GSC evidence captured on 2026-08-21

### Domain behavior

- `octowonders.com` is the Vercel production domain.
- `www.octowonders.com` permanently redirects with `301` to the apex domain.
- `art-blitz-now.vercel.app` permanently redirects with `308` to the production domain.
- These hostname settings are correct and do not explain path-routing defects.

### Sitemap and robots

- `http://octowonders.com/sitemap.xml` redirects to HTTPS.
- `https://octowonders.com/sitemap.xml` returns `200 application/xml`.
- The live sitemap contained 32 URLs: 20 product URLs and 12 other URLs.
- `robots.txt` advertises `https://octowonders.com/sitemap.xml`.
- `https://octowonders.com/sitemap.json` returns `200 text/html` containing homepage HTML and the homepage canonical. It is not a sitemap. This is a concrete false-`200` catch-all defect.

### Production and repository remeasurement on 2026-08-22

- Donato confirmed that the intended endpoint is `https://octowonders.com/sitemap.xml`; `sitemsp.xml` was a typing error.
- The live `sitemap.xml` still returns `200 application/xml`, contains 32 unique URLs and is byte-identical to the local `public/sitemap.xml` examined in the code export.
- It is not the required final sitemap. `/storie-fatti-scientifici-polpo` remains listed while returning a `308` redirect to `/blog`.
- `sitemsp.xml` returns `200 text/html` containing the homepage body. It is a second concrete false-`200` route counterexample alongside `/sitemap.json` and `/llms.txt`.
- The current build generator includes all CMS rows without an explicit publication lifecycle, fabricates today's date when `updated_at` is absent, emits `priority` and `changefreq`, writes into both tracked `public` output and `dist`, and catches generation failure without failing the build.
- The two sitemap Edge Functions and the Storage-upload generator disagree with the build sitemap about pages, active products and legacy destinations. The product database trigger and admin call can update a Storage object that is not the Vercel production sitemap.
- GitHub `main` remains at `ffe0b380166bd6b9bae7e3d89711a1078867e41d`. No GitHub issue, pull request or scheduled comprehensive review was found.
- No `test` or type-check script and no application test suite were found. The only workflow regenerates data, commits it directly and relies on the push to deploy; it does not run the required protected test matrix.
- No controlling handoff incident fact was contradicted. The new evidence expands the sitemap, admin-publication and release-safety requirements.

### GSC sitemap state

Read-only inspection of the logged-in Search Console showed:

- Submitted sitemap: `/sitemap.xml`.
- Submitted: 2026-05-16.
- Last read: 2026-08-15.
- Status: Success.
- Discovered pages: 32.
- Page Indexing data last updated: 2026-08-17.
- Sitemap URLs indexed: 25.
- Sitemap URLs not indexed: 7.
- All known URLs indexed: 27.
- All known URLs not indexed: 13.

No sitemap submission, validation request or indexing request was performed.

### Seven submitted URLs not indexed

#### Discovered, currently not indexed: four intended products

1. `https://octowonders.com/product/polpo-octopus-ventose-colori-accesi-stampa-tela`
2. `https://octowonders.com/product/polpo-octopus-ventose-rosa-digitale-stampa-tela`
3. `https://octowonders.com/product/polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela`
4. `https://octowonders.com/product/trota-salmone-pesce-temporale-stampa-tela-canvas`

GSC showed no crawl for these URLs. The current homepage server HTML contains direct links to them. A live GSC test of the first URL reported:

- URL available to Google.
- Page can be indexed.
- One valid Product item, with non-critical issues.
- One valid Breadcrumb item.

This disproves a current robots, fetch or `noindex` blocker for that representative URL. It does not prove Google will index it.

#### Discovered, currently not indexed: inconsistent article destination

5. `https://octowonders.com/storie-fatti-scientifici-polpo`

The sitemap lists this URL, but production currently redirects it with `308` to `/blog`. The intended model is now confirmed: the descriptive URL is the standalone first article, and `/blog` is the future/minimal article index. The current redirect is contrary to intent.

#### Crawled, currently not indexed

6. `https://octowonders.com/product/polpo-octopus-effetto-pescato-ventose-stampa-tela`
7. `https://octowonders.com/artista`

For the product URL, GSC showed:

- Last crawl: 2026-04-20.
- Crawled as Googlebot smartphone.
- Crawl allowed: Yes.
- Fetch: Successful.
- Indexing allowed: Yes.
- User-declared canonical: the inspected URL.
- Google-selected canonical: the inspected URL.
- Result: still not indexed.

This shifts investigation from basic technical blocking toward crawl/index selection, content differentiation, page value and historical state.

### Six non-submitted or non-destination exclusions in the all-known report

| URL | GSC/current behavior | Intended classification |
|---|---|---|
| `/FAQs` | Now `308` to `/faqs` | Correct legacy/case redirect, verify direct single hop |
| `/product/sardine-acciughe-gruppo-stampa-tela-alta-qualita/` | Currently `200` with trailing slash | Defect: should redirect to canonical non-slash URL |
| `/sitemap.xml` | Crawled but not indexed as a page | Expected for an XML sitemap |
| `/artist` | Now `308` to `/artista` | Correct legacy redirect, verify direct single hop |
| `/category/uncategorized/` | `200 text/html`, reported `noindex` | Likely catch-all/obsolete route; define or return real `404/410` |
| `/product/bd62c326-772b-4337-9131-fe10a5e4a2bb` | `308` to descriptive product slug | Intended UUID-to-slug redirect |

### Metadata falsification result

The six currently indexable submitted exclusions returned self-canonicals and no observed robots block. All emitted two `<title>` elements. The product pages emitted two H1 elements.

An indexed product control, `/product/polpo-octopus-ventose-psichedeliche-stampa-tela`, also emitted two titles and two H1s and is indexed by Google.

Therefore duplicate titles and H1s are proven architectural defects, but the indexed counterexample falsifies them as a sufficient explanation for the differential indexing outcome. Do not claim otherwise.

## Proven defects, hypotheses and unknowns

### Proven defects

- The December 2025 SSG migration silently removed the complete document `<head>` from production pages until 2026-03-10. OctoWonders was effectively down to Google and organic search for approximately 77 days while continuing to appear live to human visitors. This is a confirmed sitewide indexability outage, not merely a later URL-level indexing differential.
- Lovable's March containment repair injects the document head in a final postbuild mutation. It does not eliminate the overall brittleness of the SSG/build/serve system and remains a P0 discoverability-regression risk. The proven full-head loss is one mandatory regression case, not the full scope of the stress program.
- Missing-route catch-all can return homepage HTML with status `200` and wrong content type.
- `/sitemap.json` demonstrates the false-`200` defect.
- The sitemap lists the article URL while production redirects it elsewhere.
- Generated and fallback document metadata coexist.
- Product HTML contains duplicate H1 elements.
- The default OG/social image has returned `404`.
- The structured-data logo URL has returned homepage HTML rather than an image.
- A trailing-slash product variant returns `200` instead of canonicalizing through a redirect.
- `/category/uncategorized/` behaves as a `200` catch-all/noindex route rather than a clearly defined resource or absence.
- No adequate protected regression suite exists.
- Direct Lovable history records its agent writing, deploying and POSTing to `batch-rename-images` on January 9. Lovable separately confirmed that the IMG-to-WebP optimizer deleted `oversized-webp` files by uploading and then removing the identical path on January 25. Later that day, Lovable's agent POSTed to `batch-rename-images` with `{"dryRun": true}` and reported `deleted: 92`. Whether other files were already absent is irrelevant to these incidents and to Lovable's admitted responsibility.
- Catalogue orientation normalization is duplicated and inconsistent across boundaries.

### Supported but not yet proven causal explanations

- Low or stale crawl prioritization for four never-crawled products.
- Product-page similarity or insufficient distinctive visible value contributing to index selection.
- Historical instability or build-state divergence affecting Googlebot observations.
- Inaccurate or low-signal sitemap `lastmod` behavior.
- Internal-link timing/prominence differences even though links are now present in server HTML.

### Falsified or unsupported explanations

- Duplicate titles/H1s alone explain which products are excluded. An indexed control has the same defect.
- The four never-crawled products are currently blocked by robots, `noindex` or fetch failure. The representative GSC live test found them technically available.
- A successful sitemap status means all submitted pages are indexed. GSC reports 25 of 32 indexed.
- Aggregate GSC counts identify the root cause. URL identities and intended states are required.

### Important unknowns

- The complete 25-indexed-versus-6-intended-excluded differential is documented in `docs/2026-08-21-seo-differential-repair-brief.md`. Donato approved its revised repair scope for implementation planning on 2026-08-21. The full AEO/GEO evidence pass remains pending but is not a prerequisite for beginning the plan.
- Production data counts from the earlier audit must be remeasured before repair.
- The complete database archive restores locally with the exact measured `sandbox_exec` and `supabase_realtime_admin` roles. All 136 current Storage objects restore with byte-level proof, and PostgREST, Auth, Storage and Realtime function locally. Full application recovery, external configuration parity and exact production Realtime version/schema parity remain unproven; the tested Realtime v2.129.0 image migrated the local schema beyond production.
- The exact production Stripe, Supabase and Vercel environment parity has not been verified.
- The current end-to-end mobile purchase path has not been baselined in this program.
- The current admin-to-public propagation behavior has not been characterized.
- Current bulk Storage backup and local restore capability are proven for all 136 current objects. Safe application-level rename, quarantine, cleanup and deletion recovery remain unproven.
- Historical Googlebot/server logs may not be available.

## Workstream status ledger

Status must be reported on four independent axes. “Evidence complete” never means “implemented” or “verified in production.”

| ID | Workstream | Evidence | Specification/approval | Implementation | Production verification | Next exact action |
|---|---|---|---|---|---|---|
| WS0 | Authority, backup and recovery | Strong. Exact-role database restore, all 136 current Storage objects and core service function are proven locally. Realtime image drift is measured | Governing AP0 scope decided; external configuration, full-application recovery and rollback package still require approval | Not started | Local database, Storage, PostgREST, Auth and Realtime functional verification complete; disposable lab cleaned. Full application/external-config recovery, exact deployment provenance, rollback and exact Realtime production parity pending | Establish the proper clone and exact production deployment, pin the Realtime decision, verify the full application against recovery and rehearse rollback |
| WS1 | SEO, routing, indexability and citability | Lovable-authored admission of the approximately 77-day sitewide outage preserved. Current differential and bounded AEO/GEO baseline complete. The 2026-08-22 remeasurement proves a 32-URL live sitemap with one redirecting destination, false-`200` sitemap-like paths and multiple conflicting generators | P0 discoverability/citability outcome and comprehensive AP2 plan approved. The head-loss incident remains one regression fixture within broader SSG/build/serve stress. Implementation is not authorized | Not started | Not started | After AP0/AP1 approval, build the shared route contract and protected SSG/sitemap tests before changing routing or head output |
| WS2 | Complete transaction path | Minimal. Prior iPhone button bug and approximately ten orders are known. Exact proof layers are now distinguished: mapping, checkout handoff, test-mode completion and separately approved live-money completion | Complete artwork-to-confirmed-payment outcome is an equal governing P0. Canary and live-purchase details still require package approval | Not started | Not started | Baseline the production iPhone journey, define read-only checkout readiness and design the supplier-suppressed live canary |
| WS3 | Admin reliability | Reachable capability inventory identified. Page deletion is code-only rather than currently exposed. Admin sitemap regeneration and deploy behavior can misrepresent public state; deploy authorization requires review | Preserve current reachable outcomes. Destructive outcomes must become recoverable. Plain-language public-state labels approved | Not started | Not started | Complete the capability/persistence/publication matrix and authorization review before admin changes |
| WS4 | Image safety | Strong direct Lovable-history evidence. January 9: Lovable agent wrote, deployed and invoked the batch function. January 25: separate IMG-to-WebP optimizer self-deletion caused the first loss event; later Lovable agent diagnostic invocation reported 92 deletions. Pre-existing file state is irrelevant. Current 136-object backup/restore is proven | Pending | Not started | Not started | Specify read-only diagnosis, immutable manifests, quarantine/copy/hash/reference verification, deletion circuit breakers and restore proof |
| WS5 | SKU, catalogue, price and Stripe integrity | Surface inventory exists but is stale; cross-boundary inconsistency proven | Pending | Not started | Not started | Remeasure production and specify one canonical size/medium/variant model |
| WS6 | Homepage ordering | Repeated failure history and multi-layer path identified | Pending | Not started | Not started | Trace database-to-build-to-cache-to-render order with a content-version fingerprint |
| WS7 | Lovable independence | Target direction and dependency categories identified | Pending | Not started | Not started | Remove only after stability contracts and independent authority are verified |
| WS8 | P0 prevention, incident response, rollback, testing and observability | Three plain-English safety checks, P0 definitions, canary layers, active diagnosis and rollback rules are specified in the action plan | Governing outcomes approved. Provider/configuration package and external-setting mutation remain unapproved | Not started | Not started | Prepare the current-production canary and incident-response approval package before application changes |
| WS9 | Platform migration and supplier automation | Strategic alternatives recorded | Platform migration deferred and no longer the assumed destination. Supplier automation remains deferred | Not started | Not started | Revisit platform only if the hardened store cannot support distribution; design supplier suppression separately for a live purchase canary |
| WS10 | Basic blog and distribution engine | Existing `/blog` and article records, conflicting authorship signals and article-route defect measured. Bounded AEO/GEO baseline exists | Blog metadata/model decisions approved, but blog is below P0. Two-phase distribution strategy approved | Not started | Not started | Repair the shared article route contract in WS1; build tiles after P0 safeguards; start distribution only after entry gates pass |

## Stabilization sequence

1. Establish the authoritative Git, deployment, dependency, recovery and rollback baseline.
2. Perform the current-store safety check before application code changes.
3. Establish current-production P0 canaries, active diagnosis and alert-path tests against today's known state.
4. Establish protected characterization and falsification tests shared by the three P0 outcomes.
5. Repair and prove SSG, routing, head and sitemap integrity.
6. Repair and prove the complete mobile artwork-to-confirmed-payment path, with each proof layer labeled honestly.
7. Make image handling and destructive admin outcomes recoverable.
8. Repair and prove admin publication behavior, catalogue/Stripe integrity and homepage ordering.
9. Remove dangerous Lovable dependencies incrementally without broad redesign.
10. Run the repair-package safety check after every package.
11. Run the complete go-live safety check, rehearse rollback, deploy and verify production.
12. Keep P0 canaries active, monitor GSC as delayed evidence and run the incident-response drills.
13. Build the basic blog tiles and content metadata after the P0 safeguards.
14. Begin the distribution engine: SEO, AEO, GEO, Pinterest, selected Facebook groups, selected Instagram audiences and other measured channels.
15. Revisit platform migration only if evidence shows the hardened store cannot support the business plan.

## Immediate next task: AP0 authority and P0 safety-foundation approval package

Do not edit application code, deploy, request indexing, change external settings or perform a transaction.

The complete plan is `docs/2026-08-22-stabilization-action-plan.md`. The next task must:

1. confirm the proper Git clone, GitHub head and exact production deployment provenance;
2. prepare the first whole-store safety-check evidence brief;
3. specify the initial current-production canaries for availability, discoverability/citability and transaction readiness;
4. specify the automatic evidence capture, diagnostic classification, release freeze, alert and recovery workflow;
5. prove the automatic rollback eligibility rules against the current healthy deployment without executing a production rollback;
6. identify the exact external approvals and secret inputs required for the monitoring runner, Meta WhatsApp and Resend;
7. present the result in plain English and stop for approval before application or external-setting changes.

The historical head loss remains a mandatory AP2 regression fixture. The current article redirect, `/llms.txt`, `/sitemap.json`, `sitemsp.xml`, invalid Organization logo and default OG image remain route/identity evidence. The full AEO/GEO citation, entity and referral pass remains pending. The blog tile UI is not the immediate task.

## Required SEO behavior after the approved repair

1. Every sitemap entry returns `200`, indexable HTML and a self-canonical.
2. Redirecting, retired, malformed and nonexistent URLs are absent from the sitemap.
3. Missing assets never return homepage HTML.
4. Unknown routes return real `404/410`, not false `200` pages.
5. Product trailing-slash and other noncanonical variants redirect directly to the canonical URL.
6. `/artist` redirects directly to `/artista`.
7. `/FAQs` redirects directly to `/faqs`.
8. UUID product URLs redirect directly to the current descriptive slug or return `410` if retired.
9. `/storie-fatti-scientifici-polpo` returns a standalone, indexable article with a self-canonical.
10. `/blog` returns a minimal article index with its own canonical and at least the first article link.
11. Each document emits one effective title, description and canonical.
12. Each page has one primary H1.
13. Product pages expose accurate Product and Breadcrumb structured data.
14. OG metadata uses a valid, relevant, crawlable social image. Open Graph matters for social/link previews; it is not a substitute for indexability.
15. The organization logo URL returns an actual image with the correct content type.

## Core invariants and adversarial win conditions

### Catalogue and checkout

- `40×60` and `60×40` resolve to the same canonical size everywhere.
- The UI never displays both orientations as separate choices.
- Missing price never becomes zero.
- Missing Stripe mapping never falls back to another variant.
- Checkout never silently selects the first available size.
- An unavailable or retired product never appears purchasable.
- Composite formats such as `2x90x60` cannot be interpreted as an ordinary size.

Breaker win condition: find one input, state, timing or dependency failure that violates any invariant once.

### Routing and SEO

- A missing page or asset never returns homepage HTML with status `200`.
- A sitemap URL never redirects, returns non-HTML for a page, or declares another canonical.
- A noncanonical variant never returns an independently indexable `200` page.
- Server-rendered head metadata matches the public URL before JavaScript hydration.

Breaker win condition: produce one URL or user-agent condition that causes status, content type, canonical, robots or rendered identity to contradict the intended lifecycle state.

### Admin and deployment

- Every admin action states whether it is immediately public, stored but awaiting deployment, or failed.
- Vercel may communicate deployment status; the admin need not duplicate it.
- Public-state verification remains mandatory because a successful deployment does not prove correct content propagation.

Breaker win condition: cause the administrator to reasonably believe a change is public when production still shows the prior or wrong state.

### Images

- No cleanup path permanently deletes the only recoverable copy.
- Candidate deletions are copied/quarantined, marked, verified against all references and held before deletion.
- Recovery is demonstrated before cleanup is enabled.

Breaker win condition: find one active, generated, cached, CMS, product, OG or structured-data reference that loses its only valid asset because of cleanup.

## Stop-ship conditions

Stop a release if any of these is true:

- Any of the three governing P0 contracts lacks a named prevention test, live canary, detection objective, diagnostic playbook and recovery action.
- A P0 pre-release check fails but deployment can still proceed.
- P0 monitoring or the WhatsApp/email alert path is disabled, stale or untested.
- A confirmed P0 incident cannot freeze further releases, preserve evidence and start root-cause isolation automatically.
- The automatic rollback target is unverified, shares the same failure, can create a loop or crosses an irreversible data/payment/external-system change.
- Complete live transaction execution is claimed as proven using only page, mapping, checkout-handoff or test-mode evidence.
- An intended indexable URL has unexpected `noindex`, canonical, redirect, status or content type.
- A desired product or article is absent from the sitemap or meaningful internal navigation without a documented reason.
- A missing asset or unknown route returns homepage HTML with `200`.
- The mobile browse-to-checkout path fails on the supported iPhone baseline.
- Product, canonical size, price and Stripe mapping diverge.
- A product lifecycle state is undefined.
- A proposed image cleanup or rename path lacks a tested pre-change snapshot, immutable manifest, quarantine/reference checks, deletion limit and restore rehearsal.
- Admin saved state and public state disagree without an explicit pending/failed state.
- A stateful change lacks a tested recovery path.
- A critical test is removed, weakened or bypassed.
- A high-risk change lacks independent technical review.
- Production-only differences are concealed by Preview success.
- Evidence is replaced by claims such as “permanently fixed,” “all scenarios covered,” or “SEO safe” without explicit model limits.

## Human approval contract

Donato must not be asked to approve terminal output, a code wall or unexplained technical claims.

For a significant change, the release brief must answer:

1. What is the issue or improvement in user language? Who benefits and why?
2. What happens through the complete casual-visitor iPhone 11 journey from browse to completed purchase?
3. What engineering action is proposed?
4. What does it technically do in a few words?
5. What is the before/after behavior across customers and devices?
6. What evidence, assumptions, rationale, counterexamples and unknowns support the risk assessment?
7. Why is this a well-considered intervention rather than a patch over symptoms?
8. What changes for SEO, indexability, LLM citability, Open Graph and mobile performance?
9. What single observed outcome would immediately falsify or break the intervention?
10. What is the worst credible outcome?
11. What scenarios and surfaces remain untested?
12. What important question has not yet been asked?

The annotated source asks for chain-of-thought in item 6. Do not provide hidden private reasoning. Provide the decision-relevant evidence, assumptions, concise rationale, counterexamples, alternatives and unknowns instead.

The brief must also state:

- decision requested;
- affected and unaffected behavior;
- evidence artifacts;
- test and review results;
- risk tier;
- rollback procedure and proof;
- publish, request changes or postpone choices.

Use three plain-English safety checks rather than asking Donato to interpret technical review gates:

1. **Current-store safety check:** before application changes, confirm the exact live version and identify what could silently break availability, discoverability/citability or transactions.
2. **Repair-package safety check:** before each package joins the main code, an independent reviewer proves the agreed benefit and preservation of working behavior.
3. **Go-live safety check:** before release, verify the complete candidate, prove the rollback target and confirm the production canaries and response workflow.

The technical system and independent reviewer own proof. Donato owns the business outcome and risk decision.

## Verification surfaces

- Automated tests: technical invariants and known counterexamples.
- Vercel Preview Deployment: candidate rehearsal only.
- Clean browser sessions and independent browser engines: cross-browser behavior.
- Safari/iPhone: mandatory mobile purchase-path evidence.
- Production HTTP checks: status, content type, canonical, metadata and assets.
- Production browser checks: actual rendered and interactive behavior.
- Vercel: deployment, build and runtime evidence.
- Supabase: production read-only until a separately approved mutation plan exists.
- Stripe: test mode by default; live canary separately approved.
- GSC: read-only diagnosis until post-repair indexing/validation approval.
- Independent reviewer: code quality and suspicious-change review for material work.

Do not claim that testing in many browsers proves correctness. Each surface is a distinct attempt to expose a counterexample.

## Annotation register

The original annotated document remains authoritative for surrounding context. The entries below preserve the user's annotations verbatim or as exact inline text, then record their current disposition.

| ID | Source line | Verbatim annotation | Classification | Current disposition |
|---|---:|---|---|---|
| AN-01 | 73 | `>> DOBLE CHECK SSG INTEGRITY AND ITS FRAGILITY` | Requirement | Integrated into WS1. Surface risk known; full integrity differential and tests pending |
| AN-02 | 79 | `>> OF WHAT? BE SPECIFIC! TURN INTO REQUIREMENTS (PERSONA DOES X AND Y SO THAT RESULT AND WHT VALUABLE)` | Correction | Accepted. Admin capabilities must become job/outcome requirements in WS3 |
| AN-03 | 80 | `>> TURN INTO REQUIREMENTS` | Correction | Accepted for sizes, prices, Stripe IDs and offers; WS3/WS5 pending |
| AN-04 | 81 | `>>DITTP` | Correction | Accepted for bulk SKU/price management; WS3/WS5 pending |
| AN-05 | 82 | `>>DITTO` | Correction | Accepted for navigation editing; WS3 pending |
| AN-06 | 84 | `>>DITTO. What MUST BE DONE LIKE TO OPTIMIZE SEO AND SERP AND CITATION` | Requirement/question | Integrated into WS1/WS3; exact CMS SEO contract pending |
| AN-07 | 85 | `>> Image upload, optimization and cleanup. >> BE EXTRA CAREFUL THIS DELETED DOZEN IMAGES PERMANENLT TWICE` | Incident/high-risk requirement | Integrated into WS4 and stop-ship conditions. Direct Lovable history confirms the IMG-to-WebP self-deletion bug caused the earlier January 25 loss, followed by Lovable's diagnostic batch-function invocation reporting 92 deletions |
| AN-08 | 86 | `“”FOOR WHAT? WHAT CAN BE DONE WITH THESE? NEVER TESTED` | Open question | Import/export purpose, behavior and safety must be characterized before preservation |
| AN-09 | 87 | `“”IT IS STILL USEFUL?` | Open question | Deploy hook usefulness pending. Vercel reports deploy status, but public-state verification remains necessary |
| AN-10 | 89 | `!! THE ORDERING TOP TO BOTTOM DOES NOT AFFECT THE ACTUAL ORDER WITH WHICH ARTWORKS APPEAR IN HOMEPAGE. ALLEGEDLY FIXEN 10 TIMES; NEVER FIXED` | Repeated defect | Integrated into WS6. No new fix before full state-path trace |
| AN-11 | 100 | `>> PLS FIX 1 active product has no slug.` | Gated repair request | Backlog only. Remeasure production before repair |
| AN-12 | 101 | `>> PLS FIX 2 active products lack at least one SEO field.` | Gated repair request | Backlog only. Remeasure production before repair |
| AN-13 | 103 | `>> PLS FIX8 purchasable size rows have no Stripe product ID and therefore cannot complete checkout.` | Gated repair request | Backlog only. Remeasure production; stop purchase if mapping absent |
| AN-14 | 108 | `>> ADRESS ONCE AND FAR ALL` | Invariant requirement | Locked. One canonical dimension model across DB, API, admin and checkout |
| AN-15 | 129 | `>>Does it conform with OPEN GRAPH?` | Question | Partly answered. Current OG has proven defects; full conformance belongs in WS1 brief |
| AN-16 | 130 | `>>It OG A True, relevant STandard in our use case?` | Question | Answered: relevant for social/link previews, not a substitute for SEO/indexing |
| AN-17 | 164 | `FOR NOW, Yes.` | Decision | Vercel remains the current storefront host; not a permanent commitment |
| AN-18 | 236 | `>>RE: This is an architectural governance question. I would design it around your product expertise, not require you to impersonate an engineer.` | Governance requirement | Integrated into the approval contract |
| AN-19 | 237 | `>>ELABORATE ON “This is an architectural governance question. I would design it around your product expertise, not require you to impersonate an engineer.”` | Question | Resolved through the division of product approval, automated verification and technical review |
| AN-20 | 239 | `>>THEN ANSWER THE QUESTIONS BELOW` | Instruction | Integrated into significant-change release briefs |
| AN-21 | 240 | `>>EDITED` | Source marker | The edited questions are treated as current |
| AN-22 | 241 | `HOW APPROVAL MUST MORK... FAILURE MODE: BEING NOT TRUE; FABRICATIONS; SOCHYOPHANCY` | Governance requirement | Locked. Claims require evidence; no sycophancy or fabricated certainty |
| AN-23 | 287 | `NEVER TEST ON SAME APP/SAME BROWSER. ALWAYS TEST ON INCOGNITO SAFARI, COMET, EDGE` | Verification requirement | Integrated as independent clean sessions/engines. Exact feasible browser matrix must be specified per work package |
| AN-24 | 295 | `MCPs collect evidence from GitHub, Vercel and browsers (>What evidence?` | Question | Resolved: builds, diffs, tests, logs, screenshots, route/asset responses, checkout evidence and GSC state |
| AN-25 | 347 | `>>APPROVED` | Decision | Evidence-driven hybrid governance locked |
| AN-26 | 354 | `>>NOT REQUESTED FOR NOW` | Scope limit | Irreversible DB operations and fundamental checkout rewrite are out of scope until separately requested |
| AN-27 | 421 | `>>INTERSTING FOR LATER TO ADD A COMPARABLE MULTIPIECE QUOTE FOR HOSPITALITY` | Deferred idea | Recorded under future hospitality/GTM work; not part of stabilization |
| AN-28 | 456 | `>>AGREED` | Decision | Compact buying situations, not decorative persona documents |
| AN-29 | 580-581 | `RUN A RANDOW SURVEY / LIKE OR NOT AND WHY` | Experiment idea | Deferred GTM idea. Results cannot be treated as validation or ground truth |
| AN-30 | 713 | `MUST NOT EVEN GLIMPSE` | UX invariant | Locked: equivalent orientations must never appear as separate choices |
| AN-31 | 715 | `VERCEL TELLS ME` | Correction | Admin need not duplicate Vercel deployment notification; production result still requires verification |
| AN-32 | 717 | `NOTHING` | Prioritization correction | Double-press behavior is deprioritized unless evidence shows material harm |
| AN-33 | 730 | `AGENT DEV` | Process annotation | Breakers must prioritize severe, plausible failures over entertaining edge cases |

## Subsequent decisions not present in the annotated source

These were made after the source document was produced and are equally authoritative:

- Historical decision, now superseded by the 2026-08-22 formulation below: SEO and the mobile path to purchase were initially named as the top stabilization priorities.
- The admin is production-critical.
- “Preview is broken” referred to Lovable Preview, not Vercel Preview Deployments.
- Vercel Preview is rehearsal only; production proof is mandatory.
- The GSC sitemap is `/sitemap.xml`, not `/sitemap.json`.
- The article slug must remain a standalone article; `/blog` becomes its index.
- The duplicate metadata hypothesis was falsified as a sufficient explanation for differential indexing.
- The SEO differential is complete. Donato approved the revised repair scope for implementation planning on 2026-08-21 despite the full AEO/GEO evidence pass remaining pending. The historical next-step statement naming WS1 is superseded by AP0 in the 2026-08-22 action plan; it was never authorization for an immediate code fix.
- Both the SSG outage report and the Storage deletion transcript are Lovable's own admissions, as explicitly stated by Donato. Preserve that vendor-authored provenance.
- The March postbuild head injector is containment only. Within the P0 discoverability repair, eliminating overall SSG/build/serve brittleness through adversarial stress testing is the leading technical priority. It is equal in governing business importance to availability and transaction integrity. The head-loss incident is a mandatory regression case within that broader requirement, not the entire requirement.
- The prior SEO differential was not a dedicated AEO/GEO audit. A bounded technical baseline on 2026-08-21 proved sampled OAI-SearchBot reachability and crawler-body parity, while also proving the article redirect, false-`200` `/llms.txt`, invalid Organization logo and absence of an intended standalone Article/BlogPosting surface. Full answer-engine citation, entity, content-provenance and referral evidence remains pending.
- Direct Lovable history settles the sequence. Its agent wrote, deployed and invoked the batch function on January 9. The separate IMG-to-WebP optimizer self-deletion bug caused the earlier January 25 loss. Lovable's agent later invoked the batch function during investigation and reported 92 deletions. Whether files were already missing is irrelevant. Donato's later manual recovery does not reduce the severity or responsibility.
- The store normally works and must be preserved. The project is minimal hardening against catastrophic silent failures, not a redesign program.
- Availability, discoverability/citability and the complete artwork-to-confirmed-payment path are equal governing P0 outcomes.
- A P0 regression is a newly introduced failure of any governing P0 outcome. The same failure without a recent change is still a P0 incident.
- Prevention and active response outrank a late alert. Block bad releases, detect live failure, preserve evidence and begin root-cause isolation automatically before notifying Donato.
- A confirmed post-deployment P0 regression automatically rolls back to the last verified healthy release when attribution, target-health, reversibility and loop-prevention rules pass.
- P0 alerts go to Meta WhatsApp Business API and Resend email. The monitoring provider is replaceable; reliability outcomes win over platform preference.
- After P0 stabilization, the primary business program is distribution: SEO, AEO, GEO, Pinterest, selected Facebook groups, selected Instagram audiences and other measured channels.
- The basic blog is lower priority than P0. Only its shared routing/sitemap contradiction participates in the P0 discoverability repair.
- The blog extends the existing `pages` CMS. The first article author is Marco De Francesco, publication date 2026-01-05, initial modified date 2026-01-12, thumbnail `polpo-mimetismo-cromatico.webp`, and approved excerpt `Scienza, comportamenti intelligenti e storie vere sul polpo: dal mimetismo alle fughe più sorprendenti.`
- Destructive admin outcomes must remain available through recoverable equivalents such as archive, quarantine and restore, not irreversible deletion.
- The complete code review occurs as the current-store safety check before application changes, independently after each package and again as the go-live safety check.
- No calendar review dates are fabricated. These are mandatory phase conditions.
- The proposed production-app mirror workstream was withdrawn. Existing WS0 backup and recovery scope remains controlling.
- A new task should begin only from this verified handoff.

## Security note

Never print full configuration files, environment files, tokens, API keys or secrets. A previously exposed Obsidian local API key was rotated and the incident was contained. Do not reproduce it or investigate it as part of this project.

## New-task bootstrap prompt

Use this exact prompt in the next Codex task:

> Continue the OctoWonders stabilization program from `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/FULL-CODE-OCTOWONDERS.COM/docs/handoffs/2026-08-21-stabilization-handoff.md`. Read the entire handoff before acting, then read `docs/2026-08-22-stabilization-action-plan.md` and `docs/2026-08-21-seo-differential-repair-brief.md`. Treat the handoff's authority order, three governing P0 outcomes, workstream ledger, annotation register, stop-ship conditions and “Immediate next task” as controlling. The current store normally works and must be preserved. Availability, discoverability/citability and the complete artwork-to-confirmed-payment path are equal P0 outcomes. Prevention, current-production canaries, automatic evidence capture and diagnosis start, safe automatic rollback for eligible post-deployment P0 regressions, and WhatsApp/email incident reporting come before feature repairs. The next task is AP0: confirm exact Git/deployment authority and prepare the current-store safety-check and P0 canary/incident-response approval package. Do not edit application code, deploy, request indexing, validate GSC fixes, mutate production data, perform a transaction or change external settings. Explain decisions in plain English for a non-coder and stop for approval when the package is complete.

## Handoff acceptance test

A new agent with no prior chat memory must be able to answer all of these from this document:

1. What is the immediate objective?
2. What has and has not been implemented?
3. What is the exact next action?
4. Which sources are authoritative?
5. Which GSC URLs are affected and why?
6. Which claims are proven, hypothetical or falsified?
7. What decisions has Donato already made?
8. How must approval work?
9. What conditions stop a release?
10. What work is deferred?
11. How were all user annotations handled?
12. What actions are forbidden without new approval?
13. What are the three equal governing P0 outcomes?
14. What happens automatically before Donato is alerted to a P0 incident?
15. When is automatic rollback allowed and prohibited?
16. When does the program move from stabilization to distribution?
17. Why is the basic blog not the immediate task?
18. When do the three plain-English safety checks occur?

If any answer requires hidden chat memory, the handoff is incomplete and must be amended before starting the new task.
