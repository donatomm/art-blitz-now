
# Fix: Double Gap Caused by Spacer + Margin-Top Stacking

## Root Cause (Found It)

In `src/components/Hero.tsx`, the hero text area has TWO sources of top spacing stacked on top of each other:

1. The spacer `<div style={{ height: "var(--header-height, 80px)" }} />` — this already pushes content down by the full header height (nav + HelloBar)
2. Then the hero content div has `mt-4 md:mt-[50px]` — this adds ANOTHER 16px on mobile on top of the spacer

On **desktop** this was fine before because the old spacer was `pt-20` (80px) and the header was also ~80px, so the `mt-[50px]` was used to fill the visual gap between the fixed header and the hero box. But now the spacer already equals the exact header height, so `mt-4` stacks on top and creates the visible gap.

On **iPhone 11** the HelloBar wraps to multiple lines, making the header ~180px tall. The spacer becomes 180px, then `mt-4` adds 16px more = 196px total gap. That's the "2x" the user is seeing — the spacer already perfectly clears the header but the `mt-4` adds a visible extra strip.

## The Fix

Remove the `mt-4 md:mt-[50px]` from the hero content div in `src/components/Hero.tsx`. The spacer already positions the content correctly — no additional margin is needed.

```tsx
// Before — line 50
<div className="flex h-[calc(65vh-20px)] min-h-[400px] flex-col items-center justify-center px-4 text-center mt-4 md:mt-[50px]">

// After — remove mt-4 and md:mt-[50px]
<div className="flex h-[calc(65vh-20px)] min-h-[400px] flex-col items-center justify-center px-4 text-center">
```

## Why This Works

- The `var(--header-height)` CSS variable is set by Navigation's `useEffect` using `header.offsetHeight` which accurately measures the real header (nav + HelloBar) on every device
- With the margin removed, content appears exactly at the bottom of the header, no gap
- The hero text is vertically centered within `h-[calc(65vh-20px)]` with `min-h-[400px]`, so it always looks visually balanced regardless of the top position
- No changes needed to Navigation.tsx — the dynamic measurement is correct, it was just being double-counted

## Files Changed

- `src/components/Hero.tsx` line 50 only — remove `mt-4 md:mt-[50px]`

## No Other Changes

- No DB changes
- No SSG impact
- Desktop layout: the dynamic `var(--header-height)` spacer on desktop will be ~64px (nav only, no HelloBar on desktop), which is actually tighter than before — but the centered layout within the tall hero section compensates visually
- iPhone 11 with HelloBar ON: spacer = real header height, no extra margin = correct
- Preview (HelloBar OFF): spacer = 64px nav only, no extra margin = correct
