# 🚨 Escalation Report: Google Search Console — 20 Pages "Discovered - Currently Not Indexed"

**Date:** 2026-03-10  
**Severity:** HIGH — Revenue-impacting (pages not visible in Google search)  
**Site:** octowonders.com  
**Reporter:** AI Audit + Google Search Console CSV data

---

## EXECUTIVE SUMMARY

20 pages on octowonders.com are stuck in "Discovered - currently not indexed" status in Google Search Console. Google found the URLs via sitemap but **chose NOT to crawl or index them**. All 20 URLs show `Last crawled: 1970-01-01` (never crawled).

**Timeline:**
| Period | Pages Affected | Status |
|--------|---------------|--------|
| Dec 24 – Jan 3 | 22 | Initial batch discovered |
| Jan 4 – Feb 10 | 0 | Temporarily resolved |
| Feb 11 – present | 20–21 | Re-entered not-indexed state |
| Mar 7 (current) | 20 | Still not indexed |

---

## ROOT CAUSE ANALYSIS

### ✅ What is WORKING (verified via production fetch)

1. **SSG output renders content** — Product pages return full pre-rendered HTML (`<h1>`, descriptions, prices, images) inside `<div id="root" data-server-rendered="true">`
2. **robots.txt** — Clean, `Allow: /` for all bots, sitemap declared
3. **sitemap.xml** — Valid XML, all 20 affected URLs present with correct `<loc>`, `<lastmod>`, `<priority>`
4. **No `noindex` directives** on any affected page

### ❌ ROOT CAUSE #1: Missing `<head>` Section in Production HTML

**Critical finding.** Production pages serve HTML that starts:

```html
<!DOCTYPE html><html lang="it" data-rh="lang" style="--header-height: 102px;">
  <body>
    <div id="root" data-server-rendered="true">...
```

**There is NO `<head>` element.** The `vite-react-ssg` `<Head>` component (used by `SEO.tsx`) sets `data-rh` attributes on `<html>` but fails to inject an actual `<head>` block. This means Googlebot sees:

- ❌ No `<title>` tag
- ❌ No `<meta name="description">`
- ❌ No `<link rel="canonical">`
- ❌ No JSON-LD structured data
- ❌ No Open Graph tags

**Impact:** Without these signals, Google cannot determine page identity, relevance, or deduplication — directly causing "Discovered - not indexed."

**Evidence:** Every production page fetched (products + CMS pages + homepage) exhibits this pattern.

### ❌ ROOT CAUSE #2: CMS Pages Fall Through to SPA Shell

CMS pages (e.g., `/blog`, `/privacy`, `/terms`) that don't have explicit rewrites in `vercel.json` are served via the catch-all SPA fallback:

```json
{
  "source": "/((?!api|_next|static|...).*)",
  "destination": "/index.html"
}
```

This means Google receives the **generic SPA shell** (`/index.html`) instead of the SSG-rendered page. The SPA shell has no meaningful content until JavaScript hydrates — which Google may not wait for.

**Only these CMS routes have explicit rewrites:** `/artista`, `/contatti`, `/spedizione`, `/pricing-policy`, `/resi-rimborsi`  
**Missing rewrites for:** `/blog`, `/privacy`, `/terms`, `/ordine-personalizzato`, `/sitemap`, `/colors`

### ❌ ROOT CAUSE #3: Empty Content in Static Snapshots

The `/blog` page's SSG output is:

```html
<div class="max-w-4xl"><div class=""><div><div class="html-content">
    </div></div></div></div>
```

The `staticPages.ts` file has `"content": ""` for several HTML-type pages. The prebuild script captures the `content` field, but it's empty in the database for pages that use external HTML loading or were never populated.

### Contributing Factors

| Factor | Impact | Detail |
|--------|--------|--------|
| Stale static data | Medium | `staticProducts.ts` last built ~Dec 2025; prices, images, display order don't match live DB. Content mismatch between SSG HTML and hydrated content can trigger "soft 404" signals |
| Deployment sync gap | Medium | "Sync & Deploy" button triggers Vercel without running prebuild first, so SSG snapshots stay stale |
| `/colors` in sitemap | Low | Developer debug page wastes crawl budget |
| Redirect in sitemap | Low | `/storie-fatti-scientifici-polpo` → `/blog` redirect wastes crawl budget |

---

## AFFECTED URLs

### Product Pages (12)

| URL | Status |
|-----|--------|
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

| URL | Status | Additional Issue |
|-----|--------|-----------------|
| `/blog` | Discovered - not indexed | Empty content in SSG |
| `/colors` | Discovered - not indexed | Developer tool, should not be indexed |
| `/ordine-personalizzato` | Discovered - not indexed | Missing vercel.json rewrite |
| `/pricing-policy` | Discovered - not indexed | Has rewrite but may hit head issue |
| `/privacy` | Discovered - not indexed | Missing vercel.json rewrite |
| `/resi-rimborsi` | Discovered - not indexed | Has rewrite |
| `/sitemap` | Discovered - not indexed | HTML sitemap page |
| `/terms` | Discovered - not indexed | Missing vercel.json rewrite |

---

## REMEDIATION PLAN

### Priority 1: Fix Missing `<head>` in SSG Output 🔴 CRITICAL

**Options:**
1. Debug `vite-react-ssg` `<Head>` component — may be a version bug or config issue
2. Inject meta tags directly into `index.html` template as fallbacks
3. Use `onPageRendered` callback in `ssgOptions` to post-process HTML and ensure `<head>` is present
4. Consider switching from `vite-react-ssg` `<Head>` to direct DOM manipulation in the SSG build

**Investigation needed:**
- Check `vite-react-ssg` version `0.8.9` changelog for known `<Head>` issues
- Inspect the actual `dist/` output after build to see if `<head>` exists pre-deployment
- Determine if Vercel's serving layer strips `<head>` (unlikely but must rule out)

### Priority 2: Add Missing Vercel Rewrites 🟠 HIGH

Add explicit rewrites for ALL CMS page slugs so they serve their SSG HTML instead of the SPA fallback:

```json
{ "source": "/blog", "destination": "/blog/index.html" },
{ "source": "/privacy", "destination": "/privacy/index.html" },
{ "source": "/terms", "destination": "/terms/index.html" },
{ "source": "/ordine-personalizzato", "destination": "/ordine-personalizzato/index.html" },
{ "source": "/sitemap", "destination": "/sitemap/index.html" },
{ "source": "/colors", "destination": "/colors/index.html" }
```

### Priority 3: Run Prebuild & Deploy Fresh Snapshots 🟠 HIGH

```bash
npm run prebuild    # Regenerate staticProducts.ts, staticPages.ts from live DB
git add src/generated && git commit -m "sync static data"
# Then deploy
```

### Priority 4: Fix Empty Content Pages 🟡 MEDIUM

Ensure all CMS pages in the database have non-empty `content` fields. For HTML-type pages, verify the content is stored in the `content` column (not loaded externally).

### Priority 5: Clean Up Sitemap 🟡 MEDIUM

- Remove `/colors` from sitemap (dev tool)
- Remove any URLs that redirect (e.g., `/storie-fatti-scientifici-polpo`)
- Verify every sitemap URL returns HTTP 200 with content

### Priority 6: Request Re-indexing 🟢 LOW (after fixes)

After deploying fixes, use Google Search Console "Request Indexing" for each affected URL.

---

## ARCHITECTURE DIAGRAM

```
Database (Supabase)
    │
    ├─ prebuild.ts ──► src/generated/staticProducts.ts
    │                   src/generated/staticPages.ts
    │                   src/generated/staticSiteSettings.ts
    │
    ├─ vite-react-ssg build ──► dist/product/{slug}/index.html
    │                            dist/{page}/index.html
    │                            dist/sitemap.xml
    │
    └─ Vercel serves dist/
         ├─ Explicit rewrites → SSG HTML ✅
         └─ Catch-all fallback → /index.html (SPA shell) ❌
```

### Request Flow

```
GET /product/octoblues
  → vercel.json rewrite → /product/octoblues/index.html → SSG HTML ✅

GET /blog
  → NO explicit rewrite → catch-all → /index.html → SPA shell ❌
  → Googlebot sees empty shell → "Discovered - not indexed"
```

---

## FILES TO MODIFY

| File | Change Needed |
|------|--------------|
| `vite.config.ts` | Debug SSG `<Head>` injection, possibly add `onPageRendered` post-processing |
| `index.html` | Ensure `<head>` template content is preserved through SSG |
| `vercel.json` | Add rewrites for all CMS page slugs |
| `scripts/prebuild.ts` | Verify content field capture for HTML pages |
| `src/components/SEO.tsx` | Verify `<Head>` component works with current `vite-react-ssg` version |
| `src/routes.tsx` | Verify `getStaticPaths` returns all CMS pages and products |

---

## APPENDIX: Raw Data Sources

- `Chart.csv` — GSC trend data showing 20 pages affected
- `Metadata.csv` — Report metadata (Date range: Dec 24 2025 – Mar 7 2026)
- `Table.csv` — Per-URL status showing all 20 URLs as "Discovered - currently not indexed" with `Last crawled: 1970-01-01`
