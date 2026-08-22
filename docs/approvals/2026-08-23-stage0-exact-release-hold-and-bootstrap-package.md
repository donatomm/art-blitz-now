# Stage 0 exact release hold and safety-bootstrap approval package

**Status:** approved by Donato under the two-person model. The intended GUI change has been rebaselined and the exact starting values below are current. Nothing in this package has yet been applied outside the local working copy. Reconfirm these values immediately before the first change.

**Public starting point to preserve:** the build created on 23 August 2026 at 00:36 Rome time.

**Automatic rollback:** disabled.

**Release reopening:** manual, controlled by Donato.

## Quick orientation

The 00:36 build is public and the shop is reachable, but it still has known search failures. Donato's intended product-page GUI adjustment caused several public builds to publish automatically while he refined it. That proves the release-control gap is active now.

The recommended first move is a temporary hold, not a repair:

1. preserve the current 00:36 public build;
2. create a separate `production` branch at the exact current GitHub version;
3. tell Vercel that only that held branch may create future public builds;
4. place the prepared safety checks on `main` without publishing them;
5. protect both branches after the check names have appeared once;
6. keep the public branch unchanged until Stage 1 repairs pass every automated safety result, Codex completes a separate evidence review, and Donato separately approves publication.

No store repair belongs in this bootstrap. Payment remains out of scope.

## 1. Exact starting point

### Public store

| Item | Current value |
| --- | --- |
| Public Vercel project | `art-blitz-now` |
| Public Vercel project ID | `prj_RQiswgJu779Ix9Lb0ffAIExPkzFh` |
| Public build | `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo` |
| Build time | 23 August 2026, 00:36:13 Rome time |
| Ready time | 23 August 2026, 00:37:02 Rome time |
| GitHub version used | `063cf2a3dbadd913e5e37c11703d52b52a82a340` |
| Public addresses | `octowonders.com` and `www.octowonders.com` point to this build |
| Current public-build branch | effectively `main`, proven by the live build record |

### GitHub

The following current settings were directly inspected without saving anything:

| Area | Current value |
| --- | --- |
| Repository | public |
| Default branch | `main` |
| Classic branch protection | none |
| Repository rulesets | none |
| Allowed actions | all actions and reusable workflows |
| Require action references to be permanently fixed | off |
| Saved run records | 90 days |
| Saved build cache | 7 days, 10 GB |
| New-contributor approval | required for first-time contributors |
| Normal workflow permission | read repository contents and packages |
| Workflows may create and approve their own review request | off |

The last two permission values are already appropriately narrow and should remain unchanged.

### Evidence limit

Vercel's signed-in settings page did not load reliably enough to claim a direct screen reading. The current public branch is proven by the deployment record. Vercel's current official instructions place the editable value at:

`Project settings` → `Environments` → `Production` → `Branch Tracking`.

The proposed value below is exact, but it has not been seen or saved on that screen. If the screen does not expose the documented field exactly as expected, execution must stop before any change.

## 2. Approved two-person operating model

### Donato

Role: business owner, accountable release owner, incident decision owner and manual publication approver.

Donato decides when the held public branch may move. He receives the plain-English before-and-after evidence and authorizes each outside change separately. He is not required to inspect code unaided; Codex must translate every result into customer, search and business consequences.

### Codex

Role: technical preparer, evidence checker and technical adviser.

Codex must:

- prepare the smallest proposed change;
- run the safety checks and preserve the evidence;
- perform a separate review pass after preparation;
- explain the result to Donato without requiring him to read code;
- stop when the evidence is incomplete, contradictory or outside the approved scope.

Codex cannot be a human approver, cannot provide organizational independence from its own work and cannot own the business decision.

### Accepted limitation and compensating safeguards

Donato decided on 23 August 2026 that no senior engineer will be assigned. The operating team is Donato, a skilled product manager, and Codex. This is weaker than independent human technical review and must not be described as equivalent.

The compensating safeguards are:

- zero automatic publication from the working branch;
- every outside setting shown to Donato before execution;
- one outside change at a time, followed by a public-store check and a pause;
- all automated safety results required before a public release;
- a separate Codex review pass after Codex prepares a change;
- Donato's recorded manual publication decision;
- automatic rollback disabled and release reopening manual;
- mandatory outside specialist help if evidence is ambiguous or the work reaches payments, stored customer data, security credentials, irreversible actions or an unfamiliar platform failure.

No Stripe, payment, Supabase-data, billing or additional account-owner permission is needed for this Stage 0 model.

## 3. Exact change 1: create the held public branch

### Before

- GitHub has `main` as the default branch.
- No `production` branch is being used as the held public source.
- Current exact version: `063cf2a3dbadd913e5e37c11703d52b52a82a340`.

### Proposed action

On GitHub, create a branch named exactly `production` from exactly:

`063cf2a3dbadd913e5e37c11703d52b52a82a340`

Do not add, remove or rewrite any file while creating it.

### After

- `main` remains the normal working branch.
- `production` points to the same exact version as the current public build.
- At this point Vercel is still using `main`; the next change completes the hold.

### Benefit

There is a fixed public starting point that can remain unchanged while repairs are prepared elsewhere.

### Risk

Creating the branch can cause a non-public Vercel preview. It must not change the OctoWonders public domains. If a public domain moves, stop immediately and restore the 00:36 build before doing anything else.

### Reversal

The branch can be deleted only after Vercel is confirmed to use `main` again. Deleting it while Vercel tracks it would be unsafe.

### Immediate proof required

- `production` and `main` both show version `063cf2a3...`;
- `octowonders.com` still points to `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo`;
- the public homepage and one product page still return normally.

## 4. Exact change 2: make the held branch the only automatic public branch

### Before

- Vercel's effective public branch is `main`.
- A new `main` version can automatically create and assign a public build.

### Proposed action

In Vercel project `art-blitz-now` only:

1. open `Settings`;
2. open `Environments`;
3. open `Production`;
4. open `Branch Tracking`;
5. change the branch from `main` to exactly `production`;
6. save once.

Do not change domains, build commands, variables, integrations, protection, caches or any other setting.

### After

- only a change to `production` automatically creates a public build;
- changes to `main` create non-public previews;
- the current 00:36 build should remain on the public domains because both branches begin at the same exact version.

### Benefit

A repair can be reviewed and checked on `main` without being published merely because it was accepted there.

### Risk

Vercel may create or reclassify a build when the branch setting is saved. The public domains must be checked immediately. If they no longer point to the preserved 00:36 build, stop and restore that assignment. Do not continue to GitHub protections.

### Reversal

Change Branch Tracking back from `production` to `main`, then prove which build owns the public domains before deleting or moving `production`.

### Immediate proof required

- Branch Tracking reads exactly `production`;
- the public domains still point to `dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo`;
- `main` no longer has automatic public authority;
- the public homepage, article behavior and one product page match the preserved starting evidence.

## 5. Exact change 3: place the safety preparation on `main` without publishing it

This is a GitHub version change, not an application repair. It must happen only after Change 2 proves that `main` is no longer the public branch.

### Before

- the prepared safety files exist only in the isolated local branch;
- GitHub does not know the two safety-result names;
- no GitHub protection can yet require a result that has never appeared.

### Proposed action

1. bring the local safety work onto the current GitHub starting version without changing the application;
2. adjust the safety-run trigger so `P0 Repair Admission` runs only for repair requests into `main`, while `P0 Live Store Safety` also runs for requests into and changes to `production`;
3. prove that trigger behavior with controlled examples before joining it;
4. have Codex perform a separate evidence review of the one-time bootstrap and state explicitly that it is not independent human review;
5. show Donato the complete changed-file list and plain-English consequences, then obtain his recorded approval;
6. join only the safety files and documents to `main`;
7. allow the two prepared results to run once so GitHub records their exact names.

The two exact result names are:

- `P0 Repair Admission`
- `P0 Live Store Safety`

`P0 Live Store Safety` is expected to remain red because the current store still has true P0 search conditions. Red is the honest starting result, not a failed bootstrap.

The trigger adjustment is mandatory. The current local preparation listens only to `main`. Requiring its strict result on `production` without first making it run there would freeze the branch for the wrong reason: a missing result rather than a measured red result.

### After

- GitHub recognizes both safety-result names;
- `main` contains the prepared safety judge and evidence rules;
- Vercel creates at most a non-public preview from `main`;
- `production` remains unchanged at `063cf2a3...`.

### Stop conditions

Stop before joining the bootstrap if:

- the application comparison contains an application, route, page, sitemap, image, catalogue or payment change;
- Codex has not completed and documented the separate evidence-review pass;
- Donato has not approved the complete changed-file list and plain-English consequences;
- `main` still has automatic public authority;
- the public domains have moved from the preserved 00:36 build;
- the safety tests or saved-data build do not reproduce their documented results.

## 6. Exact change 4: protect `main`

Create an active GitHub ruleset named exactly `OctoWonders main repair protection`.

### Before and after values

| Setting | Before | Proposed after |
| --- | --- | --- |
| Target branch | none | branch named exactly `main` |
| Changes must use a review request | off | on |
| Required GitHub approvals | 0 | 0, because Donato is the only human operator |
| Remove old approvals after new changes | off | off, because no GitHub approval is required |
| Latest change needs an independent approval | off | off, because no independent human is available |
| All review conversations resolved | off | on |
| Required safety result | none | `P0 Repair Admission` |
| Result must use the latest `main` version | off | on |
| Force replacement of branch history | allowed by absence of rule | blocked |
| Delete branch | allowed by absence of rule | blocked |
| Routine bypass | unrestricted by rule | no routine bypass entry |

Do not require `P0 Live Store Safety` on `main`. The current public problems would prevent every repair from joining. The repair result is designed to accept only a change that removes at least one current P0 condition and introduces none.

### Benefit

No ordinary person or automatic routine can silently replace the working version. A real repair may still progress in small steps.

### Risk

An incorrect result name can stop all work. Confirm the exact result appears in GitHub before saving the rule. The absence of a required human approval is an accepted limitation, not proof that the change has been independently reviewed.

### Reversal

Disable the ruleset only with Donato's recorded approval and a replacement protection. Do not delete it during an incident.

## 7. Exact change 5: protect `production`

Create an active GitHub ruleset named exactly `OctoWonders public release protection`.

### Before and after values

| Setting | Before | Proposed after |
| --- | --- | --- |
| Target branch | none | branch named exactly `production` |
| Changes must use a review request | off | on |
| Required GitHub approvals | 0 | 0, because Donato is the only human operator |
| Remove old approvals after new changes | off | off, because no GitHub approval is required |
| Latest change needs an independent approval | off | off, because no independent human is available |
| All review conversations resolved | off | on |
| Required safety result | none | `P0 Live Store Safety` |
| Result must use the latest public-branch version | off | on |
| Force replacement of branch history | allowed by absence of rule | blocked |
| Delete branch | allowed by absence of rule | blocked |
| Routine bypass | unrestricted by rule | no routine bypass entry |

Donato's recorded manual publication approval is the human decision. GitHub cannot independently enforce this part of the two-person process, so the strict safety result and held public branch remain essential.

### Benefit

The public branch cannot move while any P0 condition remains. The operating procedure also requires Codex's separate evidence-review pass and Donato's recorded approval, although these are not independent human review.

### Risk

The present store has true P0 search conditions, so this branch will intentionally remain frozen. If urgent publication is later necessary during a known incident, Donato must receive a separate written risk package. There is no silent emergency bypass.

### Reversal

Do not disable the rule merely to make a red result green. Reversal requires Donato's recorded approval, Codex's documented incident evidence and a documented replacement or accepted exposure. If the evidence is ambiguous, obtain outside specialist help before reversal.

## 8. Settings deliberately left unchanged

- GitHub default branch remains `main`.
- GitHub workflow permission remains read-only by default.
- Workflows remain unable to create and approve their own review request.
- The global “all actions” setting remains unchanged during Stage 0 because the prepared workflow currently uses named standard actions but does not permanently fix their versions. Tightening this safely requires its own reviewed change.
- Vercel domains remain attached to the existing public project.
- Vercel build command, stored variables, integrations and cache settings remain unchanged.
- The duplicate Vercel project is not disconnected or deleted in this milestone.
- No Checkly, WhatsApp or Resend account is activated.
- No automatic rollback is enabled.
- No release is automatically reopened.

## 9. Rehearsal against the current healthy target

This is the non-destructive rollback rehearsal. It does not execute a rollback.

### Eligible target recorded

The 00:36 build is the current preservation target:

`dpl_TL2wWwETpnj44kzsc6NxeV9AhVAo`

It is eligible only as a manual restoration target for a later change-caused regression because:

- it is the current public build;
- the shop and checked product pages are reachable;
- its exact GitHub source and creation time are known;
- it predates any future approved repair.

It is not a fully healthy future automatic-rollback target because it still has known P0 search failures. Therefore automatic rollback remains disabled.

### Later manual restoration decision

A future build may be manually restored to this target only when all are true:

1. the failure began after a specific approved publication;
2. the previous 00:36 build does not contain that new failure;
3. no external provider outage explains the failure;
4. no unknown data corruption or irreversible state change is involved;
5. the restoration does not undo a required database or payment change;
6. one restoration attempt is made, then the public store is rechecked;
7. releases remain frozen until Donato manually reopens them.

The following are never automatic rollback cases: an outside-provider outage, a pre-existing incident, uncertain data corruption, an irreversible stateful change or an unknown cause. There is no retry loop.

## 10. Exact execution order and pause points

Each numbered item is a separate approval boundary during execution. Before performing it, the exact screen, current value and proposed value must be shown to Donato again.

1. Confirm the Donato-plus-Codex operating model and its accepted lack of independent human technical review. Completed on 23 August 2026. Pause.
2. Reconfirm the public build, domains and current GitHub version. Pause if anything differs.
3. Create `production` at `063cf2a3...`. Recheck public domains and pages. Pause.
4. Change only Vercel Branch Tracking from `main` to `production`. Recheck public domains and pages. Pause.
5. Reconcile the safety-only bootstrap, then have Codex perform a separate evidence-review pass. Show Donato the complete changed-file list and explicitly state that this is not independent human review. Pause.
6. Join the safety bootstrap to `main`. Confirm it made only a non-public preview and register the two result names. Pause.
7. Create `OctoWonders main repair protection` with the exact values in Section 6. Prove a direct change is blocked. Pause.
8. Create `OctoWonders public release protection` with the exact values in Section 7. Prove the branch remains frozen. Pause.
9. Produce a final before-and-after record. Do not start Stage 1 repair without a new approval.

## 11. Stop conditions

Stop immediately and do not improvise if:

- the current GitHub version or public build differs from the starting point in this package;
- the Vercel screen does not expose the documented Branch Tracking field;
- changing the branch moves a public domain to a different build;
- the `production` branch does not point exactly to `063cf2a3...`;
- the bootstrap contains an application or catalogue change;
- the two exact safety-result names do not appear;
- a required protection is unavailable on the current account plan;
- Codex cannot produce complete, consistent evidence that Donato can evaluate in plain English;
- the change reaches payments, stored customer data, security credentials, irreversible actions or an unfamiliar platform failure without outside specialist help;
- a secret, payment action or production-data change becomes necessary.

## 12. Approval requested

Donato approved Stage 0 execution on 23 August 2026 under the two-person operating model in Section 2. No outside change is approved silently: each exact before-and-after setting must still be presented immediately before execution.

Approval of this package would authorize only the nine controlled steps in Section 10. It would not authorize an application repair, payment work, a public release, monitoring activation, alerts, indexing, automatic rollback or release reopening.

Before every outside setting is actually changed, its exact before-and-after value will be presented again, as Donato required.

Official behavior references:

- [Vercel production branch](https://vercel.com/docs/git#production-branch)
- [Vercel non-default production branch](https://vercel.com/kb/guide/can-i-use-a-non-default-branch-for-production)
- [GitHub rules available in rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
