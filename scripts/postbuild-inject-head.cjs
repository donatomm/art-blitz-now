/**
 * scripts/postbuild-inject-head.cjs
 *
 * Postbuild step: scans all .html files in dist/ and injects a <head> block
 * if one is missing. This runs AFTER vite-react-ssg + beasties, so nothing
 * can strip it out afterward.
 *
 * Also moves any <style> tags that beasties placed inside <body> into <head>.
 */

const fs = require("fs");
const path = require("path");

const distDir = path.join(process.cwd(), "dist");

if (!fs.existsSync(distDir)) {
  console.error("[postbuild-inject-head] Missing dist/ directory. Run build first.");
  process.exit(1);
}

const HEAD_BLOCK = `<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="google-site-verification" content="piIPB5x5MjblaPWAVjsiaeV8Gc3AbIFnq1yZItrhUlM" />
    <link rel="preconnect" href="https://xqubydbsoucrwqhddodw.supabase.co" crossorigin />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300&display=swap" />
    <meta name="p:domain_verify" content="488c339e7167063621a6662be6c159b8" />
    <title>OctoWonders by Marco De Francesco - Stampe d'Arte su Tela</title>
    <meta name="description" content="Stampe d'arte originali su tela di alta qualità. Opere uniche a tema marino." />
    <meta name="author" content="Marco De Francesco" />
  </head>`;

function getAllHtmlFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllHtmlFiles(full));
    } else if (entry.name.endsWith(".html")) {
      results.push(full);
    }
  }
  return results;
}

const files = getAllHtmlFiles(distDir);
let fixed = 0;
let skipped = 0;

for (const file of files) {
  let html = fs.readFileSync(file, "utf-8");

  // Already has a proper <head> with <title> — skip
  if ((html.includes("<head>") || html.includes("<head ")) && html.includes("<title>")) {
    skipped++;
    continue;
  }

  // Extract any <style> tags from <body> that beasties may have inserted
  const styleRegex = /<style[^>]*>[\s\S]*?<\/style>/gi;
  const bodyStyleMatches = html.match(styleRegex) || [];

  // Build head with extracted styles
  let headWithStyles = HEAD_BLOCK;
  if (bodyStyleMatches.length > 0) {
    // Insert styles before </head>
    const stylesBlock = bodyStyleMatches.join("\n    ");
    headWithStyles = headWithStyles.replace("</head>", `    ${stylesBlock}\n  </head>`);
    // Remove styles from body
    for (const style of bodyStyleMatches) {
      html = html.replace(style, "");
    }
  }

  // Inject <head> before <body>
  if (html.includes("<body>") || html.includes("<body ")) {
    html = html.replace(/<body([^>]*)>/, `${headWithStyles}\n  <body$1>`);
  } else {
    // Fallback: inject after <html...>
    html = html.replace(/<html([^>]*)>/, `<html$1>\n  ${headWithStyles}`);
  }

  fs.writeFileSync(file, html);
  fixed++;

  const rel = path.relative(distDir, file);
  console.log(`[postbuild-inject-head] ✅ Injected <head> into ${rel}`);
}

console.log(
  `[postbuild-inject-head] Done: ${fixed} fixed, ${skipped} already had <head>, ${files.length} total HTML files`
);
