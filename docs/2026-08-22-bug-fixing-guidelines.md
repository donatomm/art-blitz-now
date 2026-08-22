# OctoWonders Bug-Fixing Guidelines

## Quick orientation

This document records Donato's approved bug-fixing and severity framework. It is a decision aid for independent judgment, not an exhaustive checklist.

The current MVP works and must be preserved. Detection is aggressive. Changes are conservative. Known conditions are starting probes only. Passing every recorded probe does not establish that the shop is safe, and a failure mechanism does not become less important because it is absent from this document.

## Donato's framework, preserved verbatim

The wording below is preserved as supplied. Typographical and grammatical irregularities are not silently corrected.

```text
BUG FIXING GUIDELINES

Vision
We have an MVP in production that works, although it is not well designed.
We have  rewriting it until after the GTM and automated distribution experiments. SEO is particularly important because it directly affects those experiments.

We are fixing bugs now only because some bugs could break the working product, interrupt the journey from page load to a purchase recorded by the payment gateway, or compromise SEO and indexability.

Don’t wake the sleeping dog. The current machine works, and unnecessary changes could expose hidden dependencies or introduce regressions. Touch as little as possible.

SEO Recap
Fix the ticking bombs first
FIx anything that makes current SEO work as a SHOPIY-grade SEO and better. Remember that SEO issues may derive from how content is written where and how. Flag those and let Donato fix his crap :)

Review principles
- Judge issues by their credible consequences, not by how strange or poorly written the code looks or merely because it is old or unusual.
- Assume Lovable may have created unexpected implementations or hidden dependencies.
- Do not add fixes that improve speed, efficiency, response,  or elegance of anything. Unless it’s SEO/Loading speed or unacceptable pauses
- Stay aware for unidentified bugs

We’ll use an agressive detection method, but a very conservative action

P0
P0 includes the most dangerous bugs for production and SEO continuity robustness. The ticking bombs.
What under a credible condition, it could cause a malfunction, failure, or crash
A blocking break in the customer experience end-to-end, from initial page load through the purchase being recorded by the payment gateway.
A discontinuity in SEO practices or indexability.
Any catastrophic-prone fragility around  key pillars such as in SSG > SEO gone
What could make images not loading or deleting them.

P1
P1 includes bugs of the same general nature as P0, but without a blocking consequence.
Nothing crashes. The main workflows remain operational. There is no major discontinuity. However, the behavior is incorrect and should not exist in the code.
Before assigning P1, verify that hidden dependencies or triggering conditions do not make the issue closer to P0 than to P2.

P2
P2 includes things that are not written as they should be but are not a credible threat. A P2 trigger has a probability next to zero and, even if triggered, would not block the journey from page load through the purchase being recorded by the payment gateway.
SEO and indexability remain independent criteria.
Flag P2 issues, but leave them alone. We won’t be fixing those.

Other suspicious or old code
If you find another possible bug, suspicious behavior, or old code that may not be interpreted correctly, do not rewrite it immediately. Move to P1
```

## Governing interpretation

These notes resolve ambiguities without replacing Donato's framework.

### Consequence controls severity

The broad P0 reference to a possible malfunction is read together with the consequences that follow it. A malfunction is P0 when a credible trigger can cause a blocking customer break, a major SEO or indexability discontinuity, catastrophic fragility in a key pillar, or important image loss. A non-blocking incorrect behavior belongs in P1. Poor form without credible operational danger belongs in P2.

### Suspicion starts investigation, not repair

Suspicious, old or poorly understood code enters a P1 investigation queue so it is not ignored. That temporary placement is not a confirmed severity judgment and does not authorize a fix. Investigation must look for hidden dependencies, triggering conditions and counterexamples. The item is then confirmed as P0 or P1, moved to P2, or left explicitly unknown.

### SEO is judged by observable outcomes

"SHOPIY-grade SEO and better" is treated as direction, not a vendor checklist. The controlling SEO evidence and acceptance conditions remain crawlability, indexability, unique public-page identity, correct canonical addresses, meaningful public content, structured product information, sitemap consistency, important image availability and loading performance that affects customers or discovery.

Content can be the source of an SEO failure. When the software is functioning but wording, content selection or placement is the cause, record that cause and give it to Donato. Do not disguise a content repair as a software rewrite.

## No checklist closure

No finite list of known bugs, conditions, tests or examples proves the product safe.

- A passing check is evidence only for the exact condition it exercises.
- Known conditions are examples that improve attention. They do not define the boundary of examination.
- Review remains open to unidentified triggers, hidden dependencies, shared failure points, provider changes, data changes, timing, state transitions and alternate customer or crawler paths.
- Classification remains revisable when new evidence changes the credible consequence.
- Every conclusion must state residual unknowns and at least one plausible counterexample or unexamined path.
- A repair must remain minimal even when investigation reveals broader poor design. Broader redesign stays deferred unless the discovered consequence independently justifies it.

The reviewer does not finish by checking every known item. The reviewer asks what could still produce the same business harm if every known item passed.

## Current condition register

The conditions below were detected or formulated during AP0 and AP1A analysis. They are dated starting probes, not acceptance criteria, a complete threat model or final classifications.

### P0 starting probes

- An old product address can redirect before all product-screen state is established. If the router reuses the same screen, the next render can change state order and block the canonical product page.
- An artwork card can skip its state setup when the product lacks a public address. If that same mounted card later receives an address, the changed state order can break the card or gallery.
- Malformed or empty artwork-size data can make crawler-facing product information fail or contain a non-finite price.
- Unexpected catalogue or page data can pass through incomplete validation into the generated shop pages or sitemap. A malformed input could stop or corrupt foundational public output.
- Image cleanup and optimization tools accept incompletely checked nested data. Under unexpected data plus a confirmed manual action, they can remove, clear or redirect the wrong important image reference.

These are P0 candidates because their formulated consequences reach a protected pillar. Trigger presence, router behavior, current data conformance and actual reach remain to be rehearsed. Their presence here does not imply that other P0 conditions are absent.

### P1 starting probes

- Administrator image operations can mishandle an unusually shaped error and hide the original explanation while leaving the customer shop operational.
- Connected-tool authorization can fail if an external response changes shape while the main shop remains operational.
- Optional product SEO fields can silently fall back to generic information. This is P1 only if the effect is bounded and creates no meaningful discoverability or indexability discontinuity. Otherwise it moves toward P0.
- A malformed preferred MCP configuration can be hidden by fallback handling and produce a less precise failure explanation while the public shop remains operational.
- The payment function records the incoming request too broadly in internal logs. Its privacy and operational consequence is not yet classified and must be investigated before deciding whether P1 is adequate.

These probes illustrate non-blocking incorrect behavior and unresolved investigation candidates. They do not exhaust P1.

### P2 starting probes

- Unnecessary slash escapes in regular expressions where removing the escape preserves matching behavior.
- Variable bindings that could be declared more strictly without changing execution.
- Old `var` declarations in the bundled MCP module that are not reassigned and have no identified current behavior difference.
- An empty type wrapper that is removed during the build and cannot affect runtime behavior.
- Local hot-refresh warnings that affect the editing experience but are absent from the published runtime.
- An older build-configuration import form while the current build accepts it. If a future tool change makes the build fail, the consequence must be reclassified rather than protected by its previous P2 label.

These probes are left alone under the approved framework. Their presence does not establish that every similar-looking item is P2.

## Decision record requirements

When a priority is assigned, the record should explain in plain English:

1. what is wrong and whether it is failing now;
2. the credible trigger, malfunction and consequence;
3. the protected outcome affected, if any;
4. evidence supporting the path and evidence limiting it;
5. hidden dependencies or alternate paths examined;
6. residual unknowns and why they do or do not prevent classification;
7. why the smallest proposed action is safer than leaving the condition alone.

These are prompts for reasoning, not boxes whose completion proves safety.

## Change authority

This framework guides investigation and prioritization. It does not authorize a repair, deployment, production-data change, external-setting change, purchase, refund, indexing action or automatic rollback. Existing AP1 safeguards and separate approval gates remain controlling.
