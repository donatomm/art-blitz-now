# Stage 0 exact release hold and safety-bootstrap approval package

**Status:** prepared for Donato's approval. Nothing in this package has been applied.

**Public starting point to preserve:** the build created on 22 August 2026 at 23:44 Rome time.

**Automatic rollback:** disabled.

**Release reopening:** manual, controlled by Donato.

## Quick orientation

The 23:44 build is public and the shop is reachable, but it still has known search failures. A Lovable catalogue change caused it to publish automatically even though the GitHub application files did not change. That proves the release-control gap is active now.

The recommended first move is a temporary hold, not a repair:

1. preserve the current 23:44 public build;
2. create a separate `production` branch at the exact current GitHub version;
3. tell Vercel that only that held branch may create future public builds;
4. place the prepared safety checks on `main` without publishing them;
5. protect both branches after the check names have appeared once;
6. keep the public branch unchanged until Stage 1 repairs have independent review and Donato separately approves publication.

No store repair belongs in this bootstrap. Payment remains out of scope.

## 1. Exact starting point

### Public store

| Item | Current value |
| --- | --- |
| Public Vercel project | `art-blitz-now` |
| Public Vercel project ID | `prj_RQiswgJu779Ix9Lb0ffAIExPkzFh` |
| Public build | `dpl_DT1LdiLZ4TD3WAseAFb4GrgatjQo` |
| Build time | 22 August 2026, 23:44:10 Rome time |
| Ready time | 22 August 2026, 23:44:49 Rome time |
| GitHub version used | `9760359b429fe34c979bdf3c9af420b9c42216bd` |
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

## 2. People required before activation

### Donato

Role: business owner and manual publication approver.

Donato decides when the held public branch may move. He receives the plain-English before-and-after evidence. He is not expected to judge code or investigate an incident alone.

### One named senior engineer

This person is required before the protections are activated. The role is currently unfilled.

The person must be able to:

- independently review GitHub and Vercel release-control changes;
- understand the current React, Vite and prebuilt-page setup;
- review route, search and build-safety evidence;
- respond during an approved release or incident;
- avoid approving their own latest change.

Recommended assignment for the initial phase:

- technical reviewer;
- person who performs an approved public release;
- technical incident owner.

If that engineer authors a change, a second qualified person must approve that particular change. Codex may prepare changes and evidence, but cannot be the independent approver or the accountable incident owner.

No Stripe, payment, Supabase-data, billing or account-owner permission is needed for this Stage 0 role.

**Blocking input before activation:** Donato must name the senior engineer and confirm that person's availability. No name is invented in this package.

## 3. Exact change 1: create the held public branch

### Before

- GitHub has `main` as the default branch.
- No `production` branch is being used as the held public source.
- Current exact version: `9760359b429fe34c979bdf3c9af420b9c42216bd`.

### Proposed action

On GitHub, create a branch named exactly `production` from exactly:

`9760359b429fe34c979bdf3c9af420b9c42216bd`

Do not add, remove or rewrite any file while creating it.

### After

- `main` remains the normal working branch.
- `production` points to the same exact version as the current public build.
- At this point Vercel is still using `main`; the next change completes the hold.

### Benefit

There is a fixed public starting point that can remain unchanged while repairs are prepared elsewhere.

### Risk

Creating the branch can cause a non-public Vercel preview. It must not change the OctoWonders public domains. If a public domain moves, stop immediately and restore the 23:44 build before doing anything else.

### Reversal

The branch can be deleted only after Vercel is confirmed to use `main` again. Deleting it while Vercel tracks it would be unsafe.

### Immediate proof required

- `production` and `main` both show version `9760359b...`;
- `octowonders.com` still points to `dpl_DT1LdiLZ4TD3WAseAFb4GrgatjQo`;
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
- the current 23:44 build should remain on the public domains because both branches begin at the same exact version.

### Benefit

A repair can be reviewed and checked on `main` without being published merely because it was accepted there.

### Risk

Vercel may create or reclassify a build when the branch setting is saved. The public domains must be checked immediately. If they no longer point to the healthy 23:44 build, stop and restore that assignment. Do not continue to GitHub protections.

### Reversal

Change Branch Tracking back from `production` to `main`, then prove which build owns the public domains before deleting or moving `production`.

### Immediate proof required

- Branch Tracking reads exactly `production`;
- the public domains still point to `dpl_DT1LdiLZ4TD3WAseAFb4GrgatjQo`;
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
4. have the named senior engineer review the one-time bootstrap;
5. ask Donato to approve the bootstrap review request;
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
- `production` remains unchanged at `9760359b...`.

### Stop conditions

Stop before joining the bootstrap if:

- the application comparison contains an application, route, page, sitemap, image, catalogue or payment change;
- no independent senior engineer has reviewed it;
- `main` still has automatic public authority;
- the public domains have moved from the preserved 23:44 build;
- the safety tests or saved-data build do not reproduce their documented results.

## 6. Exact change 4: protect `main`

Create an active GitHub ruleset named exactly `OctoWonders main repair protection`.

### Before and after values

| Setting | Before | Proposed after |
| --- | --- | --- |
| Target branch | none | branch named exactly `main` |
| Changes must use a review request | off | on |
| Required approvals | 0 | 1 |
| Remove old approvals after new changes | off | on |
| Latest change needs an independent approval | off | on |
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

An incorrect result name or unavailable reviewer can stop all work. Confirm the exact result appears in GitHub and the named engineer can review before saving the rule.

### Reversal

Disable the ruleset only with Donato's recorded approval and a replacement protection. Do not delete it during an incident.

## 7. Exact change 5: protect `production`

Create an active GitHub ruleset named exactly `OctoWonders public release protection`.

### Before and after values

| Setting | Before | Proposed after |
| --- | --- | --- |
| Target branch | none | branch named exactly `production` |
| Changes must use a review request | off | on |
| Required approvals | 0 | 1 |
| Remove old approvals after new changes | off | on |
| Latest change needs an independent approval | off | on |
| All review conversations resolved | off | on |
| Required safety result | none | `P0 Live Store Safety` |
| Result must use the latest public-branch version | off | on |
| Force replacement of branch history | allowed by absence of rule | blocked |
| Delete branch | allowed by absence of rule | blocked |
| Routine bypass | unrestricted by rule | no routine bypass entry |

Donato's manual publication approval is an additional human decision. GitHub's one approval does not replace it.

### Benefit

The public branch cannot move while any P0 condition remains or without independent review and Donato's separate approval.

### Risk

The present store has true P0 search conditions, so this branch will intentionally remain frozen. If urgent publication is later necessary during a known incident, Donato must receive a separate written risk package. There is no silent emergency bypass.

### Reversal

Do not disable the rule merely to make a red result green. Reversal requires Donato's recorded approval, the senior engineer's incident assessment and a documented replacement or accepted exposure.

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

The 23:44 build is the current preservation target:

`dpl_DT1LdiLZ4TD3WAseAFb4GrgatjQo`

It is eligible only as a manual restoration target for a later change-caused regression because:

- it is the current public build;
- the shop and checked product pages are reachable;
- its exact GitHub source and creation time are known;
- it predates any future approved repair.

It is not a fully healthy future automatic-rollback target because it still has known P0 search failures. Therefore automatic rollback remains disabled.

### Later manual restoration decision

A future build may be manually restored to this target only when all are true:

1. the failure began after a specific approved publication;
2. the previous 23:44 build does not contain that new failure;
3. no external provider outage explains the failure;
4. no unknown data corruption or irreversible state change is involved;
5. the restoration does not undo a required database or payment change;
6. one restoration attempt is made, then the public store is rechecked;
7. releases remain frozen until Donato manually reopens them.

The following are never automatic rollback cases: an outside-provider outage, a pre-existing incident, uncertain data corruption, an irreversible stateful change or an unknown cause. There is no retry loop.

## 10. Exact execution order and pause points

Each numbered item is a separate approval boundary during execution. Before performing it, the exact screen, current value and proposed value must be shown to Donato again.

1. Name and confirm the senior engineer. Pause.
2. Reconfirm the public build, domains and current GitHub version. Pause if anything differs.
3. Create `production` at `9760359b...`. Recheck public domains and pages. Pause.
4. Change only Vercel Branch Tracking from `main` to `production`. Recheck public domains and pages. Pause.
5. Reconcile and independently review the safety-only bootstrap. Show the complete changed-file list. Pause.
6. Join the safety bootstrap to `main`. Confirm it made only a non-public preview and register the two result names. Pause.
7. Create `OctoWonders main repair protection` with the exact values in Section 6. Prove a direct change is blocked. Pause.
8. Create `OctoWonders public release protection` with the exact values in Section 7. Prove the branch remains frozen. Pause.
9. Produce a final before-and-after record. Do not start Stage 1 repair without a new approval.

## 11. Stop conditions

Stop immediately and do not improvise if:

- the current GitHub version or public build differs from the starting point in this package;
- the Vercel screen does not expose the documented Branch Tracking field;
- changing the branch moves a public domain to a different build;
- the `production` branch does not point exactly to `9760359b...`;
- the bootstrap contains an application or catalogue change;
- the two exact safety-result names do not appear;
- a required protection is unavailable on the current account plan;
- no qualified independent reviewer is named;
- a secret, payment action or production-data change becomes necessary.

## 12. Approval requested

Recommended decision: approve Stage 0 execution only after naming the senior engineer.

Approval of this package would authorize only the nine controlled steps in Section 10. It would not authorize an application repair, payment work, a public release, monitoring activation, alerts, indexing, automatic rollback or release reopening.

Before every outside setting is actually changed, its exact before-and-after value will be presented again, as Donato required.

Official behavior references:

- [Vercel production branch](https://vercel.com/docs/git#production-branch)
- [Vercel non-default production branch](https://vercel.com/kb/guide/can-i-use-a-non-default-branch-for-production)
- [GitHub rules available in rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
