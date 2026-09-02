import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  validateHostingContract,
  validateHostingRules,
  type HostingConfig,
} from "./hosting";

test("accepts explicit routes without a homepage catch-all", () => {
  assert.deepEqual(validateHostingRules({
    redirects: [{ source: "/artist", destination: "/artista", permanent: true }],
    rewrites: [{ source: "/product/:slug", destination: "/product/:slug/index.html" }],
  }), []);
});

test("reports the required article being redirected elsewhere", () => {
  const findings = validateHostingRules({
    redirects: [{
      source: "/storie-fatti-scientifici-polpo",
      destination: "/blog",
      permanent: true,
    }],
  });

  assert.ok(findings.some((finding) => finding.code === "HOSTING_ARTICLE_REDIRECT"));
});

test("reports a broad rule that substitutes homepage HTML", () => {
  const findings = validateHostingRules({
    rewrites: [{ source: "/((?!api).*)", destination: "/index.html" }],
  });

  assert.ok(findings.some((finding) => finding.code === "HOSTING_FALSE_200_CATCHALL"));
});

test("reports a legacy article address that does not redirect directly to the intended article", () => {
  const findings = validateHostingContract({
    redirects: [{
      source: "/Octopus-Facts",
      destination: "/blog",
      permanent: true,
    }],
  });

  assert.ok(findings.some((finding) => (
    finding.code === "HOSTING_LEGACY_ARTICLE_REDIRECT"
    && finding.path === "/Octopus-Facts"
  )));
});

test("reports every intended route that lacks an explicit hosting rewrite", () => {
  const findings = validateHostingContract({
    redirects: [{
      source: "/Octopus-Facts",
      destination: "/storie-fatti-scientifici-polpo",
      permanent: true,
    }],
    rewrites: [],
  });
  const missingPaths = findings
    .filter((finding) => finding.code === "HOSTING_REQUIRED_REWRITE_MISSING")
    .map((finding) => finding.path)
    .sort();

  assert.deepEqual(missingPaths, [
    "/.lovable/oauth/consent",
    "/checkout/success",
    "/image-rename",
    "/image-rename-tool",
    "/storie-fatti-scientifici-polpo",
  ]);
});

test("reports a known prebuilt route that is rewritten to the homepage shell", () => {
  const findings = validateHostingContract({
    redirects: [{
      source: "/Octopus-Facts",
      destination: "/storie-fatti-scientifici-polpo",
      permanent: true,
    }],
    rewrites: [{ source: "/image-rename", destination: "/index.html" }],
  });

  assert.ok(findings.some((finding) => (
    finding.code === "HOSTING_REQUIRED_REWRITE_MISSING"
    && finding.path === "/image-rename"
  )));
});

test("the checked-in Vercel rules preserve known routes without turning unknown pages or assets into the homepage", () => {
  const config = JSON.parse(readFileSync("vercel.json", "utf8")) as HostingConfig;

  assert.deepEqual(validateHostingContract(config), []);
});
