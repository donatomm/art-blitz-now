import assert from "node:assert/strict";
import test from "node:test";
import { buildRouteContract } from "./routes";

const requiredPages = [
  { slug: "blog", title: "Blog" },
  { slug: "storie-fatti-scientifici-polpo", title: "Article" },
];

test("builds the expected public routes with self-canonical addresses", () => {
  const result = buildRouteContract(
    [{ id: "1", name: "Art", slug: "art", is_active: true, sizes: [] }],
    [...requiredPages, { slug: "guide/article-one", title: "Nested article" }],
  );

  assert.deepEqual(result.routes.map((route) => route.path), [
    "/",
    "/blog",
    "/guide/article-one",
    "/product/art",
    "/storie-fatti-scientifici-polpo",
  ]);
  assert.equal(result.findings.length, 0);
  assert.equal(
    result.routes.find((route) => route.path === "/guide/article-one")?.canonical,
    "https://octowonders.com/guide/article-one",
  );
});

test("excludes an inactive artwork from the public routes", () => {
  const result = buildRouteContract(
    [{ id: "1", name: "Hidden", slug: "hidden", is_active: false, sizes: [] }],
    requiredPages,
  );

  assert.equal(result.routes.some((route) => route.path === "/product/hidden"), false);
  assert.equal(result.findings.length, 0);
});

test("reports two records claiming the same public route", () => {
  const result = buildRouteContract(
    [
      { id: "1", name: "One", slug: "same", is_active: true, sizes: [] },
      { id: "2", name: "Two", slug: "same", is_active: true, sizes: [] },
    ],
    requiredPages,
  );

  assert.ok(result.findings.some((finding) => finding.code === "ROUTE_DUPLICATE"));
});

test("reports a CMS page address containing spaces", () => {
  const result = buildRouteContract([], [...requiredPages, { slug: "bad slug", title: "Bad" }]);

  assert.ok(result.findings.some((finding) => finding.code === "ROUTE_INVALID_SLUG"));
});

test("reports a CMS page address deeper than the supported two levels", () => {
  const result = buildRouteContract([], [...requiredPages, { slug: "blog/deep/article", title: "Too deep" }]);

  assert.ok(result.findings.some((finding) => finding.code === "ROUTE_INVALID_SLUG"));
});

test("reports an artwork address containing a slash", () => {
  const result = buildRouteContract(
    [{ id: "1", name: "Art", slug: "art/deep", is_active: true, sizes: [] }],
    requiredPages,
  );

  assert.ok(result.findings.some((finding) => finding.code === "ROUTE_INVALID_SLUG"));
});

test("reports each required public page that is absent", () => {
  const result = buildRouteContract([], []);
  const missing = result.findings.filter((finding) => finding.code === "ROUTE_REQUIRED_MISSING");

  assert.equal(missing.length, 2);
});
