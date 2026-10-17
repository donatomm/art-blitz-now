# Back gesture closes the artwork viewer

Only file changed: `src/components/ArtworkLightbox.tsx`. No other file, no database, no new packages.

## What the visitor will notice
- Viewer open + back (Android back, iPhone edge swipe, browser back): the viewer closes. Same page, same scroll position, address unchanged.
- Close with X, Esc or a tap on the dark background: the viewer closes and the extra back step is removed, so the next back leaves the page as it does today.
- Changing slides, zooming and the gesture hint add no back steps.

## How it works
1. **On open** (inside an effect that runs only when `open` turns true): add one history entry with the **same address**. It copies the current history state and adds a private marker (`awlb`). No `#`, so the address looks the same.
2. **Back while open**: listen for the browser's "back" event (`popstate`). If the viewer is open and the marker is gone, the viewer closes. The listener is attached in the capture phase and stops the event there, so the site's router never sees it: no route change, no data reload, no scroll jump.
3. **Closed another way** (X / Esc / background): if our marker entry is still the current one, call `history.back()` once to remove it. A flag tells the listener to ignore that one event, so nothing else reacts.
4. **Slides, zoom, hint**: they never touch history. Only the open/close effect does.
5. **Safety**: all history code sits in `useEffect` or event handlers, never during render, so pre-built pages are unaffected. If the viewer unmounts while open (e.g. the visitor navigates via a link), the entry is cleaned up without a dead back step.

## Tests (phone-sized browser, then desktop)
- Homepage: open via magnifier, press back -> viewer closed, still on homepage, same scroll. Press back again -> leaves as today.
- Homepage: open, close with X -> one back leaves the page (no dead press). Same for Esc and background tap.
- Product page: open via artwork, and via a room photo in the carousel; repeat both checks above.
- Open, change slides and zoom, then back -> closes in one press.
- Confirm address never changes and no reload happens. Run the pre-build check.

Note: real iPhone edge-swipe can only be confirmed by you on the device; the browser test simulates back.

## Before I start
DO YOU WANT TO RUN A FULL SAFETY CHECK? If yes, I will follow docs/SAFETY-CHECK.md first.
