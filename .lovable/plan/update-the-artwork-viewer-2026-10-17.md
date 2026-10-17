# Update the artwork viewer

Files changed: only `src/components/ArtworkLightbox.tsx` and `src/pages/Product.tsx`. No database, no new packages, no other file. Kept as today: fill/contain rules, X button, dots, swipe rules, z-index above the cookie banner, `useIsMobile`, no browser code during render (SSG-safe).

## ArtworkLightbox.tsx

1. **Arrows** – 40 px circle, background #FFD900, 2 px white border, shadow `0 2px 8px rgba(0,0,0,.45)`, chevron #111 stroke 3, inside a 44x44 tap area. Same on phones and computers.
2. **Captions removed** – no "Opera", no "In ambiente"; only the dots stay at the bottom. The `caption` field is dropped from slides.
3. **Size label (room photos only)** – pill positioned over the displayed photo: horizontally centered, 12 px below the photo's top edge, computed from the existing measured box and fitted image size (`(box.h - fitH)/2 + 12`). Text from dimensions: "80x80" -> "80 × 80 cm" (splits on x/X/×, trims). White 13 px, letter-spacing 0.04em, background rgba(0,0,0,.55), padding 4px 12px, fully rounded, pointer-events none. Hidden while zoomed and never on the artwork slide.
4. **Gesture hint** – text hint and its sessionStorage removed entirely. New wordless hint:
   - Phones only, artwork slide only, every time the viewer opens; 3 s, then gone.
   - Stops immediately on any touch, click, wheel or key press (listeners added in a `useEffect` while visible). pointer-events none; the artwork does not move.
   - Inline SVG hand using the exact supplied path in a 100x120 viewBox, white fill, #111 outline 4 px, ~90 px tall, centered.
   - Hint arrows: #111 8 px stroke underneath, #FFD900 4.5 px on top, round caps.
   - 0–1.5 s: hand slides 40 px left then 40 px right, with a horizontal arrow above the fingertip pointing in the direction of movement (two arrows swapped by keyframe opacity).
   - 1.5–3 s: hand still; two diagonal arrows (up-right and down-left of the fingertip) first point inward and move together, then point outward and move apart.
   - Animation via a scoped `<style>` block with keyframes (rendered statically, safe for pre-rendering). With `prefers-reduced-motion`: hand and arrows shown still for 2 s instead.
5. **Room photo list** – only sizes with price > 0, valid dimensions and a mock room URL, in the same order as the Product page carousel (no de-duplication, so slide positions always match the carousel).

## Product.tsx

6. Tapping a room photo in the carousel opens ArtworkLightbox at `initialIndex = carousel position + 1`. A new `lightboxIndex` state is passed instead of the fixed `0`; the artwork preview click still opens at 0.
   - Remove the old full-screen room-photo Dialog and the `fullscreenImage` state (and the now-unused Dialog import if nothing else uses it).
   - Carousel, labels, prices, size selection, cart and checkout untouched.

## Note
Products that use only the old-style room photos (no room photo on the sizes) show those in the carousel, but the viewer reads sizes only (rule 5). Tapping one of those would open the viewer on the artwork. Today every product uses size room photos, so this does not apply in practice.

## Check
Run the same pre-render step Vercel runs, then a phone-sized and desktop test in the browser: arrows, label position, hint timing/stop, carousel tap opening the right slide.
