import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { GateReport, GateScope, P0Finding, P0Outcome } from "./types";

const SAFE_EVIDENCE_KEYS = new Set([
  "actual",
  "canonicalSize",
  "content",
  "count",
  "destination",
  "dimensions",
  "expected",
  "identityHash",
  "path",
  "productId",
  "productName",
]);

const SENSITIVE_VALUE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|(?:\+?\d[\s().-]*){9,}|(?:sk|rk)_(?:live|test)_[a-z0-9]+|service[_-]?role|access[_-]?token|secret[_-]?key/i;
const SAFE_IDENTITY_HASH = /^[a-f0-9]{64}$/;

function safeValue(value: string | number | boolean | null): string | number | boolean | null {
  if (typeof value !== "string") return value;
  if (SENSITIVE_VALUE.test(value)) return "[REDACTED]";
  if (value.length > 512) return `${value.slice(0, 512)}[TRUNCATED]`;
  return value;
}

function safeEvidence(
  evidence: Record<string, string | number | boolean | null>,
): Record<string, string | number | boolean | null> {
  const safe: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(evidence)) {
    if (!SAFE_EVIDENCE_KEYS.has(key)) continue;
    safe[key] = key === "identityHash"
      && typeof value === "string"
      && SAFE_IDENTITY_HASH.test(value)
      ? value
      : safeValue(value);
  }
  return safe;
}

export function makeReport(
  scope: GateScope,
  findings: P0Finding[],
  options: { now: Date; gitCommit: string },
): GateReport {
  const counts: Record<P0Outcome, number> = {
    available: 0,
    discoverable: 0,
    transactable: 0,
  };
  const safeFindings = findings.map((finding) => ({
    ...finding,
    evidence: safeEvidence(finding.evidence),
  }));
  for (const finding of safeFindings) counts[finding.outcome] += 1;

  return {
    schemaVersion: 1,
    scope,
    passed: safeFindings.length === 0,
    generatedAt: options.now.toISOString(),
    gitCommit: options.gitCommit,
    findings: safeFindings,
    counts,
  };
}

export function writeReport(report: GateReport, file: string): void {
  const folder = dirname(file);
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  if (folder !== ".") chmodSync(folder, 0o700);
  writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  chmodSync(file, 0o600);
}

export function printSummary(report: GateReport): void {
  console.log(report.passed ? "P0 SAFETY: GREEN" : "P0 SAFETY: RED");
  console.log(`Availability findings: ${report.counts.available}`);
  console.log(`Discoverability findings: ${report.counts.discoverable}`);
  console.log(`Transaction findings: ${report.counts.transactable}`);
  for (const finding of report.findings) {
    console.log(`[${finding.outcome}] ${finding.code} ${finding.path}: ${finding.message}`);
  }
}
