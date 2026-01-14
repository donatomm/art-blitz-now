# docs/chat-continuity-primer.md
# CHAT CONTINUITY PRIMER (ChatGPT)
## For Donato → ChatGPT Continuity
Project: **octowonders SEO fixes and improvements**

This file is the long, living record: decisions, workflows, checkpoints, and “truth tests”.
Rules live in `docs/README_FOR_AI.md`. If there is a conflict, README wins.

---

## SECTION A — Current context

### A1. What this project optimizes for
- Reliable SSG output for crawlable routes.
- Strong SEO hygiene (canonicals, sitemap, stable URLs, redirects safety).
- Fast iteration without regressions.

### A2. Degradation signals
If any happen, stop and checkpoint:
- Assistant invents certainty (“I can see the HTML”).
- Assistant goes off-scope or ignores constraints.
- Plans change without verifying `dist/` output.
- Summaries get rewritten repeatedly (Xerox effect).

---

## SECTION B — Architecture snapshot (high level)

- Vite + React + TypeScript + Tailwind + shadcn UI
- SSG via `vite-react-ssg`
- Routing via `react-router` plus SSG static paths
- Supabase is the data source
  - Build-time prebuild generates static data for SSG
  - Runtime hydration uses live data (React Query)

Key principle:
- Crawlable pages must ship pre-rendered HTML in `dist/`, not empty SPA shells.

---

## SECTION C — Operational workflows

### C1. AM Preview Styling: stable CSS fix

Problem:
- Site CSS is hashed (`/assets/app-XXXX.css`) and changes after deploy, breaking AM preview styling.

Fix:
- Serve a stable CSS alias at `https://octowonders.com/app.css`
- Configure AM preview styling to load:
  1) `https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300&display=swap` (optional)
  2) `https://octowonders.com/app.css` (required)
- Remove any dependency on hashed `/assets/app-XXXX.css`.

AM “nuke” procedure:
1. In AM Preview Styling, click **Clear**
2. Paste only the allowed URLs (each on its own line)
3. Click **Extract CSS links**
4. Confirm the loaded list does not include `/assets/app-*.css` and does not include concatenated garbage like `app.csshttps://...`

Truth test:
- Open `https://octowonders.com/app.css`
- Expected: not 404, displays CSS text (Tailwind variables etc.)

### C2. Vercel build settings: lifecycle hooks must run

Problem observed:
- `/app.css` returned 404 when `postbuild` did not run.

Fix:
- Vercel Build Command must be `npm run build`
- Output directory must be `dist`
- Avoid self-referential or duplicate commands like `npm run prebuild:products && npm run build` because `build` already triggers prebuild in this repo.

Truth test:
- After deploy, `https://octowonders.com/app.css` must load (not 404).

---

## SECTION D — Content notes (RTL)

If testing RTL articles and formatting looks chaotic:
- Wrap the RTL block:

```html
<div dir="rtl" style="text-align:right;">
  <!-- RTL content -->
</div>
