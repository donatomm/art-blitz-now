# OctoWonders Bug-Fixing Guidelines

## Quick orientation

This document records Donato's approved bug-fixing and severity framework. Donato's Vision, SEO Recap and Review principles appear exactly once below, verbatim. The later sections add priority interpretation and current evidence without summarizing or restating those principles.

## Vision, SEO Recap and Review principles, verbatim

```text
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
```

## Severity framework, verbatim

The wording below is preserved as supplied. Typographical and grammatical irregularities are not silently corrected.

```text
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

### P0 and P1 boundary

The first broad sentence under P0 is read together with the P0 consequences that follow it. This prevents that sentence from absorbing the non-blocking cases expressly assigned to P1 and the non-credible cases expressly assigned to P2.

### Suspicion starts investigation, not repair

Suspicious, old or poorly understood code enters a P1 investigation queue so it is not ignored. That temporary placement is not a confirmed severity judgment and does not authorize a fix. Investigation establishes the relevant triggering conditions and counterexamples. The item is then confirmed as P0 or P1, moved to P2, or left explicitly unknown.

### SEO is judged by observable outcomes

The commerce-platform comparison is treated as direction, not a vendor checklist. The controlling SEO evidence and acceptance conditions remain crawlability, indexability, unique public-page identity, correct canonical addresses, meaningful public content, structured product information, sitemap consistency, important image availability and loading performance that affects customers or discovery.

## No checklist closure

No finite list of known bugs, conditions, tests or examples proves the product safe.

- A passing check is evidence only for the exact condition it exercises.
- Known conditions are examples that improve attention. They do not define the boundary of examination.
- Review remains open to unlisted causal paths, shared failure points, provider changes, data changes, timing, state transitions and alternate customer or crawler paths.
- Classification remains revisable when new evidence changes the credible consequence.
- Every conclusion must state residual unknowns and at least one plausible counterexample or unexamined path.

The reviewer does not finish by checking every known item. The reviewer asks what could still produce the same business harm if every known item passed.

## Current condition register

The conditions below were detected or formulated during AP0 and AP1A analysis. They are dated starting probes, not acceptance criteria, a complete threat model or final classifications.

Subsequent final or provisional priority decisions based on targeted evidence are recorded in `docs/2026-08-22-bug-priorities-and-staged-repair-plan.md`. That later document does not replace the framework above.

### P0 starting probes

- An old product address can redirect before all product-screen state is established. If the router reuses the same screen, the next render can change state order and block the canonical product page.
- An artwork card can skip its state setup when the product lacks a public address. If that same mounted card later receives an address, the changed state order can break the card or gallery.
- Malformed or empty artwork-size data can make crawler-facing product information fail or contain a non-finite price.
- Unexpected catalogue or page data can pass through incomplete validation into the generated shop pages or sitemap. A malformed input could stop or corrupt foundational public output.
- Image cleanup and optimization tools accept incompletely checked nested data. Under unexpected data plus a confirmed manual action, they can remove, clear or redirect the wrong important image reference.

These are P0 candidates because their formulated consequences reach a protected pillar. Trigger presence, router behavior, current data conformance and actual reach remain to be rehearsed. Their presence here does not imply that other P0 conditions are absent.

Owner correction: the former `2x90x60` catalogue value was a deliberate content decision, not a software bug. Donato reports that the exact current Lovable value is now `2x9060`. This exact owner-defined label is valid content. For every ordinary two-number dimension, orientation has no product meaning: `NxM` and `MxN` are the same size, for example `120x80` equals `80x120`. The safety checker must preserve the exact displayed label while comparing ordinary sizes without orientation. A generic detector rejecting an owner-authored format must not convert that content decision into a P0 classification.

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
5. alternate paths examined;
6. residual unknowns and why they do or do not prevent classification.

These are prompts for reasoning, not boxes whose completion proves safety.

## Change authority

This framework guides investigation and prioritization. It does not authorize a repair, deployment, production-data change, external-setting change, purchase, refund, indexing action or automatic rollback. Existing AP1 safeguards and separate approval gates remain controlling.
