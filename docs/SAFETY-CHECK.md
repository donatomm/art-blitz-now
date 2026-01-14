# Pre-Implementation Safety Check ✅

**Purpose**: Run these checks BEFORE implementing any change to prevent SSG, SEO, and performance regressions.

---

## 1. SSG Impact Check

| Question | Yes/No | Action Required |
|----------|--------|-----------------|
| Does this change affect static data hooks (`useStaticProducts`, `useStaticSiteSettings`, `useStaticPages`)? | | If yes: verify prebuild script still works |
| Does this add a component outside `<Suspense>` that makes API calls? | | If yes: WRAP IN SUSPENSE or move inside existing boundary |
| Does this modify `routes.tsx` or add new routes? | | If yes: update `getStaticPaths` and verify SSG output |
| Does this change require a database update to take effect? | | If yes: remind user to trigger rebuild after DB change |

---

## 2. SEO Impact Check

| Question | Yes/No | Action Required |
|----------|--------|-----------------|
| Does this change the `<SEO>` component or meta tags? | | If yes: verify title < 60 chars, description < 160 chars |
| Does this affect structured data (JSON-LD)? | | If yes: validate with Google Rich Results Test |
| Does this change any URLs or slugs? | | If yes: add 301 redirects in `vercel.json` |
| Does this affect `robots.txt` or `sitemap.xml`? | | If yes: verify crawlability of important pages |
| Does this change canonical URLs? | | If yes: ensure no duplicate content issues |

---

## 3. Performance (LCP/Core Web Vitals) Impact Check

| Question | Yes/No | Action Required |
|----------|--------|-----------------|
| Does this component make API calls on mount? | | If yes: MUST be inside `<Suspense>` boundary |
| Does this add JavaScript that blocks rendering? | | If yes: consider lazy loading or deferring |
| Does this affect the critical rendering path (Navigation, Hero, above-fold content)? | | If yes: ensure no new async operations before paint |
| Does this add new network requests for first-time visitors? | | If yes: verify they don't delay LCP |

### The Suspense Rule 🚨
**ANY component that fetches data (useEffect with API calls, react-query hooks, supabase calls) MUST be:**
1. Inside a `<Suspense>` boundary, OR
2. Only rendered for authenticated users after hydration

---

## 4. Execution Path Analysis (CRITICAL)

**Don't just analyze what RENDERS — analyze what EXECUTES.**

### Before adding ANY component, trace its execution:

```typescript
// WRONG ANALYSIS: "Returns null for non-admins, so it's safe"
if (!isAuthenticated) return null; // ← Only looked at render output

// CORRECT ANALYSIS: "What runs BEFORE that return?"
useEffect(() => {
  supabase.auth.getSession(); // ← RUNS FOR EVERYONE
}, []);

const { data } = useSiteSettings(); // ← RUNS FOR EVERYONE
```

| Question | Yes/No | Action Required |
|----------|--------|-----------------|
| Does this component have `useEffect` hooks that run unconditionally? | | If yes: those effects run for ALL visitors |
| Does this component use data-fetching hooks at the top level? | | If yes: those queries run for ALL visitors |
| Does the component call Supabase/API methods before conditional returns? | | If yes: impacts ALL visitors, not just the ones who see the UI |

---

## 5. Build Process Impact Check

| Question | Yes/No | Action Required |
|----------|--------|-----------------|
| Does this modify `package.json` scripts? | | If yes: verify build chain still works |
| Does this change `vercel.json` config? | | If yes: test redirects/rewrites locally first |
| Does this affect build output structure? | | If yes: verify postbuild scripts still work |

---

## 6. Database/Backend Impact Check

| Question | Yes/No | Action Required |
|----------|--------|-----------------|
| Does this require new RLS policies? | | If yes: verify data is properly protected |
| Does this add new tables? | | If yes: include in migration with RLS |
| Does this modify edge functions? | | If yes: test error handling and auth |
| Does this require authentication that isn't implemented? | | If yes: implement auth BEFORE the feature |

---

## 7. Self-Check Questions

Before finalizing, ask yourself:

1. **"What happens for a first-time visitor with empty cache?"**
   - No auth token
   - No cached data
   - Full page load

2. **"What happens at SSG build time?"**
   - No browser APIs
   - No user session
   - Static data only

3. **"Could this delay LCP for any visitor?"**
   - If the answer is "only for non-admins" or "only sometimes" — that's still a YES

---

## 8. Required Output Format

When running this check, produce a summary table:

| Area | Status | Notes | Risk Level | Recommendation |
|------|--------|-------|------------|----------------|
| SSG | ✅/⚠️/❌ | | None/Low/Medium/High | |
| SEO | ✅/⚠️/❌ | | None/Low/Medium/High | |
| LCP/Performance | ✅/⚠️/❌ | | None/Low/Medium/High | |
| Build Process | ✅/⚠️/❌ | | None/Low/Medium/High | |
| Database/Backend | ✅/⚠️/❌ | | None/Low/Medium/High | |

---

## 9. Files That Require Extra Scrutiny

These files have outsized impact on SSG/SEO/Performance:

| File | Why It's Critical |
|------|-------------------|
| `src/pages/Index.tsx` | Main entry point, LCP-critical |
| `src/components/RootLayout.tsx` | Wraps entire app |
| `src/routes.tsx` | SSG route generation |
| `vercel.json` | Build config, redirects, caching |
| `package.json` | Build scripts (read-only reminder) |
| `src/hooks/useStatic*.ts` | Static data for SSG |

---

## 10. The Golden Rules

1. **SSG First**: Static data at build time, dynamic data only when necessary
2. **Execution > Rendering**: Analyze what code RUNS, not just what displays
3. **Suspense Everything**: Any data fetching = Suspense boundary required
4. **Authenticated Experience ≠ Universal Experience**: Admin features must not impact visitor performance

---

## Quick Reference Prompt

Copy this for quick checks:

```
Before implementing, run Pre-Implementation Safety Check:
1. SSG impact? (static hooks, Suspense boundaries, routes)
2. SEO impact? (meta tags, structured data, URLs)
3. LCP impact? (API calls, render blocking, Suspense rule)
4. Execution path? (what RUNS vs what RENDERS)
5. Build process? (scripts, vercel.json, output)
```
