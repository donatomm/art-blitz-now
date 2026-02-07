

# Add Contact Button Visibility to the Page Editor

## The Problem

The WhatsApp and Email contact buttons are rendered automatically at the bottom of every CMS page by `PageContent.tsx`, but the admin page editor shows **zero indication** of this. When editing any page (AUTORE, CONTATTI, ORDINE-PERSONALIZZATO, RESI-E-RIMBORSI, SPEDIZIONE, TERMINI E CONDIZIONI), there is no visual cue that contact buttons will appear on the published page.

The buttons are not hardcoded per-page and not hidden -- they are injected silently by `PageContent.tsx` with no admin-facing UI.

## The Fix

Add an **info banner** inside the page editor (between the content area and the SEO section) that tells the admin:

1. Contact buttons (WhatsApp + Email) are **automatically shown** at the bottom of this page
2. To change the phone number or email, go to the **Hello/Contct** tab
3. A small live preview of what the buttons look like

This is read-only information -- not a toggle. Every CMS page gets contact buttons, period. The admin just needs to **know** they exist and where to change them.

## Technical Details

### File: `src/components/AdminPanel.tsx`

Between the content `<Textarea>` block (line ~328) and the SEO section (line ~331), insert an info box:

```
--- After the content textarea, before the SEO section ---

<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 
     dark:border-green-800 rounded-lg p-3 mt-2">
  <p className="text-sm font-medium text-green-800 dark:text-green-300">
    WhatsApp + Email buttons appear automatically at the bottom of this page.
  </p>
  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
    To change the number or email address, go to the "Hello/Contct" tab.
  </p>
</div>
```

### No other files change

- `PageContent.tsx` -- already renders `<ContactButtons />` unconditionally (no change needed)
- `ContactButtons.tsx` -- already reads from site settings (no change needed)
- Database -- no changes needed

### What the admin will see

When editing any page, a green info box appears below the content editor that reads:

> **WhatsApp + Email buttons appear automatically at the bottom of this page.**
> To change the number or email address, go to the "Hello/Contct" tab.

This makes the invisible visible -- no more mystery about where the buttons come from.

