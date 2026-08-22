# OctoWonders Stage 0 Progressive Handoff

**Prepared:** 2026-08-23, Europe/Rome

**Purpose:** Continue the stabilization program in a fresh Codex task without losing authority, evidence, approvals, prohibitions, or the exact point at which work paused.

**This handoff records progress. It does not replace the 2026-08-21 controlling handoff. If two documents conflict, follow the authority order below and stop to report the conflict.**

## Quick orientation

- The public shop is working and must be preserved. This is minimal hardening, not a redesign.
- AP0 is complete. AP1 was approved under safeguards. AP1A is complete in an isolated local work area.
- Stage 0 Change 1 is complete: a held GitHub branch named `production` was created from the exact current public source. It remains identical to `main` at the recorded starting point.
- Stage 0 Change 2 has not been approved or executed. It would change one Vercel field so that future changes to `main` no longer go straight to the public shop.
- No application code, public deployment, production data, payment setting, domain, monitoring account, alert channel, indexing request, or automatic rollback setting was changed by Codex.
- Payment work is paused. Do not perform checkout, purchase, refund, or payment changes.
- Automatic rollback remains disabled. Reopening releases remains Donato's manual decision.
- Exact next action: present Stage 0 Change 2 again, wait for a fresh, specific `go`, inspect the live value, and change nothing if the live screen differs from the recorded starting value.

## 1. Mandatory priming before any substantive action

Read every item completely. Do not act from excerpts or from this summary alone.

1. Entry point:
   `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/FULL-CODE-OCTOWONDERS.COM/docs/handoffs/CURRENT.md`
2. Original controlling handoff:
   `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/FULL-CODE-OCTOWONDERS.COM/docs/handoffs/2026-08-21-stabilization-handoff.md`
3. Comprehensive action plan:
   `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/FULL-CODE-OCTOWONDERS.COM/docs/2026-08-22-stabilization-action-plan.md`
4. SEO differential and repair brief:
   `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/FULL-CODE-OCTOWONDERS.COM/docs/2026-08-21-seo-differential-repair-brief.md`
5. Current worktree entry point:
   `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/art-blitz-now/.worktrees/ap1a-local-safety-gate/docs/handoffs/CURRENT.md`
6. This progressive handoff:
   `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/art-blitz-now/.worktrees/ap1a-local-safety-gate/docs/handoffs/2026-08-23-stage0-progressive-handoff.md`

If any requested file is missing, inaccessible, or not the exact item named, stop and tell Donato exactly which item could not be read. Do not substitute another source.

## 2. Authority order

Use this order when deciding what controls:

1. Donato's newest explicit instruction.
2. The original controlling handoff's authority order, current workstream ledger, annotation register, stop-ship conditions, subsequent decisions, Immediate next task, and acceptance test.
3. The comprehensive stabilization action plan.
4. The SEO differential and repair brief when its evidence is relevant.
5. Approved decision and approval documents routed by `CURRENT.md`.
6. This progressive handoff and the evidence documents it cites.
7. Older planning notes or historical evidence.

Do not silently reconcile a real contradiction. Preserve it, explain it plainly, and stop before any affected action.

## 3. Governing course

The public MVP normally works, although its implementation is not well designed. Rewriting remains deferred until after the go-to-market and automated distribution experiments. Search visibility is especially important because it directly affects those experiments.

The three equal P0 outcomes are:

1. **Available:** the shop and critical product pages remain reachable and usable.
2. **Discoverable and citable:** intended pages remain crawlable, indexable, correctly identified, and technically available to search and answer engines.
3. **Transactable:** a customer can move from liking an artwork through the correct product, size, and price to confirmed payment and the required post-payment result.

Failure of any one outcome is a P0 incident. If a change causes it, it is also a P0 regression.

Use aggressive detection and conservative action. Judge a suspected bug by the malfunction it could credibly originate, not by whether the code looks old, strange, inefficient, or inelegant. Touch as little as possible. Do not wake the sleeping dog.

Do not improve speed, efficiency, response, architecture, or elegance unless the issue is search performance, loading speed, or an unacceptable pause. P2 conditions are documented and left alone. Suspicious or poorly understood old behavior moves to P1 pending evidence, not directly to a rewrite.

The authoritative verbatim vision and severity principles appear once, in:
`docs/2026-08-22-bug-fixing-guidelines.md`.
Do not duplicate or silently paraphrase that governing text into another policy document.

## 4. Donato's operating decisions

- Donato Marco Mangialardo is the business owner and accountable release and incident decision owner.
- Primary incident contact: Donato through WhatsApp. His contact details were provided in the conversation and must not be copied into new project documents, logs, commands, or tool output.
- Email is a secondary alert channel through Resend after approval and setup.
- There will not be an independent engineer. The operating pair is Donato, a skilled product manager, and Codex, the technical preparer, checker, and adviser.
- Codex evidence review is not independent human approval and must never be represented as such.
- GitHub protections should therefore require zero GitHub reviewer approvals while still requiring a pull request and the appropriate automatic safety check.
- Donato's approval remains a documented operating step even when the platform cannot machine-enforce it.
- Every outside setting change must be presented in plain English with its exact current value, proposed value, scope, risk, reversal, and checks before execution.
- Work pauses at meaningful milestones or roughly every twenty minutes. Report what changed, what was learned, issues, and the next exact action. Ask for Donato's greenlight.
- When waiting for Donato, play `/System/Library/Sounds/Glass.aiff` with `afplay` if available.
- Use an outside specialist if evidence is ambiguous or the action reaches payments, stored data, credentials, irreversible state, or an unfamiliar platform failure.

## 5. Exact repositories and local state

### Public GitHub source

- Repository: `donatomm/art-blitz-now`
- Default branch: `main`
- Recorded current `main` head: `063cf2a3dbadd913e5e37c11703d52b52a82a340`
- Commit message: `Corretto messaggio legge`
- Commit time: 2026-08-22 22:34:52 UTC, which is 2026-08-23 00:34:52 in Rome

### Isolated local work area

- Path: `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/art-blitz-now/.worktrees/ap1a-local-safety-gate`
- Branch: `codex/ap1a-local-safety-gate`
- Recorded local head before this handoff: `f4eb8422a4be99b840c58dcd1dbaa23e5b91a998`
- Merge base with current remote `main`: `ffe0b380166bd6b9bae7e3d89711a1078867e41d`

Important: the local AP1A branch is not based on current `main`. It contains the older source at `ffe0b380...` plus local safety tests, workflow preparation, plans, and evidence. It must be reconciled onto current `main` before any later proposal to publish the safety bootstrap. Do not pretend the local branch already contains the current public application source.

At the handoff checkpoint, the worktree was clean. No local branch was pushed.

## 6. Exact public hosting provenance

### Public Vercel project

- Project name: `art-blitz-now`
- Project ID: `prj_RQiswgJu779Ix9Lb0ffAIExPkzFh`
- Team ID: `team_7lQ6krgKtZ3LWkZ3E8GWlPu7`
- Recorded public deployment: `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo`
- Permanent deployment URL: `art-blitz-oksaqdptu-dmm-projects.vercel.app`
- Created: 2026-08-23 00:36:13 Rome time
- Ready: 2026-08-23 00:37:02 Rome time
- Recorded state: `READY`, production target
- Source: GitHub `main` at `063cf2a3dbadd913e5e37c11703d52b52a82a340`
- Public aliases include `octowonders.com` and `www.octowonders.com`.
- Recorded effective public branch: `main`

### Duplicate Vercel project

- Project name: `project-7k6aq`
- Project ID: `prj_VGbGjB0mV38hWzQ87gBbQyLdcTpJ`
- It is connected to the same GitHub repository.
- The gathered evidence did not show the OctoWonders public domains attached to it.

Do not modify, delete, consolidate, or otherwise touch the duplicate project during Stage 0.

## 7. Intended product-page GUI change

Donato made and confirmed one intended visual-guidance change in `src/pages/Product.tsx`. The complete source comparison from the prior version `9760359...` to the recorded current version `063cf2a...` showed:

- two Lovable plan files;
- `src/pages/Product.tsx`, with 10 additions and 6 removals.

The product change:

- adds a red arrow when the terms box is required but unchecked;
- adds a red border and light red background in that error state;
- shortens the checkbox label so it ends at the terms PDF link;
- changes the helper text to `La legge dice che devi prima fare questo click ...`;
- clears those indicators when the box is checked.

The source comparison found no change to the existing terms requirement, buy handler, checkout connection functions, prices, validation rules, or URLs. This is source evidence, not a completed checkout proof and not a legal judgment.

The screenshot supplied in conversation was temporary evidence only. Do not use its temporary path as a canonical source.

## 8. Current public-store evidence

The current rebaseline was performed after the recorded 00:36 public build.

### Availability

- The intended homepage and checked pages were available.
- All 20 checked product routes returned 200.
- The owner-approved catalogue label `2x9060` was visible at `/product/polpo-octopus-blue-wow-stampa-tela`.
- The general catalogue rule is that orientation does not change the product: `N×M` and `M×N` are equivalent. The exact label `2x9060` is valid owner content and is not a bug.

### Discoverability and identity

- Sitemap: 200 XML, 32 URLs, 32 unique URLs.
- 31 intended pages returned 200.
- `/storie-fatti-scientifici-polpo` returned 308 to `/blog`.
- All 32 checked intended URLs had one title element, but 30 used conflicting title content.
- All 32 had one description element, but 31 used conflicting description content.
- The redirected article was the only checked intended URL without a valid canonical result.
- 22 checked URLs did not have exactly one H1.
- None of the H1s had conflicting words. The H1 conditions remain P1, not P0.
- A made-up `/sitemap.json` path and a made-up page path returned 200 with the exact homepage HTML.
- Counterexample: a made-up file under `/images/` returned a real 404, so the false-homepage fallback does not affect every asset path.
- `/logo.png` returned 200 with homepage HTML instead of a valid image.
- `/artworks/octoheaded.jpg` returned 404.

The current public discoverability result is **65 observed conditions**, grouped as:

- 1 article redirect condition;
- 1 false-homepage fallback condition;
- 30 conflicting titles;
- 31 conflicting descriptions;
- 2 identity-asset conditions.

These are not 65 separate root bugs. They currently map to four root repair groups. Keep condition counts separate from root-cause counts.

### Transaction readiness

Payment work remains paused by Donato. The six payment-related observations remain last-known saved-source evidence and were not rechecked against the current public checkout. Do not merge those saved-source observations into a claimed current total. Do not perform a checkout, purchase, refund, or payment mutation.

## 9. Current source-quality evidence

The exact recorded remote source at `063cf2a...` was checked locally without editing it.

- Lint: 67 errors and 7 warnings.
- TypeScript check: passed.
- The 67-error/7-warning result was exactly unchanged from the earlier baseline.
- The intended `Product.tsx` GUI change introduced no new checker message.

The 67 errors and 7 warnings are code-quality findings in current production source. They are not 74 production failures and must not be assigned severity from the count alone. Their full documented inventory and causal assessment is in `docs/2026-08-22-current-production-code-quality-findings.md`.

## 10. AP1A local safety preparation

The isolated work area contains a prepared local safety foundation:

- 52 safety tests passed at the recorded checkpoint.
- The safety type check passed.
- It separates `P0 Repair Admission` from `P0 Live Store Safety`.
- The prepared workflow is `.github/workflows/p0-safety.yml`.
- The unchanged lint baseline is 67 errors and 7 warnings.

Known bootstrap correction before this workflow can be required on the held public branch:

- repair admission should run for pull requests to `main`;
- live-store safety should run for pull requests and pushes to `production`.

Do not register the strict check on `production` until its trigger can actually report there. Do not publish the local branch as-is. First reconcile it onto current `main`, preserve Donato's intended GUI change, make the smallest trigger correction, retest, and present the complete changed-file list for approval.

## 11. External change ledger

Exactly one outside change has been executed.

### Completed: Stage 0 Change 1

- GitHub branch `production` was created in `donatomm/art-blitz-now`.
- It was created at exactly `063cf2a3dbadd913e5e37c11703d52b52a82a340`.
- The post-create comparison showed zero files different, zero commits ahead, and zero commits behind relative to that exact starting version.
- The public Vercel deployment and aliases remained on `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo`.
- The homepage, product page, and `2x9060` evidence remained available.
- No new Vercel deployment became the latest as a result of branch creation.

Evidence: `docs/evidence/2026-08-23-stage0-change1-held-production-branch.md`.

### Not changed

- Vercel Production Branch Tracking
- Vercel domains, aliases, deployments, or other settings
- GitHub default branch, files, protections, or rulesets
- public application code
- Supabase or other production data
- Stripe or other payment settings
- DNS
- monitoring
- WhatsApp or Resend accounts and settings
- Lovable settings
- indexing or Google Search Console state
- rollback state

## 12. Exact next task: Stage 0 Change 2

Stage 0 Change 2 has not been approved. Earlier general approvals and earlier uses of `go` do not authorize this exact pending save. Present it again and wait for a fresh, specific greenlight.

### Proposed one-field change

- Account and project: Vercel project `art-blitz-now` only, ID `prj_RQiswgJu779Ix9Lb0ffAIExPkzFh`.
- Screen: `Settings` → `Environments` → `Production` → `Branch Tracking`.
- Recorded current value: `main`.
- Proposed value: `production`.
- No other Vercel value may change.

### Plain-English purpose

Today, a new change on `main` can become public. This one-field change tells Vercel that only the held `production` branch is allowed to feed the public shop. The current public files should remain the same because `production` was created as an exact copy of the current public source.

### Before saving

Perform read-only checks and stop if any fails:

1. GitHub `main` is still exactly `063cf2a3dbadd913e5e37c11703d52b52a82a340`.
2. GitHub `production` is still identical to that exact version.
3. The public aliases still serve `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo`.
4. The live Vercel screen is visible in Donato's signed-in browser.
5. Production Branch Tracking exists and its live value is exactly `main`.

If the field is absent, unreadable, differently named, or not exactly `main`, do not save. Report the actual screen and wait.

### Execution

After Donato gives the fresh, specific approval:

1. Change only Branch Tracking from `main` to `production`.
2. Save once.
3. Do not touch any adjacent option.

### Immediate confirmation

1. Confirm the field now reads `production`.
2. Confirm `octowonders.com` and `www.octowonders.com` still point to `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo`.
3. Confirm the homepage and the checked product page remain available and visually consistent.
4. Confirm `2x9060` remains visible.
5. Confirm no unexpected public deployment has replaced the recorded deployment.
6. Stop, report evidence and counterexamples, play the waiting sound, and ask for the next greenlight.

### Failure response

Vercel may rebuild or reclassify something when the field is saved. If the public aliases unexpectedly move or the shop changes, stop immediately. Restore the aliases to `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo` only if that exact recovery action is clearly available and within the previously presented reversal. Do not continue to later Stage 0 changes. Preserve evidence and report what happened.

If a signed-in Vercel screen cannot be reached or inspected, stop. Do not infer the value from documentation or use a different project.

## 13. Later Stage 0 sequence, each with a separate approval

Do not bundle these actions with Change 2.

1. Reconcile the isolated safety branch onto current `main`, preserving the Product GUI change.
2. Correct the workflow trigger so each safety check reports on the branch it will protect.
3. Run the complete local tests and checks again.
4. Perform a separate Codex evidence-review pass and clearly label it as non-independent review.
5. Show Donato the complete changed-file list and the evidence. Wait for approval.
6. Publish only the approved safety bootstrap through a pull request to `main`, after `main` is no longer the public branch. Confirm Vercel produces only a non-public preview.
7. Register these exact automatic check names:
   - `P0 Repair Admission`
   - `P0 Live Store Safety`
8. Protect `main` with a required pull request, zero required GitHub approvals, resolved conversations, `P0 Repair Admission`, latest branch version, no force push, no deletion, and no routine bypass.
9. Protect `production` with a required pull request, zero required GitHub approvals, resolved conversations, `P0 Live Store Safety`, latest branch version, no force push, no deletion, and no routine bypass.
10. Keep `production` frozen while strict live-store safety is red because the existing search P0 conditions remain.

Stage 1 repair is not authorized by completing Stage 0. It requires a separate approval after the release hold is proven.

## 14. Rollback and incident rules

- `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo` is a recorded manual restoration target for a later change-caused regression.
- It is not a fully healthy automatic rollback target because the existing discoverability P0 conditions are present in it.
- Automatic rollback remains disabled until a qualified healthy target exists.
- Never automatically roll back an external-provider outage, a pre-existing incident, an unknown data-corruption event, an irreversible stateful change, or an unknown cause.
- Never create a rollback loop.
- Preserve evidence, classify the incident, freeze releases, isolate cause, and alert only through an approved and configured path.
- Release reopening remains Donato's manual decision.

## 15. Stop conditions

Stop before acting if any of these occurs:

- a mandatory source is missing or inaccessible;
- current GitHub, Vercel, domain, or deployment evidence differs from this handoff;
- the exact setting is not visible or differs from the presented current value;
- a step would touch a second project or an adjacent setting;
- a public alias moves unexpectedly;
- a new public build appears;
- current evidence cannot distinguish a new regression from a pre-existing condition;
- work reaches payment, stored data, credentials, irreversible state, or destructive image handling;
- a requested action would deploy application code, mutate production data, request indexing, perform checkout, purchase, or refund;
- a repair would begin before its separate approval;
- a safe reversal is unclear.

Do not call a preview, a local result, a plan, or a design production proof.

## 16. Important canonical documents

- `docs/handoffs/CURRENT.md`
- `docs/handoffs/2026-08-21-stabilization-handoff.md`
- `docs/approvals/2026-08-23-stage0-exact-release-hold-and-bootstrap-package.md`
- `docs/evidence/2026-08-23-live-rebaseline-after-intended-product-gui-change.md`
- `docs/evidence/2026-08-23-stage0-change1-held-production-branch.md`
- `docs/evidence/2026-08-23-stage0-stop-new-lovable-public-build.md`
- `docs/2026-08-22-bug-priorities-and-staged-repair-plan.md`
- `docs/2026-08-22-bug-fixing-guidelines.md`
- `docs/2026-08-22-current-production-code-quality-findings.md`
- `docs/superpowers/plans/2026-08-23-stage1-route-and-article-continuity.md`
- `docs/evidence/2026-08-22-ap1b-local-repair-door-and-priority-rehearsal.md`

## 17. Copy-and-paste bootstrap for a new task

> Continue the OctoWonders stabilization program through the progressive handoff. Before any substantive action, read completely and in order: (1) `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/FULL-CODE-OCTOWONDERS.COM/docs/handoffs/CURRENT.md`; (2) `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/FULL-CODE-OCTOWONDERS.COM/docs/handoffs/2026-08-21-stabilization-handoff.md`; (3) `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/FULL-CODE-OCTOWONDERS.COM/docs/2026-08-22-stabilization-action-plan.md`; (4) `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/FULL-CODE-OCTOWONDERS.COM/docs/2026-08-21-seo-differential-repair-brief.md`; (5) `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/art-blitz-now/.worktrees/ap1a-local-safety-gate/docs/handoffs/CURRENT.md`; and (6) `/Users/donatomm/---OCTOPRO.PRO/OCTOWONDERS/art-blitz-now/.worktrees/ap1a-local-safety-gate/docs/handoffs/2026-08-23-stage0-progressive-handoff.md`. Follow the original controlling handoff's authority order. Do not edit store code or change any outside setting during priming. Then recheck the recorded GitHub and Vercel starting evidence. The exact next possible action is Stage 0 Change 2 only, but it is not approved: present the exact Vercel Branch Tracking change from `main` to `production` for project `art-blitz-now`, explain it in plain English, and wait for Donato's fresh specific greenlight. Keep payment paused, automatic rollback disabled, and release reopening manual. Present every outside setting change before execution. Pause at each milestone and ask for approval.

## 18. Acceptance check for the receiving task

Before saying it is ready to continue, the receiving task must be able to state accurately:

1. which handoff controls and what to do on conflict;
2. the exact current GitHub `main`, held `production` branch, and public Vercel deployment;
3. that the isolated local safety branch is not yet based on current `main`;
4. that Change 1 is complete but Change 2 is not approved;
5. the one exact field proposed in Change 2;
6. the 65 discoverability-condition baseline and its four root repair groups;
7. why 67 errors and 7 warnings are not automatically 74 production bugs;
8. why the recorded public deployment is not eligible for automatic rollback;
9. what remains paused and prohibited;
10. when to stop and ask Donato rather than infer.
