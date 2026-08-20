# Permanent fix: "Buy now" never opens Stripe on some mobiles

## Root cause (confirmed in code)

Both checkout paths do the same thing:

- `src/pages/Product.tsx:259` — `window.open(data.url, '_blank')`
- `src/components/CartDrawer.tsx:63` — `window.open(data.url, "_blank")`

The `window.open` runs **after** `await supabase.functions.invoke('create-checkout')`. By then the browser no longer considers the call "user-initiated", so it is treated as an unsolicited popup. Result by platform:

```text
Desktop Chrome/Safari      -> popup allowed        -> works
iOS Safari (your phone)    -> often allowed        -> works
iOS Safari (strict / low power / content blockers) -> blocked silently
Android Chrome "block pop-ups" (default ON)        -> blocked, tiny toast only
Instagram / Facebook / TikTok / Gmail in-app views -> blocked, nothing at all
Meta / Google ad click-throughs (in-app webview)   -> blocked, nothing at all
```

Nothing is logged, no error is thrown — the customer taps and nothing happens. This matches "works on my phone, not on customers'": most of your paid traffic arrives inside in-app browsers.

## The fix: guaranteed navigation, never a popup

One shared helper used by both buttons, with a three-step ladder that ends in a path no browser can block:

1. **Synchronously**, inside the tap handler and *before* any `await`, try to open a blank tab (`window.open('', '_blank')`). This still counts as user-initiated, so where popups are allowed it succeeds.
2. After the Stripe URL comes back:
   - if that tab exists and is still open -> point it at the Stripe URL;
   - if it was blocked (returned `null`) -> **navigate the current tab** with `window.location.assign(url)`. This is a plain navigation; it cannot be blocked on any platform, including every in-app webview.
3. If the app is running inside an iframe (Lovable preview) and top-level navigation is not permitted, fall back to the iframe's own navigation. Real customers are never in an iframe, so this only protects your preview workflow.

Because step 2's fallback is an ordinary link navigation, the outcome is **deterministic on every mobile platform**: the customer always lands on Stripe Checkout.

Also included:

- The loading spinner stays on until navigation actually happens (no dead "clicked but idle" state), and is cleared if the checkout call errors.
- Double-tap guard so a slow 3G connection cannot create two Stripe sessions.
- A `console.warn` breadcrumb when the popup path is blocked, so future diagnosis does not need guesswork.

Untouched: prices, Stripe edge function, cart logic, design, layout, copy, SEO, backend.

## Files changed

| File | Change |
| --- | --- |
| `src/lib/openCheckout.ts` (new) | The shared helper described above |
| `src/pages/Product.tsx` | Replace the single `window.open` line with the helper; pre-open before `await` |
| `src/components/CartDrawer.tsx` | Same replacement for the cart checkout |

Three small edits, no dependency added.

## Stress-test plan (the report you get back)

### A. Automated matrix — headless Chromium, scripted

For each scenario the script taps "Buy now", waits, and records the final URL:

| # | Scenario | Emulation | Pass condition |
| --- | --- | --- | --- |
| 1 | Popups allowed, mobile viewport | iPhone-size viewport | New tab lands on `checkout.stripe.com` |
| 2 | **Popups blocked** | `window.open` forced to return `null` | Current tab lands on `checkout.stripe.com` |
| 3 | Instagram in-app browser | Instagram user-agent + popups blocked | Same-tab navigation to Stripe |
| 4 | Facebook in-app browser | FB user-agent + popups blocked | Same-tab navigation to Stripe |
| 5 | Android Chrome default | Android UA + popups blocked | Same-tab navigation to Stripe |
| 6 | Slow network (3G) | 2s throttle, double-tap the button | Exactly **one** Stripe session created |
| 7 | Checkout function error | Edge function forced to fail | Error toast shown, no navigation, spinner cleared |
| 8 | Cart drawer checkout | Popups blocked, 2 items | Same-tab navigation, correct item count |
| 9 | Back from Stripe | Navigate to Stripe then go back | Product page renders, button usable again |
| 10 | Inside iframe (preview) | Page loaded in an iframe | Navigates without the "blocked" dead end |

Each run captures the final URL, console errors, and a screenshot.

### B. Live verification against the deployed site

After deploy, the same matrix runs against `octowonders.com` (test scenarios stop at the Stripe page — no payment is completed, no live charge).

### C. Real-device checklist for you (5 minutes)

1. Open your own Instagram profile link to a product page -> tap Buy now.
2. Same from a WhatsApp-shared link.
3. Android phone, Chrome, pop-ups blocked (the default) -> tap Buy now.
4. iPhone Safari with "Block Pop-ups" ON (Settings -> Safari) -> tap Buy now.

All four must land on Stripe.

### D. Deliverable

A written report listing each of the 10 scenarios with pass/fail, the observed final URL, and screenshots for the mobile ones.

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Where popups are blocked the customer leaves your tab for Stripe | Low | Stripe's cancel URL returns them to the site; the cart lives in localStorage and survives |
| Back button from Stripe restores a cached page with the spinner still spinning | Low | Loading state is reset on page-show / bfcache restore |
| Behaviour differs between popup-allowed and popup-blocked devices | Low | Both end on the same Stripe Checkout page; only the tab differs |
| Regression in the cart checkout | Low | Same helper, covered by scenario 8 |

Doing nothing is the larger risk: every customer arriving from Instagram, Facebook or an ad click currently cannot buy at all.
