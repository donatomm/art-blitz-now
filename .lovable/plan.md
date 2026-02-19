
# Fix: Hero Spacer Must Adapt to HelloBar On/Off State

## Problem

The screenshot shows the HelloBar is **disabled** (green bar is gone — only the nav is visible). But the spacer is hardcoded to `pt-56` (224px) regardless, so the hero image shows a large empty dark gap above the content box.

- HelloBar **ON** → needs ~224px clearance (nav 64px + multi-line HelloBar ~120–160px)
- HelloBar **OFF** → needs only ~80px clearance (nav 64px only)

`pt-56` was correct to fix the overlap when HelloBar is on, but it's too much when it's off.

## The Fix: Pass `helloBarEnabled` Prop to Hero

### 1. `src/components/Hero.tsx`

Add a `helloBarEnabled?: boolean` prop. Apply it to the spacer `<div>`:

```tsx
// Before (hardcoded)
<div className="pt-56 md:pt-20" />

// After (adaptive)
<div className={helloBarEnabled ? "pt-56 md:pt-20" : "pt-20"} />
```

- HelloBar ON, mobile → `pt-56` (224px) — clears nav + tall wrapped HelloBar
- HelloBar OFF, mobile → `pt-20` (80px) — clears nav only, matches desktop
- Desktop always → `pt-20` (80px) — unchanged in both cases

### 2. `src/pages/Index.tsx`

Pass the existing `hellobarEnabled` variable (already read from static settings on line 34) into the `<Hero>` component:

```tsx
<Hero
  imageUrl={heroImageUrl}
  title={heroTitle}
  subtitle={heroSubtitle}
  ctaText={heroCtaText}
  onCtaClick={scrollToGallery}
  trustBarItems={trustBarItems}
  helloBarEnabled={hellobarEnabled}   // ← add this
/>
```

`hellobarEnabled` is already computed from `useStaticSiteSettings()` — zero extra cost.

## Files Changed

- `src/components/Hero.tsx` — add `helloBarEnabled` prop, make spacer conditional (2 lines)
- `src/pages/Index.tsx` — pass `helloBarEnabled={hellobarEnabled}` to `<Hero>` (1 line)

## No Other Changes

- No DB changes
- No SSG impact
- Desktop layout unchanged
- Real iPhone 11 behaviour unchanged (HelloBar is on → still gets `pt-56`)
- Preview with HelloBar off → gets `pt-20`, hero content sits just below the nav
