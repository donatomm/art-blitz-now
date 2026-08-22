# Add a visible "Last updated" badge

## Goal
Show a "Last updated" badge on every page, stamped with the current deployment/build date in EU format.

## Changes

1. **Inject build timestamp at build time**
   - Add `import.meta.env.VITE_BUILD_DATE` via Vite `define` or an environment variable in `vite.config.ts`.
   - Value: ISO string of the build start, e.g. `new Date().toISOString()`.

2. **Create a badge component**
   - New file: `src/components/LastUpdatedBadge.tsx`.
   - Reads `import.meta.env.VITE_BUILD_DATE`.
   - Formats the date to EU format: `DD/MM/YYYY` (e.g., `22/08/2026`).
   - Falls back to a safe placeholder if the variable is missing during dev.

3. **Render on every page**
   - Add `<LastUpdatedBadge />` inside `src/components/Footer.tsx` (or `RootLayout.tsx` if no footer is present on all routes).
   - Keep styling minimal and on-brand: small text, muted color, no hardcoded values outside the design tokens.

4. **Verify build output**
   - Run `npm run build`.
   - Confirm the rendered date appears in `dist/` HTML for at least the homepage and one product page.

## Risks
- **Dev vs. production date mismatch**: Vite define only resolves at build; local dev may show a different or missing date. Mitigation: use a fallback like "Live" or the current date in dev.
- **SSG hydration mismatch**: if the component uses `new Date()` client-side, the server-rendered HTML may differ. Mitigation: only read the injected build-time string, never `new Date()`.
