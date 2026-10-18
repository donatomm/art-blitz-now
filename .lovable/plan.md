# Hero: remove the empty space under the blue text box on phones

## What to change

One line only — `src/components/Hero.tsx`, line 50 (the hero text area wrapper).

Today:

```text
flex h-[calc(65vh-20px)] min-h-[400px] flex-col items-center justify-center px-4 text-center
```

New:

```text
flex flex-col items-center justify-center px-4 text-center py-4 md:h-[calc(65vh-20px)] md:min-h-[400px] md:py-0
```

No other line, no other file, no new files.

## How it behaves

- **Phones (narrower than 768 px):** the text area no longer has the fixed height or the 400 px minimum, so it takes only the height the title and subtitle need. `py-4` gives about 16 px above and below the blue box, and the three trust bar lines sit directly under it — no empty band.
- **Computers (768 px and up):** `md:h-[calc(65vh-20px)]` and `md:min-h-[400px]` put today's height and minimum back exactly as they are, and `md:py-0` keeps today's spacing (no extra padding). The computer hero is unchanged.

The choice comes from Tailwind responsive classes alone — CSS only. No `useIsMobile`, no `window.matchMedia`, no JavaScript screen check, so the pre-built pages (built on a server with no screen) render both versions and the browser picks the right one.

## What stays untouched

Background image and its LCP settings, dark overlay, the header-height spacer, the blue box styling, title and subtitle text and styling, the CTA button (including the `hidden md:inline-block` from the previous change), the TrustBar itself, and every other file. No database, no Admin Panel content, no SEO tags, no `vercel.json`.

## How it will be tested

Playwright at 390x844 and 1280x1800 on the homepage:

1. Screenshot the hero on both sizes.
2. Measure the gap between the bottom of the blue box and the first trust bar line — expect roughly 16 px on the phone, and the same value as today on the computer.
3. Confirm the blue box on the phone is only as tall as its content.
4. Confirm the computer hero matches the baseline screenshot taken before the change.
5. The build must pass.

## Safety check

| Area | Risk |
|---|---|
| Database / Admin Panel content | None — no data touched |
| Slugs, image filenames, storage | None |
| SEO tags, sitemap, prerendering | None |
| `vercel.json` and the deployment guard | None — file untouched |
| `safety/p0` and the safety scripts | None |
| Computer layout | Low — fixed height and minimum restored from 768 px up |
| Pre-built pages (SSG) | Low — CSS-only switch, no screen check in JavaScript |
| New packages / new files | None |

DO YOU WANT TO RUN A FULL SAFETY CHECK?
