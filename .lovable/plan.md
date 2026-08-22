# Propagate the renamed SKU `2x9060`

You renamed the irregular size on OCTOBLUE SUCKERS from `2x90x60` to `2x9060` in the product's sizes. The old string is still present in two places that matter, plus one cosmetic one.

## What I verified (read-only)

- Product `OCTOBLUE SUCKERS` (`polpo-octopus-blue-wow-stampa-tela`) now has size `2x9060`, price 129, deal_price 129, Stripe id `prod_TefKwgzZVvw3f3`. This is the only `2x...` size in the catalogue.
- `default_prices` table still holds a row `2x90x60 = 299`. There is no row for `2x9060`.
- `src/generated/staticProducts.ts` (build-time snapshot of the catalogue, line ~433) still contains `"dimensions": "2x90x60"` with the old data.
- The mockroom image filename for that size is still `octoblue-double-suckers-2x60x90.webp`.
- Site settings and CMS pages contain no reference to the old string.

## Where this shows up

1. **Listino / default price ("prezzo di listino") is now unmatched.** `getDefaultPrice()` normalises and looks up the exact dimension string. With `2x9060` absent from `default_prices`, this SKU no longer gets a listing price: the crossed-out reference price disappears in the gallery cards, and the SKU Editor's "Applica prezzi di listino" bulk action skips it. The SKU Editor also lists `2x9060` as its own dimension group, separate from the old `2x90x60` group.
2. **Live pages still serve the old label and old price.** The published site renders from `src/generated/staticProducts.ts`, which was generated before your edit. Until a new deploy regenerates it, product pages and gallery cards fetched statically still show `2x90x60`. This is the "price in product page" mismatch you saw.
3. **Cosmetic:** the mockroom image file for that size is still named with the old convention (`2x60x90`). Only the filename; the image itself is correct.

## Proposed fix

1. Update the `default_prices` row `2x90x60` to `2x9060` (keeping the 299 value, or a value you specify) so the listing price matches again — one DB update, no code change.
2. Redeploy so the prebuild step regenerates `src/generated/staticProducts.ts` from the live database and the public pages pick up `2x9060` and price 129.

**Constraint:** No URLs will be changed. The mockroom image filename stays exactly as it is, and no storage paths or page routes are touched.

Nothing else needs to change: the size label, price, deal price and Stripe id on the product itself are already consistent, and `normalizeDimension()` handles `2x9060` without confusing it with other sizes.

## Confirmations I need

- Should the default price for `2x9060` stay 299, or be a different number?
- Do you want the mockroom image renamed, or leave the filename alone?
- Do you want me to run `docs/SAFETY-CHECK.md` before touching anything?

## Risks

- Editing `default_prices` changes the crossed-out reference price shown next to offers for that SKU; it does not change what a customer pays (the sale price lives on the product size).
- If the value is set below the current 129 sale price, the offer display logic hides the strikethrough.
- Regenerating the static snapshot pulls in every other change made in the database since the last deploy — expected, but worth knowing.
- Renaming the storage image is irreversible; it must be copy-then-verify-then-delete, following the verify-before-delete rule.
