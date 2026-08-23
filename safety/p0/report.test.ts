import assert from "node:assert/strict";
import { chmodSync, mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { makeReport, writeReport } from "./report";

const finding = {
  code: "EXAMPLE",
  outcome: "transactable" as const,
  path: "/product/example",
  message: "Example",
  evidence: { canonicalSize: "40x60" },
};

const options = {
  now: new Date("2026-08-22T12:00:00.000Z"),
  gitCommit: "abc123",
};

test("creates deterministic failure counts and writes valid JSON", () => {
  const report = makeReport("source", [finding], options);
  assert.equal(report.passed, false);
  assert.deepEqual(report.counts, { available: 0, discoverable: 0, transactable: 1 });

  const dir = mkdtempSync(join(tmpdir(), "octowonders-report-"));
  const file = join(dir, "private", "report.json");
  writeReport(report, file);

  assert.deepEqual(JSON.parse(readFileSync(file, "utf8")), report);
});

test("creates a green report when there are no findings", () => {
  const report = makeReport("source", [], options);

  assert.equal(report.passed, true);
  assert.deepEqual(report.counts, { available: 0, discoverable: 0, transactable: 0 });
});

test("discards unexpected evidence fields and redacts sensitive values", () => {
  const report = makeReport("source", [{
    ...finding,
    evidence: {
      canonicalSize: "40x60",
      productName: "contact@example.invalid",
      email: "contact@example.invalid",
      accessToken: "secret-token-value",
      cardNumber: "4242424242424242",
    },
  }], options);

  assert.deepEqual(report.findings[0].evidence, {
    canonicalSize: "40x60",
    productName: "[REDACTED]",
  });
  const serialized = JSON.stringify(report);
  for (const forbidden of ["contact@example.invalid", "secret-token-value", "4242424242424242"]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("preserves privacy-safe identity hashes that contain a phone-like digit run", () => {
  const identityHash = `${"a".repeat(20)}123456789${"b".repeat(35)}`;
  const report = makeReport("artifact", [{
    ...finding,
    evidence: {
      identityHash,
      productName: "+39 123 456 7890",
    },
  }], options);

  assert.deepEqual(report.findings[0].evidence, {
    identityHash,
    productName: "[REDACTED]",
  });
});

test("restores private permissions when rewriting evidence", () => {
  const dir = mkdtempSync(join(tmpdir(), "octowonders-permissions-"));
  const evidenceDir = join(dir, "evidence");
  const file = join(evidenceDir, "report.json");
  const report = makeReport("source", [finding], options);

  writeReport(report, file);
  chmodSync(evidenceDir, 0o755);
  chmodSync(file, 0o644);
  writeReport(report, file);

  assert.equal(statSync(evidenceDir).mode & 0o777, 0o700);
  assert.equal(statSync(file).mode & 0o777, 0o600);
});
