Add a visible left-arrow indicator to the terms-and-conditions checkbox when a visitor clicks "Acquista ora" without accepting the terms.

## Goal
Make the existing T&C checkbox impossible to miss on a failed buy attempt by adding the "red arrow by the left" treatment selected from the design directions.

## What will change
In `src/pages/Product.tsx`, the terms acceptance block (around the existing checkbox and error message) will gain an error-state visual:
- A red outline / tinted background around the whole checkbox row when `showTermsError` is true.
- A left-pointing arrow icon positioned to the left of the checkbox, visible only in the error state.
- Bold red helper text reading "Campo obbligatorio per procedere" placed directly under the checkbox label when the error is active.
- The existing error paragraph below the checkbox is preserved.

## Files to modify
- `src/pages/Product.tsx` — add conditional error-state classes and the arrow/helper text markup.

## Implementation notes
- Use the existing `showTermsError` state that is already set to `true` when "Acquista ora" is pressed while `termsAccepted` is false.
- Use the project's semantic `destructive` color tokens for the red outline/text so the indicator works in both light and dark mode.
- Use a Lucide arrow icon (already imported in the file) for the left arrow.
- On very narrow mobile screens the arrow may be hidden or stacked to avoid line-break issues; the red outline and helper text remain visible.
- No legal wording changes, no new state, no backend or SEO changes.

## Verification
- Open a product page, leave the T&C checkbox unchecked, and click "Acquista ora".
- Confirm the checkbox row shows a red outline, a left arrow, and "Campo obbligatorio per procedere".
- Check the box and confirm the indicator disappears immediately.
- Repeat on mobile viewport to confirm readability.