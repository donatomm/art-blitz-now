
# Fix: Use ResizeObserver to Always Capture the True Header Height

## Root Cause

The `updateHeaderHeight` function in `Navigation.tsx` calls `header.offsetHeight` **once on mount** (and once on resize). On a real device like iPhone 11, the HelloBar content (text wrapping, countdown timer) finishes rendering **after** that initial measurement fires. So `--header-height` gets set to a value that is too small — then the HelloBar finishes rendering and grows taller, but the CSS variable is never updated. The Hero spacer stays at the old (too-small) height, so the hero content overlaps or sits wrong.

The `window.addEventListener("resize", ...)` only fires on orientation change, not on the HelloBar growing taller due to text wrapping or countdown rendering.

## The Fix: Replace `resize` listener with `ResizeObserver`

`ResizeObserver` fires **every time the element's dimensions change** — including when child content finishes painting and the element grows. This means the CSS variable will be updated correctly after:
- Initial mount
- HelloBar text wrapping
- Countdown timer rendering
- Font loading
- Orientation change

### Change in `src/components/Navigation.tsx`

Replace the current `useEffect` that uses `window.addEventListener("resize", ...)`:

```tsx
// BEFORE — fires only once on mount + on window resize
useEffect(() => {
  const updateHeaderHeight = () => {
    const header = document.querySelector("header");
    if (header) {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`
      );
    }
  };
  updateHeaderHeight();
  window.addEventListener("resize", updateHeaderHeight);
  return () => window.removeEventListener("resize", updateHeaderHeight);
}, [showHelloBar]);
```

```tsx
// AFTER — fires every time the header element changes size
useEffect(() => {
  const header = document.querySelector("header");
  if (!header) return;

  const observer = new ResizeObserver(() => {
    document.documentElement.style.setProperty(
      "--header-height",
      `${header.offsetHeight}px`
    );
  });

  observer.observe(header);
  return () => observer.disconnect();
}, []); // no dependency needed — ResizeObserver watches the element continuously
```

## Why This Works

- `ResizeObserver` on the `<header>` element fires whenever its height changes for any reason
- HelloBar text wrapping on iPhone 11 increases the header height → `ResizeObserver` fires → CSS variable updated → Hero spacer matches exactly
- Countdown timer content rendering → same
- Orientation change → same
- HelloBar toggled on/off → same
- No more stale initial measurement

## Files Changed

- `src/components/Navigation.tsx` — replace the `useEffect` with resize listener with a `ResizeObserver` (same lines, same location, cleaner logic)

## No Other Changes

- `src/components/Hero.tsx` stays exactly as-is — the spacer `<div style={{ height: "var(--header-height, 80px)" }} />` is correct
- No DB changes, no SSG impact, no other files touched
