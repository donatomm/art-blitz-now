# New zoom behaviour for the artwork viewer

Only `src/components/ArtworkLightbox.tsx` changes. No other file, no database, no new packages. Unchanged: yellow arrows, dots, size label look, X button, z-index above the cookie banner, `useIsMobile`, no browser code during render (safe for pre-rendering).

Before starting: do you want me to run the full safety check (docs/SAFETY-CHECK.md)? If you approve without saying anything, I will run it before changing the code.

## 1. Every slide opens whole
- Remove the phone-only "cover" start. The starting scale is always 1 (whole image, as large as the screen allows), on every device and every slide.
- Changing slide (swipe, arrow, dot, keyboard) always shows the new slide whole. The zoom state resets on each slide.

## 2. Pinch
- Pinch zooms freely, minimum scale 1, maximum 5.

## 3. Double tap / double click
- The library's built-in double-click is turned off and replaced with my own handling, so the result is exact:
  - At scale 1: zoom to 2.5x, centred on the point tapped (that point stays under the finger/cursor).
  - Above scale 1: back to scale 1, whole and centred.
- Same on every slide and device. A double tap is two taps within 300 ms, close together.

## 4. One finger
- At scale 1: one-finger drag does nothing; a horizontal swipe (more than 50 px, mostly sideways) changes slide.
- Above scale 1: one finger moves around the image; swipe does not change slide.

## 5. Arrows and dots
- Always visible and working at every zoom level. Tapping one while zoomed goes straight to that slide, shown whole.

## 6. Gesture hint
- Same conditions as today: phones only, artwork slide only, every time the viewer opens, 3 seconds, stops at once on any touch, click, wheel or key press.
- Left-right drag part removed (no moving hand, no horizontal arrows).
- The hand stays still in the centre; the two diagonal yellow arrows next to the fingertip point outward and move apart, twice in the 3 seconds.
- With reduced motion: hand and outward arrows shown still for 2 seconds.

## 7. Size label
- Unchanged; still hidden while zoomed in.

## Check
- Run the same pre-render step Vercel runs.
- Phone-sized and desktop test in the browser: every slide opens whole, double click zooms to 2.5x where clicked and back, arrows/dots work while zoomed and reset to whole, hint shows only outward arrows and stops on touch.
- Real pinch and two-finger gestures cannot be tested here; please try them on your phone in the preview.
