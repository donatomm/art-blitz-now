# Remove "- Personalizza" from the phone line

Only file changed: `src/components/ProductCard.tsx`. No new files, no database, no packages, no SEO tags touched.

## What visitors will see

Phones (narrower than 768 px), example OCTIFIED:

```text
OCTIFIED | Da €93 [120x60]
```

- No size with a price: only the name.
- "Coming soon" cards: name only (unchanged).
- Computers and admin edit mode: unchanged.

## How

- In the phone block, delete the `<span>` holding " - " and the "Personalizza" link to `/ordine-personalizzato`.
- Name link and " | Da €… […]" link stay exactly as built (same cheapest-size rule, same `whitespace-nowrap` wrapping).

## Safety check (docs/SAFETY-CHECK.md)

| Area | Status | Notes | Risk |
|------|--------|-------|------|
| SSG | OK | CSS-only choice kept; no browser APIs | None |
| SEO | OK | Removes one internal link from cards; no meta, slugs, sitemap or redirects touched; the page itself is untouched | Low |
| LCP/Performance | OK | Less text | None |
| Build | OK | `vercel.json` untouched | None |
| Database | OK | Nothing changes | None |
| Admin INP | OK | Edit mode unchanged | None |

## Testing

Playwright at 390 px: OCTIFIED card text is exactly "OCTIFIED | Da €93 [120x60]", no "Personalizza". At 1280 px: card identical to today. Live after your Sync & Deploy.
