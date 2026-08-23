import assert from "node:assert/strict";
import test from "node:test";
import { assessRepairAdmission } from "./repair";
import type { GateReport, GateScope, P0Finding } from "./types";

const finding = (
  code: string,
  path: string,
  evidence: P0Finding["evidence"] = {},
): P0Finding => ({
  code,
  outcome: "discoverable",
  path,
  message: code,
  evidence,
});

const report = (scope: GateScope, findings: P0Finding[]): GateReport => ({
  schemaVersion: 1,
  scope,
  passed: findings.length === 0,
  generatedAt: "2026-08-22T12:00:00.000Z",
  gitCommit: scope === "source" ? "source-commit" : "artifact-commit",
  findings,
  counts: {
    available: findings.filter((item) => item.outcome === "available").length,
    discoverable: findings.filter((item) => item.outcome === "discoverable").length,
    transactable: findings.filter((item) => item.outcome === "transactable").length,
  },
});

const pair = (sourceFindings: P0Finding[], artifactFindings: P0Finding[]): GateReport[] => [
  report("source", sourceFindings),
  report("artifact", artifactFindings),
];

test("admits a red-store repair only when it removes a finding and introduces none", () => {
  const article = finding("HOSTING_ARTICLE_REDIRECT", "/article");
  const missingImage = finding("ASSET_MISSING", "/logo.png");

  const result = assessRepairAdmission(
    pair([article], [missingImage]),
    pair([], [missingImage]),
  );

  assert.equal(result.passed, true);
  assert.equal(result.reason, "improved-without-regression");
  assert.equal(result.baselineFindingCount, 2);
  assert.equal(result.candidateFindingCount, 1);
  assert.deepEqual(result.introduced, []);
  assert.deepEqual(result.resolved.map((item) => item.code), ["HOSTING_ARTICLE_REDIRECT"]);
});

test("rejects a red-store proposal that makes no P0 improvement", () => {
  const article = finding("HOSTING_ARTICLE_REDIRECT", "/article");

  const result = assessRepairAdmission(pair([article], []), pair([article], []));

  assert.equal(result.passed, false);
  assert.equal(result.reason, "no-p0-improvement");
  assert.deepEqual(result.introduced, []);
  assert.deepEqual(result.resolved, []);
});

test("rejects a proposal that replaces an old finding with a new one", () => {
  const oldFinding = finding("HOSTING_ARTICLE_REDIRECT", "/article");
  const newFinding = finding("ASSET_MISSING", "/logo.png");

  const result = assessRepairAdmission(pair([oldFinding], []), pair([newFinding], []));

  assert.equal(result.passed, false);
  assert.equal(result.reason, "introduced-p0-finding");
  assert.deepEqual(result.introduced.map((item) => item.code), ["ASSET_MISSING"]);
  assert.deepEqual(result.resolved.map((item) => item.code), ["HOSTING_ARTICLE_REDIRECT"]);
});

test("treats a worse count on the same path as a newly introduced condition", () => {
  const baseline = finding("HTML_H1_COUNT", "/product/example", { count: 2 });
  const candidate = finding("HTML_H1_COUNT", "/product/example", { count: 3 });

  const result = assessRepairAdmission(pair([], [baseline]), pair([], [candidate]));

  assert.equal(result.passed, false);
  assert.equal(result.reason, "introduced-p0-finding");
  assert.equal(result.introduced[0].evidence.count, 3);
});

test("requires a previously green store to remain absolutely green", () => {
  const green = assessRepairAdmission(pair([], []), pair([], []));
  assert.equal(green.passed, true);
  assert.equal(green.reason, "candidate-green");

  const red = assessRepairAdmission(
    pair([], []),
    pair([], [finding("ASSET_MISSING", "/logo.png")]),
  );
  assert.equal(red.passed, false);
  assert.equal(red.reason, "introduced-p0-finding");
});

test("ignores descriptive product-name changes when identifying the same condition", () => {
  const baseline = finding("CATALOG_MISSING_STRIPE_MAPPING", "/product/example", {
    canonicalSize: "40x60",
    productId: "product-1",
    productName: "Old title",
  });
  const candidate = finding("CATALOG_MISSING_STRIPE_MAPPING", "/product/example", {
    canonicalSize: "40x60",
    productId: "product-1",
    productName: "New title",
  });

  const result = assessRepairAdmission(pair([baseline], []), pair([candidate], []));

  assert.equal(result.passed, false);
  assert.equal(result.reason, "no-p0-improvement");
  assert.deepEqual(result.introduced, []);
  assert.deepEqual(result.resolved, []);
});
