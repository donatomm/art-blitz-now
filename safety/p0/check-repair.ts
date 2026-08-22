import { readFileSync } from "node:fs";
import { assessRepairAdmission } from "./repair";
import type { GateReport, GateScope } from "./types";

function readReport(path: string, expectedScope: GateScope): GateReport {
  const report = JSON.parse(readFileSync(path, "utf8")) as Partial<GateReport>;
  if (
    report.schemaVersion !== 1
    || report.scope !== expectedScope
    || !Array.isArray(report.findings)
  ) {
    throw new Error(`Invalid ${expectedScope} safety report: ${path}`);
  }
  return report as GateReport;
}

const paths = process.argv.slice(2);
if (paths.length !== 4) {
  throw new Error(
    "Usage: check-repair <baseline-source> <baseline-artifact> <candidate-source> <candidate-artifact>",
  );
}

const baseline = [
  readReport(paths[0], "source"),
  readReport(paths[1], "artifact"),
];
const candidate = [
  readReport(paths[2], "source"),
  readReport(paths[3], "artifact"),
];
const result = assessRepairAdmission(baseline, candidate);

console.log(result.passed ? "P0 REPAIR: ADMITTED" : "P0 REPAIR: STOPPED");
console.log(`Reason: ${result.reason}`);
console.log(`Baseline findings: ${result.baselineFindingCount}`);
console.log(`Candidate findings: ${result.candidateFindingCount}`);
for (const finding of result.introduced) {
  console.log(`[introduced] ${finding.outcome} ${finding.code} ${finding.path}`);
}
for (const finding of result.resolved) {
  console.log(`[resolved] ${finding.outcome} ${finding.code} ${finding.path}`);
}

process.exitCode = result.passed ? 0 : 1;
