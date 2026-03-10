

# Fix Missing `<head>` in Production SSG HTML

## Problem

The `onPageRendered` callback in `vite.config.ts` injects a `<head>` block, but beasties (CSS inliner used by vite-react-ssg) runs **after** `onPageRendered` and strips it out again. Production HTML still serves `<html><body>` with no `<head>`.

## Solution: Postbuild HTML Processor

Add a postbuild step that runs **after the entire SSG + beasties pipeline** to scan all `.html` files in `dist/` and inject `<head>` where missing. This guarantees no subsequent process can strip it.

## Changes

### 1. Create `scripts/postbuild-inject-head.cjs`

A Node.js script that:
- Recursively finds all `.html` files in `dist/`
- For each file missing `<head>`, injects a proper `<head>` block before `<body>`
- Preserves any existing inline `<style>` tags that beasties may have placed inside `<body>` by moving them into `<head>`
- Includes essential meta tags (charset, viewport, google verification, preconnects, font stylesheet, default title/description)
- Logs a summary of files processed

### 2. Update `package.json` build scripts

Change `postbuild` to run both the CSS alias script AND the head injection script:

```json
"postbuild": "node scripts/postbuild-inject-head.cjs && node scripts/postbuild-css-alias.cjs"
```

### 3. Update `docs/ESCALATION-INDEXING-REPORT.md`

Add a status update noting the `onPageRendered` approach failed and the postbuild processor is the new fix. Mark Priority 1 as "In Progress — postbuild approach."

## Why This Works

- Runs as the **very last step** in the build pipeline
- No framework hook or plugin can undo it afterward  
- Simple file I/O — no dependency on vite-react-ssg internals
- Idempotent — safe to run multiple times

## Files Modified

| File | Action |
|------|--------|
| `scripts/postbuild-inject-head.cjs` | **Create** — postbuild HTML head injector |
| `package.json` | **Edit** — add head injection to postbuild |
| `docs/ESCALATION-INDEXING-REPORT.md` | **Edit** — update status |

