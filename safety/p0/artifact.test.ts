import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateArtifact, validateSeoArtifact } from "./artifact";

const routes = [
  { path: "/", canonical: "https://octowonders.com/", kind: "home" as const },
  { path: "/blog", canonical: "https://octowonders.com/blog", kind: "page" as const },
];

const healthyHtml = (title: string, canonical: string): string =>
  `<!doctype html><html><head><title>${title}</title><meta name="description" content="Good"><link rel="canonical" href="${canonical}"></head><body><h1>${title}</h1></body></html>`;

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

const jpeg = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABBQJ//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPwF//8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPwF//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQAGPwJ//8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPyF//9oADAMBAAIAAwAAABD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/EH//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/EH//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/EH//2Q==",
  "base64",
);

function createArtifact(): string {
  const dir = mkdtempSync(join(tmpdir(), "octowonders-artifact-"));
  mkdirSync(join(dir, "blog"), { recursive: true });
  mkdirSync(join(dir, "artworks"), { recursive: true });
  writeFileSync(join(dir, "index.html"), healthyHtml("Home", "https://octowonders.com/"));
  writeFileSync(join(dir, "blog", "index.html"), healthyHtml("Blog", "https://octowonders.com/blog"));
  writeFileSync(join(dir, "logo.png"), png);
  writeFileSync(join(dir, "artworks", "octoheaded.jpg"), jpeg);
  writeFileSync(
    join(dir, "sitemap.xml"),
    "<?xml version=\"1.0\"?><urlset><url><loc>https://octowonders.com/</loc></url><url><loc>https://octowonders.com/blog</loc></url></urlset>",
  );
  return dir;
}

const codesFor = (dir: string): string[] => validateArtifact(dir, routes).map((finding) => finding.code);

test("accepts complete pages, sitemap and supported shared images", () => {
  assert.deepEqual(validateArtifact(createArtifact(), routes), []);
});

test("accepts complete page and sitemap structure independently of deferred shared images", () => {
  const dir = createArtifact();
  rmSync(join(dir, "logo.png"));
  rmSync(join(dir, "artworks", "octoheaded.jpg"));

  assert.deepEqual(validateSeoArtifact(dir, routes), []);
});

test("reports an expected built page that is absent", () => {
  const dir = createArtifact();
  const extraRoute = {
    path: "/missing",
    canonical: "https://octowonders.com/missing",
    kind: "page" as const,
  };

  assert.ok(validateArtifact(dir, [...routes, extraRoute]).some(
    (finding) => finding.code === "ARTIFACT_ROUTE_MISSING" && finding.path === "/missing",
  ));
});

test("reports an expected route omitted from the sitemap", () => {
  const dir = createArtifact();
  writeFileSync(
    join(dir, "sitemap.xml"),
    "<?xml version=\"1.0\"?><urlset><url><loc>https://octowonders.com/</loc></url></urlset>",
  );

  assert.ok(codesFor(dir).includes("SITEMAP_ROUTE_MISSING"));
});

test("reports a duplicate sitemap route", () => {
  const dir = createArtifact();
  writeFileSync(
    join(dir, "sitemap.xml"),
    "<?xml version=\"1.0\"?><urlset><url><loc>https://octowonders.com/</loc></url><url><loc>https://octowonders.com/</loc></url><url><loc>https://octowonders.com/blog</loc></url></urlset>",
  );

  assert.ok(codesFor(dir).includes("SITEMAP_ROUTE_DUPLICATE"));
});

test("reports an unexpected sitemap route", () => {
  const dir = createArtifact();
  writeFileSync(
    join(dir, "sitemap.xml"),
    "<?xml version=\"1.0\"?><urlset><url><loc>https://octowonders.com/</loc></url><url><loc>https://octowonders.com/blog</loc></url><url><loc>https://octowonders.com/old</loc></url></urlset>",
  );

  assert.ok(codesFor(dir).includes("SITEMAP_ROUTE_UNEXPECTED"));
});

test("reports a missing sitemap", () => {
  const dir = mkdtempSync(join(tmpdir(), "octowonders-no-sitemap-"));

  assert.ok(codesFor(dir).includes("SITEMAP_MISSING"));
});

test("reports malformed sitemap markup even when every expected address appears", () => {
  const dir = createArtifact();
  writeFileSync(
    join(dir, "sitemap.xml"),
    "<loc>https://octowonders.com/</loc><loc>https://octowonders.com/blog</loc>",
  );

  assert.ok(validateSeoArtifact(dir, routes).some(
    (finding) => finding.code === "SITEMAP_MALFORMED",
  ));
});

test("reports homepage HTML stored at the shared logo address", () => {
  const dir = createArtifact();
  writeFileSync(join(dir, "logo.png"), "<!doctype html><html>homepage</html>");

  assert.ok(codesFor(dir).includes("ASSET_NOT_IMAGE"));
});

test("reports a truncated shared image", () => {
  const dir = createArtifact();
  writeFileSync(join(dir, "logo.png"), png.subarray(0, 12));

  assert.ok(codesFor(dir).includes("ASSET_NOT_IMAGE"));
});

test("reports a required shared image that is absent", () => {
  const dir = mkdtempSync(join(tmpdir(), "octowonders-no-assets-"));

  assert.ok(codesFor(dir).includes("ASSET_MISSING"));
});
