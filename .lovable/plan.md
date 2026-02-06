

# Fix HelloBar On/Off Toggle: Make It Work Instantly on Production

## Root Cause

The HelloBar toggle saves correctly to the database, but production (octowonders.com) never reads the database. It uses a static file (`staticSiteSettings.ts`) that was baked on January 17th with `hellobar_enabled: true`. Toggling it to `false` in the admin panel has zero effect on what customers see.

The `useStaticSiteSettings` hook has a guard:
```
const isLovablePreview = hostname includes 'lovable.app' or 'localhost'
```
On octowonders.com, this is `false`, so the hook always returns the stale static file. The database is completely ignored.

## Solution

Make the production site fetch HelloBar settings live from the database after initial render. The static data is still used for the first paint (no loading flicker), but a lightweight background fetch overrides it with the live database values within ~200ms.

This means: toggle HelloBar off in admin panel --> customers see it disappear on next page load. No rebuild needed.

## What Changes

### 1. `src/hooks/useStaticSiteSettings.ts`

Remove the `isLovablePreview` guard so the live-data fetch runs on ALL domains (including octowonders.com), not just lovable.app.

The hook already returns static data immediately (zero latency), then swaps in live data once fetched. This means:
- First paint: uses static data (fast LCP, no loading state)
- After ~200ms: live data from database replaces it
- If database is unreachable: static data stays (graceful fallback)

The change is small: remove the `enabled: isLovablePreview` condition from the `useQuery` call, and remove the `isLovablePreview` variable.

### 2. Why this is safe

- **No LCP regression**: Static data renders instantly. The live fetch happens in the background after hydration.
- **Graceful fallback**: If the database query fails, the static data is used (current behavior).
- **Minimal network cost**: One small SELECT query (~1KB response) per page load. The `site_settings` table is tiny.
- **HelloBar flicker risk**: If static says `enabled: true` but DB says `false`, the bar shows for ~200ms then disappears. This is a one-time glitch until the next rebuild syncs the static file. Acceptable trade-off vs. the bar being permanently wrong.

### 3. What about other settings?

This fix makes ALL site settings live (hero text, nav items, trust bar, etc.), not just HelloBar. This is actually better -- any admin change takes effect immediately instead of requiring a rebuild. The static data just serves as the initial render value.

## Technical Detail

Current code:
```typescript
const isLovablePreview = typeof window !== 'undefined' && 
  (window.location.hostname.includes('lovable.app') || 
   window.location.hostname.includes('lovableproject.com') ||
   window.location.hostname.includes('localhost'));

// ...
const { data: liveSettings } = useQuery({
  // ...
  enabled: isLovablePreview,  // <-- THIS blocks production from fetching
});

return isLovablePreview && liveSettings ? liveSettings : staticSiteSettings;
```

Fixed code:
```typescript
const { data: liveSettings } = useQuery({
  // ...
  enabled: true,  // Always fetch live data
  staleTime: 30_000,  // Cache for 30s to avoid hammering DB on navigation
});

return liveSettings ?? staticSiteSettings;
```

Key changes:
- Remove `isLovablePreview` variable entirely
- Set `enabled: true` (always fetch)
- Change `staleTime` from 0 to 30000 (30 seconds) -- in preview mode it was 0 for instant updates, but on production we don't need to re-fetch on every component mount
- Keep `gcTime: 0` so stale data is discarded when the query is no longer used
- Return `liveSettings ?? staticSiteSettings` (use live data when available, static as fallback)

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Brief HelloBar flicker on first visit after toggle | Low | Only happens once per static/live mismatch; bar appears/disappears in ~200ms |
| Extra database query per page load | Low | ~1KB response, cached 30s, site_settings table is tiny |
| SSG hydration mismatch warning | None | React Query doesn't render during SSR; static data is used for server HTML, live data swaps in client-side |
| Database unreachable | None | Falls back to static data (current behavior) |

## Files Modified

1 file: `src/hooks/useStaticSiteSettings.ts`

