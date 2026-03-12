

# Incident Report: SSG Migration Broke Website Indexability

## Document to Create

A new file `docs/INCIDENT-SSG-REGRESSION.md` — a focused forensic report on the period when the broken SSG build made the website non-indexable.

## Content Summary

The report will document:

1. **The Single Causal Event**: Migration of `src/main.tsx` from standard React SPA entry (`createRoot` from `react-dom/client`) to `vite-react-ssg` (`ViteReactSSG`), and corresponding `package.json` build command change from `vite build` to `vite-react-ssg build`.

2. **Technical Mechanism**: How `vite-react-ssg@0.8.9` uses jsdom + `react-helmet-async` for SSG rendering, which sets `data-rh` attributes on `<html>` but fails to serialize `<head>` content into the final HTML output. The `<Head>` component in `SEO.tsx` (importing from `vite-react-ssg`) renders `<title>`, `<meta>`, `<link rel="canonical">`, JSON-LD — all of which were silently dropped.

3. **Cascading Failures**: The SSG migration created three simultaneous breaks:
   - All pages lost `<head>` (title, meta, canonical, structured data)
   - CMS pages without Vercel rewrites fell through to a headless SPA shell
   - Pages with empty DB `content` rendered as empty divs at build time

4. **Timeline with Evidence**:
   - ~Dec 22-24, 2025: SSG deployed, 22 pages enter GSC "Discovered - not indexed"
   - Jan 4 - Feb 10: Google served stale cached index (bug still live, not fixed)
   - No deployments between Feb 7 and Feb 14 — confirming Feb 11 regression was a Google re-crawl, not a new deployment
   - Feb 11 onward: Google re-crawled, found headless HTML, de-indexed 20 pages
   - Mar 7: Still 20 pages not indexed
   - Mar 10: Fix implemented (postbuild-inject-head.cjs)

5. **Production Evidence**: The exact broken HTML pattern served to Googlebot:
   ```html
   <!DOCTYPE html><html lang="it" data-rh="lang">
     <body>
       <div id="root" data-server-rendered="true">...
   ```
   No `<head>`, no `<title>`, no `<meta>`, no canonical, no JSON-LD.

6. **Code Evidence**: The exact file changes that introduced the bug:
   - `src/main.tsx`: `ViteReactSSG` import replacing `createRoot`
   - `package.json` line 9: `vite-react-ssg build` replacing `vite build`
   - `vite-react-ssg@0.8.9` added as dependency
   - `SEO.tsx` using `Head` from `vite-react-ssg` (which silently fails during SSG serialization)

7. **Key Finding**: No deployments occurred between Feb 7 and Feb 14, proving the Feb 11 "regression" was not a new code change but Google's re-crawl discovering the already-broken pages.

## File

Create `docs/INCIDENT-SSG-REGRESSION.md` with the complete forensic incident report.

