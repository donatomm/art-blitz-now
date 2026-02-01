
# Fix: "Sync & Deploy" Button Not Visible on Mobile Admin Panel

## Problem

The Admin Panel tabs use a fixed 8-column grid layout:
```tsx
<TabsList className="grid w-full grid-cols-8">
```

On mobile screens (less than 768px wide), this causes:
- All 8 tabs to be compressed into a tiny space
- The "Deploy" tab (8th column) to be either invisible or too small to tap
- No horizontal scrolling enabled, so users cannot reach it

## Solution

Make the TabsList horizontally scrollable on mobile with properly sized tabs.

## Technical Changes

### File: `src/components/AdminPanel.tsx`

**Current code (line 1267):**
```tsx
<TabsList className="grid w-full grid-cols-8">
```

**New code:**
```tsx
<TabsList className="flex overflow-x-auto w-full gap-1 pb-1">
```

Also update each TabsTrigger to have minimum width for touch targets:
```tsx
<TabsTrigger value="products" className="min-w-[70px] text-xs sm:text-sm">
```

### Summary of Changes

1. Replace `grid grid-cols-8` with `flex overflow-x-auto` to enable horizontal scrolling
2. Add `gap-1` for spacing between tabs
3. Add `pb-1` for bottom padding (scroll indicator space)
4. Add `min-w-[70px] text-xs sm:text-sm` to each TabsTrigger for:
   - Minimum tap target size (70px)
   - Smaller text on mobile (`text-xs`), normal on desktop (`sm:text-sm`)

### Alternative Approach (if preferred)

Use a responsive grid that changes columns based on screen size:
```tsx
<TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 gap-1">
```

This would show 4 tabs per row on mobile (2 rows total) instead of scrolling.

## Impact

- Mobile users will be able to scroll horizontally to see all tabs including "Deploy"
- Touch targets will be appropriately sized (minimum 70px width)
- Desktop layout remains unchanged
- No changes to tab functionality or content
