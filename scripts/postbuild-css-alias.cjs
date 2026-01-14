/**
 * scripts/postbuild-css-alias.cjs
 *
 * Finds dist/assets/app-*.css and copies newest to dist/app.css
 */

const fs = require("fs");
const path = require("path");

function die(msg) {
  console.error(`[postbuild-css-alias] ${msg}`);
  process.exit(1);
}

const root = process.cwd();
const distDir = path.join(root, "dist");
const assetsDir = path.join(distDir, "assets");
const outFile = path.join(distDir, "app.css");

if (!fs.existsSync(distDir)) die("Missing dist/ directory. Run build first.");
if (!fs.existsSync(assetsDir)) die("Missing dist/assets/ directory.");

const files = fs.readdirSync(assetsDir);
const appCssFiles = files.filter((f) => /^app-.*\.css$/i.test(f));

if (!appCssFiles.length) die("No app-*.css found in dist/assets/.");

appCssFiles.sort((a, b) => {
  const aTime = fs.statSync(path.join(assetsDir, a)).mtimeMs;
  const bTime = fs.statSync(path.join(assetsDir, b)).mtimeMs;
  return bTime - aTime;
});

const newest = appCssFiles[0];
fs.copyFileSync(path.join(assetsDir, newest), outFile);

console.log(`[postbuild-css-alias] Created dist/app.css from dist/assets/${newest}`);

