# Deployment Workflow

This project uses Static Site Generation (SSG). Content changes in the database require a rebuild to reflect on the live site.

---

## When Database Content Changes

### Manual Workflow

1. **Make changes** in the database (products, settings, pages)
2. **Run prebuild** to regenerate static data files:
   ```bash
   npm run prebuild
   ```
3. **Verify** the generated files in `src/generated/`:
   - `staticProducts.ts`
   - `staticSiteSettings.ts`
   - `staticPages.ts`
   - `products.json`
   - `pages.json`
4. **Commit** the updated files
5. **Push** to trigger Vercel deployment
6. **Wait** for deployment to complete (~2-5 minutes)
7. **(Optional)** Purge CDN cache via Vercel dashboard if needed immediately

### Important Notes

- Static data files are **committed to the repository**
- The preview/production site uses these committed files
- Without running `prebuild`, content changes won't appear

---

## CDN Cache Behavior

The site uses a CDN cache with these settings (in `vercel.json`):

| Setting | Value | Meaning |
|---------|-------|---------|
| `max-age=0` | 0 seconds | Browser always revalidates |
| `s-maxage=300` | 5 minutes | CDN caches for 5 minutes |
| `stale-while-revalidate=600` | 10 minutes | CDN can serve stale while fetching fresh |

### What This Means

- After deployment, CDN may serve old content for up to 5 minutes
- Users see fresh content within 5-15 minutes of deployment
- For immediate updates, purge CDN cache in Vercel dashboard

---

## Automated Workflow (Recommended)

For instant content updates without manual steps:

### Option 1: Vercel Deploy Hook

1. Create a deploy hook in Vercel dashboard
2. Store the hook URL in Supabase secrets (`VERCEL_DEPLOY_HOOK`)
3. Call the hook after database changes via edge function

### Option 2: Database Trigger + Edge Function

The `trigger-deploy` edge function can be called after product/settings changes to:
1. Regenerate the sitemap
2. Trigger a Vercel deployment

---

## Troubleshooting

### "Old content showing in preview"

1. Check if `npm run prebuild` was run after the latest DB changes
2. Check if `src/generated/*.ts` files are up to date
3. Check if changes were committed and pushed
4. Wait for Vercel deployment to complete
5. Hard refresh browser (Ctrl+Shift+R) to bypass browser cache

### "Content shows correctly sometimes"

This usually means mixing static and live data. Check that:
- All public pages use `getStaticProducts()` not `useProducts()`
- All components use `useStaticSiteSettings()` not `useSiteSettings()`

### "Changes work locally but not in production"

1. Ensure `npm run prebuild` was run
2. Ensure `src/generated/` files were committed
3. Check Vercel build logs for errors

---

## Key Files

| File | Purpose |
|------|---------|
| `scripts/prebuild.ts` | Fetches data from Supabase, generates static files |
| `src/generated/staticProducts.ts` | Static product data |
| `src/generated/staticSiteSettings.ts` | Static settings data |
| `src/generated/staticPages.ts` | Static CMS page data |
| `vercel.json` | CDN cache settings, redirects |

---

## See Also

- [SAFETY-CHECK.md](./SAFETY-CHECK.md) - Pre-implementation checklist
- [COMMON-MISTAKES.md](./COMMON-MISTAKES.md) - Common SSG/LCP issues
