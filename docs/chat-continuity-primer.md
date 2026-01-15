# CHAT CONTINUITY PRIMER (ChatGPT)
## For Donato → ChatGPT Continuity
Project: **octowonders SEO fixes and improvements** (but follow scope guardrails)

---

## SECTION A — CURRENT WORK SESSION CONTEXT

### A0. Capacity / Degradation Signal
- Old chat felt: slightly degraded
- What started failing:
  - assistant went off-scope (kept mentioning SEO after user said “FORGET SEO”)
  - assistant claimed “I can see the HTML” too confidently (user reaction: “stop”)
- Constraints reasserted by user:
  - **Forget SEO.**
  - Execute only requested edits; stop immediately when told.

### A1. Primary Objective (One Sentence)
Create a full ChatGPT chat-continuity primer (Markdown) populated with everything known from this chat, and preserve the OctoWonders repo/architecture understanding for future work.

### A2. Scope Guardrails (What to Ignore)
FORGET SEO unless Donato explicitly asks for SEO.  
Do not keep fixing the /storie-fatti-scientifici-polpo page unless asked again.  
No extra tangents.

### A3. Current Status / Progress Marker
COMPLETED:
- A page-edit request was defined: translate EN→IT, insert HTML5 audio player with specific label and position, remove black horizontal line.
- User fixed the page in Lovable (no further fixes requested).
- Repo ZIP was provided so the assistant can learn project structure.
- Claude chat-migration primer was adapted into a ChatGPT-oriented template.

IN PROGRESS:
- Producing the filled continuity primer (this document).

NEXT:
- None.

### A4. Non-Negotiable Requirements (Hard Constraints)
- direct, practical, skeptical; don’t waste tokens; minimize em-dashes
- when user says “STOP,” stop immediately
- when user says “FORGET X,” drop it immediately
- don’t claim access to GitHub/Supabase/Vercel/Lovable unless user uploads content
- copy/paste-ready; diff/patch preferred for edits

### A4.1 Precedence rule (when docs/requests conflict)
1) **User commands override everything**:
   - STOP = stop immediately
   - FORGET X = drop it immediately

2) **This primer governs behavior + scope**:
   - only do what’s requested
   - avoid tangents
   - don’t claim access you don’t have

3) **Repo README governs architecture safety** when changes are requested:
   - protect SSG output and routing stability
   - avoid SPA-shell regressions

Interpretation:
- “FORGET SEO” means “don’t start SEO projects unasked,” not “break SSG.”

### A5. Decisions Already Made (Do Not Re-litigate)
1) Do not continue fixing the page unless asked.  
2) Use repo ZIP to inform project architecture understanding.  
3) SEO is out-of-scope unless user asks.

### A6. Open Questions / Unknowns
None blocking.

### A7. Exact Next Step
Deliver this primer; do nothing else.

---

## SECTION B — INPUTS & ARTIFACTS

### B1. Uploaded Files
| File | What it is | Why it matters |
|---|---|---|
| `/mnt/data/art-blitz-now-main 2.zip` | Repo snapshot | Anchor architecture understanding |
| `/mnt/data/Claude-chat_migration_primer_template-Date XX.XX.XX.md` | Claude primer template | Baseline adapted to ChatGPT |

### B2. Pasted Snippets
Audio URL (historical request):
https://xqubydbsoucrwqhddodw.supabase.co/storage/v1/object/public/audio//POLPO-INTELLIGENZA_DIBATTITO_STREAMING.mp3

Page URL referenced:
https://octowonders.com/storie-fatti-scientifici-polpo

---

## SECTION C — PROJECT SNAPSHOT (OctoWonders)

- Stack: Vite + React + TypeScript + Tailwind/shadcn
- Routing: react-router + vite-react-ssg
  - `src/main.tsx` uses `ViteReactSSG`
  - `src/routes.tsx` defines routes with `getStaticPaths`
- Data: Supabase (products, pages, site_settings) using supabase client + React Query hooks (useProducts/usePages)
- Build: `scripts/prebuild.ts` (via `npm run prebuild:products`) generates:
  - `src/generated/staticProducts.ts`, `staticPages.ts`, `staticSiteSettings.ts`
  - `products.json`, `pages.json`
- Rendering: pages/products render from generated static data for SSG, then hydrate with live data
- Content: `PageContent` renders markdown-like text and full HTML with sanitize utilities
- Sitemap: `vite.config.ts` plugin from products.json/pages.json writes sitemap.xml to public and dist
- Redirects: Vercel edge `middleware.ts` handles `/product/{uuid}` → 308 redirect to slug (else 410)

---

## VERSION
Filled snapshot: **2026-01-10**
Visible: 0% - 100%
