# Computer/tablet card text: name and sorted sizes only

Only file changed: `src/components/ProductCard.tsx`. No new files, no database, no packages, no SEO tags. The phone block (`md:hidden`) stays exactly as today. The product page and its #acquista section are not touched.

## What visitors will see (768 px and wider)

Before: `OCTIFIED | From an AI Hallucination to Mutation . . Stampa su Tela | 120x60 €93 | 120x80 €114 | ACQUISTA`

After: `OCTIFIED | 120x60 €93 | 120x80 €114`

## Rules

- Removed: the green ACQUISTA button, its link to `/product/{slug}#acquista`, and the "|" before it.
- Removed (outside edit mode): the medium text and the "|" after the name. The medium text stays in the picture's alt text.
- Sizes sorted cheapest first by shown price (offer price when the offer is on, same rule as today). Equal prices keep their saved order (stable sort). Sizes written as saved in the Admin Panel.
- If no size has a price: name only, with no trailing "|".
- "Coming soon" cards: name only.
- NEW badge, OFFERTA badge, magnifier: unchanged.
- Admin edit mode (every screen): name | medium (still click-to-edit) | sorted sizes, no ACQUISTA.

## How

- Make a sorted copy of the existing `shownSizes` list (stable sort by price) and build the `sizePrices` text from it. The phone line's cheapest-size value keeps using the same data, so it does not change.
- In the computer row: show the medium and its "|" only when edit mode is on. Delete the "|" before ACQUISTA and the ACQUISTA link/button. Show the "|" before the sizes only when there are priced sizes.
- The `Button` import stays because edit mode still uses it.

## Safety

No browser screen checks (CSS only), no new data fetch, no meta/slug/sitemap changes, no hosting settings, `vercel.json` untouched. Removing the ACQUISTA links takes away one internal link per card to `/product/{slug}#acquista`. The name and picture still link to the same product page.

## Testing

Run Playwright on the homepage at 1280 px and 820 px and check for "OCTIFIED | 120x60 €93 | 120x80 €114" with no ACQUISTA. At 390 px, check the phone line is unchanged. Live after your Sync & Deploy.

DO YOU WANT TO RUN A FULL SAFETY CHECK?
