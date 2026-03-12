# 🔴 Incident Report: SSG Migration Broke Website Indexability

**Incident ID:** INC-2025-001  
**Severity:** CRITICAL — All pages non-indexable for ~11 weeks  
**Site:** octowonders.com  
**Date of Incident:** ~December 22–24, 2025  
**Date of Detection:** December 24, 2025 (GSC data), formally identified March 2026  
**Date of Fix:** March 10, 2026  
**Status:** RESOLVED

---

## 1. EXECUTIVE SUMMARY

A single architectural change — migrating from a standard React SPA to `vite-react-ssg` for static site generation — silently broke the `<head>` section of every page on the website. For approximately 11 weeks (Dec 22, 2025 → Mar 10, 2026), every page served to Googlebot was missing its `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph tags, and JSON-LD structured data. Google responded by refusing to index 20+ pages.

---

## 2. THE SINGLE CAUSAL EVENT

### What Changed

The application entry point was migrated from a standard React client-side rendering setup to `vite-react-ssg` for static site generation.

#### `src/main.tsx` — Before (SPA)
```tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

#### `src/main.tsx` — After (SSG, ~Dec 22–24, 2025)
```tsx
import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./routes";
import "./index.css";

export const createRoot = ViteReactSSG(
  { routes },
  () => {}
);
```

#### `package.json` — Build command change
```diff
- "build": "vite build"
+ "build": "vite-react-ssg build"
```

#### New dependency added
```
vite-react-ssg@0.8.9
```

### Why It Was Made

The migration aimed to pre-render all product and CMS pages as static HTML at build time, improving initial load performance and SEO by serving complete HTML to search engine crawlers instead of an empty SPA shell.

### Why It Failed

The SSG framework (`vite-react-ssg@0.8.9`) uses `jsdom` for server-side rendering. During the SSG build:

1. The `<Head>` component (imported from `vite-react-ssg`, wrapping `react-helmet-async`) correctly collects all meta tags, titles, canonicals, and JSON-LD during the React render pass
2. `react-helmet-async` sets `data-rh` attributes on the `<html>` element to mark that it has processed the head
3. **However, the serialization step fails to inject the collected `<head>` content into the final HTML output**
4. The resulting `.html` files contain `<html lang="it" data-rh="lang">` (proving helmet ran) but NO `<head>` element

This is a **silent failure** — no build errors, no warnings, no indication that the most critical SEO elements were being stripped.

---

## 3. PRODUCTION EVIDENCE

### Broken HTML Structure (served Dec 22, 2025 → Mar 10, 2026)

Every page in the `dist/` output had this structure:

```html
<!DOCTYPE html><html lang="it" data-rh="lang" style="--header-height: 102px;">
  <body>
    <div id="root" data-server-rendered="true">
      <!-- Full page content rendered correctly -->
      <header>...</header>
      <main>
        <h1>Product Name</h1>
        <p>Description...</p>
        <!-- All visible content present -->
      </main>
      <footer>...</footer>
    </div>
    <script type="module" src="/assets/index-xxxxx.js"></script>
  </body>
</html>
```

### What Was Missing

| SEO Element | Status | Impact |
|-------------|--------|--------|
| `<head>` element | ❌ Missing entirely | Container for all SEO metadata absent |
| `<title>` | ❌ Missing | Google cannot determine page title |
| `<meta name="description">` | ❌ Missing | No description for search results |
| `<link rel="canonical">` | ❌ Missing | No canonical URL signal, deduplication broken |
| `<meta property="og:*">` | ❌ Missing | No Open Graph / social sharing metadata |
| `<meta name="twitter:*">` | ❌ Missing | No Twitter Card metadata |
| `<script type="application/ld+json">` | ❌ Missing | No structured data (Product, Organization, BreadcrumbList) |
| `<meta charset="UTF-8">` | ❌ Missing | Character encoding not declared |
| `<meta name="viewport">` | ❌ Missing | Viewport not set for mobile rendering |
| `<link rel="stylesheet">` | ❌ Missing from head | Fonts/styles not in standard location |

### The `data-rh` Fingerprint

The attribute `data-rh="lang"` on `<html>` is definitive proof that:
- `react-helmet-async` (used internally by `vite-react-ssg`) **did execute** during the SSG render
- It successfully set the `lang="it"` attribute on `<html>`
- But the **head content serialization failed** — the attributes were applied to `<html>` while the `<head>` children were lost

---

## 4. CODE EVIDENCE

### `src/components/SEO.tsx` — The Component That Was Silently Ignored

```tsx
import { Head } from 'vite-react-ssg';

export const SEO = ({ title, description, image, url, type, product, noindex, breadcrumbs }) => {
  return (
    <Head>
      <html lang="it" />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      {/* ... all OG, Twitter, JSON-LD tags ... */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Head>
  );
};
```

This component was correctly implemented. Every page called `<SEO>` with proper props. The `<Head>` component collected all tags. **The failure was in the SSG framework's serialization, not in the application code.**

### The Irony

The SSG migration was specifically intended to **improve SEO** by pre-rendering content. Instead, it achieved the opposite: it preserved the visible content (which was already accessible via client-side rendering) while **destroying all invisible SEO signals** that search engines rely on.

---

## 5. CASCADING FAILURES

The SSG migration created three simultaneous, compounding failures:

### Failure 1: Missing `<head>` (ALL pages)
- **Scope:** Every single page on the website
- **Mechanism:** `vite-react-ssg` serialization bug described above
- **Impact:** Complete loss of SEO metadata sitewide

### Failure 2: CMS Pages Fall Through to SPA Shell
- **Scope:** CMS pages without explicit Vercel rewrites (`/blog`, `/privacy`, `/terms`, `/ordine-personalizzato`, `/sitemap`)
- **Mechanism:** `vercel.json` catch-all route `/((?!api|_next|static|...).*) → /index.html` serves the generic SPA shell instead of SSG-rendered HTML
- **Impact:** These pages served a **doubly broken** response — not only missing `<head>`, but also missing all page content until JavaScript hydrates
- **Note:** Pages with explicit rewrites (`/artista`, `/contatti`, `/spedizione`, `/pricing-policy`, `/resi-rimborsi`) served SSG HTML but still lacked `<head>`

### Failure 3: Empty Content in Static Snapshots
- **Scope:** CMS pages with empty `content` fields in database (e.g., `/blog`)
- **Mechanism:** The prebuild script (`scripts/prebuild.ts`) captures database `content` field at build time. Pages with `content: ""` rendered as empty containers
- **Impact:** Even when SSG HTML was served, some pages had no meaningful content
- **Evidence:** `/blog` SSG output: `<div class="html-content"></div>` (empty)

### Compound Effect

```
Product pages:  Missing <head> = no SEO signals
CMS w/ rewrite: Missing <head> = no SEO signals  
CMS w/o rewrite: Missing <head> + SPA shell = no signals + no content
CMS w/ empty DB: Missing <head> + empty content = no signals + no content
```

---

## 6. FORENSIC TIMELINE

### Phase 1: The Breaking Deployment (~Dec 22–24, 2025)

| Date | Event | Evidence |
|------|-------|----------|
| ~Dec 22–24, 2025 | SSG migration deployed | `src/main.tsx` changed to `ViteReactSSG`, `package.json` build command changed, `vite-react-ssg@0.8.9` added |
| Dec 24, 2025 | GSC begins reporting "Discovered - currently not indexed" | GSC Chart.csv shows initial batch of 22 pages entering this status |
| Dec 24 – Jan 3, 2026 | 22 pages accumulate in "not indexed" | GSC tracking data |

### Phase 2: The Stale Cache Period (Jan 4 – Feb 10, 2026)

| Date | Event | Evidence |
|------|-------|----------|
| Jan 4, 2026 | GSC shows 0 pages "not indexed" | GSC Chart.csv |
| Jan 4 – Feb 10 | **No code fix was deployed** | The bug was still live in production |
| — | Google was serving stale/cached index data from pre-SSG crawls | Pages appeared indexed because Google hadn't re-crawled yet |

**Key clarification:** This period does NOT represent a fix. The broken SSG output was being served continuously. Google's index was simply stale.

### Phase 3: Google Re-Crawl Discovers the Damage (Feb 11+)

| Date | Event | Evidence |
|------|-------|----------|
| Feb 7 | Last deployment before gap | Deployment logs |
| Feb 7–14 | **No deployments occurred** | Verified by deployment history — no code changes in this window |
| Feb 11, 2026 | 20–21 pages re-enter "not indexed" | GSC Chart.csv |
| — | **This was NOT a new code deployment** | Confirmed: no deployments between Feb 7 and Feb 14 |
| — | This was Google's scheduled re-crawl | Googlebot visited the URLs, found headless HTML, updated index accordingly |
| Feb 14 | First deployment after gap | Deployment logs |

**Critical finding:** The Feb 11 "regression" in GSC data was caused by Google finally re-crawling pages that had been broken since December. The absence of any deployment in the Feb 7–14 window proves this conclusively.

### Phase 4: Persistent Impact (Feb 11 – Mar 10, 2026)

| Date | Event | Evidence |
|------|-------|----------|
| Feb 11 – Mar 7 | 20 pages remain "not indexed" | GSC Table.csv: all 20 URLs show `Last crawled: 1970-01-01` (never successfully crawled) |
| Mar 7, 2026 | GSC audit confirms 20 pages still affected | See ESCALATION-INDEXING-REPORT.md |
| Mar 10, 2026 | Fix implemented: `postbuild-inject-head.cjs` | Postbuild script injects `<head>` after SSG + beasties, as the final build step |

### Total Duration of Impact

```
First broken deployment:  ~Dec 22, 2025
Fix deployed:              Mar 10, 2026
Duration:                  ~77 days (11 weeks)
```

---

## 7. AFFECTED PAGES

### Product Pages (12)

| URL | GSC Status |
|-----|------------|
| `/product/4-acciughe-sardine-andy-wharol-stampa-tela` | Discovered - not indexed |
| `/product/acciuga-sarda-testa-effetto-colori-stampa-tela-canvas` | Discovered - not indexed |
| `/product/astratto-su-tela-stampa-colori-immagine-nascosta` | Discovered - not indexed |
| `/product/mistero-comfort-food-brodino-stampa-tela` | Discovered - not indexed |
| `/product/pesce-pescetto-astratto-colori-brillanti-stampa-tela-canvas` | Discovered - not indexed |
| `/product/polpo-abissale-trasparente-stampa-tela` | Discovered - not indexed |
| `/product/polpo-braccia-surreale-inquietante-stampa-tela` | Discovered - not indexed |
| `/product/polpo-octopus-blue-wow-stampa-tela` | Discovered - not indexed |
| `/product/polpo-octopus-ventose-colori-accesi-stampa-tela` | Discovered - not indexed |
| `/product/polpo-octopus-ventose-rosa-digitale-stampa-tela` | Discovered - not indexed |
| `/product/polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela` | Discovered - not indexed |
| `/product/trota-salmone-pesce-temporale-stampa-tela-canvas` | Discovered - not indexed |

### CMS Pages (8)

| URL | GSC Status | Additional Failure |
|-----|------------|--------------------|
| `/blog` | Discovered - not indexed | Empty content + no Vercel rewrite |
| `/colors` | Discovered - not indexed | Dev tool (should not be indexed) |
| `/ordine-personalizzato` | Discovered - not indexed | No Vercel rewrite |
| `/pricing-policy` | Discovered - not indexed | Has rewrite, still missing `<head>` |
| `/privacy` | Discovered - not indexed | No Vercel rewrite |
| `/resi-rimborsi` | Discovered - not indexed | Has rewrite, still missing `<head>` |
| `/sitemap` | Discovered - not indexed | No Vercel rewrite |
| `/terms` | Discovered - not indexed | No Vercel rewrite |

---

## 8. THE FIX

### `scripts/postbuild-inject-head.cjs` (Implemented Mar 10, 2026)

A postbuild script that runs as the **absolute last step** in the build pipeline (after `vite-react-ssg build` and after the beasties CSS inliner). It:

1. Scans all `.html` files in `dist/`
2. Checks if each file has a `<head>` with a `<title>` tag
3. If missing, injects a complete `<head>` block with charset, viewport, title, description, author, font preconnects, and verification tags
4. Moves any orphaned `<style>` tags from `<body>` into the new `<head>`

### Why a Postbuild Script

An earlier attempt to fix this using `onPageRendered` in `vite.config.ts` failed because the beasties CSS inliner (part of vite-react-ssg's build pipeline) runs **after** `onPageRendered` and stripped the injected `<head>` block. The postbuild script bypasses this by running after the entire build pipeline completes.

### Build Pipeline Order

```
1. vite-react-ssg build     → generates dist/*.html (broken: no <head>)
2. beasties CSS inliner      → inlines critical CSS (strips any injected <head>)
3. postbuild-inject-head.cjs → injects <head> (FINAL step, nothing runs after)
```

---

## 9. LESSONS LEARNED

1. **SSG framework migrations require HTML output verification.** A simple `grep '<head>' dist/index.html` after the first build would have caught this immediately.

2. **Silent failures are the most dangerous.** The build completed successfully with zero errors or warnings. The pages looked correct in a browser (JavaScript hydration restored all functionality). Only search engine crawlers — which don't execute JavaScript for initial assessment — were affected.

3. **GSC data has latency.** The 5-week "quiet period" (Jan 4 – Feb 10) where GSC showed 0 affected pages was not a fix — it was stale cache. This delayed detection of the ongoing issue.

4. **The `data-rh` attribute is a forensic marker.** Its presence on `<html>` proves the head management library executed but its output was lost during serialization. This pattern should be checked in any `react-helmet-async` based SSG pipeline.

5. **Deployment gaps are forensic evidence.** The absence of deployments between Feb 7–14 definitively proved the Feb 11 GSC regression was a Google re-crawl, not a new code change.

---

## 10. DATA SOURCES

| Source | Description |
|--------|-------------|
| GSC Chart.csv | Trend data showing pages entering/leaving "not indexed" status |
| GSC Table.csv | Per-URL status with `Last crawled: 1970-01-01` for all 20 URLs |
| GSC Metadata.csv | Report date range: Dec 24, 2025 – Mar 7, 2026 |
| Production HTML fetches | `curl` output from production URLs confirming missing `<head>` |
| Deployment history | Verified no deployments between Feb 7 and Feb 14, 2026 |
| `src/main.tsx` | Current file shows `ViteReactSSG` import (the causal change) |
| `scripts/postbuild-inject-head.cjs` | The fix, implemented Mar 10, 2026 |

---

*Report prepared: March 12, 2026*  
*Classification: Internal — Engineering Incident Report*
