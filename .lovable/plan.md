

# Implement No/Low Risk Changes: Remove Hardcoded Contact Details

Only steps rated **None** or **Low** risk from the regression analysis. Skipping Product.tsx (medium), Contact.tsx deletion (high), and DB content updates (user action).

---

## Step 1: Fix `usePages.ts` preview domain detection (Risk: None)

**File:** `src/hooks/usePages.ts`, lines 5-7

Add `lovableproject.com` to `isLovablePreview` -- same fix already applied to `useStaticSiteSettings.ts`.

```typescript
const isLovablePreview = typeof window !== 'undefined' && 
  (window.location.hostname.includes('lovable.app') || 
   window.location.hostname.includes('lovableproject.com') ||
   window.location.hostname.includes('localhost'));
```

---

## Step 2: Create `ContactButtons` component (Risk: None -- new file)

**New file:** `src/components/ContactButtons.tsx`

A reusable React component that:
- Reads `hellobar_whatsapp_number` and `hellobar_contact_email` from `useStaticSiteSettings()`
- Accepts optional `whatsappMessage` and `emailSubject` / `emailBody` overrides
- Renders WhatsApp (green CTA) + Email (secondary) buttons
- Responsive: stacks vertically on mobile, side-by-side on desktop
- Zero hardcoded contact details

---

## Step 3: Add `{{CONTACT_BUTTONS}}` token to PageContent.tsx (Risk: Low)

**File:** `src/components/PageContent.tsx`

In both the markdown renderer (`renderContent`) and the HTML renderer:
- Detect lines containing `{{CONTACT_BUTTONS}}`
- Render the `ContactButtons` component at that position
- For HTML mode: split content at `{{CONTACT_BUTTONS}}`, render HTML before it, then the component, then HTML after

This allows any CMS page (markdown or HTML) to include dynamic contact buttons without hardcoding.

---

## Step 4: Refactor `BuyDialog.tsx` (Risk: Low)

**File:** `src/components/BuyDialog.tsx`

- Import `useStaticSiteSettings`
- Replace hardcoded `393666295174` (line 29) with `settings.hellobar_whatsapp_number`
- Replace hardcoded `me@octowonders.com` (line 59) with `settings.hellobar_contact_email`
- Keep the product-specific message templates unchanged

---

## Step 5: Refactor `CheckoutSuccess.tsx` (Risk: Low)

**File:** `src/pages/CheckoutSuccess.tsx`

- Import `useStaticSiteSettings`
- Replace 3 hardcoded WhatsApp links (lines 63, 82) with dynamic number from settings
- Replace hardcoded `info@octowonders.com` (line 91) with `settings.hellobar_contact_email`
- Keep custom `?text=` message parameters as-is (VIP, order support)

---

## Step 6: Clean up `HelloBar.tsx` default params (Risk: Low)

**File:** `src/components/HelloBar.tsx`, lines 64-65

Replace hardcoded default parameter values:
```typescript
// Before
whatsappNumber = "393666295174",
contactEmail = "me@octowonders.com",

// After
whatsappNumber = "",
contactEmail = "",
```

These are always overridden by props from Navigation (which reads from `useStaticSiteSettings`). Empty string defaults are safe -- the contact buttons in the popup simply won't render broken links if somehow props aren't passed.

---

## Step 7: Clean up `HelloBarTabContent.tsx` initial state (Risk: Low)

**File:** `src/components/HelloBarTabContent.tsx`, lines 85-86

Replace hardcoded initial state values:
```typescript
// Before
const [hellobarWhatsappNumber, setHellobarWhatsappNumber] = useState("393666295174");
const [hellobarContactEmail, setHellobarContactEmail] = useState("me@octowonders.com");

// After
const [hellobarWhatsappNumber, setHellobarWhatsappNumber] = useState("");
const [hellobarContactEmail, setHellobarContactEmail] = useState("");
```

The `useEffect` on line 106-107 immediately overwrites these with real DB values. The empty string default shows briefly (admin-only, behind auth).

---

## Step 8: Fix `SEO.tsx` JSON-LD schema (Risk: Low)

**File:** `src/components/SEO.tsx`, line 39

Import `staticSiteSettings` (the constant, not the hook -- keeps SEO as a pure render component) and use it for the email in JSON-LD:

```typescript
import { staticSiteSettings } from '@/generated/staticSiteSettings';

// In getOrganizationSchema():
email: staticSiteSettings.hellobar_contact_email || 'me@octowonders.com',
```

---

## Files Summary

| File | Action | Risk |
|------|--------|------|
| `src/hooks/usePages.ts` | Add `lovableproject.com` to preview domain check | None |
| `src/components/ContactButtons.tsx` | **NEW** -- reusable component, zero hardcoding | None |
| `src/components/PageContent.tsx` | Add `{{CONTACT_BUTTONS}}` token support | Low |
| `src/components/BuyDialog.tsx` | Replace 2 hardcoded values with settings hook | Low |
| `src/pages/CheckoutSuccess.tsx` | Replace 3 hardcoded values with settings hook | Low |
| `src/components/HelloBar.tsx` | Change 2 default params to empty strings | Low |
| `src/components/HelloBarTabContent.tsx` | Change 2 initial state values to empty strings | Low |
| `src/components/SEO.tsx` | Import static settings for JSON-LD email | Low |

## What's NOT included (medium/high risk -- separate step)

- `src/pages/Product.tsx` -- medium risk, has complex contact link logic
- `src/pages/Contact.tsx` deletion + `src/routes.tsx` cleanup -- high risk, changes routing
- `scripts/prebuild.ts` -- build fallback values, low-risk but out of scope for this batch
- Database content migration (`{{CONTACT_BUTTONS}}` token insertion) -- user action after deploy

