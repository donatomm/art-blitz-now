# Plan: Refine Terms Checkbox Error Indicator

## What to change
In `src/pages/Product.tsx`, adjust the existing error-state visual indicator around the terms checkbox so the arrow points at the checkbox itself, and simplify the helper sentence below.

## Changes

### 1. Arrow must point at the checkbox
- Reposition the bouncing `ArrowRight` icon so it sits **before / beside the checkbox**, pointing right at the checkbox (not floating on the left side of the label text).
- Keep it hidden on very narrow screens (`hidden sm:block`) and `aria-hidden="true"`.
- Maintain the red error styling on the checkbox container (`border-destructive bg-destructive/5`).

### 2. Simplify the error sentence
- Current: `Per continuare devi accettare i Termini e Condizioni e l'obbligo di pagamento.`
- New: `Per continuare devi accettare i Termini e Condizioni.`
- Remove the word "Obbligo" and the payment-clause fragment.

### 3. Trim the checkbox label (previous request)
- Current label ends with: `e dichiari di essere consapevole che l'ordine comporta un obbligo di pagamento.`
- New label ends at: `Termini e Condizioni di Vendita (PDF)`
- Remove the `{" "}e dichiari...` fragment.

## Scope
Only `src/pages/Product.tsx` around the terms-and-conditions block (lines ~560–590). No logic, validation, URLs, or checkout behavior changes.

## Risk
Very low. Pure copy and positioning adjustments inside an existing UI element.