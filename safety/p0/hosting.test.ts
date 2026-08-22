import assert from "node:assert/strict";
import test from "node:test";
import { validateHostingRules } from "./hosting";

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
