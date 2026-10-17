# Fix: second double tap while zoomed does nothing (iPhone)

Only `src/components/ArtworkLightbox.tsx` changes. No other file, no database, no new packages. Everything else stays as today.

Full safety check (docs/SAFETY-CHECK.md) runs first, as you asked.

## About the suspected cause
I read the zoom library's code. It does not block the tap's start and end events, only the finger-move events while panning. So the taps should still reach our double-tap code. Your suspected cause is **not confirmed**. A more likely cause: when the finger lifts, the library runs its own end-of-pan step ("snap back inside the edges"). That step can cancel our "return to whole" animation as soon as it starts, so nothing seems to happen. This is still unconfirmed, so step 1 checks it.

## Steps
1. **Reproduce first:** in a phone-emulated test browser with real touch events, double tap to zoom in, then double tap again. Check whether our double-tap code runs and what the zoom level is afterwards. This shows which cause is real.
2. **Fix (the same fix works for both causes):**
   - Detect taps with our own listener on the picture area. It runs before the zoom library sees the touch, so it never misses a tap at any zoom level.
   - The listener only observes touches: it never stops or cancels a touch event (no stopPropagation, no preventDefault), so pinch and one-finger panning keep working exactly as today.
   - When a double tap is detected while zoomed, return to whole on the next screen frame, after the library's end-of-pan step, so nothing cancels it.
   - Zooming in (scale 1 to 2.5x where tapped) works the same way.
3. **Unchanged:** one-finger panning while zoomed, swipe changes slide only at scale 1, pinch, double click on computers, arrows, dots, X, hint, size label, z-index, `useIsMobile`, and no browser code during render (still safe for pre-rendering).

## Check
- Run the same pre-render step Vercel runs.
- Phone-emulated test: double tap zooms in, a second double tap returns to whole (repeated several times), one-finger drag pans while zoomed, a swipe at scale 1 changes slide, and a swipe while zoomed does not.
- Final check on your real iPhone in the preview.
