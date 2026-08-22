# Fix the `2x90x60` default price key

## Goal
Keep the `default_prices` table as it is today, but correct the one stale key so the renamed SKU `2x9060` matches its listino price of 299.

## The single change
One database row update:

```text
default_prices: dimension "2x90x60"  ->  "2x9060"   (price stays 299)
```

Nothing else. No code edits, no URL changes, no image renames, no redeploy required.

## Safety check (docs/SAFETY-CHECK.md)

| Area | Status | Notes | Risk | Recommendation |
|---|---|---|---|---|
| SSG | OK | `default_prices` is not part of the prebuild snapshot (`src/generated/*` contains only products, pages, site settings). It is fetched at runtime via `useDefaultPrices` (react-query). No rebuild needed. | None | Proceed |
| SEO | OK | No meta tags, URLs, slugs, sitemap, canonical or JSON-LD touched. Product page prices come from the product's own `sizes`, not this table. | None | Proceed |
| LCP / Performance | OK | Same query, same row count, same payload size. No new requests. | None | Proceed |
| Build process | OK | No `package.json`, `vercel.json` or postbuild script touched. | None | Proceed |
| Database / Backend | OK | Single `UPDATE` on one row of an existing table. RLS and grants unchanged (admins write, everyone reads). | Low | Proceed |
| Admin INP | OK | No admin component changed. | None | Proceed |
| Hydration / Browser APIs | OK | No new client-only code. | None | Proceed |

## Regression risks, double-checked

1. **Gallery strikethrough (`ProductCard.tsx`)** — this is the only customer-visible effect. Today `OCTOBLUE SUCKERS / 2x9060` finds no default, so the strikethrough falls back to the size's own price. After the fix it will use 299. Visible only when that size has an active deal label and 299 is higher than the deal price. Verify on the gallery after the change.
2. **Admin "Reset a Default" button (`SKUEditor.tsx`)** — after the fix, pressing it will fill `2x9060` with 299 instead of leaving it untouched. It is a form filler only; nothing is persisted until "Salva". No silent price change.
3. **Product detail page** — unaffected: it computes the strikethrough from the size's own `price`, never from `default_prices`.
4. **Checkout / Stripe** — unaffected: prices come from the product's `sizes`, fetched fresh at checkout.
5. **Dimension normalization** — verified: `normalizeDimension("2x9060")` returns `2x9060` unchanged (it parses as `2` x `9060`), so the lookup key matches exactly. No collision with any other row.
6. **Rollback** — trivial and lossless: set the dimension back to `2x90x60`. No storage files, no URLs, nothing irreversible.
7. **Untouched by design** — the mockroom image filename still says `2x60x90`. Cosmetic only; it stays as is per your instruction not to touch any URL.

## What stays broken on purpose
The gallery card and the product page still derive the strikethrough from two different sources. That inconsistency predates this change and is out of scope here — flag it if you want it unified later.
