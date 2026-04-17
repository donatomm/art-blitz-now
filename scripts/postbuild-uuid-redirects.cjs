/**
 * scripts/postbuild-uuid-redirects.cjs
 *
 * Generates static redirect HTML pages for legacy UUID product URLs
 * pointing to their canonical slug-based URLs.
 *
 * Lovable hosting does not honor _redirects, vercel.json, or middleware,
 * so the strongest available signal is a static page with:
 *   - <meta http-equiv="refresh" content="0; url=...">  (Google treats
 *     instant meta refresh as a permanent redirect)
 *   - <link rel="canonical" href="...">                  (reinforces it)
 *   - JS fallback window.location.replace(...)
 *   - <noscript> link fallback
 */

const fs = require("fs");
const path = require("path");

const SITE_ORIGIN = "https://octowonders.com";

// UUID -> destination path (must start with "/")
const uuidToPath = {
  "bd62c326-772b-4337-9131-fe10a5e4a2bb":
    "/product/trota-salmone-pesce-psichedelico-luce-stampa-tela-canvas",
};

const distDir = path.join(process.cwd(), "dist");

if (!fs.existsSync(distDir)) {
  console.error("[postbuild-uuid-redirects] Missing dist/. Run build first.");
  process.exit(1);
}

function buildRedirectHtml(destPath) {
  const destAbs = `${SITE_ORIGIN}${destPath}`;
  return `<!doctype html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${destAbs}" />
    <meta http-equiv="refresh" content="0; url=${destPath}" />
    <title>Redirecting…</title>
    <script>window.location.replace(${JSON.stringify(destPath)});</script>
  </head>
  <body>
    <noscript>
      <p>This page has moved. <a href="${destPath}">Continue to the new URL</a>.</p>
    </noscript>
  </body>
</html>
`;
}

let written = 0;
for (const [uuid, destPath] of Object.entries(uuidToPath)) {
  const outDir = path.join(distDir, "product", uuid);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "index.html");
  fs.writeFileSync(outFile, buildRedirectHtml(destPath));
  written++;
  console.log(
    `[postbuild-uuid-redirects] ✅ /product/${uuid} → ${destPath}`
  );
}

console.log(
  `[postbuild-uuid-redirects] Done: ${written} redirect page(s) written.`
);
