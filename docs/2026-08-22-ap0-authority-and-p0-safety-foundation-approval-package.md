# AP0 authority and P0 safety-foundation approval package

Status: approved by Donato Marco Mangialardo on 2026-08-22 for AP1 planning and safe local preparation under the safeguards in this document. No application code, deployment, production data, transaction, indexing request, or external setting was changed during AP0.

Approval safeguards: release reopening remains a manual decision; automatic rollback remains disabled until a healthy target passes all three P0 outcomes; every proposed change to an external account or the live store must be shown to Donato before execution. Donato is the business owner and primary WhatsApp recipient. His phone number and email address are personal data and must remain outside this public repository.

Evidence cutoff: 2026-08-22T10:44:16Z (2026-08-22T12:44:16+02:00 in Rome).

## Quick orientation

### What this package establishes

The live OctoWonders domains are served by a specific Vercel deployment built from a specific GitHub commit. The local workspace is not a Git clone, although the high-risk local files tested match that commit exactly.

The current shop is reachable and a sampled customer can browse a product, select a size, and see the expected price. It is not yet a verified healthy P0 baseline under the controlling contract:

| Equal P0 outcome | Current result | Plain-English meaning |
| --- | --- | --- |
| Available | Partially proven | The public site and 31 of 32 sitemap destinations returned usable HTML in one read-only pass. Broad false-`200` routing can conceal missing pages and assets. |
| Discoverable and citable | Failed | The sitemap contains a redirect, nonexistent routes and assets return homepage HTML with `200`, the declared logo and default social image are broken, and sampled documents contain duplicate identity signals. This is a current incident under the agreed P0 contract. |
| Transactable | Partially proven | A sampled product exposes the expected sizes and prices. A payment was not attempted. Six active size rows in the exact deployed snapshot lack a Stripe price mapping, and the success page claims payment success without verifying a Stripe session. |

The previous Vercel deployment is platform-eligible for Instant Rollback, but it is not program-eligible for automatic rollback. It has not passed the same P0 contract, its immutable URL is protected from independent public probing, and state/configuration parity is not proven. No production rollback was performed.

### Decision recorded

Donato approved AP1 planning and safe local preparation for the safety foundation described here, subject to the listed boundaries and separate approvals. The approval covers work on monitoring, release gates, evidence capture, alerting, and the rollback controller. It does not authorize an application repair, production transaction, refund, indexing request, image cleanup, production data mutation, production rollback, or an unreviewed external-setting change.

The approval-stage choices were:

1. **Approve the safety-foundation package.** Proceed to an implementation plan and controlled setup, with every external mutation shown before execution.
2. **Request changes.** State the business requirement or risk rule to change.
3. **Postpone.** Keep the current deployment unchanged and explicitly accept that the three P0 outcomes are not yet protected by enforceable release gates, independent live monitoring, or verified alert delivery.

## 1. Scope and authority

This package follows the authority order in:

- `docs/handoffs/CURRENT.md`
- `docs/handoffs/2026-08-21-stabilization-handoff.md`
- `docs/2026-08-22-stabilization-action-plan.md`
- `docs/2026-08-21-seo-differential-repair-brief.md`

The controlling objective is to preserve a store that normally works while protecting three equal P0 outcomes: availability, discoverability/citability, and the artwork-to-confirmed-payment journey. A failure of any one is a P0 incident. A change-caused failure is also a P0 regression.

This was a read-only AP0 investigation. It did not authorize or perform application repairs.

## 2. Exact code and deployment authority

### 2.1 Git authority

No Git clone exists in the authorized OctoWonders or OCTOFAST workspace roots. Both the workspace root and `FULL-CODE-OCTOWONDERS.COM` return “not a git repository”, and the authorized roots contain no `.git` directory.

The authoritative public repository is `donatomm/art-blitz-now`, default branch `main`.

| Item | Proven value |
| --- | --- |
| GitHub repository | `donatomm/art-blitz-now` |
| Repository ID | `1110762504` |
| Branch | `main` |
| Current head | `ffe0b380166bd6b9bae7e3d89711a1078867e41d` |
| Commit time | `2026-08-20T19:59:22Z` |
| Commit message | `Added green/amber/red fills` |
| Branch protection | Not protected |
| Required status checks | None |

The commit tree contains 237 entries and was not truncated. Git blob hashes for 22 high-risk local files matched the corresponding blobs in that commit. The sample included package and lock files, Vercel and Vite configuration, build scripts, routing and checkout surfaces, generated catalogue data, static pages and settings, and Supabase function/configuration files.

Conclusion: the local high-risk snapshot matches the deployed commit for the tested files, but the workspace lacks Git history, branch state, remotes, and a safe change workflow. A proper clone must be established before implementation.

### 2.2 Production deployment provenance

| Item | Proven value |
| --- | --- |
| Vercel team | `dmm projects` |
| Team ID | `team_7lQ6krgKtZ3LWkZ3E8GWlPu7` |
| Plan observed | Hobby |
| Domain-owning project | `art-blitz-now` |
| Project ID | `prj_RQiswgJu779Ix9Lb0ffAIExPkzFh` |
| Current deployment | `dpl_CtsCkxKWcDv8ZhoNTjCdgsT6dsTh` |
| Current deployment URL | `art-blitz-abob1rc1m-dmm-projects.vercel.app` |
| Production domains | `octowonders.com`, `www.octowonders.com` |
| Deployment state | `READY`, production |
| Source | GitHub `donatomm/art-blitz-now`, `main` |
| Git commit | `ffe0b380166bd6b9bae7e3d89711a1078867e41d` |
| Created | `2026-08-20T19:59:28.212Z` |
| Ready | `2026-08-20T20:00:13.959Z` |

The immediately previous production deployment is:

| Item | Proven value |
| --- | --- |
| Previous deployment | `dpl_ioqQaxg5gu7Wy9haM9v2D2ZsJGrj` |
| Deployment URL | `art-blitz-1a51ni619-dmm-projects.vercel.app` |
| Git commit | `b34cfca21b2495c6bb501250d3ef170cd026fba3` |
| Created | `2026-08-20T19:29:56.293Z` |
| Vercel rollback-candidate flag | `true` |

Vercel reports the current and previous deployments as rollback candidates. This platform flag means the deployment can be selected, not that it is safe or healthy under the OctoWonders P0 contract.

### 2.3 Authority anomaly

A second Vercel project, `project-7k6aq` (`prj_VGbGjB0mV38hWzQ87gBbQyLdcTpJ`), is linked to the same GitHub repository and deployed the same current commit at nearly the same time. It does not own the OctoWonders production domains.

This is not a current domain conflict, but it is an authority and cost/confusion risk. AP1 should identify its owner and purpose before anyone changes or deletes it. This package does not authorize either action.

The footer value labelled “Build” is not reliable deployment provenance. The deployed settings hook generates that timestamp at runtime. Deployment ID plus Git commit is the trustworthy pair.

## 3. First whole-store current-store safety check

### 3.1 Availability evidence

Read-only production probes found:

- The homepage returned `200` with `text/html`.
- `robots.txt` was reachable and allowed Googlebot, Bingbot and general crawling while advertising the sitemap.
- The live sitemap hash was `68d054bf4be66c700fe23c8c0118bbbe64e7381b4813a650224b35d30a9c0cc5` and contained 32 URLs.
- Of those 32 URLs, 31 returned `200 text/html` in one pass.
- `/storie-fatti-scientifici-polpo` returned `308 text/plain` and redirected to `/blog`.
- The maximum observed response time in that single pass was below 0.78 seconds.
- Vercel showed no runtime-error cluster for this project in the prior seven days.

Limits: this was one location and one interval, not a service-level measurement. A mostly static frontend can fail through routing, browser code, Supabase, Stripe, or generated data without producing a Vercel runtime cluster.

### 3.2 Availability counterexamples

The homepage body was 45,629 bytes with SHA-256 `d352c686...`. Each of these missing or malformed paths returned `200 text/html` with the same homepage size and hash:

- `/ap0-definitely-missing-route`
- `/assets/ap0-definitely-missing.webp`
- `/sitemap.json`
- `/sitemsp.xml`
- `/llms.txt`
- `/logo.png`

This broad SPA fallback hides failures from status-only monitoring. An availability canary that merely expects `200` would report false success.

`/artworks/octoheaded.jpg`, the default Open Graph image, returned `404 text/plain`.

### 3.3 Discoverability and citability evidence

Positive evidence:

- The homepage, one representative product, and `/blog` returned identical page bytes for ordinary, Googlebot Smartphone, Bingbot and OAI-SearchBot user agents in the sampled probes.
- `/artist` redirected to `/artista`.
- `/FAQs` redirected to `/faqs`.
- A sampled legacy UUID product path redirected to the descriptive product route.

Current failures:

- The sitemap includes `/storie-fatti-scientifici-polpo`, but that URL redirects instead of returning an indexable article with its own identity.
- Unknown routes and missing assets can return homepage HTML with `200`.
- A product trailing-slash variant returned an independently indexable `200` instead of redirecting to one canonical form.
- The Organization logo URL returns HTML rather than an image.
- The default Open Graph image is missing.
- The homepage emitted two titles and two descriptions.
- The sampled product emitted two titles, two descriptions, two H1s and two JSON-LD blocks.
- The sampled blog page emitted two titles, two descriptions and two JSON-LD blocks.

Conclusion: discoverability/citability is currently red under the controlling P0 contract. These are pre-existing defects, so automatic rollback is prohibited.

### 3.4 Transaction-readiness evidence

A read-only browser journey showed:

1. The homepage rendered 20 product cards.
2. A customer could open the pink representative product.
3. The product showed `75x100` at €91 and `40x60` at €45.
4. Selecting `40x60` changed the displayed total to €45.
5. The WhatsApp and email links updated to the selected size and price.
6. Terms remained unchecked. No add-to-cart, checkout, payment, refund, or data mutation was performed.

The exact deployed generated catalogue snapshot contains 24 products, 21 active products, and one active product without a slug. Among active products, six non-null size rows across four products lack a Stripe price mapping:

- Octosuckers: `90x60`
- OLIM: `100x75`, `90x60`, `60x40`
- OCTOPUS EREBUS: `80x80`
- Octocubist: `80x80`

Seven active size rows have a nonpositive price and are hidden by the current UI. That UI behavior is positive, but it is not proof that every backend or future path preserves the rule.

The deployed checkout-success page returned `200` without a `session_id` and displayed that payment was processed successfully. The deployed code does not verify the Stripe session or payment before showing success and clearing the cart. No Stripe webhook or server-side payment-confirmation/order-finalization path was found in the reviewed repository.

The public checkout function enforces an exact dimension-to-price mapping and does not silently choose another price, but it does not check the product's active state. It also logs request and Stripe session details that should not be retained in production logs.

Conclusion: browsing and size/price selection are partially proven. Checkout handoff, payment confirmation, required post-payment behavior, and Safari/iPhone support are unproven. The current success page provides a concrete false-confirmation counterexample.

### 3.5 Release and recovery evidence

- `main` is unprotected and has no required checks.
- The current GitHub Action can refresh generated data, commit directly to `main`, and trigger Vercel production deployment.
- Vercel normally auto-deploys the production branch. No enforceable release freeze or P0 promotion gate exists today.
- Build logs completed successfully but contain repeated server-rendering `useLayoutEffect` warnings.
- The repository contains no application test/spec files and no test or typecheck package script.
- Local lint could not run because dependencies are not installed. No dependencies were installed during AP0.
- A current read-only `npm audit --omit=dev` reported 18 dependency advisories: 15 high and 3 moderate, with no critical advisory. Exploitability in this application is not established. This is a security backlog and a stop-ship input for high-risk changes, not proof of compromise.
- The existing recovery work proves an exact-role database restore, restoration and hash verification of all 136 current Storage objects, and local core Supabase service function.
- Full application recovery, external-configuration parity and exact Realtime production parity remain unproven. The recovery lab's Realtime image migrated local schema beyond production.

Two deployed edge functions deserve authorization review before the safety controller trusts them: `setup-admin` can create or reset an administrator using service-role authority without a caller-authentication check, and `trigger-deploy` can invoke the Vercel deploy hook without a caller-authentication check. No exploit was attempted.

Image rename and cleanup paths can delete source objects without a proven quarantine, immutable manifest, hold period, deletion cap, or end-to-end restore rehearsal. They remain stop-ship surfaces for any image work.

### 3.6 Plain-English risk ledger

| Classification | Finding | Why it is classified here | Required disposition |
| --- | --- | --- | --- |
| P0 now | Discoverability/citability contract is red | The sitemap includes a redirect, false-`200` route and asset substitution is live, and shared identity assets are invalid. Intended pages are not reliably identified by status and content. | Keep releases frozen once the gate exists. Build AP1 protection first, then repair under AP2. |
| P0 now | Complete transaction result is unproven and has a false-success counterexample | Six active size rows in the deployed snapshot lack Stripe mappings, and `/checkout/success` claims payment success without verifying the session. | Do not claim a complete live path. Build the AP1 transaction-readiness layers, then repair and prove AP3 separately. |
| P0 safety gap | No enforceable prevention, live canary, release freeze, alert path or qualified rollback target | A new regression can deploy from unprotected `main` and remain silent. | AP1 is the next implementation package if approved. |
| P0 safety gap | `setup-admin` and `trigger-deploy` lack caller-authentication checks in deployed code | Misuse could affect control of the store or releases. Exploitability was not tested, so this is a proven authorization defect and a potential incident, not a claim of compromise. | Treat as stop-ship for relying on these functions. Perform a separately approved safe authorization review and repair. |
| P0 safety gap for image work | Rename/cleanup can delete the only recoverable object without the required quarantine controls | A destructive admin action could remove active customer/search assets. | Keep destructive image work disabled or unused until AP4 proves snapshot, manifest, quarantine, limits and restore. |
| Important but non-P0 on current evidence | 18 production-dependency advisories, 15 high and 3 moderate | Advisory presence is proven; reachability and exploitability in this store are unmeasured. | Triage before high-risk changes. Do not claim compromise or safety without analysis. |
| Important but non-P0 | Server-render build warnings and absent test/typecheck scripts | They weaken prevention and can conceal hydration defects, but the sampled public pages rendered. | Add fail-closed checks and targeted tests in the approved safety work. |
| Important but non-P0 | Duplicate Vercel project deploys the same repository | It creates authority, cost and accidental-change risk but does not currently own the production domains. | Identify owner and purpose before changing either project. |
| Important but non-P0 | Full application/external-configuration recovery and exact Realtime parity remain unproven | Database and Storage recovery are strong, but whole-system recovery cannot yet be claimed. | Complete WS0 proof before stateful changes or broader rollback claims. |
| Safe to defer from AP0/AP1 | Blog tile UI, broader blog work and distribution campaigns | They do not establish the three P0 protections. | Revisit only after the safety foundation and P0 repairs. |
| Safe to defer from AP0/AP1 | Full AEO/GEO citation, entity and referral analysis | The bounded technical evidence is sufficient to expose current route/identity defects; the full distribution study is not a safety prerequisite. | Resume under the later measured-distribution workstream. |

## 4. Proposed current-production P0 canaries

These canaries are intended to expose current failures. They must not grandfather known defects as acceptable baselines.

### 4.1 Availability canary

Proposed check ID: `p0-availability-fast`.

Run every two minutes from two independent public locations, with one confirmation retry from a different location. Initial locations should include Milan and a second European location supported by the selected provider.

Check:

- DNS resolution and TLS validity for apex and `www`.
- Homepage status, `text/html`, and a stable visible store sentinel.
- A fixed representative product in addition to a second product selected from the current sitemap.
- Critical CSS, JavaScript, product image, organization logo and Open Graph image as their expected content types.
- Browser render and a visible product-grid sentinel.

Incident objective: a confirmed failure starts the incident workflow within five minutes of first failure. This objective is proposed, not yet operating.

### 4.2 Discoverability and citability canaries

Proposed check IDs:

- `p0-discoverability-fast`, every two to five minutes.
- `p0-route-contract-hourly`, every hour.
- `p0-route-ua-matrix-daily`, once per day and after every release.

Fast checks:

- `robots.txt` is crawlable and advertises the intended sitemap.
- The sitemap is valid XML, has the expected route count range and manifest hash, and contains required commercial pages.
- Homepage and representative product return server-delivered `200 text/html` with no `noindex`, one effective title, description, canonical and primary H1, plus the expected page identity.
- Canonicals are HTTPS, on the intended host and self-referential.
- The declared logo and social image return an actual image content type.

Hourly full route contract:

- Every sitemap URL returns `200`, indexable HTML and a self-canonical.
- No sitemap URL redirects or declares another canonical.
- Known aliases redirect directly to their canonical destination.
- Noncanonical variants do not return independently indexable `200` documents.
- One known impossible route and one known impossible asset return `404` or `410`, never homepage HTML.
- `/storie-fatti-scientifici-polpo` returns its own article identity, and `/blog` returns its own index identity, after the separately approved AP2 repair.

Daily and post-release user-agent matrix:

- Ordinary browser, Googlebot Smartphone, Bingbot and OAI-SearchBot.
- Compare status, content type, robots, canonical, title, page sentinel and body hash or normalized identity hash.
- Treat a user-agent-specific identity difference as a confirmed P0 after the second-location retry unless the difference is documented and intended.

### 4.3 Transaction-readiness canaries

Use four tiers. Only Tier A is authorized by this AP0 package if Donato approves implementation.

**Tier A, read-only production journey, every five minutes:**

- Start in a clean browser context.
- Open the homepage, a fixed representative product and a rotating active product.
- Verify the intended product name, canonical size labels and prices.
- Select a size and verify that displayed price, product, size, email link and WhatsApp link remain aligned.
- Verify that checkout is blocked until terms are accepted.
- Do not click checkout and do not create a Stripe session.

**Tier B, checkout handoff, separate approval:**

- Use a dedicated canary product/size and idempotency key.
- Create a Checkout Session and verify the hosted Stripe page shows the exact product, canonical size, amount, currency and non-live completion behavior.
- Do not pay. Automatically expire or otherwise clean up the session using a separately reviewed procedure.

**Tier C, Stripe test-mode end-to-end, separate approval:**

- Complete a test-mode payment.
- Verify signed server-side payment confirmation, idempotent order handling, cart behavior and the required post-payment result.

**Tier D, live low-value proof, separate explicit approval:**

- Use a controlled SKU, supplier-suppression plan, named payer, accounting treatment and refund procedure.
- This is the only tier that can help prove the real live payment path. It must never run from this package alone.

The production transaction contract also requires a full read-only catalogue validator: every publicly purchasable product/size must have an active lifecycle, positive price, canonical dimension and exact Stripe mapping. Any mismatch is red, even if the sampled browser product works.

### 4.4 Monitor-the-monitor checks

- Send a weekly all-clear through both WhatsApp and email.
- Run a monthly controlled incident drill without touching production state.
- Alert if any P0 monitor, evidence store, release-freeze check, WhatsApp path, or email path is disabled, stale, over quota or failing authentication.
- Record provider plan limits and cost before activation. They are currently unmeasured.

### 4.5 P0 ownership and recovery matrix

| Outcome | Prevention test | Live canary | Detection objective | Diagnostic start | Recovery action | Owner state |
| --- | --- | --- | --- | --- | --- | --- |
| Available | Built artifact and Preview must return the intended route and asset identities, then production must pass the same contract | `p0-availability-fast` | Confirmed signal within five minutes | DNS/TLS, Vercel, deployment, route, asset and frontend-runtime evidence | One eligible rollback attempt for an attributable reversible release regression; otherwise provider or recovery playbook | Automated controller owns first response. Donato must appoint a human incident/release owner before activation. |
| Discoverable/citable | Route registry, SSG/head, sitemap, canonical, robots and negative-route tests fail closed | Fast sentinel, hourly full route contract, daily and post-release user-agent matrix | Confirmed broad failure within five minutes; full-matrix drift at its next scheduled run | Route/SSG/head, data snapshot, asset and user-agent comparison | Eligible rollback for a new attributable regression; AP2 repair for the current pre-existing incident | Automated controller owns first response. Human owner remains unassigned pending Donato's approval. |
| Transactable | Catalogue lifecycle, canonical size, price and Stripe mapping contract, plus approved checkout/payment layer | Tier A read-only every five minutes; Tier B through D only after separate approvals | Readiness failure within five minutes at Tier A; higher-tier objective set when authorized | Catalogue/data, browser, Supabase and Stripe boundary evidence | Eligible rollback only for reversible code regression; never for payment/provider/state corruption | Automated controller owns first response. Human owner remains unassigned pending Donato's approval. |

Activating AP1 without a named human incident/release owner would itself violate the stop-ship contract. Donato does not need to perform technical diagnosis, but must designate who receives escalation and who can clear the release freeze.

## 5. Automatic incident and recovery workflow

### 5.1 Event sequence

1. **Accept only a verified monitor event.** Verify the Checkly webhook signature or the equivalent provider signature before processing. Reject stale or replayed events.
2. **Deduplicate.** Use a key composed of check ID, production deployment ID and first-failure time window. One incident gets one controller run.
3. **Freeze releases first.** Set a durable incident flag consumed by every production promotion path. No new deployment or data-refresh direct push may bypass it.
4. **Preserve evidence.** Record UTC time, URL, user agent, location, status, content type, selected safe headers, body hash and minimal safe excerpt. For browser checks, retain a screenshot and trace. Record the Vercel project/deployment IDs, Git commit, route/data manifest hashes, and relevant build/runtime log references. Never store secret values, full environment files, checkout/customer data, access tokens or payment details.
5. **Confirm independently.** Retry once from a different public location. Browser-only failures get a clean-context rerun. Do not create retry storms.
6. **Classify.** Assign the failure to DNS/TLS, Vercel/deployment, routing/SSG/head identity, generated data/assets, frontend runtime, Supabase, Stripe, or another external provider. Preserve `unknown` when evidence does not support a class.
7. **Compare against a qualified target.** Run the same relevant canary against the last independently qualified production deployment and compare deployment, commit and manifest identity.
8. **Apply the rollback gate.** Roll back once only if every eligibility rule in Section 7 passes. Otherwise keep the freeze, continue evidence capture and alert without rollback.
9. **Alert after action has started.** WhatsApp and email state customer impact, first detection, evidence, classification, actions already taken, rollback state and the next human decision. Do not send secrets or personal/payment data.
10. **Confirm recovery.** Require the full three-P0 production contract, not merely the failed check, to pass after any response. Keep releases frozen until Donato or a named release owner reviews the evidence and manually clears the incident.

### 5.2 Diagnostic classes and automatic action

| Class | Examples | Automatic action | Automatic rollback? |
| --- | --- | --- | --- |
| Deployment regression | New commit changes route identity, storefront render or checkout mapping | Freeze, capture, compare current and qualified prior target | Only if every rule passes |
| DNS/TLS or Vercel provider outage | Resolution, certificate, edge or control-plane failure affecting both versions | Freeze, capture provider status and multi-location evidence | No |
| Supabase/Stripe/third-party outage | Both current and prior targets fail the same dependency | Freeze, capture, alert and monitor recovery | No |
| Pre-existing incident | Failure existed before the latest production deployment | Freeze further releases and open repair work | No |
| Unknown data corruption | Catalogue, price, order or asset state has unexplained divergence | Freeze, preserve evidence and isolate state | No |
| Irreversible or stateful change | Schema, payment, order, deletion or external side effect cannot be undone by code alias change | Freeze and use the approved recovery playbook | No |
| Eligible reversible code regression | Confirmed after release, absent on the qualified target, no stateful crossing | One rollback attempt, then full recovery check | Yes, once |

### 5.3 Making the freeze enforceable

The current arrangement cannot enforce a freeze because `main` is unprotected, the generated-data workflow can commit directly to `main`, a public function can trigger deployment, and Vercel normally assigns the production domains after a successful production-branch build.

AP1 should propose the smallest enforceable change:

- establish a proper Git clone and controlled working branch;
- protect `main` with required P0 checks and independent review for high-risk changes;
- prevent the generated-data job and deploy hook from bypassing the freeze or required checks;
- make the route/data contract fail closed during build;
- run the complete candidate in Preview, while treating Preview as rehearsal only;
- require a production promotion gate or an equivalent workflow that reads the durable freeze flag;
- require post-release canaries before the deployment becomes the next rollback target.

Vercel documents that Deployment Checks can hold a production deployment away from custom domains until selected GitHub checks pass. The current Hobby plan's exact feature availability and cost must be confirmed before choosing this mechanism. If unavailable, AP1 must propose an equivalent explicit promotion workflow rather than silently weakening the gate. Vercel Rolling Releases require Pro or Enterprise and are optional, not assumed.

## 6. Required approvals, accounts and inputs

No secret is requested in this document. No secret value should be pasted into chat, a ticket, a document, source control, browser code or an alert. After approval, secrets should be entered directly into the chosen server-side secret store by an authorized owner.

### 6.1 Donato's business approvals

| Approval | Exact decision needed |
| --- | --- |
| Incident contract | Accept the equal-P0 definitions, the five-minute proposed detection objective, the pre-existing discoverability incident, and manual release unfreeze. |
| Monitoring provider | Approve Checkly or require an equivalent independent provider. Approve plan, cadence, public locations, retention and budget after current price/limit verification. |
| Alert recipients | Name the WhatsApp number and email recipient(s), confirm business-message consent/opt-in where required, and name a backup recipient. |
| Alert content | Approve the WhatsApp utility template and email format, including the rule that no customer/payment data or secrets appear. |
| DNS | Authorize the exact SPF/DKIM records for a dedicated Resend subdomain after they are shown for review. DMARC is a separate staged decision. |
| Release control | Authorize GitHub branch/ruleset changes, Vercel promotion gating, deploy-hook restriction and the durable release-freeze mechanism. |
| Rollback authority | Authorize one automatic rollback only under every eligibility rule in Section 7, with no loop and mandatory recovery confirmation. |
| Data handling | Approve evidence fields, retention, storage region/access and deletion policy. |
| Drills | Approve weekly alert-path health and a monthly non-destructive incident drill. |
| Transaction tiers | Approve Tier B, C or D separately. This package approves none of them automatically. |

### 6.2 Checkly or equivalent independent monitor

Accounts/roles:

- An organization-owned monitor account and billing owner.
- An administrator able to create projects, locations, API keys and alert channels.
- A least-privilege CI/service identity for infrastructure-as-code deployment.
- A named human owner for monitor health and plan limits.

Non-secret configuration:

- Account/project name and account ID.
- Check IDs, schedules, locations, retry policy and retention.
- Signed webhook endpoint URL.
- GitHub repository and Vercel project/deployment identifiers.

Secret inputs to create later:

- `CHECKLY_API_KEY`
- `CHECKLY_WEBHOOK_SECRET`

Checkly documents `CHECKLY_API_KEY` plus `CHECKLY_ACCOUNT_ID` for CLI authentication, and signed webhooks using a webhook secret. The account ID is an identifier, not a secret, but it should still be managed as configuration. Checkly also supports retrying from another location. Exact plan coverage, quotas and price are unmeasured and must be checked at approval time.

### 6.3 Meta WhatsApp Business Platform

Accounts/roles:

- A business-owned Meta Business Portfolio.
- A WhatsApp Business Account (WABA).
- A Meta app with the WhatsApp product.
- A registered sender phone number and its phone-number ID.
- An authorized system user/service identity with only the needed WhatsApp permissions.
- A WhatsApp Manager owner able to submit and maintain the incident utility template.
- The recipient number and documented consent/opt-in appropriate to the use.

Non-secret configuration:

- Business Portfolio ID, WABA ID and phone-number ID.
- Current supported Graph API version selected during implementation.
- Approved template name, language/locale and variables.
- Alert recipient number, treated as personal data.

Secret inputs to create later:

- `META_WHATSAPP_ACCESS_TOKEN`
- `META_APP_SECRET` if status/inbound webhooks are verified
- `META_WEBHOOK_VERIFY_TOKEN` if a webhook subscription is configured

Meta's official WhatsApp collection documents the `whatsapp_business_messaging` and `whatsapp_business_management` permissions, a phone-number ID, an access token, and an approved message template for template notifications. It recommends a system-user token for longer-lived server operation. Token lifetime and the current Graph API version must be verified when the account is configured, not copied from an old example.

### 6.4 Resend email

Accounts/roles:

- An organization-owned Resend account/team and billing owner.
- A domain/DNS owner.
- An administrator able to add a domain, create a least-privilege sending key and configure webhooks.

Non-secret configuration:

- Dedicated sending subdomain, proposed example `alerts.octowonders.com`, subject to DNS review.
- Sender and recipient addresses.
- Webhook endpoint and selected delivery events if delivery confirmation is enabled.

Secret inputs to create later:

- `RESEND_API_KEY`, using sending-only permission restricted to the approved domain
- `RESEND_WEBHOOK_SECRET`, if delivery webhooks are enabled

Resend requires SPF and DKIM to verify a domain and recommends a subdomain to isolate sending reputation. A sending-only API key can be restricted to one domain and is shown only once. Signed delivery webhooks can verify delivery events. Use an idempotency key for each incident email to prevent duplicates.

### 6.5 Incident controller, GitHub and Vercel

Accounts/roles:

- A server-side controller runtime independent enough to receive monitor alerts when the storefront is impaired.
- A durable incident/evidence store with named access and retention.
- A least-privilege GitHub App or service identity able to publish the P0 status and enforce the freeze workflow.
- A least-privilege Vercel service identity able to read deployment evidence and perform a rollback only if approved. Team/project IDs remain non-secret configuration.

Potential secret inputs to create later:

- `INCIDENT_WEBHOOK_SECRET` or provider-specific signature secret
- `GITHUB_APP_PRIVATE_KEY` or an equivalent short-lived credential
- `VERCEL_TOKEN` if the final design cannot use a more narrowly scoped integration

The AP1 design must minimize these permissions. It must not reuse Donato's personal session or expose provider credentials to the browser.

## 7. Rollback eligibility definition and rehearsal

### 7.1 Every rule must pass

Automatic rollback is eligible only when:

1. The incident began after one identified production deployment.
2. The relevant P0 canary passed immediately before that deployment and failed after it.
3. A retry from a second location confirms the failure.
4. Evidence attributes the failure to that deployment, not to an external provider or shared dependency.
5. The target previously served production and passed the same current three-P0 contract after its release.
6. The target does not share the failure.
7. The change did not cross a database schema, payment/order, deletion, credential, DNS or other irreversible/stateful boundary.
8. The target's required external configuration remains compatible. Vercel warns that Instant Rollback restores an old build while current environment variables remain in place.
9. No rollback is already in progress and the incident key has not used its one attempt.
10. Evidence capture and release freeze completed before the rollback call.

After one rollback attempt, the controller must stop. If the full P0 contract does not recover, it keeps the release freeze, marks rollback ineffective, sends an updated alert and waits for human direction.

### 7.2 Rehearsal against the current baseline

| Gate | Current deployment `dpl_Cts...` as source | Previous deployment `dpl_ioq...` as target |
| --- | --- | --- |
| Exact identity known | Pass | Pass |
| Previously served production | Pass | Pass |
| Platform marks target rollback-eligible | Not applicable | Pass |
| Same full P0 contract passed | Fail, discoverability is red and transaction completion is unproven | Unknown |
| Target independently probeable on immutable URL | Not required for current source | Fail for this AP0 probe, Vercel authentication returned `302` |
| Target does not share failure | Unknown | Unknown |
| External configuration compatible | Unknown | Unknown |
| Stateful boundary absent | Unknown without a release manifest | Unknown |
| Full-application recovery proven | Fail | Fail |

Rehearsal result: **automatic rollback is ineligible today**. This is the safe outcome. The phrase “current healthy deployment” in the task is contradicted by the measured P0 contract. The deployment is an operational baseline candidate, not a qualified rollback target.

No rollback was executed. AP1 must create a qualified-target record only after a deployment passes the full production contract and records its commit, deployment, route/data/assets manifest, compatible external-configuration fingerprint, stateful-change declaration and evidence references.

## 8. Customer journey, affected behavior and risk

### 8.1 Casual iPhone 11 journey

The intended journey is: open the shop, browse visible art, open the intended product, choose one canonical size, see the exact price, accept terms, reach Stripe with the same product/size/amount, complete payment, receive a server-verified confirmation, and receive the required post-payment result.

AP0 proves only the browse through size/price-selection portion in one existing Chrome session. It does not prove clean-session behavior, Safari/iPhone layout, checkout handoff, live payment, supplier behavior, order finalization, refund, or server-verified success. Those remain explicit stop-ship evidence gaps.

### 8.2 Behavior affected by approval

If approved, AP1 may design and later implement:

- independent read-only production checks;
- evidence capture and incident classification;
- enforceable release freeze and promotion gates;
- signed WhatsApp and email alerts;
- the one-attempt rollback controller with the strict gate above;
- weekly path health and monthly rehearsal.

Unaffected until separate approval:

- customer-facing design and copy;
- catalogue, product, price and Stripe data;
- blog, sitemap and routing implementation;
- GSC validation/indexing;
- live transactions and refunds;
- image rename/cleanup;
- DNS, Meta, Resend, Vercel, Supabase, Stripe and GitHub settings.

### 8.3 Why this is not a symptom patch

The intervention defines one testable contract shared by prevention, live detection, diagnosis and recovery. It does not call a deployment healthy because Vercel says `READY`, because routes return `200`, or because one checkout button is visible. It requires the same customer/search/payment invariants before release and after recovery.

### 8.4 Falsifier and worst credible outcome

One observed outcome that immediately falsifies the proposed protection is: a release reaches the public domains while a required P0 check is red or the release-freeze flag is set.

The worst credible automation outcome is an incorrect rollback during an external outage or stateful/payment incident, followed by a loop that changes code while data and provider state remain incompatible. The design prevents this with attribution, a qualified-target manifest, explicit stateful exclusions, one attempt, a durable incident key and manual unfreeze.

## 9. Evidence, counterexamples, unknowns and contradictions

### Proven evidence

- Exact GitHub head and exact Vercel production provenance.
- No proper Git clone in the authorized workspace.
- Exact match for 22 sampled high-risk local files against the deployed commit.
- Current 32-URL sitemap behavior, user-agent samples, false-`200` counterexamples and broken image endpoints.
- Sampled product browse/selection behavior.
- Exact deployed-snapshot catalogue mapping gaps.
- False payment-success behavior without session verification.
- Current absence of branch protection, required checks, tests and enforceable freeze.
- Vercel's platform rollback candidate and duplicate-project evidence.

### Counterexamples that defeat a green baseline

- A nonexistent route and nonexistent asset both return homepage HTML with `200`.
- A sitemap URL redirects to a different page.
- The success page claims successful payment without a Stripe session.
- Six active size rows lack Stripe mappings in the exact deployed snapshot.
- The declared logo is HTML and the default social image is `404`.

### Unknowns that must remain unknown

- Whether production Supabase data currently matches the generated snapshot exactly.
- Whether every active product/size can hand off to the correct live Stripe price.
- The real live payment, order and post-payment path.
- Safari/iPhone 11 behavior and clean-session behavior.
- The previous deployment's complete route, search and transaction contract.
- Full external-configuration parity and full-application recovery.
- Who owns or needs the duplicate Vercel project.
- Existing Checkly, Meta WhatsApp and Resend account state, roles, plan limits and cost.
- Final monitor provider, controller host, evidence retention and storage region.
- Whether Vercel Deployment Checks are available on the observed Hobby plan.

### Contradictions with the handoff or task

- No contradiction was found among the four controlling documents.
- The task's wording “current healthy deployment” conflicts with current measured P0 evidence. This package therefore uses “operational baseline candidate”. Treating it as healthy would violate the handoff's stop-ship conditions.
- The store's normal usability is not contradicted by the sampled browse evidence. It is insufficient to prove the three equal P0 outcomes.
- The footer's runtime-generated “Build” time conflicts with its apparent meaning and must not be used as deployment provenance.

### Evidence limitations

- Production HTTP measurement was a bounded read-only pass, not continuous or geographically representative monitoring.
- The browser session was Chrome-based and not clean or incognito. It already showed a cart count of two. No cart or transaction mutation was made.
- Direct immutable deployment URLs were protected by Vercel authentication during repeated probes, so prior-target route equivalence remains unknown.
- Local lint/build/tests were not run because dependencies were absent. No dependency installation was authorized.
- The requested EOS audit skill path was unavailable. The analysis therefore used the controlling handoff's evidence/counterexample/unknown discipline and did not treat the missing optional skill as a substitute source.

## 10. Official provider references used for the proposal

- Checkly CLI authentication: <https://www.checklyhq.com/docs/cli/authentication/>
- Checkly signed webhooks and retries: <https://www.checklyhq.com/docs/integrations/alerts/webhooks/>
- Checkly locations: <https://www.checklyhq.com/docs/concepts/locations/>
- Checkly retry behavior: <https://www.checklyhq.com/docs/communicate/alerts/retries/>
- Meta's official WhatsApp Business Platform collection: <https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api>
- Meta template-message request: <https://www.postman.com/meta/whatsapp-business-platform/request/o65u5m5/send-message-template-text>
- Resend API keys: <https://resend.com/docs/dashboard/api-keys/introduction>
- Resend domain verification: <https://resend.com/docs/dashboard/domains/introduction>
- Resend send-email API and idempotency: <https://resend.com/docs/api-reference/emails/send-email>
- Resend webhook verification: <https://resend.com/docs/webhooks/verify-webhooks-requests>
- Vercel Deployment Checks: <https://vercel.com/docs/deployment-checks>
- Vercel Instant Rollback: <https://vercel.com/docs/instant-rollback>
- Vercel Rolling Releases: <https://vercel.com/docs/rolling-releases>

## 11. Approval boundary and next action

Approval of this package is permission to prepare and present the AP1 implementation changes. Before any external account, DNS, GitHub, Vercel, monitoring, Meta or Resend setting is changed, the exact proposed changes, owner, cost, permission scope and recovery procedure must be shown to Donato.

Until approval:

- do not change application code or external settings;
- do not call the current deployment P0 healthy;
- do not enable automatic rollback;
- do not perform a purchase, refund or checkout-session canary;
- do not implement the blog/sitemap repair or request indexing;
- do not enable destructive image operations;
- do not represent Preview, local recovery or planning as production proof.

The next valid action is to prepare the AP1 implementation plan in the proper local clone. Nothing may be sent live until the relevant external changes are presented to Donato and separately approved.
