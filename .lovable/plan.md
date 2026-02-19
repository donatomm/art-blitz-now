
# Fix: Hero Spacer Too Small on Mobile When HelloBar is Visible

## Root Cause

In `src/components/Hero.tsx`, line 45:

```tsx
<div className="pt-28 md:pt-20" />
```

- `pt-28` = 112px on mobile
- `pt-20` = 80px on desktop

The fixed `<header>` stacks two things:
1. Navigation bar: `h-16` = 64px (always)
2. HelloBar: variable height — on desktop ~40px (single line), on mobile ~120px+ (wraps to 3 lines + button, as shown in the screenshot)

So on mobile the actual header height when HelloBar is enabled = 64px nav + ~120px hellobar ≈ 184px. The current `pt-28` (112px) is 72px too short — the hero text box bleeds up into the HelloBar.

On desktop it works fine because `pt-20` = 80px and the HelloBar is ~40px tall = 120px total, and the hero content starts below (`mt-[50px]` gives extra breathing room).

## The Fix

Increase the mobile spacer from `pt-28` to `pt-56` (224px) to safely clear the nav + tall mobile HelloBar.

Also add an `md:pt-28` intermediate step for safety — on desktop the HelloBar fits in one line so `pt-20` + `mt-[50px]` is fine.

Since the HelloBar can be disabled, and its height changes whether it's on or off, the cleanest approach is: bump the mobile padding to `pt-56` (enough to clear the tallest possible HelloBar on mobile), and keep desktop as-is.

**File:** `src/components/Hero.tsx`, **line 45 only**

```tsx
// Before
<div className="pt-28 md:pt-20" />

// After
<div className="pt-56 md:pt-20" />
```

`pt-56` = 224px. With the nav at 64px, this gives 160px of room for the HelloBar on mobile — enough for 3 wrapped lines + the button row visible in the screenshot.

## Technical Details

- Single line change, one file only
- No DB changes, no SSG impact
- Does not affect desktop layout (`md:pt-20` is unchanged)
- Does not affect pages without a HelloBar (the spacer is always present in the Hero, but on those pages the hello bar is disabled, so the extra padding is wasted space — acceptable trade-off vs. the current breakage)
- If HelloBar is disabled, the hero just has slightly more top padding on mobile — not visible because the hero image fills the full section anyway and the text is still centered vertically within `h-[calc(65vh-20px)]`
