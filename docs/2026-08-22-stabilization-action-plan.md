# OctoWonders Stabilization and Distribution Action Plan

**Date:** 2026-08-22  
**Status:** Decision-ready program plan. No application implementation, deployment, production mutation, GSC action, external configuration change, purchase or refund has been performed.  
**Controlling handoff:** `docs/handoffs/2026-08-21-stabilization-handoff.md`  
**WS1 evidence:** `docs/2026-08-21-seo-differential-repair-brief.md`

> This plan translates the governing business priorities into executable work packages. It does not authorize implementation or production changes. Each package still requires the approval and safety evidence described below.

## Start here

The current store normally works for customers. The program is not a redesign exercise and does not assume that Shopify or another platform is the answer.

The risk is that brittle or unsafe mechanisms can silently remove the store, remove its search and answer-engine identity, or break the path to a completed transaction. These are the three equal governing P0 outcomes:

1. **Available:** the shop and critical product pages are reachable and usable.
2. **Discoverable and citable:** intended pages remain crawlable, indexable, correctly identified and technically available to search and answer engines.
3. **Transactable:** a customer can go from liking an artwork through the correct product, size and price to confirmed payment and the required post-payment result.

A failure of any one is a P0 incident. If a new release or configuration change caused it, it is also a P0 regression. P0 is an incident classification, not a fourth priority.

The protection system must do more than send a late alert. It must:

- block a release that violates a P0 contract;
- detect a live failure quickly;
- preserve evidence and begin root-cause isolation automatically;
- freeze further releases;
- automatically roll back a confirmed post-deployment P0 regression when the rollback safety rules are satisfied;
- notify Donato by WhatsApp and email with the failure, business impact, evidence, actions already taken and current recovery state.

The basic blog remains in the program but is not P0. The shared routing defect that currently redirects the intended article and allows false `200` pages belongs to the discoverability repair. Blog tiles and editorial convenience follow the P0 safeguards.

After the P0 system is protected, the business program changes emphasis from stabilization to distribution: SEO, AEO, GEO, Pinterest, selected Facebook groups, selected Instagram audiences and other evidence-backed channels.

## Governing definitions

### P0 availability incident

Examples include DNS or TLS failure, timeouts, broad `5xx` responses, blank critical pages, homepage substitution for real destinations, broken static assets that make the shop unusable, or a production deployment that is not serving the intended release.

One noncritical cosmetic defect is not P0. A broad failure or a failure that blocks a critical entry point is.

### P0 discoverability or citability incident

Examples include complete or broad document-head loss, an unintended sitewide `noindex`, robots blocking intended crawlers, widespread wrong canonicals, corrupt or materially incomplete sitemap output, crawler-specific wrong content, false-`200` homepage substitution, loss of route-specific server HTML, or invalid shared identity assets that make the site technically unavailable to search or answer engines.

A single imperfect title or one broken low-value page is not automatically P0. It becomes P0 when it broadly removes or materially threatens the site's search or answer-engine identity. Search ranking changes caused solely by an external engine are not automatically technical P0 incidents, but sharp unexplained visibility loss triggers investigation.

### P0 transaction incident

Examples include inability to reach a product, choose the canonical size, see the correct price, create the correct Stripe Checkout session, complete payment, receive the success state, or preserve the required order/payment result. A transaction that completes with the wrong product, size or price is also P0.

Synthetic tests can continuously prove most of this path. Only a controlled live purchase can prove the complete live-money path. Supplier suppression, canary product, charge, refund and evidence procedure require separate approval before recurring live canaries are enabled.

## Program order and benefit

| Order | Work package | Outcome and benefit |
|---|---|---|
| AP0 | Authority, recovery and release baseline | Confirms the exact live code, deployment, data, configuration, restore and rollback target before changing anything |
| AP1 | P0 canaries and incident response | Prevents another silent multi-month outage and starts diagnosis before Donato receives the alert |
| AP2 | SSG, routing, head and sitemap integrity | Prevents the store from appearing live to people while disappearing from crawlers |
| AP3 | Complete transaction integrity | Protects the revenue path from product selection to confirmed payment |
| AP4 | Admin, image and catalogue safety | Preserves required admin capabilities without irreversible media or catalogue damage |
| AP5 | Homepage ordering and publication truth | Makes merchandising and public-state propagation predictable |
| AP6 | Lovable independence | Removes dangerous Lovable runtime, deployment and control dependencies without redesigning the working store |
| AP7 | Basic blog and content foundation | Restores the intended article and supplies a small governed surface for later distribution |
| AP8 | Distribution engine | Prioritizes SEO, AEO, GEO, Pinterest and selected social audiences after the store is safe to promote |

AP1 is established against today's working production before repair deployments begin. AP2 and AP3 are equal P0 repair streams after their shared test and rollback foundation exists.

## AP0: authority, recovery and first safety check

1. Create or identify a proper clone of `https://github.com/donatomm/art-blitz-now`.
2. Verify the remote, default branch, current commit and exact commit/deployment serving `octowonders.com`.
3. Preserve the current production deployment as the candidate rollback target and prove it can be restored.
4. Copy the canonical documentation into the real clone and commit documentation separately before application changes.
5. Complete the remaining WS0 proof:
   - exact production Realtime version decision;
   - full application against the recovered stack;
   - Supabase, Stripe, Vercel, DNS and secret inventory without printing secrets;
   - external configuration restoration procedure;
   - tested deployment rollback.
6. Perform the first whole-store safety check before application code changes.

The first safety check covers frontend code, SSG and postbuild processing, routes, hosting rules, Supabase migrations and Edge Functions, authentication, Stripe boundaries, admin behavior, media handling, generated data, workflows, dependencies, security and missing tests. Its deliverable is a plain-English risk ledger: P0 now, important but non-P0, or safe to defer.

## AP1: prevention, canaries and active incident response

### Pre-release prevention

- Generate a release contract from the intended public routes, content snapshot, assets and transaction invariants.
- Run the full contract against the built artifact and production-like Preview.
- Block deployment on any P0 invariant failure.
- After deployment, keep the prior healthy release available until the production canaries pass.
- Do not treat Preview success as production proof.

### Live canary layers

The provider is replaceable. Checkly is the current candidate because it can run HTTP and browser checks independently of the shop, retain incident evidence and call Meta WhatsApp and Resend. Reliability outcomes, not vendor preference, govern the choice.

1. **Fast P0 probes:** availability, server-rendered head sentinel, robots, sitemap integrity, representative product identity, missing-route behavior and read-only checkout readiness. Target: confirmed detection within five minutes and no later than fifteen minutes.
2. **Browser journey:** homepage to product, canonical size and price, checkout handoff and Stripe-hosted page without payment. Run frequently enough to meet the approved detection objective.
3. **Daily full matrix:** every sitemap URL under ordinary, Googlebot smartphone, Bingbot and OAI-SearchBot identities.
4. **After every deployment:** complete route, asset, browser and transaction-readiness contract.
5. **Controlled transaction layers:** isolated Stripe test-mode end-to-end proof first; separately approved low-risk live charge/refund canary only after supplier fulfilment is provably suppressed.
6. **Monitor health:** weekly all-clear summary and monthly test incident through both WhatsApp and email. Missing monitor health is itself an incident.

### Automatic incident workflow

On a confirmed P0 signal, automation starts before notifying Donato:

1. freeze further releases;
2. record time, affected URLs, user agents, response headers, body fingerprints, release identity and route/data manifest hashes;
3. compare the failing release with the last healthy release;
4. rerun the failing contract from an independent location;
5. classify the likely layer: DNS/TLS, hosting/deployment, routing, SSG/head, data snapshot, shared assets, application runtime, Supabase, Stripe or third party;
6. start the relevant read-only diagnostic playbook and create one deduplicated incident record;
7. evaluate automatic rollback eligibility;
8. send WhatsApp and Resend notifications containing what failed, impact, actions already taken, rollback state and the next technical action;
9. send recovery confirmation only after the complete P0 contract passes.

### Automatic rollback policy

A confirmed post-deployment P0 regression automatically rolls production back to the last verified healthy release only when all conditions hold:

- the failure began after the candidate deployment and is attributable to it;
- the prior release passed the same P0 canaries;
- rollback is technically available and has been rehearsed;
- rollback cannot worsen an irreversible database, payment or external-system change;
- no rollback is already in progress;
- the target is not the source of the same failure.

Do not auto-rollback an external-provider outage, a pre-existing incident, an unknown data-corruption event or a stateful migration that code rollback cannot reverse. In those cases freeze releases, preserve evidence, begin diagnosis and alert immediately. Prevent rollback loops with one automatic attempt and a verified target.

## AP2: SSG, routing, document identity and sitemap

### One route authority

Create one validated public-route registry shared by:

- SSG route generation;
- redirect and lifecycle rules;
- sitemap generation;
- pre-deployment artifact tests;
- production canaries.

Every public destination has an explicit lifecycle: published/indexable, redirect, retired, private/tool or missing. Unknown routes and assets return real `404` or `410`, never homepage HTML.

### SSG stress program

- Preserve the historical complete-head loss as a mandatory regression fixture.
- Test the full path from database snapshot through generated files, SSG, every HTML mutation, packaging, hosting rules, caches and served response.
- Inject unavailable, empty, partial, stale and malformed data.
- Repeat clean and incremental builds and compare route/output fingerprints.
- Fail closed when authoritative data is missing or contradictory.
- Require one effective title, description, canonical and primary H1, correct robots state, visible route identity, structured data and valid assets for every intended page.

### Final sitemap system

Retire the competing sitemap mechanisms after dependency proof:

- the sitemap Edge Function;
- the `regenerate-sitemap` Edge Function;
- the product database regeneration trigger;
- the Storage sitemap copy;
- the stale `_redirects` sitemap proxy;
- the admin regeneration call;
- build-time writes to tracked `public/sitemap.xml`.

Generate one deployment artifact from the validated route registry. The initial repaired set is expected to contain the homepage, 20 active valid products, 10 ordinary published CMS pages, `/blog` and the standalone article, 32 real destinations in total.

Requirements:

- absolute canonical HTTPS apex URLs;
- valid UTF-8 XML and entity escaping;
- deterministic ordering and no duplicates;
- only published, canonical, indexable destinations;
- `lastmod` only from a trustworthy material public-content timestamp, otherwise omitted;
- no ignored `priority` or `changefreq` noise;
- one correct sitemap declaration in `robots.txt`;
- every sitemap URL must return `200` indexable HTML and a self-canonical;
- `sitemsp.xml`, `sitemap.json`, `llms.txt`, missing routes and missing assets must not return homepage HTML.

Product-image sitemap extensions wait until the image-safety workstream proves stable asset identity, references and recovery.

## AP3: complete transaction integrity

Define one canonical interpretation used by product display, admin, catalogue, checkout and monitoring:

- `N×M` equals `M×N`;
- duplicate orientations never appear to the customer;
- composite formats such as `2x90x60` are not ordinary dimensions;
- medium is separate from dimensions;
- missing price never becomes zero;
- missing Stripe mapping never falls back to another size or product;
- checkout never silently selects a default variant;
- inactive, invalid or retired products cannot appear purchasable;
- successful payment reaches the correct success and order state.

Canary levels must be reported honestly:

- page and mapping checks prove catalogue readiness;
- checkout-session handoff proves the live Stripe boundary without payment completion;
- Stripe test mode proves the end-to-end technical flow in isolation;
- only an approved live charge proves the complete live-money path.

## AP4: admin, image and catalogue safety

Preserve the intended outcomes of all reachable admin capabilities: authentication, products, lifecycle flags, descriptions, tags, dimensions, prices, Stripe IDs, offers, images, mockrooms, bulk SKU work, import/export, navigation, hero, contact bar, pages, media and deployment.

Required changes:

- product and page removal become archive and restore;
- image rename, optimization and cleanup use preview, immutable manifests, quarantine/copy, reference and hash verification, deletion limits, hold period and demonstrated restore;
- every admin action reports `stored`, `awaiting deployment`, `public and verified`, `failed` or `restored`;
- the deploy function requires verified authentication and a server-side admin-role check;
- no admin message claims that production changed until production verification passes;
- import/export purpose and round-trip safety are characterized before preservation;
- current reachable outcomes are preserved unless Donato explicitly retires one.

## AP5 and AP6: public-state truth and Lovable independence

- Trace homepage order from database through generated data, build, cache, render and deployment using a content-version fingerprint.
- Make the public order agree with the stored intended order or fail visibly.
- Remove high-risk Lovable runtime, deployment, hostname, MCP, preview and control paths incrementally after replacements pass the same contracts.
- Do not combine Lovable removal with unrelated redesign.
- Keep GitHub as source authority and treat the hosting provider as replaceable.

## AP7: basic blog, lower than P0

Extend the existing `pages` CMS with:

- `page_kind`: `page`, `blog_index`, `article`;
- `publication_status`: `draft`, `published`, `archived`;
- `excerpt`;
- `thumbnail_url`;
- `author_name`;
- `published_at`;
- `content_modified_at`.

Reading duration is calculated from visible words at 200 words per minute, rounded up with a one-minute minimum.

The first article contract is already decided:

- route: `/storie-fatti-scientifici-polpo`;
- author: Marco De Francesco;
- publication date: 2026-01-05;
- initial content-modified date: 2026-01-12;
- thumbnail: `polpo-mimetismo-cromatico.webp`;
- excerpt: `Scienza, comportamenti intelligenti e storie vere sul polpo: dal mimetismo alle fughe più sorprendenti.`

`/blog` becomes a minimal collection page with tiles containing thumbnail, title, excerpt, Italian date, calculated duration and author. Published articles sort newest first. New articles default to draft and are not added automatically to the main navigation.

The article emits visible author/date/duration metadata and matching Article or BlogPosting structured data. Elena's existing editorial credit remains a separate content-review question and is not used as the schema author.

The shared route/sitemap defect affecting the article is repaired in AP2. The tile UI and broader publishing convenience occur only after P0 safeguards.

## AP8: distribution engine

Entry conditions:

- all three P0 contracts have active prevention, monitoring and response;
- the current release passed all three safety checks;
- attribution is able to distinguish channel, content, landing page, checkout start and purchase;
- homepage ordering and public-state propagation are trustworthy;
- high-risk Lovable control paths are removed or isolated.

Channel order:

1. SEO distribution and internal discovery.
2. Full AEO evidence and entity/citation readiness.
3. GEO evidence and answer-engine referral measurement.
4. Pinterest asset, board, pin and landing-page automation.
5. Selected Facebook groups and Instagram audiences.
6. Other channels only when evidence justifies them.

The blog and catalogue are the governed source layer. External publishing, audience settings and automated posting require separate approval and platform-compliant controls. Measure qualified visits, engagement, checkout starts, purchases, operational effort and content reuse. Do not treat impressions as demand.

## Three plain-English safety checks

1. **Current-store safety check:** before application changes, confirm the exact live version and identify what could silently break availability, visibility or transactions.
2. **Repair-package safety check:** before each package joins the main code, an independent reviewer proves the agreed benefit and preservation of working behavior.
3. **Go-live safety check:** before release, verify the complete candidate, prove the rollback target and confirm the production canaries and response workflow.

Donato receives the issue, benefit, evidence, remaining risk, rollback and decision in plain English. He is not asked to inspect code or terminal output.

## Protected test matrix

- all generated routes and assets, not samples;
- ordinary browser, Googlebot smartphone, Bingbot and OAI-SearchBot;
- clean and repeated builds;
- partial, empty, unavailable, stale and malformed data;
- cold and warm cache behavior;
- redirects, trailing slashes, UUID products, retired resources and missing paths;
- full server-rendered metadata and structured-data identity;
- sitemap and route-registry equality;
- real Safari/iPhone browse and checkout evidence;
- archive, quarantine and restore;
- admin stored-to-public transitions;
- transaction layers with their exact proof limits;
- Preview rehearsal, production verification and rollback rehearsal;
- canary failure, retry, incident creation, automatic rollback, alert and recovery paths.

## Stop-ship additions

In addition to the controlling handoff, stop if:

- any P0 canary or incident workflow is disabled, untested or unable to alert;
- the rollback target has not passed the current P0 contract;
- a deployment can proceed after a failed P0 pre-release check;
- a confirmed P0 regression cannot freeze releases and start diagnosis;
- automatic rollback can loop or can cross an irreversible state change;
- the complete transaction path is claimed as proven using only a non-payment simulation;
- one of the three governing P0 outcomes has no named owner, test, detection target and recovery action.

## Exact next task for a new chat

Planning is complete enough to begin the authority and safety foundation, not feature implementation.

The next chat must:

1. read the complete controlling handoff, this action plan and the SEO brief;
2. confirm the proper Git clone, GitHub head and exact production deployment provenance;
3. prepare the AP0 first-safety-check evidence brief;
4. specify the initial current-production P0 canaries and automatic incident workflow against today's known state;
5. identify the exact approvals and external credentials required for Checkly or an equivalent runner, Meta WhatsApp and Resend without exposing secrets;
6. define and rehearse automatic rollback eligibility against the current healthy deployment;
7. stop before changing application code or external settings and present the plain-English approval package.

No next chat may begin by rebuilding the blog, changing the sitemap, deploying or requesting indexing. The first implementation work is the safety foundation that prevents and responds to failures of the three governing P0 outcomes.

## Explicit unknowns

- Exact Vercel production deployment-to-Git commit mapping must be reverified.
- Full application recovery and external configuration parity remain unproven.
- Exact Realtime production-version parity remains unproven.
- The safe recurring live purchase/refund and supplier-suppression procedure is not approved.
- The full AEO/GEO citation, entity and referral evidence pass remains pending.
- Monitoring vendor limits, cost and regional coverage must be rechecked during approval. The required outcomes are fixed even if the provider changes.
- Automated diagnostic scripts can begin root-cause isolation immediately. Any integration that automatically assigns an LLM agent must be proven before it is represented as active.

