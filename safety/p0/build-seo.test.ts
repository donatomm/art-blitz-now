import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateBuiltSeo } from "./build-seo";

const html = (title: string, canonical: string): string => [
  "<!doctype html><html><head>",
  `<title>${title}</title>`,
  '<meta name="description" content="Good">',
  `<link rel="canonical" href="${canonical}">`,
  `</head><body><h1>${title}</h1></body></html>`,
].join("");

function createBuild(): string {
  const root = mkdtempSync(join(tmpdir(), "octowonders-build-seo-"));
  const generated = join(root, "src", "generated");
  const dist = join(root, "dist");
  mkdirSync(generated, { recursive: true });
  mkdirSync(join(dist, "blog"), { recursive: true });
  mkdirSync(join(dist, "storie-fatti-scientifici-polpo"), { recursive: true });
  writeFileSync(join(generated, "products.json"), "[]");
  writeFileSync(join(generated, "pages.json"), JSON.stringify([
    { slug: "blog", title: "Blog" },
    { slug: "storie-fatti-scientifici-polpo", title: "Article" },
  ]));
  writeFileSync(join(dist, "index.html"), html("Home", "https://octowonders.com/"));
  writeFileSync(join(dist, "blog", "index.html"), html("Blog", "https://octowonders.com/blog"));
  writeFileSync(
    join(dist, "storie-fatti-scientifici-polpo", "index.html"),
    html("Article", "https://octowonders.com/storie-fatti-scientifici-polpo"),
  );
  writeFileSync(join(dist, "sitemap.xml"), [
    '<?xml version="1.0"?><urlset>',
    "<url><loc>https://octowonders.com/</loc></url>",
    "<url><loc>https://octowonders.com/blog</loc></url>",
    "<url><loc>https://octowonders.com/storie-fatti-scientifici-polpo</loc></url>",
    "</urlset>",
  ].join(""));
  return root;
}

test("accepts a complete built SEO structure without requiring deferred shared images", () => {
  assert.deepEqual(validateBuiltSeo(createBuild()), []);
});

test("rejects a build when an intended route has no generated page", () => {
  const root = createBuild();
  rmSync(join(root, "dist", "blog", "index.html"));

  assert.ok(validateBuiltSeo(root).some(
    (finding) => finding.code === "ARTIFACT_ROUTE_MISSING" && finding.path === "/blog",
  ));
});

test("rejects a build when a generated page has duplicate identity tags", () => {
  const root = createBuild();
  const file = join(root, "dist", "blog", "index.html");
  writeFileSync(
    file,
    html("Blog", "https://octowonders.com/blog").replace("</head>", "<title>Second</title></head>"),
  );

  assert.ok(validateBuiltSeo(root).some(
    (finding) => finding.code === "HTML_TITLE_COUNT" && finding.path === "/blog",
  ));
});
