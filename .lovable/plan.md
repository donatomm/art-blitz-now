
# Fix: Admin Page Editor INP (1,316ms regression)

## What the INP report is showing

The offending element is:
```
textarea.flex.min-h-[80px]...font-mono.text-sm
```
This is the page content `<Textarea>` at line 322 of `src/components/AdminPanel.tsx`, inside the `PagesTabContent` component.

## Root cause (pre-existing, not caused by the PageContent.tsx fix)

`PagesTabContent` (lines 58–379) owns ALL of this state directly:
- `editingPage`, `editTitle`, `editContent`, `editSlug`, `editSeoTitle`, `editSeoDescription`, `isHtmlMode`, `showImageUpload`
- `debouncedContent = useDebouncedInput(editContent, setEditContent)`

When the user types, `useDebouncedInput` fires `setEditContent` after 150ms. Because `editContent` is state inside `PagesTabContent`, this triggers a **full re-render of the entire component** — including the pages list, all buttons, the Textarea itself, and the `<Tabs>` wrapper. That is the 950ms render time in the report.

The debounce prevents re-renders on every single keystroke but does NOT prevent the expensive re-render 150ms later when the debounce fires.

## Why my PageContent.tsx diff is unrelated

My last change was a one-line fix in `src/components/PageContent.tsx` — the public-facing page renderer used by visitors. It has zero involvement with `AdminPanel.tsx` or `PagesTabContent`. The INP was pre-existing.

## The fix: extract PageEditorForm as an isolated sub-component

This is the exact same pattern already used for `ProductSizeRow`, `ProductDealRow`, `TrustBarItemInput`, and `MenuItemRow`.

Create `src/components/admin/PageEditorForm.tsx` containing:
- All edit state: `editTitle`, `editContent`, `editSlug`, `editSeoTitle`, `editSeoDescription`, `isHtmlMode`, `showImageUpload`
- All debounced inputs: `debouncedContent`, `debouncedSeoDescription`
- The entire form UI currently at lines 251–378 of AdminPanel.tsx
- A `onSave(data)` callback prop and `onCancel` prop

`PagesTabContent` is reduced to:
- The page list (lines 380+)
- `handleEditPage` sets `editingPage` to the selected page
- When `editingPage` is set, renders `<PageEditorForm page={editingPage} onSave={...} onCancel={...} />`

**Result**: Typing in the content textarea now only re-renders `PageEditorForm` (a small isolated component), not `PagesTabContent` or the pages list. The 950ms render collapses to single digits.

## Files changed

- `src/components/admin/PageEditorForm.tsx` — new file, extracted from AdminPanel.tsx lines 251–378
- `src/components/AdminPanel.tsx` — lines 251–378 replaced with `<PageEditorForm>` usage; edit state moved into the new component
