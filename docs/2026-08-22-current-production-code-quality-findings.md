# Current Production Code-Quality Findings

## Quick orientation

This document records the untouched starting-code result from the current production source: 67 errors and 7 warnings reported by the code-quality checker across 29 files.

These are 74 checker findings, not 74 confirmed customer-facing bugs. The checker reports a mixture of possible runtime hazards, missing future safeguards, development-only warnings and formatting rules with no runtime effect.

No final P0 to P2 priority is assigned here. Donato's approved framework is recorded in `docs/2026-08-22-bug-fixing-guidelines.md`. Each group instead records the causal question needed for later prioritization: if this is left alone, what specific trigger could turn it into a malfunction, what would be affected, and what evidence or counterexample limits that claim? The listed conditions are starting probes, not an exhaustive safety checklist.

Headline evidence:

- Current production Git source: `ffe0b380166bd6b9bae7e3d89711a1078867e41d`.
- Local AP1A evidence snapshot: `d9b6e101db2856c8f5b6f99022bfadf15c36d564`.
- The application, build and hosted-function files listed here have no changes between those two snapshots.
- `npm run lint -- --format stylish` reports exactly 67 errors and 7 warnings.
- `npx tsc -b` passed on the untouched starting source.
- The production build does not run this code-quality checker, so these findings did not block the current deployment.
- No live malfunction was reproduced as part of this documentation exercise.

The production-provenance evidence is recorded in `docs/2026-08-22-ap0-authority-and-p0-safety-foundation-approval-package.md`.

## Interpretation labels used in this document

These labels are evidence descriptions, not severity priorities:

- **Credible latent malfunction:** The present code contains a specific trigger-to-failure path. It has not yet been reproduced.
- **Future safeguard gap:** The current code can work, but a future data or code change can escape an automatic check and become a malfunction.
- **Development-only disruption:** The issue affects local editing or testing behavior, not the published store bundle.
- **No credible runtime path identified:** The checker objects to form or maintainability, but the current construct has the same runtime behavior as the suggested form.
- **Unknown:** More targeted reproduction or external-state evidence is required.

## Totals by checker rule

| Checker rule | Errors | What the checker is objecting to | Initial causal interpretation |
| --- | ---: | --- | --- |
| Unspecified data shape (`no-explicit-any`) | 41 | The compiler is told not to check the shape of a value. | Usually a future safeguard gap. Some occurrences sit on catalogue, sitemap, SEO, payment logging or data-changing admin paths and need separate causal review. |
| Unnecessary regular-expression escape (`no-useless-escape`) | 9 | A slash is escaped where that escape is not needed. | No credible runtime path identified. The checker states that removing the escape preserves behavior. |
| Old variable declaration form (`no-var`) | 7 | `var` is used instead of `let` or `const`. | No credible runtime path identified in this bundled module. The declarations are at module level and are not reassigned. |
| Conditional screen-state helper (`react-hooks/rules-of-hooks`) | 4 | A screen-state helper may be skipped on one render and called on another. | Credible latent malfunction. The four findings arise from two root code patterns. |
| Variable could be constant (`prefer-const`) | 2 | A binding is never reassigned. | No credible runtime path identified. Changing the declaration does not change behavior. |
| Broad compiler suppression (`ban-ts-comment`) | 1 | A compiler complaint is always suppressed even when the original reason disappears. | Future safeguard gap on one image-priority attribute. |
| Empty type wrapper (`no-empty-object-type`) | 1 | An empty interface is equivalent to its parent type. | No credible runtime path identified. Type-only construct. |
| Empty exception handler (`no-empty`) | 1 | A configuration parsing error is ignored without explanation. | Future diagnostic gap for the optional MCP service. Storefront impact not identified. |
| Older import form (`no-require-imports`) | 1 | A build configuration uses `require()` in a module-style file. | No current runtime failure identified. A future build-tool compatibility risk exists only if module handling changes. |
| Mixed exports during local refresh (`react-refresh/only-export-components`) | 7 warnings | Some screen files export components and other values together. | Development-only disruption. It can make local hot refresh unreliable, but it is not included in production runtime behavior. |
| **Total** | **67 errors, 7 warnings** |  |  |

## Complete location inventory

Every checker location is listed below. Multiple locations on one row share the same rule and surrounding behavior.

| File | Location(s) | Level | Rule | Count |
| --- | --- | --- | --- | ---: |
| `scripts/prebuild.ts` | 23:23, 26:18, 26:25 | Error | Unnecessary escape | 3 |
| `scripts/prebuild.ts` | 32:27, 69:41, 96:32, 99:65, 159:41 | Error | Unspecified data shape | 5 |
| `scripts/prebuild.ts` | 96:7 | Error | Variable could be constant | 1 |
| `src/components/AdminPanel.tsx` | 54:23, 253:87 | Error | Unnecessary escape | 2 |
| `src/components/AdminPanel.tsx` | 920:9 | Error | Variable could be constant | 1 |
| `src/components/ArticleImageBrowser.tsx` | 134:21, 231:21, 285:21 | Error | Unspecified caught-error shape | 3 |
| `src/components/BrokenImageCleanup.tsx` | 31:15, 32:10, 99:43, 118:40, 168:21, 267:26, 277:19, 283:54, 305:23, 322:21 | Error | Unspecified data or caught-error shape | 10 |
| `src/components/Hero.tsx` | 36:9 | Error | Broad compiler suppression | 1 |
| `src/components/ImageOptimizer.tsx` | 219:50, 228:47, 242:50, 247:47, 277:24, 285:60, 298:53, 498:23 | Error | Unspecified data or caught-error shape | 8 |
| `src/components/ImageUpload.tsx` | 196:21 | Error | Unspecified caught-error shape | 1 |
| `src/components/ProductCard.tsx` | 25:43, 26:37, 29:37 | Error | Conditional screen-state helper | 3 |
| `src/components/admin/PageEditorForm.tsx` | 91:88 | Error | Unnecessary escape | 1 |
| `src/components/ui/badge.tsx` | 29:17 | Warning | Mixed exports during local refresh | 1 |
| `src/components/ui/button.tsx` | 48:18 | Warning | Mixed exports during local refresh | 1 |
| `src/components/ui/debounced-input.tsx` | 64:17 | Warning | Mixed exports during local refresh | 1 |
| `src/components/ui/form.tsx` | 129:10 | Warning | Mixed exports during local refresh | 1 |
| `src/components/ui/sonner.tsx` | 27:19 | Warning | Mixed exports during local refresh | 1 |
| `src/components/ui/textarea.tsx` | 5:18 | Error | Empty type wrapper | 1 |
| `src/contexts/CartContext.tsx` | 128:14 | Warning | Mixed exports during local refresh | 1 |
| `src/hooks/usePages.ts` | 80:40 | Error | Unspecified data shape | 1 |
| `src/hooks/useProducts.ts` | 63:29 | Error | Unspecified data shape | 1 |
| `src/hooks/useStaticProducts.ts` | 80:29 | Error | Unspecified data shape | 1 |
| `src/hooks/useStaticSiteSettings.ts` | 12:31, 12:65 | Error | Unspecified data shape | 2 |
| `src/lib/utils.ts` | 18:23, 21:18, 21:25 | Error | Unnecessary escape | 3 |
| `src/pages/OAuthConsent.tsx` | 9:9, 28:42 | Error | Unspecified authorization-response shape | 2 |
| `src/pages/Product.tsx` | 139:20 | Error | Conditional screen-state helper | 1 |
| `src/pages/Product.tsx` | 306:28, 307:34 | Error | Unspecified product SEO fields | 2 |
| `src/routes.tsx` | 28:7 | Warning | Mixed exports during local refresh | 1 |
| `supabase/functions/create-checkout/index.ts` | 10:42 | Error | Unspecified logging-detail shape | 1 |
| `supabase/functions/mcp/index.ts` | 45:13 | Error | Empty exception handler | 1 |
| `supabase/functions/mcp/index.ts` | 62:1, 92:1, 118:1, 145:1, 171:1, 208:1, 209:1 | Error | Old variable declaration form | 7 |
| `supabase/functions/seo-proxy/index.ts` | 112:50, 113:40 | Error | Unspecified product-size shape | 2 |
| `tailwind.config.ts` | 108:13 | Error | Older import form | 1 |
| `vite.config.ts` | 18:30, 45:21 | Error | Unspecified build or page shape | 2 |
| **Total** |  |  |  | **74** |

## Causal analysis by behavior

### 1. Product-card screen-state order

Locations: `src/components/ProductCard.tsx` lines 25, 26 and 29.

What exists today:

- The component returns nothing at line 23 when an artwork has no slug.
- Three screen-state helpers are called only after that return.
- The three checker entries are one root pattern, not three separate bugs.

How it could originate a malfunction:

1. A particular card first renders with no slug and therefore calls none of the three helpers.
2. The same mounted card later receives a product with a slug.
3. That render calls three additional helpers in a different order from the previous render.
4. React can reject the changed order, producing a render error and removing or breaking that card or its surrounding screen.

Customer or business consequence if triggered:

- An artwork card could fail to appear or the gallery could render an error.
- A customer could be prevented from opening the affected artwork and beginning purchase.

Counterexamples and limits:

- If each card's product and slug remain stable for the lifetime of the mounted card, the trigger does not occur.
- The checker does not prove that production currently changes a slug on an already mounted card.
- No live failure or local reproduction has yet been recorded.

Evidence label: **Credible latent malfunction**, with trigger frequency unknown.

### 2. Canonical product redirect and screen-state order

Location: `src/pages/Product.tsx` line 139.

What exists today:

- The product screen calls several state helpers, then returns a redirect at lines 90 to 92 when the URL contains a product identifier instead of its canonical slug.
- The mobile-layout helper at line 139 is after that possible return.

How it could originate a malfunction:

1. A visitor opens an older product URL containing the product identifier.
2. The product screen renders and returns the redirect before calling the mobile-layout helper.
3. The router replaces the address with the canonical slug while reusing the same product-screen instance.
4. The next render calls the additional helper.
5. React can reject the changed helper order, interrupting the redirect destination instead of showing the canonical product page.

Customer or business consequence if triggered:

- An old or shared product link could fail before the customer can select a size or pay.
- The intended canonical product page could be unavailable to that visit, affecting both transaction readiness and the consolidation of search signals.

Counterexamples and limits:

- If the router fully unmounts and remounts the product screen during this address change, the helper order is reset and the trigger does not occur.
- The actual router reuse behavior for this exact path has not yet been rehearsed.
- No live failure has been reproduced.

Evidence label: **Credible latent malfunction**, with a more concrete trigger than the product-card pattern but without reproduction evidence.

### 3. Catalogue and page build input shapes

Locations:

- `scripts/prebuild.ts` lines 32, 69, 96, 99 and 159.
- `src/hooks/useProducts.ts` line 63.
- `src/hooks/useStaticProducts.ts` line 80.
- `src/hooks/useStaticSiteSettings.ts` line 12 at columns 31 and 65.

What exists today:

- Database responses, artwork sizes, page records and site-setting values are accepted with incomplete compiler checking.
- Some runtime protection exists. Arrays are checked before size normalization, defaults are applied, and failed product or page requests stop the build.
- Object members inside accepted arrays are not fully validated before being read or copied.

How it could originate a malfunction:

1. The database or generated data changes shape, contains a malformed record, or renames a field.
2. The compiler does not flag the mismatch because these points opt out of shape checking.
3. The build may write incorrect catalogue, page, price, image or setting data, or it may fail while reading a missing member.
4. If an incorrect build were released, an artwork page, visible price, payment mapping, shared image or public page identity could be wrong.

Counterexamples and limits:

- The untouched source currently passes its compiler check and is deployed.
- A stronger compile-time type alone would not validate live database values. Runtime validation is required to close the data-shape path.
- No malformed-input rehearsal has yet been performed for these existing functions.

Evidence label: **Future safeguard gap**. The potential impact reaches all three P0 outcomes, but likelihood and current data conformance are unmeasured.

### 4. Sitemap build input shapes

Locations: `vite.config.ts` lines 18 and 45.

What exists today:

- The sitemap builder accepts the build output object and CMS page list without a checked shape.
- It reads generated JSON and constructs public addresses directly from page and product members.

How it could originate a malfunction:

1. A generated page or product record has a missing, malformed or renamed public-address field.
2. The unchecked value is inserted into the sitemap or causes the sitemap build step to fail.
3. Search and answer engines receive missing or incorrect public addresses.

Counterexamples and limits:

- The two lint findings do not themselves prove the current sitemap is wrong.
- Replacing `any` with a static type would not validate parsed JSON at runtime.
- Separate AP0 evidence already identifies live sitemap and routing contradictions. Those are not caused or proven by these two lint entries and must remain separate findings.

Evidence label: **Future safeguard gap**, with discoverability impact possible if malformed input occurs.

### 5. Product SEO fields

Locations: `src/pages/Product.tsx` lines 306 and 307.

What exists today:

- The product screen reads optional SEO title and description members by bypassing its declared product shape.
- It falls back to the artwork name and description when those values are absent.

How it could originate a malfunction:

1. The SEO fields are renamed, contain an unexpected value, or diverge from the product type.
2. The compiler cannot flag the mismatch at these two reads.
3. The page can silently fall back to generic metadata or pass an unsuitable value to the SEO component.
4. The page may remain usable for customers while becoming incorrectly identified or described to search and answer engines.

Counterexamples and limits:

- Optional missing fields are intentionally handled by fallbacks.
- Property access on the current product object is not inherently unsafe at runtime.
- No current metadata failure is proven by these two checker entries.

Evidence label: **Future safeguard gap**, not a confirmed discoverability failure.

### 6. SEO proxy product sizes

Locations: `supabase/functions/seo-proxy/index.ts` lines 112 and 113.

What exists today:

- The crawler-facing response assumes `product.sizes` is an array of objects with numeric price members.
- It filters and maps those objects without runtime validation.
- An empty valid-price list would also produce a non-finite minimum price.

How it could originate a malfunction:

1. A product has malformed sizes, a non-array value, or no positive price.
2. The proxy throws while filtering, or builds metadata using a non-finite price.
3. A crawler receives an error or misleading product information.

Counterexamples and limits:

- Correctly shaped products with at least one positive price follow the intended path.
- The checker only reports the missing compile-time shape. The empty-list condition is a separate nearby observation revealed by causal review.
- No request against the live function was made during this documentation step.

Evidence label: **Credible latent malfunction** for malformed or empty size data. Trigger presence is unknown.

### 7. Payment-function logging detail

Location: `supabase/functions/create-checkout/index.ts` line 10.

What exists today:

- A logging helper accepts any detail value.
- The finding is on logging, not price lookup, payment creation or payment confirmation.

How it could originate a malfunction:

- No direct payment malfunction path was identified from the unspecified type at line 10. JSON conversion can fail on a circular object, but the current calls shown use ordinary request or status data.
- A failed conversion would happen inside the request handler and could stop checkout before payment creation.

Counterexamples and limits:

- Normal parsed request bodies are plain data and can be converted to JSON.
- The more important nearby concern is that the whole request body is logged at line 47 and may include a customer email. That privacy concern is not one of the 74 checker findings and requires separate review. No private value is reproduced in this document.

Evidence label: **Future safeguard gap** for the lint entry. Separate privacy follow-up required for the nearby full-body logging behavior.

### 8. Admin image browser and upload error values

Locations:

- `src/components/ArticleImageBrowser.tsx` lines 134, 231 and 285.
- `src/components/ImageUpload.tsx` line 196.
- `src/components/ImageOptimizer.tsx` line 498.
- `src/components/BrokenImageCleanup.tsx` lines 168, 305 and 322.

What exists today:

- Caught exceptions are assumed to have a readable `message` member.

How it could originate a malfunction:

1. A library throws a string, null value or differently shaped object.
2. The error handler tries to read `.message` without checking the shape.
3. The handler itself can fail or show an empty message, hiding the original operation failure.

Customer or business consequence if triggered:

- The admin may not receive a useful explanation after a scan, upload, optimization, deletion or cleanup failure.
- The original operation has already failed. This pattern mainly worsens diagnosis and recovery rather than originating the first failure.

Counterexamples and limits:

- Standard JavaScript `Error` objects have a message and follow the intended path.
- These screens require admin action and are not part of an ordinary customer visit.

Evidence label: **Future diagnostic gap**, limited to manually used admin tools.

### 9. Admin image cleanup data shapes

Locations: `src/components/BrokenImageCleanup.tsx` lines 31, 32, 99, 118, 267, 277 and 283.

What exists today:

- The cleanup tool accepts unvalidated mock-room and size objects.
- It can alter product image references after a scan and confirmation.
- Array checks exist, but member objects and their fields are not validated.

How it could originate a malfunction:

1. A product contains a legacy, malformed or unexpected mock-room or size entry.
2. The scan misreads a member, skips it, or associates an array position with the wrong expected shape.
3. The confirmed cleanup removes or clears the wrong image reference or writes an incomplete array back to the product.
4. Artwork imagery or room previews can disappear from the customer-facing product.

Counterexamples and limits:

- The tool is manually invoked and includes a confirmation step.
- It checks that the main collections are arrays and updates products one at a time.
- No cleanup was run and no production data was changed.
- The lint findings show absent safeguards, not proof that current product records are malformed.

Evidence label: **Credible latent malfunction** on a data-changing admin path. Trigger requires manual use plus unexpected data.

### 10. Admin image optimizer data shapes

Locations: `src/components/ImageOptimizer.tsx` lines 219, 228, 242, 247, 277, 285 and 298.

What exists today:

- The optimizer scans and rewrites product image addresses in main images, room images and size-specific room images.
- Its verification and update loops treat nested records as unchecked objects.

How it could originate a malfunction:

1. A nested image record has an unexpected shape.
2. The tool misses an old address, updates an unintended member, or incorrectly concludes that the new address is present.
3. The administrator receives a success result despite an incomplete or incorrect product-data change.
4. Customer-facing artwork imagery can remain broken or be pointed at the wrong location.

Counterexamples and limits:

- The tool explicitly re-reads the database and verifies old and new addresses.
- Array checks exist before iteration.
- It is a manually invoked admin tool, not an automatic customer path.
- No optimization or database update was executed.

Evidence label: **Credible latent malfunction** on a data-changing admin path, mitigated by manual invocation and verification logic.

### 11. Article image browser and other admin data

Locations:

- `src/components/ArticleImageBrowser.tsx` lines 134, 231 and 285, covered under error handling above.
- `src/hooks/usePages.ts` line 80.
- `src/pages/OAuthConsent.tsx` lines 9 and 28.

What exists today:

- Page-update fields are collected in a flexible object before a database update.
- Authorization response and screen details are accepted without a declared specific shape.

How it could originate a malfunction:

- A future field rename or provider response change can escape the compiler and cause a failed page edit or authorization-consent screen.
- These paths affect admin content management or connected-tool authorization, not an ordinary store visit.

Counterexamples and limits:

- The page-update object is intentionally heterogeneous and is sent to a database client that performs its own request handling.
- No provider-response mismatch or current admin failure was reproduced.

Evidence label: **Future safeguard gap** on non-customer paths.

### 12. Broad compiler suppression on the hero image

Location: `src/components/Hero.tsx` line 36.

What exists today:

- The next line's image-priority attribute is always excluded from compiler checking.

How it could originate a malfunction:

1. The original type mismatch disappears or the line changes for another reason.
2. The broad suppression remains and hides a new compiler complaint on that exact line.
3. A misspelled or invalid image-priority attribute can ship without the expected compile-time signal.
4. The hero image may load with lower priority, harming initial visual performance rather than preventing store use.

Counterexamples and limits:

- The current lowercase attribute is deliberate and the browser can accept it.
- No current hero-image loading failure is proven.

Evidence label: **Future safeguard gap**.

### 13. Regular-expression escape findings

Locations:

- `scripts/prebuild.ts` lines 23 and 26 twice.
- `src/components/AdminPanel.tsx` lines 54 and 253.
- `src/components/admin/PageEditorForm.tsx` line 91.
- `src/lib/utils.ts` lines 18 and 21 twice.

What exists today:

- Slash characters are escaped inside regular-expression character groups where the escape is unnecessary.

How it could originate a malfunction:

- No present runtime malfunction path was identified. The checker explicitly reports a behavior-preserving removal.
- The only future risk is readability: a maintainer may find the expression harder to interpret and make a separate mistaken edit.

Counterexample:

- Both escaped and unescaped slash forms match the intended slash in these expressions.

Evidence label: **No credible runtime path identified**.

### 14. Constant-declaration findings

Locations:

- `scripts/prebuild.ts` line 96.
- `src/components/AdminPanel.tsx` line 920.

What exists today:

- The object or array contents are mutated, but the variable binding itself is never reassigned.

How it could originate a malfunction:

- No present runtime path was identified. Changing `let` to `const` would prevent a future reassignment but would not change current execution.

Evidence label: **No credible runtime path identified**.

### 15. Empty type wrapper

Location: `src/components/ui/textarea.tsx` line 5.

What exists today:

- The named textarea properties interface adds no members to the standard textarea properties.

How it could originate a malfunction:

- It cannot affect runtime because the type is removed during the build.
- It can create minor maintenance confusion about whether custom properties exist.

Evidence label: **No credible runtime path identified**.

### 16. Optional MCP configuration parsing and bundled declarations

Locations:

- Empty exception handler: `supabase/functions/mcp/index.ts` line 45.
- Old declaration form: the same file at lines 62, 92, 118, 145, 171, 208 and 209.

What exists today:

- If a preferred key collection cannot be parsed, the code silently tries legacy configuration and eventually raises a general missing-key error if no fallback exists.
- The seven `var` declarations belong to a bundled module and are not shown being reassigned.

How it could originate a malfunction:

- A malformed preferred key collection can be hidden, making the MCP service fail with a less precise explanation and increasing recovery time.
- No separate runtime malfunction was identified from the seven declaration forms.

Counterexamples and limits:

- A valid direct key or legacy key bypasses the malformed collection.
- This function serves the connected MCP tool, not the public storefront, checkout or ordinary search crawler.
- No live MCP request or setting change was performed.

Evidence labels:

- Empty handler: **Future diagnostic gap**.
- Seven declaration findings: **No credible runtime path identified**.

### 17. Build configuration import form

Location: `tailwind.config.ts` line 108.

What exists today:

- The style-build configuration uses an older import form inside a module-style file.

How it could originate a malfunction:

1. A future build-tool or module-handling upgrade removes the current compatibility behavior.
2. The style plugin fails to load.
3. A release build fails or ships without expected generated styles if the build does not stop correctly.

Counterexamples and limits:

- The current build tooling accepts this form and the production source was built.
- No present customer-runtime path exists without a future tooling change.

Evidence label: **Future build compatibility gap**.

### 18. Local refresh warnings

Locations:

- `src/components/ui/badge.tsx` line 29.
- `src/components/ui/button.tsx` line 48.
- `src/components/ui/debounced-input.tsx` line 64.
- `src/components/ui/form.tsx` line 129.
- `src/components/ui/sonner.tsx` line 27.
- `src/contexts/CartContext.tsx` line 128.
- `src/routes.tsx` line 28.

What exists today:

- Files export screen components together with helper values or functions.

How it could originate a malfunction:

1. During local editing, the hot-refresh system cannot safely replace only the edited component.
2. It may refresh more of the application, reset local state, or fail to display the newest edit until a full reload.
3. A developer can temporarily misread the local result while testing a change.

Counterexamples and limits:

- The hot-refresh system is a development tool and is not part of the published production runtime.
- A clean full reload displays the built code.

Evidence label: **Development-only disruption**.

## File totals and concentration

| File or area | Errors | Warnings | Main interpretation |
| --- | ---: | ---: | --- |
| `src/components/BrokenImageCleanup.tsx` | 10 | 0 | Admin-only data-shape and diagnostic gaps on a data-changing tool. |
| `scripts/prebuild.ts` | 9 | 0 | Five data-shape safeguards, three behavior-neutral escapes, one behavior-neutral declaration. |
| `src/components/ImageOptimizer.tsx` | 8 | 0 | Admin-only data-shape and diagnostic gaps on a data-changing tool. |
| `supabase/functions/mcp/index.ts` | 8 | 0 | Seven bundled declaration-style findings and one diagnostic gap. |
| `src/components/AdminPanel.tsx` | 3 | 0 | Two behavior-neutral escapes and one behavior-neutral declaration. |
| `src/components/ArticleImageBrowser.tsx` | 3 | 0 | Admin error-reporting safeguards. |
| `src/components/ProductCard.tsx` | 3 | 0 | One credible runtime pattern reported three times. |
| `src/lib/utils.ts` | 3 | 0 | Behavior-neutral regular-expression escapes. |
| `src/pages/Product.tsx` | 3 | 0 | One credible redirect/runtime pattern and two SEO type safeguards. |
| `src/hooks/useStaticSiteSettings.ts` | 2 | 0 | Data-shape safeguards for live settings. |
| `src/pages/OAuthConsent.tsx` | 2 | 0 | Connected-tool authorization shape safeguards. |
| `supabase/functions/seo-proxy/index.ts` | 2 | 0 | Crawler-facing product-size validation gap. |
| `vite.config.ts` | 2 | 0 | Sitemap build-input safeguards. |
| Seven local-refresh files | 0 | 7 | Development-only warnings. |
| Nine remaining single-error files | 9 | 0 | Mixed formality, diagnostic and future safeguard findings. |
| **Total** | **67** | **7** |  |

## What is and is not proven

Proven:

- These exact 74 findings exist in the source corresponding to the current production deployment.
- They do not currently block the production build because the release process does not run this checker.
- Four findings identify two conditional screen-state patterns with credible trigger-to-render-failure chains.
- Several findings are on data-changing admin tools, build data, sitemap data and crawler metadata, where absent shape checks can permit future malformed inputs to travel further.
- Nine escape errors, two constant-declaration errors, seven bundled `var` errors and the empty type wrapper have no identified current runtime behavior difference.
- Seven warnings concern local refresh behavior, not the published runtime.

Not proven:

- That any of the 74 findings is currently causing a live customer failure.
- That all 67 errors should be fixed, or that they should be fixed together.
- That replacing every unspecified type with a declared type would make runtime data safe.
- That either conditional screen-state trigger occurs in current customer traffic.
- That the current database contains the malformed values required by the data-shape failure paths.
- Any final P0, P1 or P2 ranking. That awaits application of Donato's approved framework and targeted rehearsals.

## Reproduction record

Commands used without changing application code or external state:

```bash
npm run lint -- --format stylish
npx tsc -b
git diff --name-only ffe0b380166bd6b9bae7e3d89711a1078867e41d..HEAD -- scripts src supabase tailwind.config.ts vite.config.ts
```

Observed results:

- Lint: exit `1`, 67 errors, 7 warnings, 74 total.
- Compiler: exit `0` on the untouched starting source.
- Application-file difference from the production source snapshot: none.

## Follow-up required before prioritization

1. Rehearse the identifier-to-slug product redirect locally to determine whether the router reuses the same screen and triggers the conditional-helper failure.
2. Rehearse a product card changing from missing slug to present slug within one mounted position.
3. Inspect current committed catalogue data for malformed or empty size collections through the AP1A catalogue validator, without changing data.
4. Test the sitemap and crawler metadata checkers against controlled malformed examples.
5. Review the separate full-request-body logging concern without exposing or collecting customer data.
6. Prioritize root patterns, not raw checker counts. In particular, the three ProductCard entries are one code pattern and the seven MCP declaration entries are one style pattern.
7. Continue searching for unlisted triggers and alternate failure paths. Passing the recorded probes does not establish safety.

No repair, bulk formatting, dependency change, production action or external-setting change is authorized by this document.
