# OctoWonders bug priorities and staged repair plan

Status: prepared locally for Donato's review. This document authorizes no repair, push, publication, outside setting, production-data change, indexing request, transaction, refund or rollback.

**23 August evidence update:** the 73-condition result below is the last complete local saved-copy result. The read-only public rebaseline of the build created on 22 August at 23:44 found 64 discoverability conditions: two route failures, 30 conflicting titles, 30 conflicting descriptions and two missing or invalid shared identity images. A newer public build appeared at 00:30 on 23 August and includes an application change, so 64 is now historical too. Payment remained paused, and no current combined public total is claimed. See `docs/evidence/2026-08-23-live-rebaseline-after-lovable-catalogue-change.md` and `docs/evidence/2026-08-23-stage0-stop-new-lovable-public-build.md`.

## Quick orientation

The local saved-copy safety result remained red after removing four false P0 classifications:

- Donato's former `2x90x60` catalogue label was not a software bug. Donato reports that the exact current Lovable value is `2x9060`; it remains owner-defined content, not a software P0. Ordinary two-number dimensions are compared without orientation under the rule in the bug-fixing guidelines.
- A non-public artwork record without an address is not a current customer-path P0.
- A draft artwork without a sellable size is not a current customer-path P0.
- Repeated primary headings with the same words are incorrect, but are not a credible blocking failure.

That corrected local saved-copy result contains 73 P0 conditions, not 73 separate bugs:

| Protected outcome | Local saved-copy P0 conditions | Root meaning |
| --- | ---: | --- |
| Availability | 0 | The local built-store check found no missing intended page. This is not continuous production proof. |
| Discoverability and citability | 67 | Two routing failures, 31 conflicting titles, 32 conflicting descriptions and two missing shared identity images. |
| Transaction readiness | 6 | Six visible size choices have no exact payment connection. Payment work remains paused by Donato. |

The number 67 above is unrelated to the separate starting-code result of 67 code-quality errors. They are different measurements.

Recommendation: first make the prepared release protection enforceable under the AP1B approval boundary. Then repair one root cause at a time, starting with current search identity and route continuity. Do not perform a bulk cleanup of the 67 code-quality errors.

## 1. Governing framework and scope

The sole verbatim copy of Donato's Vision, SEO Recap and Review principles remains in `docs/2026-08-22-bug-fixing-guidelines.md`. Those principles control every decision below and are not repeated here.

This plan uses `docs/2026-08-21-seo-differential-repair-brief.md` for the approved search repair contract and `docs/2026-08-22-stabilization-action-plan.md` for release, monitoring and recovery order.

The priorities below are judgments about credible consequences. They are not judgments about elegance, age, style or how many checker messages a file produced.

## 2. Priority summary by root condition

### P0 now or P0 protection gap

| ID | Root condition | Failing now? | Why it can originate protected harm | Current disposition |
| --- | --- | --- | --- | --- |
| P0-SEO-1 | The intended article is redirected to the blog index. | Yes | The intended article has no independent crawlable or citable identity. Search and answer engines are sent to another page. | Repair after release protection is enforceable. |
| P0-SEO-2 | A broad hosting rule replaces unknown pages and assets with the homepage. | Yes | Missing routes and files can look successful, conceal failures from monitors and give crawlers the wrong identity. | Repair with the complete route matrix, not by editing one sample address. |
| P0-SEO-3 | Built pages contain conflicting search identity. | Yes, sitewide | All 32 checked descriptions conflict. Titles conflict on 31 of 32 pages. A generic store identity competes with the route-specific identity. | Remove the shared source of conflict and prove all 32 pages. |
| P0-SEO-4 | The declared organization logo and default social image do not resolve as valid images. | Yes | Search, answer and social systems cannot retrieve two shared identity assets. The false-homepage rule also disguises one missing image. | Donato supplies or confirms the intended files; code only connects the approved assets. |
| P0-SEO-5 | Multiple sitemap and build-data authorities can disagree. | Credible latent failure; public sitemap is currently present | A catalogue change can report sitemap success without changing the Vercel sitemap. A live-data production build can differ from the saved version that was checked. | Establish one validated route and sitemap authority before normal catalogue automation resumes. |
| P0-CTRL-1 | Direct `main` writes, automatic public publishing and the current catalogue-refresh routine can bypass review. | Yes, as a protection gap | A change can reach customers without the P0 repair or live-store decision. | AP1B protection bootstrap, separately approved before execution. |
| P0-CTRL-2 | The deployed release-trigger function accepts unauthenticated callers. | Proven source defect; misuse not tested | Any caller able to reach it can request a production build, bypassing the intended release path and consuming build capacity. | Disable or require a narrowly authorized caller before trusting the release gate. Do not test it against production. |
| P0-CTRL-3 | The deployed administrator-setup function accepts unauthenticated callers and uses administrator authority. | Proven source defect; misuse not tested | An outside call can cause administrator creation or password reset using stored authority. This can disrupt control of the store even though the caller does not receive the stored password. | Separate authorization repair before the function is trusted or retained. Do not probe it in production. |
| P0-PAY-1 | Six visible size choices have no exact payment connection. | Yes in the saved production-source catalogue | A customer can like an artwork and choose a visible size but be unable to continue through that exact purchase. | Detected and documented. All further payment work remains paused by Donato. |

### P0 candidates that require proof before repair

| ID | Candidate | Credible trigger and consequence | Evidence limiting the claim | Required next action |
| --- | --- | --- | --- | --- |
| CAND-1 | Malformed generated product or page data crosses the build without complete runtime checking. | A changed database record can stop the build or corrupt a product page, sitemap, price or shared identity. | Current committed data built successfully. Static types alone would not validate live database values. | Add controlled malformed-input examples before deciding the minimum runtime boundary. |
| CAND-2 | Crawler-facing product-size generation can receive an empty or malformed size list. | It can throw or emit a non-finite price, breaking crawler product identity. | The crawler proxy is deployed but no current public routing dependency on it was found. No live call was made. | Prove whether any production route or outside service uses it before assigning final priority. |
| CAND-3 | Image cleanup and optimization tools accept incompletely checked nested data. | A manual action plus unexpected data can clear, delete or redirect an important artwork image. | These are administrator-only tools with confirmation and some verification. No action was run. | Keep destructive image work unused. Rehearse quarantine and restore before any image repair. |

### P1 investigation or later correction

| Root condition | Why it is not P0 on current evidence | Disposition |
| --- | --- | --- |
| Twenty product pages render the same primary heading twice; the FAQ source adds the same heading twice. | The words agree, no intended identity is missing, and no blocking or indexability failure was shown. The markup is still incorrect. | Correct after the current P0 search identity failures, or in the same narrowly reviewed file only when that file is already required for a P0 repair. Donato removes the extra FAQ heading from content. |
| Administrator image screens can lose the original explanation when an unusual error value is thrown. | The original operation has already failed and the public shop remains usable. | Leave in P1 until the relevant administrator tool is next approved for work. |
| Optional product search fields can fall back silently. | Fallbacks exist and no current route identity failure was attributed to these two reads. | Re-evaluate only after the shared title and description conflict is removed. |
| Optional connected-tool configuration and authorization response shapes can fail unclearly. | These paths do not serve an ordinary customer or crawler. | Defer. Investigate if the connected tool becomes operationally required. |
| Payment request logging accepts overly broad detail and may record more request data than needed. | No direct current payment malfunction was proven from the checker finding. Privacy and diagnostic consequences remain unresolved. | Keep in the payment queue. Do not inspect or change it while payment scope is paused. |
| The saved-data build reports that its process is still running after 15 seconds and then force-exits. | The build exits successfully, all post-build steps complete and the expected 83 files are produced. The unresolved open work could still become a release delay or failure after a tool change. | Investigate only as a separate release-continuity question. Do not change the build lifecycle during an SEO repair. |

### P2, leave alone

| Root condition | Evidence-based reason to leave it alone |
| --- | --- |
| Nine unnecessary regular-expression escapes | The checker describes a behavior-preserving change. No runtime failure path was found. |
| Seven old declaration forms in the bundled connected-tool module | They are not reassigned and no behavior difference was identified. |
| Two variables that could be declared more strictly | The current binding behavior is unchanged. |
| One empty type wrapper | It disappears during the build and cannot affect runtime. |
| Seven local refresh warnings | They affect local editing refresh, not the published store. |
| The current style-build import form | The current production build accepts it. Reclassify only if a future tool change makes it fail. |
| Broad suppression on the hero image priority line | No current image failure is proven. The credible current effect is limited to a future editing safeguard or loading priority. |
| Product-card conditional state helpers | The production catalogue is static for a mounted customer session. The missing-address card remains missing rather than changing identity in place. A live-data preview can change, but that is not the customer store. |
| Product-page redirect conditional state helper | Current Vercel middleware intercepts UUID product addresses with `308` or `410`, and the known legacy UUID also has a static redirect page. The customer request does not currently reach the conditional client redirect. |

The two conditional state-helper items must be reclassified before any future change removes their current protection. In particular:

- if product cards begin receiving live catalogue changes in production, the ProductCard condition becomes a credible render-break candidate;
- if server and static UUID redirects are removed or bypassed, the Product-page condition becomes a credible product-page crash candidate.

This dependency is a reason not to “clean up” the hook warnings now and not to remove the routing protection casually later.

## 3. Detailed current P0 evidence and limits

### 3.1 Route identity

Current evidence:

- `/storie-fatti-scientifici-polpo` is an intended sitemap destination but is redirected to `/blog`.
- A deliberately nonexistent page, missing asset, misspelled sitemap address and other impossible addresses can return homepage HTML with a successful status.
- The source checker reproduces both hosting rules directly from the current configuration.

Credible harm:

- an intended page cannot establish its own search or citation identity;
- a missing page or image can be mistaken for a healthy resource;
- simple monitoring can report green while customers or crawlers receive the wrong page.

Limit:

Most intended current pages are reachable, and no whole-store availability outage is occurring now. The classification is based on current discoverability discontinuity and false success, not a claim that the whole shop is down.

### 3.2 Conflicting title and description identity

Current full-build comparison across 32 intended routes found:

- 32 pages with two descriptions, and the two descriptions conflict on all 32;
- 32 pages with two titles, with conflicting values on 31;
- the homepage repeats the same title, but still has conflicting descriptions;
- the route-specific values are followed by generic fallback values from the shared HTML template.

Credible harm:

Search and answer engines receive two competing instructions about the same document. A generic title or description can be selected instead of the product, article or policy identity. Because this is generated across the whole route set, it is a shared SEO continuity failure rather than isolated untidy markup.

Counterexample and changed judgment:

Several pages have been indexed despite the conflict. That proves the defect does not guarantee total index loss. Earlier provisional discussion treated the duplicates as non-P0 for that reason. The later full-build comparison adds material evidence: these are not harmless repeated identical values; the descriptions conflict on every checked route and titles conflict on 31. Under Donato's SEO continuity rule, the current sitewide conflict is P0 even though it has not erased all indexing.

### 3.3 Repeated headings

The 21 pages with two primary headings were compared by normalized visible words:

- all 21 pairs contain the same words;
- 20 originate from two product-layout headings in the same product screen;
- one originates from the FAQ page wrapper plus an owner-authored heading in the FAQ content.

This remains incorrect and below the intended search standard, but current evidence does not show conflicting page identity or a blocking outcome. It is P1, not P0.

### 3.4 Shared identity images

Current evidence:

- the declared organization logo address returns homepage HTML rather than an image;
- the default social image address is missing;
- product artwork samples otherwise returned their intended image content.

This is two shared identity failures, not evidence that all product images are broken. The repair must use Donato-approved source files and must not rename, delete or bulk-optimize artwork storage.

### 3.5 Build and sitemap authority

Current evidence:

- the production build command obtains catalogue data before building;
- the local safety release check deliberately builds only from the saved snapshot;
- a catalogue refresh can currently write directly to the main source version;
- six sitemap mechanisms exist and do not share one route contract;
- the administrator and database-trigger sitemap refresh update a Storage object that is not the Vercel production sitemap;
- the current public sitemap is present and matched the local public file at the AP0 evidence cutoff.

Credible harm:

A candidate can be checked against one saved catalogue and then publicly built from different live data. A catalogue edit can also report sitemap success while the public sitemap remains unchanged. Either path can create silent search drift after a seemingly successful release.

Limit:

This is a credible next-change failure path, not proof that today's public sitemap body is missing.

## 4. Staged repair sequence

Every stage is a separate proposal and approval boundary. A later stage does not become authorized merely because an earlier one passes.

### Stage 0: make safe repair work possible

Purpose: prevent a repair from reaching customers before it passes the strict live-store result.

Required actions, all still outside and unexecuted:

1. Present the exact GitHub and Vercel screens and before-and-after values.
2. Stop automatic attachment of public domains during the bootstrap.
3. Place the prepared safety files into the official source through a one-time independently reviewed bootstrap. The first bootstrap cannot compare itself with `main` because `main` does not yet contain the repair judge.
4. Require `P0 Repair Admission` for later repair proposals.
5. Use `P0 Live Store Safety` only for public publication. It remains red while any true P0 condition remains.
6. Keep reopening manual and automatic rollback disabled.
7. Remove or authorize the direct catalogue writer and release-trigger bypass before normal publication resumes.

Stop condition: do not begin application repair if a proposal can still publish publicly while the live-store result is red.

### Stage 1: route and article continuity

Purpose: remove false success and restore the intended article identity without changing blog features.

Test first:

- every intended route and asset class;
- the article and blog as different identities;
- one impossible page and one impossible asset;
- known legacy aliases and UUID product addresses;
- trailing-slash variants;
- ordinary browser, Googlebot, Bingbot and OAI-SearchBot identity;
- current server and static UUID redirects, so the dormant Product-page state-order hazard is not awakened.

Minimum repair outcome:

- the article returns its own `200` indexable page;
- the blog remains its own index;
- impossible routes and assets return `404` or `410`, never homepage HTML;
- valid client-side navigation still works;
- known aliases redirect once to the intended destination;
- the shop, all intended products and critical assets remain available.

Rollback boundary: route and hosting-rule changes only. No catalogue, payment, database or image operation in the same proposal.

### Stage 2: one effective title and description per intended page

Purpose: remove the shared generic competitor without rewriting page copy.

Test first:

- all 32 current intended routes have one effective title and one description;
- every value is route-specific where route-specific data exists;
- no route loses its canonical, robots rule, structured data or meaningful server HTML;
- repeat builds produce the same identity;
- an intentionally missing route cannot inherit homepage identity.

Likely minimum repair surface:

- the generic fallback title and description in the shared HTML template;
- the build behavior that is expected to replace or omit those fallbacks;
- a fail-closed post-build check if a route finishes with no effective identity.

Do not rewrite the route-specific titles or descriptions merely for style. If a route-specific value itself is poor, flag that content to Donato separately.

Rollback boundary: shared head generation only. Do not combine with route, catalogue, payment or visual redesign.

### Stage 3: restore the two shared identity images

Purpose: make the declared organization logo and default social image real, stable image resources.

Donato must first confirm:

- the exact approved logo file;
- the exact approved default sharing image;
- whether their public addresses should remain the current declared addresses.

Test first:

- successful image status and image content type;
- nontruncated file signature;
- stable public address;
- Organization and social metadata refer to the approved files;
- no product artwork or Storage object is renamed, optimized or deleted.

Rollback boundary: the two approved shared assets and their exact references only.

### Stage 4: establish one sitemap and build-data authority

Purpose: make the checked candidate and the published artifact derive from the same validated route and catalogue snapshot.

Test first:

- controlled malformed product, page, size and public-address inputs stop before publication;
- the same saved input produces the same route manifest and sitemap twice;
- every sitemap destination is a real indexable page;
- inactive, draft, redirect, missing and tool-only routes are excluded;
- one material content change updates only the intended route record;
- the catalogue refresh opens a reviewed proposal and cannot write directly to `main`;
- administrator and database-trigger actions cannot claim they changed the public sitemap when they did not.

Minimum authority outcome:

- one route registry governs build output and sitemap membership;
- one reviewed saved catalogue snapshot is checked and built;
- competing sitemap writers are removed from production authority or converted into clearly non-authoritative diagnostics;
- Vercel publishes the exact artifact that passed the live-store check.

This is the largest search repair and requires independent technical review. It must not include payment, image cleanup or a platform migration.

### Stage 5: close administrator and release-function authorization gaps

Purpose: prevent public callers from invoking service-level administrator or release actions.

Required proof before a change:

- current legitimate caller and business need for each function;
- least permission required;
- behavior for missing, expired, wrong-role and replayed authorization;
- evidence that no secret is returned or logged;
- a recovery path if Donato is locked out;
- proof that removing a function does not break the current administrator journey.

Separate the administrator-setup and release-trigger changes. They have different failure and recovery consequences.

### Stage 6: P1 correction after P0 is green

Candidate order:

1. Change the second product heading to a subordinate heading while preserving its visible style.
2. Donato removes the extra FAQ primary heading from the page content.
3. Reassess optional product search-field fallbacks after shared identity is clean.
4. Reassess administrator error handling only when those tools are next authorized for work.

Do not open a general code-quality cleanup stage. P2 items remain untouched.

### Payment stage: deliberately parked

The six missing payment connections remain P0 transaction findings. Donato instructed that payment work stop after detection. Therefore this plan:

- records the current finding;
- does not inspect Stripe;
- does not change a product, size, price or payment identifier;
- does not run checkout, purchase or refund;
- does not plan the payment fix until Donato separately reopens that scope.

## 5. Donato-owned content decisions

The following are not software repairs and must not be silently decided by a developer:

1. Supply or approve the organization logo.
2. Supply or approve the default social-sharing image.
3. Remove the extra primary heading from the FAQ content when Stage 6 is approved.
4. Correct, retire or retain unusual catalogue labels and draft records through the catalogue process. The current owner-reported `2x9060` label must not be silently rewritten, and ordinary size orientation must not be treated as a different product.
5. Review any route-specific title or description flagged as weak after the shared duplication is removed.
6. Confirm the intended publication state of the draft “not for sale yet” record.

None of these content actions is executed by this plan.

## 6. Acceptance evidence required for every repair stage

Before a repair may be proposed for public publication:

1. Show the exact current failure and the controlled example that catches it.
2. Show the first failing test before the repair.
3. Make the minimum change that satisfies that test.
4. Run the complete local safety examples and strict agreement check.
5. Build twice from the same saved snapshot and compare the governed outputs.
6. Run the full source and built-store safety results.
7. Confirm no new P0 finding and at least one resolved P0 finding through `P0 Repair Admission`.
8. Confirm the absolute `P0 Live Store Safety` result for public publication.
9. Review affected iPhone, crawler and public-page behavior in proportion to the stage.
10. Record changed files, unaffected behavior, evidence, counterexamples, residual unknowns and reversal procedure.
11. Obtain independent technical review.
12. Obtain Donato's publication approval.

After any P0 repair publishes, verify the public domains rather than treating a local build, proposal result or Vercel `READY` label as production proof.

## 7. Stop and rollback rules

Stop a stage immediately if:

- an unrelated application area must be changed to make the repair work;
- the repair requires a database, payment, DNS, credential or destructive image change not already approved;
- the repair wakes a dormant dependency, including client UUID redirects or live ProductCard data;
- any intended page, product, image, canonical, sitemap member or customer path worsens;
- the repair result introduces a new P0 condition;
- production publishing can bypass the live-store result;
- the named technical reviewer is unavailable.

Reversal remains manual. Automatic rollback stays disabled because no deployment has yet passed the complete three-outcome contract as a qualified healthy target.

## 8. Residual unknowns and counterexamples

Unknowns that still matter:

- which current outside service, if any, calls the crawler proxy;
- whether every current database record conforms to the shapes assumed by the production data-fetch build;
- the exact current legitimate caller for administrator setup and release trigger;
- who will serve as qualified technical reviewer, release operator and technical incident owner;
- the complete live payment and post-payment path, deliberately paused;
- current use and restore behavior of destructive image tools;
- whether all route-specific title and description copy meets Donato's content standard after the shared conflict is removed.

Counterexamples that constrain overstatement:

- several pages are indexed despite conflicting titles and descriptions, so the defect is not proof of universal deindexing;
- most intended pages and product images currently load;
- the public sitemap exists and matched the local public file at the AP0 evidence cutoff;
- current server/static UUID handling prevents the Product-page conditional state path from triggering in the observed production route;
- the current production catalogue is static during a customer session, preventing the ProductCard missing-address transition;
- no misuse of the administrator or release functions was attempted or proven;
- no live payment failure was performed or reproduced.

Passing every known check would not prove that no unlisted causal path exists. Review must remain open to shared build state, provider changes, timing, data transitions, crawler differences and hidden Lovable dependencies.

## 9. Approval choices

### Approve the staged plan

Authorize preparation of the exact Stage 0 outside-setting package and Stage 1 test-first implementation plan. This does not authorize applying Stage 0, repairing the application or publishing.

### Change the order or classification

State which root condition, consequence or business constraint should change. Evidence and counterexamples will be reconciled before work continues.

### Postpone

Keep the current store and all outside settings unchanged. This accepts the current route, search identity, shared-image and release-protection gaps while automatic rollback remains disabled.
