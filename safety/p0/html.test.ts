import assert from "node:assert/strict";
import test from "node:test";
import { inspectHtml } from "./html";

const route = {
  path: "/product/art",
  canonical: "https://octowonders.com/product/art",
  kind: "product" as const,
};

const identity = (head: string, body = "<h1>Art</h1>"): string =>
  `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

const healthyHead = [
  "<title>Art</title>",
  '<meta name="description" content="One">',
  '<link rel="canonical" href="https://octowonders.com/product/art">',
].join("");

const codesFor = (html: string): string[] => inspectHtml(html, route).map((finding) => finding.code);

test("accepts one indexable identity for one route", () => {
  assert.deepEqual(inspectHtml(identity(healthyHead), route), []);
});

test("ignores tag-like text inside scripts and styles", () => {
  const rawText = [
    healthyHead,
    '<script>const example = "<title>Not a document title</title>";</script>',
    '<style>.example::before { content: "<h1>Not a heading</h1>"; }</style>',
  ].join("");

  assert.deepEqual(inspectHtml(identity(rawText), route), []);
});

test("reports duplicate document titles", () => {
  const head = healthyHead.replace("</title>", "</title><title>Second</title>");

  assert.ok(codesFor(identity(head)).includes("HTML_TITLE_COUNT"));
});

test("reports duplicate descriptions", () => {
  const head = `${healthyHead}<meta name="description" content="Second">`;

  assert.ok(codesFor(identity(head)).includes("HTML_DESCRIPTION_COUNT"));
});

test("reports a missing canonical address", () => {
  const head = healthyHead.replace(/<link\b[^>]*>/i, "");

  assert.ok(codesFor(identity(head)).includes("HTML_CANONICAL_COUNT"));
});

test("reports a canonical address belonging to another route", () => {
  const head = healthyHead.replace(route.canonical, "https://octowonders.com/wrong");

  assert.ok(codesFor(identity(head)).includes("HTML_CANONICAL_MISMATCH"));
});

test("reports multiple primary headings", () => {
  assert.ok(codesFor(identity(healthyHead, "<h1>One</h1><h1>Two</h1>")).includes("HTML_H1_COUNT"));
});

test("reports an intended public route marked not for indexing", () => {
  const head = `${healthyHead}<meta name="robots" content="noindex, follow">`;

  assert.ok(codesFor(identity(head)).includes("HTML_NOINDEX"));
});
