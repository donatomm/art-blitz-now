# AP1B outside release-protection approval package

Status: prepared for Donato's review. Nothing in this package has been applied outside the local working copy.

## Quick orientation

The local safety check is prepared and proven unable to publish, send alerts or change an outside account. It is not active.

The direction remains sound: every proposed store change should be reviewed and tested before it can reach customers. However, the prepared check must not be made compulsory unchanged today. It currently reports the store's known search problems as red, and one catalogue rule still misreads Donato's deliberate `2x90x60` entry as a software danger. Turning it on unchanged would block repair proposals as well as unsafe proposals.

The safest next design has two doors:

1. A repair door lets reviewed work be prepared while the current incident remains visible. It must reject any new problem and any worsening of a known problem.
2. A live-store door remains closed until the complete current safety check is genuinely green and Donato manually approves reopening after an incident.

Recommendation: choose **Change, then apply** in Section 11. Do not switch on the prepared settings yet.

## 1. What has been prepared locally

A proposed store-safety check now:

- reads a proposed change without retaining permission to write back;
- installs only the exact locked packages;
- proves its own safety examples;
- builds from the saved catalogue instead of contacting the live database;
- checks store availability, search identity, saved catalogue links, built pages, the sitemap and shared images;
- preserves a redacted evidence bundle for 30 days;
- ends red when the source or built-store result is unsafe;
- stops after 20 minutes if it cannot finish;
- contains no publishing, account-changing, alerting or rollback command.

It exists only in the local branch. It has not been pushed to GitHub, run by GitHub, connected to Vercel or used to block a release.

## 2. Decision 1: require a store-safety result before joining the main store version

**Proposed change**

After the correction described below, make a uniquely named store-safety result compulsory before a proposed change can join the main store version.

Use two distinct results:

- **Repair safety:** permits a reviewed repair to join the main version only when it creates no new finding and worsens no known finding.
- **Live-store safety:** permits public publishing only when all three P0 outcomes are green, with no allowance for known P0 failures.

The current local file prepares the second, stricter result. The first result has not yet been written and therefore this outside change is not ready to apply.

**Benefit**

Unsafe work cannot quietly become the official store version. Repairs can still proceed in small stages without pretending that the existing incident is healthy.

**Risk and side effect**

If only the strict result is used, all repair proposals are blocked. If only the repair result is used, a known P0 problem could still be published. Both doors and their different purposes must remain explicit.

The rule for unusual size text must also be narrowed. `2x90x60` is owner-authored catalogue content, not a proven software bug. The check may flag it for review, but must not call it P0 merely because it has three measurements.

**Price**

No additional GitHub charge is expected while the repository remains public on its current plan. Any repository visibility or plan change needs a separate cost check and approval.

**Owner and permission**

- Donato: business owner and manual reopening approver.
- Qualified technical reviewer: not yet named. This person must understand changes to the safety check and must not approve their own last change.
- GitHub: read access for the safety run. No saved publishing credential.

**How to reverse it**

A GitHub administrator can remove the compulsory result. That would remove protection, so reversal requires a recorded reason, Donato's approval and a replacement protection or an explicit acceptance of the risk.

## 3. Decision 2: stop direct changes to the main store version

**Proposed change**

Protect `main` so changes arrive only through a reviewed proposal. Require:

- one approval from the named qualified technical reviewer;
- a new approval after important changes are added;
- all review discussions resolved;
- the author of the latest change cannot be its sole approver;
- the relevant safety result up to date and passing;
- no forced replacement or deletion of `main`;
- no routine administrator bypass.

Changes to the safety check, its examples, package commands, saved package list, build rules and hosting rules require explicit technical review because weakening the judge can create a false green result.

**Benefit**

No person or automatic process can silently replace the live source. The reason, evidence and reviewer remain visible.

**Risk and side effect**

Donato currently has no named qualified technical reviewer. Switching this on first could lock a one-person operation out of ordinary repairs. The reviewer role must be filled before activation.

**Price**

No additional GitHub charge is expected for this public repository on its current plan.

**Owner and permission**

- Donato: owner of the business decision and emergency risk acceptance.
- Named technical reviewer: approval permission, no billing or account-owner permission required.
- GitHub administrator: permission to create and later change the protection. This should remain Donato or a specifically named delegate.

**How to reverse it**

The GitHub administrator can restore the previous unprotected behavior. This is a high-risk reversal and must be shown to Donato before execution.

## 4. Decision 3: prevent catalogue refresh from writing directly to the main version

**Current fact**

The existing catalogue-refresh routine can create a change, write it directly to `main`, and thereby start public publishing without review.

**Proposed change**

Later, change that routine so it writes only to a temporary proposal, opens a review, runs both safety doors, and cannot publish directly. The outside request that starts a refresh may still request a proposal, but it must never receive permission to approve or publish it.

This routine has not been changed in AP1A.

**Benefit**

A catalogue refresh cannot bypass the same protection applied to human changes.

**Risk and side effect**

Catalogue updates will no longer appear immediately. A failed refresh or missing reviewer can leave the public catalogue stale. The monitor must distinguish stale data from a store outage and report it clearly.

**Price**

No additional GitHub charge is expected under the current public-repository plan. Work time and any future automation service cost remain unmeasured.

**Owner and permission**

- Donato: approves the business timing of catalogue publication.
- Named technical reviewer: reviews the generated difference.
- Future refresh identity: permission to write only its temporary proposal and open a review. No permission to write `main`, approve itself, change account settings or publish.

**How to reverse it**

Restore the previous routine only through a reviewed proposal and Donato's explicit acceptance that direct public publishing will resume.

## 5. Decision 4: make public publishing obey the manual incident freeze

**Proposed temporary change**

Until a separate durable freeze controller is proven, use manual public promotion:

1. Vercel may build a candidate after an approved GitHub change.
2. The candidate does not receive the public OctoWonders domains automatically.
3. The uniquely named live-store safety result must be green.
4. A named release operator confirms the evidence.
5. If an incident freeze exists, only Donato can approve reopening. The operator then publishes the proven candidate.

Vercel's Deployment Checks can add another hold so a candidate cannot reach the public domains while the selected GitHub result is red. Vercel currently documents this for GitHub-connected projects. Dashboard availability on the current project must be confirmed immediately before any change.

The second Vercel project linked to the same repository owns no OctoWonders public domain. Do not change or delete it until its owner and purpose are known.

**Benefit**

The incident freeze cannot be ignored by an ordinary code change. Reopening remains a human decision, as approved.

**Risk and side effect**

Every release requires a short manual publication step during this temporary phase. A missing release operator delays publication. Vercel also offers a force-publish action that can bypass a failed hold, so its use must be limited to Donato or a specifically named emergency delegate and always recorded.

**Price**

No additional Vercel charge is expected for Deployment Checks under the currently published availability. The observed project is on the Hobby plan. This must be confirmed in the actual dashboard before applying it. Paid gradual-release features are not required or proposed.

**Owner and permission**

- Donato: business owner, incident-freeze owner and only automatic-reopening prohibition override.
- Named release operator: not yet named. May inspect candidates and publish only after the stated evidence and approval. No billing permission needed.
- Vercel administrator: needed once to change publication settings and restrict access. This should remain Donato or a specifically named delegate.

**How to reverse it**

Re-enable automatic attachment of the public domains only after a replacement freeze control is proven and separately approved. Reversal without a replacement would recreate today's release gap.

## 6. Decision 5: keep automatic rollback disabled

**Proposed change**

No change. Keep automatic rollback off. Store no Vercel publishing token in the prepared safety check.

**Benefit**

The system cannot automatically return to an older version that shares the same defect, uses incompatible settings, or crosses a payment, data, deletion, credential or outside-provider change.

**Risk and side effect**

Recovery from a real change-caused outage will require a qualified person until a healthy target and the one-attempt rules are fully proven.

**Price**

No added service cost.

**Owner and permission**

Donato owns any future permission to enable it. A named technical incident owner, currently unassigned, must prove the target and make the recommendation.

**How to reverse it**

Enabling automatic rollback is not a routine reversal. It requires a separate approval package proving one healthy target, compatible settings, no irreversible boundary, one attempt only, preserved evidence and recovery confirmation.

## 7. Decision 6: independent watcher plan and current cost limit

**Recommended starting service**

Checkly Starter is the current provisional recommendation for non-payment monitoring. Its published annual-billing price was rechecked on 2026-08-22 and listed as USD 24 per month, USD 288 per year before tax. The exact monthly-billing price was not established. Recheck price, tax, renewal terms and dashboard limits at purchase.

The currently published Starter allowances include 50 simple uptime watches, one-minute maximum frequency, six public locations, 25,000 web-request runs per month, 3,000 browser runs per month, three users, seven days of detailed results and 30 days of summary results. It also lists email, chat, text-message and general web alerts. No extra runs or overage spending may be enabled without Donato's separate approval.

The free plan is not recommended for the complete initial protection. It has a two-minute maximum frequency, one user and hard monthly limits. It leaves too little room for confirmation retries, post-release checks and route coverage.

**Initial use within the limit**

- Fast simple checks for the home page, representative product, search instructions, sitemap and shared images.
- Two five-minute web-request checks would use about 17,280 of the 25,000 monthly request runs.
- One hourly browser journey would use about 720 of the 3,000 monthly browser runs before retries or long-run rounding.
- Keep a visible remaining allowance for confirmation retries and post-release checks.

This is a budget shape, not a finished monitor design. The read-only transaction-readiness check still lacks a proven public input that can validate the saved product, size and price links independently without starting payment. Payment work remains paused. Measure the final scripts' real run consumption before subscribing or promising coverage.

**Benefit**

The watcher is independent of the store host and can detect a public failure even when the store itself cannot report it.

**Risk and side effect**

Poorly designed checks can report false green results because the current store sometimes returns a home page for a missing address. Excessive frequency, multiple locations, retries or long browser runs can exceed the plan allowance. Monitoring without a proven alert path and named responder is not complete protection.

**Owner and permission**

- Donato: organization and billing owner, budget approver.
- Watcher administrator: not yet named. May manage watches, locations and alert links.
- Monitor health owner: not yet named. Must respond to broken watches and plan-limit warnings.
- Future automatic setup identity: permission only to manage the approved OctoWonders watches.

**Inputs to create later, without sharing their values**

- A business-owned Checkly account and project.
- `CHECKLY_API_KEY`, entered directly in the approved private secret store.
- `CHECKLY_ACCOUNT_ID`, an account identifier kept as private configuration.
- `CHECKLY_WEBHOOK_SECRET`, used to prove that an alert really came from Checkly.

**How to reverse it**

Pause the watches, export the evidence needed for open incidents, remove the alert link, revoke the setup key, and cancel or downgrade the subscription after retention needs are satisfied. Do not cancel during an open incident.

## 8. Later alert accounts, permissions and secret inputs

WhatsApp and Resend are required by the governing incident plan, but they are not included in the outside changes requested in this package. They need their own exact settings and delivery rehearsal before monitoring can be called complete. No account has been created or changed here, and no message has been sent.

### Meta WhatsApp

Required accounts and ownership:

- a business-owned Meta Business Portfolio;
- a business-owned WhatsApp Business Account;
- a Meta app containing the WhatsApp service;
- a registered sender number;
- Donato as business owner and primary recipient;
- a named backup recipient, still unassigned;
- a WhatsApp account administrator;
- a restricted service identity that can send only the approved incident message.

Required permission: the minimum current WhatsApp sending and management permissions needed to maintain the approved incident-message template. No advertising, audience or unrelated account permission is requested.

Inputs to create later, without sharing their values:

- business, WhatsApp-account and sender-number identifiers;
- approved message name, language and permitted fields;
- `META_WHATSAPP_ACCESS_TOKEN`;
- `META_APP_SECRET` only if delivery or incoming-message verification is used;
- `META_WEBHOOK_VERIFY_TOKEN` only if a webhook is configured.

Donato must approve the message wording, recipients and any current consent requirement before the first test. The test itself requires a separate send approval.

### Resend email

Required accounts and ownership:

- a business-owned Resend team with Donato as business and billing owner;
- a named Resend administrator;
- the OctoWonders domain owner for the exact email-authentication records;
- a restricted sending identity for the approved alert subdomain.

Required permission: send email only from the approved OctoWonders alert subdomain. No general domain or account-owner permission for the automatic sender.

Inputs to create later, without sharing their values:

- the exact alert subdomain, sender and recipients;
- the exact domain-verification records, shown to Donato before they are added;
- `RESEND_API_KEY`, restricted to sending from the approved domain;
- `RESEND_WEBHOOK_SECRET` only if delivery confirmation is enabled.

Donato must approve the domain records, sender, recipients, email wording, retention and test send before execution.

## 9. Evidence ownership and retention

**Proposed change**

- GitHub safety evidence: retain 30 days.
- Checkly Starter: accept the published seven-day detailed and 30-day summary retention for the initial non-payment monitors.
- Keep incident evidence private to Donato, the named incident owner and the minimum technical responders.
- Never place customer, payment, private contact or secret values in the evidence.

**Benefit**

There is enough recent evidence to compare the moment before and after a release and begin diagnosis without exposing unrelated private data.

**Risk and side effect**

Thirty days may be too short for a late investigation. Longer storage has an unmeasured cost and privacy burden. This retention must be reviewed after the first month of real use.

**Owner and permission**

Donato owns retention and access decisions. The technical incident owner, still unassigned, may read and preserve incident evidence but should not receive billing or unrelated account access.

**How to reverse it**

Reduce retention only after preserving evidence for open incidents. Increasing retention requires a cost and data-handling review.

## 10. Conditions that must be satisfied before applying any setting

1. Narrow or reclassify the unusual-dimension rule so Donato's `2x90x60` entry is not treated as a software P0.
2. Add and prove the repair-safety result, separate from the absolute live-store result.
3. Name a qualified technical reviewer.
4. Name a release operator and technical incident owner. One person may fill both roles if qualified.
5. Decide whether current repair work may join `main` while public publication remains frozen.
6. Confirm the exact GitHub protection controls visible on the current public repository.
7. Confirm the exact Vercel publication and Deployment Check controls visible on the domain-owning project.
8. Confirm Checkly price, tax, limits, region coverage and real expected run consumption.
9. Present screenshots or an exact before-and-after list of every proposed outside setting.
10. Obtain Donato's separate execution approval.

## 11. Decision choices

### Apply now

Not recommended. The current strict result is red and includes one false software classification. The repair door, named technical roles and complete alert path do not yet exist.

### Change, then apply

Recommended. Approve the two-door direction, correct the dimension rule, prepare the no-regression repair result, name the human roles, recheck the actual account screens and costs, then return with the exact outside settings for a separate yes or no. Public publishing remains unchanged until then.

### Postpone

Leave GitHub, Vercel and monitoring unchanged. This accepts the current facts: direct writing to `main` remains possible, public publishing can begin automatically, no independent watcher is operating, alerts are unproven and automatic rollback remains disabled.

## 12. Explicit boundary

None of the outside changes in this package has been executed.

No branch was pushed. No review request was opened. No GitHub rule, Vercel setting, watcher, DNS record, Meta account, WhatsApp setting, Resend account, Supabase setting or Stripe setting changed. No alert, purchase, refund, deployment, rollback or indexing request occurred. Automatic rollback remains disabled and release reopening remains manual.

## 13. Current official references

- GitHub protected branches: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches>
- GitHub required results: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging>
- Vercel Deployment Checks: <https://vercel.com/docs/deployment-checks>
- Vercel production publishing settings: <https://vercel.com/docs/deployments/promoting-a-deployment>
- Checkly plans and current listed prices: <https://www.checklyhq.com/pricing/>
- Checkly signed alert links: <https://www.checklyhq.com/docs/integrations/alerts/webhooks/>
- Meta WhatsApp Business Platform: <https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api>
- Resend restricted sending keys: <https://resend.com/docs/dashboard/api-keys/introduction>
- Resend domain verification: <https://resend.com/docs/dashboard/domains/introduction>
