# Bulk fix: stylized Unicode → plain ASCII in product descriptions

## Goal
Strip mathematical/bold/italic Unicode variants (𝘌𝘯𝘵𝘳𝘢, 𝙐𝙣𝙤, 𝓐𝓑𝓒, 𝗢𝗰𝘁𝗼…) from all product descriptions so Google/screen readers see real words. ~12 products affected.

## Approach

### Step 1 — One-shot normalization script
Run a local Node script (`scripts/normalize-product-descriptions.ts`) that:
1. Fetches all products from Supabase (anon key, read).
2. Applies `text.normalize('NFKC')` to each `description`. NFKC collapses Mathematical Alphanumeric Symbols (U+1D400–U+1D7FF) and similar to plain ASCII letters/digits while preserving accents, emoji, ™, and CJK.
3. Diffs old vs new; for changed rows, prints a summary and emits a single SQL file `/tmp/normalize-descriptions.sql` with one `UPDATE products SET description = $$...$$  WHERE id = '...';` per row.
4. Output is reviewed in chat before executing.

### Step 2 — Apply the UPDATEs
Execute the generated SQL via the `supabase--insert` data-change tool (requires your approval). Single transaction, ~12 statements.

### Step 3 — Verify
Re-query: `SELECT count(*) FROM products WHERE description ~ '[𝀀-𝟿]';` → expect `0`. Spot-check 2–3 product pages in preview.

### Step 4 — Prevent recurrence (small admin tweak)
In `useUpdateProduct` / `useCreateProduct` (src/hooks/useProducts.ts), normalize `description` with `.normalize('NFKC')` before insert/update. Silent — pasted stylized text becomes plain text on save. No UI change.

### Step 5 — Refresh static data
After updates land, run the existing static-data regeneration (already part of build) so `src/generated/products.json` reflects the cleaned text. No manual action — next deploy picks it up; we can also trigger the prebuild locally to sanity-check.

## Out of scope
- Product `name` field (none affected per earlier scan;