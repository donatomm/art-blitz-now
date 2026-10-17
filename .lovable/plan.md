# Phone-only text under gallery cards

Only file changed: `src/components/ProductCard.tsx`. No new files, no database, no packages, no SEO tags touched.

## What visitors will see

Phones (narrower than 768 px), example OCTIFIED:

```text
OCTIFIED
Da €93 [120x60]  Personalizza >>
```

Computers: the card text stays exactly as today (name | medium | sizes | ACQUISTA).

## Rules

- Line 1: product name, same style as today, links to the product page.
- Line 2: "Da €[price] [size]" links to the product page; "Personalizza >>" is a separate link to `/ordine-personalizzato`. Three separate links, none inside another.
- Cheapest size: same rule the card uses today. For each size with a price above 0, the shown price is the offer price when the offer is on and lower than the reference price, otherwise the normal price. The lowest shown price wins; the size is written as saved in the Admin Panel. Ties keep the first one in the saved order.
- If no size has a price, line 2 shows only "Personalizza >>".
- "Coming soon" cards: line 1 only, no links (as today the picture is not a link either).
- NEW badge, OFFERTA badge, magnifier: unchanged.
- Admin edit mode on: the card shows today's text on every screen; the phone version is not drawn.

## How

- Today's text row gets `hidden md:flex` (stays visible on computers; in edit mode it keeps plain `flex` so it shows everywhere).
- New phone block next to it with `md:hidden`, rendered only when edit mode is off.
- The choice comes from CSS only — no `useIsMobile`, no `matchMedia`, so pre-built pages are identical on server and phone.
- The cheapest-price calculation reuses the same values already computed for the size list.

## Safety check (docs/SAFETY-CHECK.md)

| Area | Status | Notes | Risk | Recommendation |
|------|--------|-------|------|----------------|
| SSG | OK | No screen checks, no browser APIs, no new data fetch; same static data. | None | — |
| SEO | OK | No meta, slugs, sitemap or redirects touched. Adds normal links to existing pages; `/ordine-personalizzato` already exists and is pre-built. | Low | — |
| LCP/Performance | OK | Tiny extra text, no images, no new requests. | None | — |
| Build process | OK | No scripts, packages or hosting settings. `vercel.json` untouched. | None | — |
| Database/Backend | OK | Nothing changes. | None | — |
| Admin INP | OK | Edit mode unchanged. | None | — |

## Testing

Playwright at phone width (390 px) and desktop width (1280 px) on the homepage: phone shows the two lines with correct cheapest price and working links; desktop identical to today; coming-soon card shows name only. Live site updates after your Sync & Deploy.
