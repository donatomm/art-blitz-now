

# Health Assessment and Implementation Plan: Centralized Contact Buttons

## 1. Architecture Audit -- Current State

### Data Flow Map

There are **two parallel query caches** for site settings:

- `["site-settings"]` -- used by `useSiteSettings` (Admin Panel read/write)
- `['site-settings-live']` -- used by `useStaticSiteSettings` (consumer-facing components)

When the admin saves, `useUpdateSiteSetting` invalidates `["site-settings"]` but **NOT** `['site-settings-live']`. Consumer components will only see the update after the 30-second `staleTime` expires or a page refresh. This is a **propagation gap**.

### Hardcoded Contact Strings Found

| File | Hardcoded Values | Count |
|------|-----------------|-------|
| `Product.tsx` | `393666295174` (x4), `me@octowonders.com` (x1), `info@octowonders.com` (x1) | 6 |
| `Index.tsx` | `wa.me/?text=...` (empty number -- **BROKEN**) | 1 |
| **Total** | | **7 hardcoded strings** |

### Dead Code Found

`onCustomOrder` in `Index.tsx` is passed through `MasonryGrid` to `ProductCard`, but `ProductCard` **never calls it**. The ACQUISTA button links directly to `/product/{slug}#acquista` instead. This entire prop chain (`Index.tsx` line 63-66, `MasonryGrid` prop, `ProductCard` prop) is dead code.

### Style Inventory -- Current Inconsistency

| Component | WhatsApp Style | Email Style | Data Source |
|-----------|---------------|-------------|-------------|
| Contact.tsx | Green #25D366 + SVG | Gold gradient + SVG | Dynamic (settings) |
| ContactButtons.tsx | Green #25D366 + SVG | Gold gradient + SVG | Dynamic (settings) |
| HelloBar.tsx | Green #25D366 + SVG | `bg-primary` (wrong) | Props from settings |
| BuyDialog.tsx | shadcn Button default | shadcn Button secondary | Dynamic (settings) |
| CheckoutSuccess.tsx | Plain green text link | Plain primary text link | Dynamic (settings) |
| Product.tsx | Gray bg-gray-100 | Gray bg-gray-100 | **Hardcoded** |

---

## 2. Critical Bug: Query Key Mismatch (Propagation)

**Root cause:** Admin save invalidates `["site-settings"]`, but consumer components listen on `['site-settings-live']`.

**Fix:** In `useSiteSettings.ts`, the `onSuccess` callback of `useUpdateSiteSetting` must ALSO invalidate `['site-settings-live']`. One line change:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["site-settings"] });
  queryClient.invalidateQueries({ queryKey: ["site-settings-live"] });
},
```

This ensures admin saves propagate instantly to all consumer components without waiting for the 30-second staleTime.

---

## 3. Regression Risk Assessment by File

| File | Change Scope | Risk Level | Rationale |
|------|-------------|------------|-----------|
| `Product.tsx` (662 lines) | Add hook + replace 6 hardcoded strings + restyle 2 buttons | **MEDIUM** | Complex file with many concerns (carousel, checkout, sizes, terms), but changes are localized to link-building functions and one JSX block |
| `BuyDialog.tsx` (120 lines) | Replace Button wrappers with styled `<a>` tags | **LOW** | Already uses settings hook; only JSX button markup changes |
| `CheckoutSuccess.tsx` (124 lines) | Replace Lucide icons + add branded styling | **LOW** | Already uses settings hook; purely visual changes |
| `HelloBar.tsx` (191 lines) | Change email button from `bg-primary` to gold gradient | **LOW** | Single CSS change, no logic change |
| `Index.tsx` (122 lines) | Remove dead `handleCustomOrder` function | **LOW** | Removing unused code; no runtime impact |
| `useSiteSettings.ts` (54 lines) | Add one `invalidateQueries` call | **LOW** | Additive change, no behavior change for existing admin query |

### Overall Regression Risk: **LOW-MEDIUM**

The highest-risk change (Product.tsx) is localized to:
- 3 link-building functions (lines 171-226) -- replacing string literals with `settings.xxx`
- 1 JSX block (lines 630-648) -- replacing Button wrappers with `<a>` tags

No changes to checkout logic, carousel, size selection, or any other Product.tsx concern.

---

## 4. Critical Review -- What Can Be Questioned

### a) SVG Duplication
The same WhatsApp SVG path and Mail SVG path are now copy-pasted in 5+ files. This is maintainable for now (SVGs don't change), but if a third icon is ever added, consider extracting to shared `<WhatsAppIcon />` and `<MailIcon />` components.

**Decision:** Accept duplication for now. Extracting adds a new file and import chain with no functional benefit. Revisit only if a third contact channel is added.

### b) Inline Styles vs Tailwind
The gold gradient uses `style={{ background: "linear-gradient(...)" }}` because Tailwind doesn't natively support multi-stop gradients with arbitrary hex colors. This is acceptable and consistent with the existing pattern in `ContactButtons.tsx`.

### c) BuyDialog Button Size
BuyDialog renders inside a `sm:max-w-md` dialog. The branded buttons must fit within this constrained width. Use smaller sizing (`py-2 px-4`, `text-sm`) rather than the full-size Contact page buttons.

### d) CheckoutSuccess Context
The checkout success page has a specific VIP WhatsApp section with a green theme. Applying the full gold-gradient email style here would visually clash with the existing green VIP section. **Recommendation:** Apply branded buttons only to the "contattami qui" section (lines 84-101), keep the VIP section's visual identity separate but use the WhatsApp SVG logo instead of the generic Lucide icon.

### e) Dead Code Removal Scope
Removing `onCustomOrder` from Index.tsx means also removing it from `MasonryGrid` props and `ProductCard` props. This is 3 files but each change is just deleting a prop. Low risk but adds to the diff size.

**Decision:** Remove dead code in a separate stage to keep the contact-button diff clean.

---

## 5. MD/HTML Toggle Survival Check

The `{{CONTACT_BUTTONS}}` token is handled in **both** code paths of `PageContent.tsx`:

- **Markdown mode** (line 132): `trimmedLine === "{{CONTACT_BUTTONS}}"` triggers `<ContactButtons />` injection
- **HTML mode** (line 281): `htmlContent.includes("{{CONTACT_BUTTONS}}")` splits and injects `<ContactButtons />` between HTML segments

Both paths render the same `ContactButtons` React component, which is self-contained with its own `useStaticSiteSettings` call. **Switching a page's content_type between "markdown" and "html" in the Admin Panel will NOT break the contact buttons.** The token works identically in both modes.

---

## 6. Admin Panel Save Verification

The save flow in `HelloBarTabContent.tsx`:

1. Admin edits "Numero WhatsApp" and "Indirizzo Email" fields (lines 351-370)
2. Inputs are debounced (150ms) via `useDebouncedInput` (lines 127-135)
3. On "Salva Hello Bar" click, `handleSave` calls `flushSync()` on all debounced values (lines 139-143)
4. Then fires 17 `updateSetting.mutateAsync()` calls in parallel (lines 146-164)
5. Each calls `supabase.from("site_settings").upsert(...)` with `onConflict: 'key'`
6. On success, invalidates `["site-settings"]` query cache

**Current gap:** Step 6 does NOT invalidate `['site-settings-live']`, so consumer components lag by up to 30 seconds. Fix described in Section 2 above.

---

## 7. Staged Implementation Plan

### Stage 1: Fix Propagation (1 file, critical)

**File:** `src/hooks/useSiteSettings.ts`

Add `queryClient.invalidateQueries({ queryKey: ["site-settings-live"] })` to the `onSuccess` callback. This ensures ALL subsequent changes propagate instantly.

**Why first:** Without this fix, testing any other change requires waiting 30 seconds or refreshing. Fixing this first makes all subsequent testing instant.

---

### Stage 2: Product.tsx (1 file, highest risk)

**File:** `src/pages/Product.tsx`

- Add `useStaticSiteSettings` import and `settings` variable
- Replace 6 hardcoded strings in `getWhatsAppLink()`, `getEmailLink()`, `getCustomWhatsAppLink()`, `getCustomEmailLink()` with `settings.hellobar_whatsapp_number` and `settings.hellobar_contact_email`
- Fallback: if settings are empty/undefined, the `wa.me/` and `mailto:` links still work (just with no pre-filled recipient -- same as current broken `handleCustomOrder`)
- Restyle the contact/support section (lines 630-648) with green + gold branded `<a>` tags
- Remove `MessageCircle, Mail` from Lucide imports (replaced by inline SVGs)

---

### Stage 3: BuyDialog + CheckoutSuccess (2 files, low risk)

**File:** `src/components/BuyDialog.tsx`
- Replace `<Button asChild>` wrappers with branded `<a>` tags (compact size for dialog context)
- Remove `Button`, `MessageCircle`, `Mail` imports

**File:** `src/pages/CheckoutSuccess.tsx`
- Replace Lucide `<MessageCircle>` in VIP section with WhatsApp SVG logo (keep green theme)
- Replace generic text links in "contattami qui" section with branded green + gold `<a>` tags
- Remove `MessageCircle`, `Mail` from Lucide imports

---

### Stage 4: HelloBar Email Fix + Dead Code Cleanup (2 files, low risk)

**File:** `src/components/HelloBar.tsx`
- Change email button style from `bg-primary hover:bg-primary/90 text-primary-foreground` to the gold gradient + border style

**File:** `src/pages/Index.tsx`
- Remove the dead `handleCustomOrder` function (lines 63-66)
- Remove `onCustomOrder` prop from `<MasonryGrid>` (line 107)

**Files (optional, cleanup):** `src/components/MasonryGrid.tsx` and `src/components/ProductCard.tsx`
- Remove `onCustomOrder` from props interface (dead prop)

---

### Stage 5: Documentation + Verification

**Create:** `docs/admin-contact-buttons.md` documenting the admin workflow:

```
## How to Update Contact Buttons

1. Open Admin Panel (gear icon, bottom-right corner)
2. Navigate to the "Hello Bar" tab
3. Scroll to the "Contenuto Popup" section
4. Edit "Numero WhatsApp" (international format without +, e.g., 393666295174)
5. Edit "Indirizzo Email"
6. Click "Salva Hello Bar"
7. Changes propagate instantly to all pages:
   - /contatti
   - All product pages (/product/*)
   - Checkout success page
   - HelloBar popup
   - Any CMS page using the {{CONTACT_BUTTONS}} token
   - BuyDialog (quick purchase modal)
8. Blog pages only show buttons if you add {{CONTACT_BUTTONS}} to the content
```

---

## 8. Summary

| What | Count | Risk |
|------|-------|------|
| Files modified | 6 (+ 2 optional cleanup) | LOW-MEDIUM overall |
| Hardcoded strings removed | 7 | -- |
| Dead code removed | 1 function + 3 prop declarations | -- |
| Critical bug fixed | 1 (query key propagation) | -- |
| New files | 1 (documentation) | -- |
| Database changes | 0 | -- |
| New dependencies | 0 | -- |

The staged approach isolates the riskiest change (Product.tsx) from the straightforward style updates, and fixes the propagation bug first so every subsequent stage can be tested immediately.

