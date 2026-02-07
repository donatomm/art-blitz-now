

# Fix Plan: CMS Pages, Product Page, and Admin Tabs

## What Went Wrong (Honest Assessment)

### What was done:
- Global tab styling (`tabs.tsx`) was modified with `font-extralight`, `bg-primary text-primary-foreground` -- these were admin-specific styles that leaked into the global component, breaking tabs everywhere
- Product page button styling was changed to Amazon-style yellow/orange pill buttons and layout was shifted with `md:pl-[68px]`

### What was NOT done (but should have been):
- Contact buttons were never added to generic CMS pages -- only Contatti works because `Contact.tsx` hardcodes them as children
- The `ordine-personalizzato` page database content was never cleaned up -- it's a full `<!DOCTYPE html>` blog-template document with breadcrumb nav ("Back to Blog"), author byline, read time, and custom CSS that doesn't belong on a standard CMS page

### Why it went wrong:
- Admin-specific styling was applied to the global `TabsTrigger` component instead of being scoped via className overrides
- Product page buttons were redesigned without checking the site's existing design language
- Contact buttons solution was proposed as a per-slug matching hack instead of understanding the architecture: `PageContent` is the single source of truth for ALL CMS pages (except `/blog`) and should always render contact buttons

---

## What Needs Fixing (3 items)

### 1. CMS Contact Buttons -- The Right Way

**Problem:** The `{{CONTACT_BUTTONS}}` token exists in PageContent but zero pages in the database use it. Only Contatti works because Contact.tsx hardcodes buttons as children.

**Architecture Fix:** `PageContent.tsx` is the single rendering component for all CMS pages. It should ALWAYS append `ContactButtons` at the bottom of every page. No slug matching. No token needed. The component already imports and supports `ContactButtons`.

**Changes:**
- `PageContent.tsx`: After rendering page content and children, always render `<ContactButtons />` at the bottom (it's already imported)
- `Contact.tsx`: Remove the hardcoded WhatsApp/Email buttons since PageContent will now handle them universally

### 2. Fix `ordine-personalizzato` Database Content

**Problem:** The database content for this page is a full HTML document (`<!DOCTYPE html>`) with blog-style markup:
- `<nav>` breadcrumb with "Back to Blog" link
- Author byline ("DMM") and read time metadata
- Custom CSS classes and inline styles
- Full `<html>/<head>/<body>` structure

This makes it render completely differently from other CMS pages like `artista`, `spedizione`, `pricing-policy` which are clean Markdown.

**Fix:** Convert `ordine-personalizzato` from HTML to clean Markdown content (matching the style of `artista`, `spedizione`, etc.) and update `content_type` to `markdown`. The actual informational content will be preserved -- just stripped of the blog template wrapper, nav, author byline, and custom CSS.

### 3. Admin Tab Renaming

**Current:** Prodotti | SKUs | Menu | Hello Bar | Hero | Pagine | Immagini | Deploy

**New:** Prodotti | SKU | Menus | Hello/Contct | Hero | Pagin | Imgs | Deploy

Only text labels change. No styling changes.

---

## What Will NOT Be Changed

- `tabs.tsx` -- left alone as-is (user confirmed no fix needed)
- Product page -- not in scope for this implementation
- Mobile column layout -- confirmed good, no changes

---

## Technical Details

### File: `src/components/PageContent.tsx`
- After the `{children}` render inside `<div className="max-w-4xl">`, add `<ContactButtons />` unconditionally
- The component already imports `ContactButtons`

### File: `src/pages/Contact.tsx`
- Remove the hardcoded WhatsApp/Email button JSX (lines 28-61)
- Simplify to just render `<PageContent slug="contatti" breadcrumbs={...} />` without children
- Remove unused imports (`useStaticSiteSettings`) and variables

### Database: `ordine-personalizzato` page
- Convert content from HTML blog template to clean Markdown
- Change `content_type` from `html` to `markdown`
- Preserve all actual content (steps, descriptions, contact info)
- Remove: `<!DOCTYPE>`, `<html>/<head>/<body>`, nav breadcrumb, author byline, read time, custom CSS

### File: `src/components/AdminPanel.tsx` (lines 1269-1276)
- Rename tab labels only:
  - "SKUs" to "SKU"
  - "Menu" to "Menus"  
  - "Hello Bar" to "Hello/Contct"
  - "Pagine" to "Pagin"
  - "Immagini" to "Imgs"

---

## Implementation Order

1. Fix `PageContent.tsx` -- add universal ContactButtons
2. Simplify `Contact.tsx` -- remove hardcoded buttons
3. Convert `ordine-personalizzato` database content to Markdown
4. Rename admin tabs in `AdminPanel.tsx`
5. Verify each CMS page one by one: artista, spedizione, pricing-policy, contatti, ordine-personalizzato, faqs, resi-rimborsi

