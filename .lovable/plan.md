# Keep an empty hero button text empty in the pre-built homepage

Only file changed: `scripts/prebuild.ts`, line 110. No new files, no database, no packages, no other line.

## Change

Before:
```text
hero_cta_text: settings.hero_cta_text || "ESPLORA LA COLLEZIONE",
```
After:
```text
hero_cta_text: settings.hero_cta_text ?? "ESPLORA LA COLLEZIONE",
```

## What visitors will see

- Admin Panel text empty: the pre-built homepage has no button, so no flash of the button before live settings load. (The hero already shows the button only when the text is not empty.)
- Admin Panel text filled: unchanged, the saved text shows.
- Setting missing entirely: fallback "ESPLORA LA COLLEZIONE", as today.

All other `||` lines in prebuild.ts stay as they are.

## Safety check (docs/SAFETY-CHECK.md)

| Area | Status | Notes | Risk |
|------|--------|-------|------|
| SSG | OK | Only changes a value in pre-built settings; pre-built and live now match | None |
| SEO | OK | No meta, slugs, sitemap, robots, canonicals | None |
| LCP/Performance | OK | Removes a flashing element | None |
| Build | OK | Same script, same output files; `vercel.json` untouched | Low |
| Database | OK | Read only, as today | None |
| Admin INP | OK | Admin untouched | None |

## Testing

Run the prebuild script locally and confirm the generated settings file holds the saved text (empty if empty). The generated file may change as a normal result of that run; I will not keep that change unless you ask. Live after your Sync & Deploy.

## Before I build

DO YOU WANT TO RUN A FULL SAFETY CHECK?
