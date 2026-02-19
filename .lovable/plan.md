
# Fix: Single Line Change in PageContent.tsx

## The only bug

Line 229 of `src/components/PageContent.tsx`:

```
page?.content_type === "html" || !page?.content_type && page?.content && containsHTML(page.content);
```

`containsHTML()` matches ANY HTML tag — `<b>`, `<br>`, `<strong>`, anything. The moment a markdown page contains one tag, the entire page is routed to the HTML renderer. The `{{CONTACT_BUTTONS}}` token only exists inside `renderContent()` (line 132), which only runs on the markdown path. HTML path never hits it.

## The fix

Replace `containsHTML(page.content)` with `isFullHtmlDocument(page.content)` on line 229. `isFullHtmlDocument` is already imported on line 10 — no new imports needed.

Changed line:
```
page?.content_type === "html" || (!page?.content_type && page?.content && isFullHtmlDocument(page.content));
```

This means: only treat content as HTML if:
1. The database explicitly says `content_type = "html"`, OR
2. The content is a real `<!DOCTYPE>`/`<html>` document

Markdown pages with `<br>` or `<b>` tags remain on the markdown path where the token works.

## What is NOT changed

- No buttons are added automatically anywhere
- HTML pages (`content_type = "html"` or full `<!DOCTYPE>` documents) are completely unaffected
- Nothing else in the file is touched

## Files changed

- `src/components/PageContent.tsx` — line 229 only, one value replaced
