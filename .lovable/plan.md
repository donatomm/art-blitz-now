

# Escalation Report: Google Search Console "Discovered - Currently Not Indexed" for 20 Pages

---

## EXECUTIVE SUMMARY

**Issue:** 20 pages on octowonders.com are reported as "Discovered - currently not indexed" in Google Search Console. Google has found these URLs in the sitemap but has chosen NOT to crawl or index them.

**Root Cause:** This is NOT a code bug. The SSG output is correct -- all pages serve pre-rendered HTML with full content, meta tags, JSON-LD, and canonical URLs. The problem is Google's **crawl budget allocation** and **perceived page quality** signals, compounded by two specific technical issues that reduce crawl efficiency.

**Impact Timeline from CSV:**
- Dec 24 - Jan 3: 22 pages affected (initial batch)
- Jan 4 - Feb 10: 0 pages affected (temporarily resolved)
- Feb 11 onward: 20-21 pages re-entered "Discovered - not indexed" state
- Current (Mar 7): 20 pages still not indexed

---

## TECHNICAL FINDINGS

### A. What is WORKING correctly (verified via live production fetch)

1. **SSG output is correct.** All product pages serve fully pre-rendered HTML with real content in `<div id="root" data-server-rendered="true">`. Example: `/product/polpo-octopus-ventose-colori-accesi-stampa-tela` returns `<h1>Octosuckers</h1>`, full description, images, prices -- all in the initial HTML.

2. **Meta tags present.** `<title>`, `<meta name="description">`, Open Graph, Twitter Card tags all render correctly in the SSG HTML.

3. **JSON-LD structured data** renders Product schema with AggregateOffer.

4. **Canonical URLs** are set correctly.

5. **robots.txt** is clean -- `Allow: /` for all bots, sitemap declared.

6. **sitemap.xml** is valid XML with all 20 affected URLs present, correct `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>`.

7. **No `noindex` directives** on any affected page.

### B. The TWO technical issues contributing to the problem

#### Issue #1: MISSING `<head>` section in production HTML

**This is the critical finding.** When fetching production pages, the HTML starts with:

```html
<!DOCTYPE html><html lang="it" data-rh="lang" style="--header-height: 102px;">

  <body>
    <div id="root" data-server-rendered="true">...
```

There is **no `<head>` element** in the served HTML. The `<title>`, `<meta>`, `<link rel="canonical">`, and `<script type="application/ld+json">` tags that the `SEO` component generates via `vite-react-ssg`'s `<Head>` are NOT present in the static HTML served to Googlebot.

**Why this happens:** The `vite-react-ssg` `<Head>` component uses `data-rh="lang"` attribute (visible in the HTML), which suggests it's using a helmet-style approach. However, the SSG build appears to inject head tags as `data-rh` attributes on `<html>` but the actual `<head>` element with meta tags is missing from the served output. This means:
- Googlebot sees NO `<title>` tag
- Googlebot sees NO `<meta name="description">`  
- Googlebot sees NO canonical URL
- Googlebot sees NO JSON-LD structured data
- Googlebot sees NO Open Graph tags

Without these signals, Google has no structured way to understand page content, which directly causes "Discovered - not indexed."

**Evidence:** Every production page I fetched (products, CMS pages, homepage) has this same pattern -- `<html>` tag with `data-rh` attributes, then directly `<body>`, with NO `<head>` section.

#### Issue #2: /blog page serves EMPTY content

The `/blog` page SSG output is:

```html
<div class="max-w-4xl"><div class=""><div><div class="html-content">
    </div></div></div></div>
```

This is because the blog page's `content` field in `staticPages.ts` is an empty string (`"content": ""`). The HTML content is stored in the database but the SSG prebuild only captures the content field -- and for HTML-type pages, the content may be loaded via a separate mechanism that isn't captured at build time. Google sees an empty page and refuses to index it.

### C. Contributing factors (not root cause but relevant)

1. **Stale static data.** The `staticProducts.ts` file has different data than the live database (different prices, different `display_order`, different `image_url`). The last prebuild was done around late December 2025. The SSG HTML is built from stale snapshots while the live site hydrates with current data -- this creates a mismatch that could trigger "soft 404" signals if Google's renderer sees different content than the initial HTML.

2. **Deployment sync gap.** The "Sync & Deploy" button triggers Vercel directly without running prebuild first, so the SSG snapshots remain stale in production.

3. **`/colors` page in sitemap.** A developer debug page with `priority: 0.3` is wasting crawl budget.

4. **`/storie-fatti-scientifici-polpo`** is in the sitemap but has a redirect to `/blog` in `vercel.json`. Redirect chains waste crawl budget.

---

## AFFECTED URLS (from Table.csv)

All 20 URLs have `Last crawled: 1970-01-01` (never crawled):

**Product pages (12):**
- `/product/4-acciughe-sardine-andy-wharol-stampa-tela`
- `/product/acciuga-sarda-testa-effetto-colori-stampa-tela-canvas`
- `/product/astratto-su-tela-stampa-colori-immagine-nascosta`
- `/product/mistero-comfort-food-brodino-stampa-tela`
- `/product/pesce-pescetto-astratto-colori-brillanti-stampa-tela-canvas`
- `/product/polpo-abissale-trasparente-stampa-tela`
- `/product/polpo-braccia-surreale-inquietante-stampa-tela`
- `/product/polpo-octopus-blue-wow-stampa-tela`
- `/product/polpo-octopus-ventose-colori-accesi-stampa-tela`
- `/product/polpo-octopus-ventose-rosa-digitale-stampa-tela`
- `/product/polpo-ventose-zoensis-octopus-brilliant-colors-stampa-su-tela`
- `/product/trota-salmone-pesce-temporale-stampa-tela-canvas`

**CMS pages (8):**
- `/blog`
- `/colors`
- `/ordine-personalizzato`
- `/pricing-policy`
- `/privacy`
- `/resi-rimborsi`
- `/sitemap`
- `/terms`

---

## REMEDIATION PLAN

### Priority 1: Fix missing `<head>` in SSG output

**Root cause investigation needed:** The `vite-react-ssg` `<Head>` component is not properly injecting the `<head>` section into the final HTML. This needs to be debugged:

1. Check if the `<head>` content from `index.html` template is being stripped during SSG
2. Verify `vite-react-ssg` version compatibility with the `<Head>` component API
3. Consider whether `index.html` needs explicit `<head>` tags that SSG preserves, or if the `ssgOptions` configuration needs adjustment
4. **Possible quick fix:** Add static `<head>` content directly in `index.html` template AND verify that `vite-react-ssg`'s `Head` component merges/replaces correctly per-route

**This is the #1 blocker for indexing.** Without `<head>` tags, Google cannot parse the page identity.

### Priority 2: Run prebuild and deploy fresh SSG snapshots

Run `npm run prebuild:products` to sync static data with the live database, then deploy. This ensures the SSG HTML matches the live data and prevents "content mismatch" soft-404 signals.

### Priority 3: Fix empty content pages

For HTML-type CMS pages (blog, faqs, storie-fatti-scientifici-polpo), the prebuild script needs to capture the full `content` field from the database. Currently these have `"content": ""` in staticPages.ts, meaning the SSG output is empty.

### Priority 4: Clean up sitemap

- Remove `/colors` (developer tool, not user-facing)
- Remove `/storie-fatti-scientifici-polpo` (redirects to `/blog`)
- Verify all URLs in sitemap return 200 with content

### Priority 5: Request indexing

After fixes are deployed, use Google Search Console's "Request Indexing" for each affected URL to accelerate re-crawling.

---

## TECHNICAL APPENDIX

### Architecture flow

```text
Database (Supabase)
    │
    ├─ prebuild.ts ──► src/generated/staticProducts.ts
    │                   src/generated/staticPages.ts
    │                   src/generated/staticSiteSettings.ts
    │
    ├─ vite-react-ssg build ──► dist/product/{slug}/index.html (SSG HTML)
    │                            dist/{page}/index.html
    │                            dist/sitemap.xml
    │
    └─ Vercel serves dist/ with rewrites from vercel.json
```

### vercel.json rewrite chain

```text
Request: /product/octoblues
  → rewrite: /product/octoblues/index.html (SSG file)
  
Request: /blog  
  → fallback rewrite: /index.html (SPA shell -- no SSG file matched)
```

**Key insight:** CMS pages that don't have explicit rewrites in vercel.json fall through to the SPA fallback (`/index.html`), which serves the generic SPA shell instead of the SSG-rendered page. This means Google sees an empty SPA shell for these pages.

### Affected page categories

| Category | Count | Root Cause |
|----------|-------|------------|
| Product pages | 12 | Missing `<head>`, stale static data |
| CMS pages | 8 | Missing `<head>`, empty content, SPA fallback |

### Files to investigate/modify

1. `vite.config.ts` - SSG options, `onPageRendered` callback
2. `index.html` - Template `<head>` content
3. `vercel.json` - Add rewrites for all CMS page slugs
4. `scripts/prebuild.ts` - Ensure full content captured for HTML pages
5. `src/components/SEO.tsx` - Verify `<Head>` component behavior during SSG
6. `src/routes.tsx` - Verify `getStaticPaths` returns all pages

