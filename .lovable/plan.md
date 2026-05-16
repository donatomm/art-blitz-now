## Goal
Eliminate the runtime fetch of `/static-loader-data-manifest-<hash>.json` that intermittently fails after deploys (browser caches old HTML referencing a hash whose JSON is no longer at the edge → Vercel returns the 404 HTML → `JSON.parse` throws "Unexpected token 'T'").

## Root cause (verified in `node_modules/vite-react-ssg/dist/index.mjs`)
- `ViteReactSSG` wraps every route's `loader` with `transformStaticLoaderRoute`. On any SSR'd page (every page we ship has `data-server-rendered=true`), the very first navigation/hydration triggers:
  ```js
  if (window.__VITE_REACT_SSG_STATIC_LOADER_DATA__) { … }
  else {
    const manifestUrl = `/static-loader-data-manifest-${window.__VITE_REACT_SSG_HASH__}.json`;
    staticLoadData = await (await fetch(manifestUrl)).json();   // ← throws when HTML is returned
  }
  ```
- The hash is baked into each generated HTML at build time. If the HTML in the user's browser cache (or Vercel's HTML cache) was produced by an older deploy, the matching JSON file no longer exists → Vercel returns its 404 HTML → JSON.parse blows up → app crashes mid-hydration → user sees "Page could not be found" / blank product page.
- We do not use `includeAllRoutes`, and we do not use react-router `loader` anywhere in `src/` (all data comes from React Query + static TS files). The manifest is therefore semantically empty for us — but the runtime still fetches it on every cold load.

## Fix
Pre-populate `window.__VITE_REACT_SSG_STATIC_LOADER_DATA__` inline in every generated HTML so the runtime never performs the fetch. Because we have zero route `loader`s, an empty object is functionally identical to the real manifest.

### Implementation

Add a new postbuild step `scripts/postbuild-inline-ssg-data.cjs` that:
1. Walks every `*.html` under `dist/`.
2. Injects, immediately before the existing `window.__VITE_REACT_SSG_HASH__ = '…'` script tag:
   ```html
   <script>window.__VITE_REACT_SSG_STATIC_LOADER_DATA__ = {};</script>
   ```
   (Idempotent — skip if already present.)
3. Logs a count of files patched.

Wire it into `package.json` after the existing postbuild chain so it runs last:
```diff
- "postbuild": "node scripts/postbuild-inject-head.cjs && node scripts/postbuild-css-alias.cjs && node scripts/postbuild-uuid-redirects.cjs"
+ "postbuild": "node scripts/postbuild-inject-head.cjs && node scripts/postbuild-css-alias.cjs && node scripts/postbuild-uuid-redirects.cjs && node scripts/postbuild-inline-ssg-data.cjs"
```

### Why this is safe
- We grep'd `src/` — no `loader:` in `routes.tsx` or pages. `staticLoaderDataManifest[path] = routerContext?.loaderData` therefore writes `undefined` for every path, so the live manifest is `{}`.
- Even if a loader is added later, the symptom would be missing loader data (a clean `null` return per the runtime's `routeData ?? null`), not an app-crashing JSON parse exception.
- The change is HTML-only and additive; no source/runtime/SSG-config changes, no library upgrade, no rebuild semantics changed.

### Verification after deploy
```
curl -s https://octowonders.com/product/polpo-octopus-ventose-colori-accesi-stampa-tela \
  | grep -E "__VITE_REACT_SSG_STATIC_LOADER_DATA__|__VITE_REACT_SSG_HASH__"
```
Expect both scripts present, the STATIC_LOADER_DATA one appearing before the HASH one. Then hard-reload an existing tab with a stale cached HTML — no JSON parse error in console, page hydrates normally.

## Out of scope
- Upgrading or replacing `vite-react-ssg`.
- Switching to `single-page` entry (would change SSG behavior for all pages — bigger blast radius).
- Touching `includeAllRoutes` — we already don't set it; default is `false`. The bug is unrelated to that flag despite earlier hypothesis.

## Files changed
- `scripts/postbuild-inline-ssg-data.cjs` (new)
- `package.json` (extend `postbuild`)
