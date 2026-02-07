

# Reduce Admin Panel Tab Width -- Remove Scrollbar

## Problem

The 8 admin tabs each have `min-w-[70px]`, forcing a minimum total width of ~570px plus gaps. On narrower screens (or even the dialog width), this overflows and triggers the horizontal scrollbar from `overflow-x-auto`.

## Solution

Remove `min-w-[70px]` from each tab trigger and replace with `flex-1` so all 8 tabs share the available width equally. Also remove `overflow-x-auto` from the `TabsList` since scrolling will no longer be needed. Keep the small text sizing (`text-xs sm:text-sm`) to ensure labels fit comfortably.

## Change (1 file)

**`src/components/AdminPanel.tsx`** (lines 1268-1277)

- `TabsList`: change from `flex overflow-x-auto w-full gap-1 pb-1` to `flex flex-wrap w-full gap-1 pb-1`
- Each `TabsTrigger`: change from `min-w-[70px] text-xs sm:text-sm` to `flex-1 text-xs sm:text-sm`
- This gives each tab equal flexible width within the row, eliminating overflow

## Technical Details

| Property | Before | After |
|----------|--------|-------|
| TabsList | `overflow-x-auto` (scrollbar) | `flex-wrap` (wraps if extremely narrow) |
| TabsTrigger | `min-w-[70px]` (fixed minimum) | `flex-1` (equal share of space) |
| Text size | `text-xs sm:text-sm` (unchanged) | `text-xs sm:text-sm` (unchanged) |

On typical dialog widths the 8 tabs will fit in a single row without a scrollbar. On very small mobile screens, `flex-wrap` ensures they gracefully wrap to a second row rather than overflowing.

