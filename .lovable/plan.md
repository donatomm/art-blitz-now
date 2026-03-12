

# Fix: Duplicate `<head>`, `/colors` in Sitemap, Emoji in `/terms` H1

## 1. Duplicate `<head>` blocks (head=2)

**Root cause**: Two places inject `<head>` — the SSG `onPageRendered` callback in `vite.config.ts` (lines 158-175) AND the postbuild script `scripts/postbuild-inject-head.cjs`. When SSG injects one, the postbuild script sees it and skips — but for pages where SSG succeeds, we get the SSG head. For pages where both fire, we get two.

**Fix**: Remove the `<head>` injection from `vite.config.ts` `onPageRendered`. The postbuild script is the authoritative final pass — it runs after everything and handles all cases. Keeping both creates duplicates. The `onPageRendered` should only log diagnostics, not modify HTML.

| File | Change |
|------|--------|
| `vite.config.ts` | Remove lines 158-175 (the `<head>` injection in `onPageRendered`). Keep only the logging. |
| `scripts/postbuild-inject-head.cjs` | Update skip logic: instead of skipping when `<head>` exists, skip when `<head>` exists AND contains a `<title>` tag. This ensures the postbuild script always injects into empty/stripped heads. |

## 2. Remove `/colors` from sitemap

The `/colors` route is a developer tool. It appears in the sitemap via the fixed routes array and also in the edge function.

| File | Change |
|------|--------|
| `vite.config.ts` | Already excluded — comment says "excluded from sitemap". No change needed. |
| `supabase/functions/sitemap/index.ts` | Already excluded. No change needed. |
| `src/pages/Sitemap.tsx` | No change — `/colors` is not listed in the human-readable sitemap sections. |

Actually, `/colors` is NOT in the fixed routes array in either location. It must be appearing because it's a CMS page or picked up elsewhere. Let me verify — the curl showed `head=1` for `/colors`, meaning it's lazy-loaded and served via SPA fallback. It's not in the XML sitemap at all (the XML sitemap only has fixed routes + CMS pages + products). The `/sitemap` HTML page also doesn't list it. **No change needed** — `/colors` is already excluded from the XML sitemap.

## 3. Remove emoji from `/terms` H1

The content `# 📄 Termini e Condizioni di Vendita` is stored in the database (`pages` table, slug `terms`). The `staticPages.ts` file is auto-generated from it.

**Fix**: Update the database content to remove the emoji from the H1 heading.

| Action | Detail |
|--------|--------|
| Database migration | Update the `pages` table: set `content` for slug `terms` to replace `# 📄 Termini e Condizioni di Vendita` with `# Termini e Condizioni di Vendita` |

## Summary

Three changes total:
1. **`vite.config.ts`** — Remove `<head>` injection from `onPageRendered` (keep logging only)
2. **`scripts/postbuild-inject-head.cjs`** — Smarter skip: only skip files where `<head>` contains `<title>`
3. **Database update** — Remove emoji from `/terms` page content heading

