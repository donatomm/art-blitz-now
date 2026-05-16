#!/usr/bin/env node
/**
 * Inline an empty static-loader-data object into every built HTML so
 * vite-react-ssg's runtime never fetches /static-loader-data-manifest-<hash>.json.
 *
 * Why: stale browser/edge HTML referencing an old hash causes the runtime
 * to fetch a JSON file that no longer exists. Vercel returns its 404 HTML,
 * JSON.parse explodes ("Unexpected token 'T'"), and the page crashes mid-hydration.
 *
 * We don't use any react-router `loader`s in this app, so the live manifest
 * is semantically `{}`. Inlining `{}` is functionally identical and removes
 * the fragile network dependency entirely.
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(process.cwd(), 'dist');
const INLINE_TAG = '<script>window.__VITE_REACT_SSG_STATIC_LOADER_DATA__={};</script>';
const HASH_MARKER = 'window.__VITE_REACT_SSG_HASH__';

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function patch(file) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('__VITE_REACT_SSG_STATIC_LOADER_DATA__')) return 'skip';
  if (!html.includes(HASH_MARKER)) {
    // No SSG hash script in this HTML — inject before </head> as a safe default.
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${INLINE_TAG}</head>`);
      fs.writeFileSync(file, html);
      return 'head';
    }
    return 'none';
  }
  // Insert the inline script right before the <script> tag containing the hash assignment.
  const re = /<script\b[^>]*>[^<]*window\.__VITE_REACT_SSG_HASH__[\s\S]*?<\/script>/;
  if (re.test(html)) {
    html = html.replace(re, (m) => `${INLINE_TAG}${m}`);
  } else {
    html = html.replace(HASH_MARKER, `${INLINE_TAG.slice(8, -9)};${HASH_MARKER}`);
  }
  fs.writeFileSync(file, html);
  return 'ok';
}

const files = walk(DIST);
const stats = { ok: 0, head: 0, skip: 0, none: 0 };
for (const f of files) stats[patch(f)]++;

console.log(
  `✅ postbuild-inline-ssg-data: patched=${stats.ok} headFallback=${stats.head} skipped=${stats.skip} noHead=${stats.none} total=${files.length}`
);
