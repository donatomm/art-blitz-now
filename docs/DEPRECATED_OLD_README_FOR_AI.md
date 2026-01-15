# docs/README_FOR_AI.md
# OctoWonders: README for AI Assistants

Project: **octowonders SEO fixes and improvements**

This file is the short operating contract. If you are an AI assistant working on this repo, follow it. If anything conflicts with a user request, raise the conflict explicitly and propose a safe alternative.

## 1) Non-negotiables

1. **SSG + SEO are hard requirements.** Crawlable pages must ship pre-rendered HTML in `dist/`. No SPA shells for `/`, `/blog`, `/blog/<slug>`, `/product/<slug>`.
2. **Zero tolerance for regressions.** If a change can break SEO/SSG, you must provide a verification checklist and a rollback path.
3. **Lovable is allowed but fragile.** Treat Lovable edits as high risk. Verify SSG output after meaningful changes.
4. **Build execution must run npm scripts.** On Vercel, Build Command must be `npm run build` so `prebuild` and `postbuild` can run.
5. **No “summary of summaries.”** Do not compact context recursively. Use checkpoints after verified deploys.
6. **Keep repo clean.** No junk scripts, no abandoned utilities. Document any new build step and remove dead code.
7. **Truth tests over vibes.** Never claim certainty without evidence. Prefer binary checks like “URL returns 404 or not” and “dist contains HTML or SPA shell.”

## 2) Key architecture (high-level)

- Stack: Vite + React + TypeScript + Tailwind + shadcn UI
- SSG: `vite-react-ssg`
- Routing: `react-router` + SSG static paths
- Data: Supabase
  - Build-time prebuild generates static data used during SSG, then hydration uses live data (React Query).

## 3) Must-keep operational fix (AM Preview Styling)

Goal: Article Manager preview must stay styled across deploys.

- Stable CSS URL: `https://octowonders.com/app.css`
- Optional font: `https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300&display=swap`
- AM must not depend on hashed `/assets/app-XXXX.css`.

Truth test:
- `https://octowonders.com/app.css` must load (not 404) and display CSS text.

## 4) Verification checklist (before you say “done”)

1. Run production build:
   - `npm run build`
2. Inspect `dist/` output:
   - Key pages have real HTML content (not empty SPA shells).
   - `sitemap.xml` exists.
   - `app.css` exists (stable alias).
3. Spot-check in browser:
   - `/` homepage
   - `/blog`
   - `/blog/<slug>`
   - `/product/<slug>`
4. SEO sanity:
   - Canonical tags exist in built HTML for key pages.

## 5) Checkpoint policy (instead of compaction)

After any verified deploy or substantial change, create a checkpoint entry in:
- `docs/chat-continuity-primer.md`

Checkpoint format must include:
- Problems identified
- Fixes applied
- Results (truth tests)
- Current config values
- Next actions
