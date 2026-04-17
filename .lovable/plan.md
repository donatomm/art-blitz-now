

## Goal
Make `/product/bd62c326-772b-4337-9131-fe10a5e4a2bb` return a server-level redirect to `/product/trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas` so Google consolidates the indexed UUID URL into the canonical slug URL.

## Current state
- `src/pages/Product.tsx` (lines 78-82) already does a client-side `<Navigate replace>` from UUID → slug. This works for users but returns HTTP 200, so Googlebot may still treat the UUID as a separate URL.
- `middleware.ts` and `public/_redirects` exist but are **not honored by Lovable hosting** (Lovable ignores `_redirects`, `vercel.json`, and Next-style middleware).
- True server-side 301 is not configurable on Lovable hosting.

## Approach: build-time static redirect page (best available)
Generate a physical file at `dist/product/bd62c326-772b-4337-9131-fe10a5e4a2bb/index.html` during the build. The file contains:
- `<meta http-equiv="refresh" content="0; url=/product/trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas">`
- `<link rel="canonical" href="https://octowonders.com/product/trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas">`
- A small JS fallback `window.location.replace(...)`
- Minimal noscript body with a link

Google explicitly documents that an instant `meta refresh` is interpreted as a permanent redirect, and the canonical link reinforces it. This is the strongest signal achievable on Lovable hosting.

## Implementation steps
1. Create `scripts/postbuild-uuid-redirects.cjs`:
   - Read a small map: `{ "bd62c326-772b-4337-9131-fe10a5e4a2bb": "/product/trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas" }`
   - For each entry, write `dist/product/<uuid>/index.html` with the redirect HTML.
2. Wire it into `package.json` build script (after existing `postbuild-inject-head.cjs`).
3. Keep the existing client-side `<Navigate>` in `Product.tsx` as a safety net for UUIDs not in the map.
4. Update `middleware.ts` map comment to note it's the source of truth for the postbuild script (or move the map into the script directly — simpler).

## Files to change
- `scripts/postbuild-uuid-redirects.cjs` (new)
- `package.json` (build script chain)
- No changes to `Product.tsx`, no changes to routing, no UX impact.

## Verification after deploy
```
curl -sI https://octowonders.com/product/bd62c326-772b-4337-9131-fe10a5e4a2bb
curl -s  https://octowonders.com/product/bd62c326-772b-4337-9131-fe10a5e4a2bb | grep -E 'refresh|canonical'
```
Then in GSC: URL Inspection on the UUID URL → "Request Indexing" so Google re-crawls and sees the redirect signal.

## Out of scope
- True HTTP 301 (not possible on Lovable hosting today).
- Removing the existing client-side Navigate (kept as fallback).

