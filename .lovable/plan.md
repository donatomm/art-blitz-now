# Hide the hero button on phones

Only file changed: `src/components/Hero.tsx`. No new files, no database, no packages, no SEO tags touched.

## What visitors will see

- Phone (narrower than 768 px): the hero shows the title and subtitle only. No "ESPLORA LA COLLEZIONE" button.
- Computer (768 px and wider): the button looks and works exactly as it does today — same text, same green pill, same scroll to the gallery.
- The button text itself is not touched anywhere: Admin Panel and database keep it as is.

## How

- In `Hero.tsx`, the button's class list gains `hidden md:inline-block`. Everything else on the button (text, `onClick`, colours, hover scale, padding, rounded shape) stays byte-for-byte the same.
- `hidden` removes the button on phones, `md:inline-block` puts it back on computers. The choice is made by CSS alone, so the pre-built pages never ask the screen how wide it is.
- The spacer, the title, the subtitle, the trust bar and the click handler are untouched.

## Safety check (docs/SAFETY-CHECK.md)

| Area | Status | Notes | Risk |
|------|--------|-------|------|
| SSG | OK | CSS-only choice; no browser APIs, no screen check in JavaScript, so server render and first client render match | None |
| SEO | OK | No meta tags, slugs, sitemap, robots or canonicals touched. One internal scroll action is no longer offered on phones; no URL changes | Low |
| LCP/Performance | OK | Removes one element on phones; no new network requests, nothing added before paint | None |
| Build | OK | `vercel.json`, `package.json` and build scripts untouched | None |
| Database | OK | Nothing changes; hero text still comes from the same settings | None |
| Admin INP | OK | Not an admin file; Admin Panel untouched | None |

## Testing

Playwright in a phone-sized browser (390 px): the button is not present on the page, and the title and subtitle still show. Playwright at 1280 px: the button is present with the same text and still scrolls to the gallery when clicked. Build passes.

Live after your Sync & Deploy.

## Before I build

DO YOU WANT TO RUN A FULL SAFETY CHECK?
