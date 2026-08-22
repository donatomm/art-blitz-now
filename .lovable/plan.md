# Plan: Trim Terms Checkbox Label

## What to change
In `src/pages/Product.tsx`, remove the trailing clause from the terms-and-conditions checkbox label so it ends at `(PDF)`.

## Current text
```
Confermando il tuo ordine accetti i Termini e Condizioni di Vendita (PDF) e dichiari di essere consapevole che l'ordine comporta un obbligo di pagamento.
```

## New text
```
Confermando il tuo ordine accetti i Termini e Condizioni di Vendita (PDF)
```

## Implementation
- Edit the `<label>` at approximately line 574–584 in `src/pages/Product.tsx`.
- Remove the `{" "}e dichiari di essere consapevole che l'ordine comporta un obbligo di pagamento.` fragment.
- Keep the link, its `download` attribute, and the existing error paragraph unchanged.

## Risk
Very low. This is a pure copy change inside an existing label; no logic, URLs, or validation change.