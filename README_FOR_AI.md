# OctoWonders — README for AI Assistants

This repo powers **octowonders.com** (Vite + React + TypeScript + Tailwind/shadcn) with **SSG** via `vite-react-ssg`.

Use this file to avoid breaking **SSG / routing / build output**, and to make changes safely.

---

## 0) Precedence rules (read this first)

When there’s any tension between docs:

1) **Behavior & scope guardrails** come from `chat-continuity-primer.md`:
   - obey **STOP** and **FORGET X**
   - do only what’s requested
   - don’t claim access to systems you can’t see

2) **Architecture safety rules** come from this README:
   - **SSG integrity** and **routing stability** are non-negotiable when touching the site/build
   - avoid changes that degrade `dist/` HTML output

Practical interpretation:
- You may “forget SEO” as a topic while still protecting SSG output (because SSG is the site’s core delivery mechanism, not a “SEO task”).

---

## 1) Operating rules

1. **SSG is non-negotiable.** Avoid changes that reduce server-rendered HTML in `dist/`.
2. **Prefer small, reversible changes.** One change, then verify build output.
3. **Never introduce SPA-shell behavior** for crawlable pages (`/`, `/blog`, `/blog/<slug>`, `/product/<slug>`).
4. **Don’t change routing patterns** (slugs, redirects) without considering indexed URLs/backlinks.
5. **Avoid build hacks** unless documented and tested.
6. **Do not claim access** to GitHub/Supabase/Vercel/Lovable unless the user has provided the relevant content.

---

## 2) Key architecture (high level)

- **Routing:** `react-router` + `vite-react-ssg`
  - `src/main.tsx` uses `ViteReactSSG`
  - `src/routes.tsx` defines routes + `getStaticPaths`

- **Data:** Supabase + build-time static generation
  - `scripts/prebuild.ts` (via `npm run prebuild:products`)
  - Generates: `src/generated/staticProducts.ts`, `staticPages.ts`, `staticSiteSettings.ts`
  - Also writes: `products.json`, `pages.json`

- **Hydration:** pre-rendered from static data, then hydrated with live data via React Query hooks.

- **SEO plumbing (implementation detail):**
  - `SEO.tsx` handles canonical/OG/meta + JSON-LD.

- **Sitemap:**
  - generated during build from `products.json` / `pages.json`.

- **Redirect safety net:**
  - Vercel edge middleware redirects `/product/{uuid}` → 308 to slug, else 410.

---

## 3) Must-keep operational fix

### Stable CSS for Article Manager preview

AM preview should load:
- `https://octowonders.com/app.css`
- (optional) Montserrat Google Font link

Repo uses a `postbuild` step to generate `dist/app.css` so AM doesn’t chase hashed `/assets/app-*.css`.

Note (recommendation, not a claim about your current hosting):
- Ensure your deployment runs the repo’s `build` in a way that also runs `postbuild`, otherwise `app.css` won’t exist.

---

## 4) Verification checklist (pass/fail)

1. Run: `npm run build`
2. Confirm `dist/` contains:
   - HTML with real content (not empty SPA shells)
   - `sitemap.xml`
   - `app.css` (stable CSS alias)
3. Spot-check:
   - `/` homepage
   - `/blog`
   - `/blog/<slug>`
   - `/product/<slug>`
4. Confirm canonical tags exist in built HTML.

---

## 5) Long context

See: `chat-continuity-primer.md`
