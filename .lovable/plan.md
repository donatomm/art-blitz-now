

# Fix: Restore `<head>` in SSG Output

## Problem
`vite-react-ssg` 0.8.9 + beasties CSS inliner strips the `<head>` element during SSG build. Production HTML has `<html>` followed directly by `<body>` with no head section. All 20 non-indexed pages are affected.

## Solution: Use `onPageRendered` to force `<head>` injection

The `ssgOptions.onPageRendered` callback in `vite.config.ts` already exists (currently just logs). We use it to post-process the HTML and guarantee a `<head>` element exists with proper meta tags.

### Changes

**1. `vite.config.ts` — Enhance `onPageRendered` callback**

Add a post-processing step that:
- Detects if `<head>` is missing from the rendered HTML
- Extracts any `data-rh` attributes (helmet-managed tags) 
- Injects a proper `<head>` block between `<html>` and `<body>` containing the original template head content (charset, viewport, fonts, google verification) merged with any per-page helmet output
- Falls back to the template `<head>` content from `index.html` if helmet output is empty

```typescript
onPageRendered: (route: string, html: string) => {
  // If <head> is missing, inject it before <body>
  if (!html.includes('<head>') && !html.includes('<head ')) {
    const headContent = `<head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300&display=swap" />
      <meta name="google-site-verification" content="piIPB5x5MjblaPWAVjsiaeV8Gc3AbIFnq1yZItrhUlM" />
      <meta name="p:domain_verify" content="488c339e7167063621a6662be6c159b8" />
      <title>OctoWonders by Marco De Francesco - Stampe d'Arte su Tela</title>
      <meta name="description" content="Stampe d'arte originali su tela di alta qualità. Opere uniche a tema marino." />
    </head>`;
    html = html.replace('<body>', headContent + '\n<body>');
  }
  return html;
}
```

**2. Optionally: Disable beasties entirely**

If the head injection fix works but beasties continues causing issues, set `beastiesOptions: false` in ssgOptions to disable CSS inlining entirely. The performance impact is minimal for this site size.

**3. `vercel.json` — Add missing CMS page rewrites**

Add rewrites for CMS pages that currently fall through to the SPA shell:
```json
{ "source": "/blog", "destination": "/blog/index.html" },
{ "source": "/privacy", "destination": "/privacy/index.html" },
{ "source": "/terms", "destination": "/terms/index.html" },
{ "source": "/ordine-personalizzato", "destination": "/ordine-personalizzato/index.html" },
{ "source": "/sitemap", "destination": "/sitemap/index.html" },
{ "source": "/colors", "destination": "/colors/index.html" },
{ "source": "/faqs", "destination": "/faqs/index.html" },
{ "source": "/cookies", "destination": "/cookies/index.html" }
```

**4. `vite.config.ts` — Remove `/colors` from sitemap generation**

Exclude the developer debug page from `sitemap.xml` to save crawl budget.

**5. Update `docs/ESCALATION-INDEXING-REPORT.md`**

Add root cause finding: beasties CSS inliner strips `<head>` during SSG build.

## What this does NOT fix (requires separate action)

- **Stale static data**: `npm run prebuild` must be run manually to refresh `staticProducts.ts` and `staticPages.ts` from the live database before deploying
- **Empty blog content**: The `/blog` page content field is empty in the database; needs content to be added via admin panel

## Risk

Low. The `onPageRendered` callback is already in use (logging only). Adding head injection is a safe string transformation. The vercel.json rewrites are additive.

