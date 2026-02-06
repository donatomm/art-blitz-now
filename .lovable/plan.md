

# Fix Content Type Detection (1-line change)

## The Problem

Line 172 of `src/components/PageContent.tsx`:

```typescript
const isHTMLContent = page?.content_type === 'html' || (page?.content && containsHTML(page.content));
```

The `||` with `containsHTML()` overrides explicit `content_type: 'markdown'` whenever any HTML tag exists in the content (like a CTA button). This causes the entire page to bypass the markdown renderer.

## The Fix

**File:** `src/components/PageContent.tsx`, line 172

Replace:
```typescript
const isHTMLContent = page?.content_type === 'html' || (page?.content && containsHTML(page.content));
```

With:
```typescript
const isHTMLContent = page?.content_type === 'html' || 
  (!page?.content_type && page?.content && containsHTML(page.content));
```

Only auto-detect HTML when `content_type` is not explicitly set. If the database says `'markdown'`, respect it.

## Result

| `content_type` in DB | Has HTML tags? | Renderer used |
|---|---|---|
| `'markdown'` | Yes (CTA button) | Markdown renderer |
| `'html'` | n/a | HTML renderer |
| `null` / missing | Yes | HTML renderer (auto-detect) |
| `null` / missing | No | Markdown renderer (auto-detect) |

