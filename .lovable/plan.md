# Two fixes for the artwork viewer

Only `src/components/ArtworkLightbox.tsx` changes. No other file, no database, no new packages. Everything else stays exactly as today (zoom, double tap, yellow arrows, dots, X, z-index, `useIsMobile`, no browser code during render).

Before starting: do you want me to run the full safety check (docs/SAFETY-CHECK.md)? If you approve without saying anything, I will run it before changing the code.

## 1. Gesture hint: 4 seconds, two parts
- Same conditions as today: phones only, artwork slide only, every time the viewer opens, stops at once on any touch, click, wheel or key press. Timer goes from 3 s to 4 s.
- Part 1 (0 to 2 s), swipe: the hand slides 40 px left, then 40 px right. A horizontal yellow arrow sits above the fingertip and moves with the hand, pointing the way the hand is moving (flips direction at the turn). Diagonal arrows hidden.
- Part 2 (2 to 4 s), pinch: exactly as today. Hand still in the centre, the two diagonal yellow arrows point outward and move apart, twice. Horizontal arrow hidden.
- The switch between parts is done with CSS animation timing only (no extra timers), so it stays safe for pre-rendering.
- Reduced motion: hand with horizontal arrow still for 2 s, then hand with diagonal arrows still for 2 s (total 4 s).

## 2. Size label on room photos
- Add a 1.5 px solid white border.
- Unchanged: dark background, white text, position, font size, padding, hidden while zoomed in.

## Check
- Run the same pre-render step Vercel runs.
- Phone-sized test in the browser: hint shows swipe then pinch, stops on touch; size label shows the white border and hides when zoomed.
- Real phone gestures and reduced-motion on your device: please try in the preview.
