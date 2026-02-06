
# Fix HelloBar Not Respecting Admin Settings

## Problem Found

**The HelloBar settings from Admin Panel are ignored because live database fetching is disabled.**

The code checks if we're in "preview mode" to decide whether to fetch live data from the database. But the check is wrong:

```typescript
// Current check (BROKEN)
const isLovablePreview = typeof window !== 'undefined' && 
  (window.location.hostname.includes('lovable.app') || 
   window.location.hostname.includes('localhost'));
```

Your preview runs on `248403b8-3b63-497c-a1bd-bb25e96e0f47.lovableproject.com` - which contains **`lovableproject.com`**, not `lovable.app`.

**Result:** The live database query never runs. The app only shows the old bundled values from the last deploy.

---

## The Fix

Update `src/hooks/useStaticSiteSettings.ts` to include the correct domain:

```typescript
// Fixed check
const isLovablePreview = typeof window !== 'undefined' && 
  (window.location.hostname.includes('lovable.app') || 
   window.location.hostname.includes('lovableproject.com') ||  // ADD THIS
   window.location.hostname.includes('localhost'));
```

---

## What Changes

| Before | After |
|--------|-------|
| Preview shows old bundled values | Preview fetches live database values |
| Admin changes ignored until deploy | Admin changes visible immediately |
| HelloBar shows despite being disabled | HelloBar respects your settings |

---

## Files to Modify

**1 file:**
- `src/hooks/useStaticSiteSettings.ts` - Add `lovableproject.com` to the preview domain check

---

## After Approval

1. I'll update the domain check
2. HelloBar will immediately respect your Admin Panel settings in preview
3. Production will still use bundled static data (requires Sync & Deploy to update)
