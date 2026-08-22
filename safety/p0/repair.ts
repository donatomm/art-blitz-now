import type { GateReport, P0Finding } from "./types";

export type RepairAdmissionReason =
  | "candidate-green"
  | "improved-without-regression"
  | "introduced-p0-finding"
  | "no-p0-improvement";

export interface RepairAdmission {
  passed: boolean;
  reason: RepairAdmissionReason;
  baselineFindingCount: number;
  candidateFindingCount: number;
  introduced: P0Finding[];
  resolved: P0Finding[];
}

interface ScopedFinding {
  scope: GateReport["scope"];
  finding: P0Finding;
}

const DESCRIPTIVE_EVIDENCE_KEYS = new Set(["productName"]);

const stableEvidence = (evidence: P0Finding["evidence"]): string => JSON.stringify(
  Object.fromEntries(
    Object.entries(evidence)
      .filter(([key]) => !DESCRIPTIVE_EVIDENCE_KEYS.has(key))
      .sort(([left], [right]) => left.localeCompare(right)),
  ),
);

const identity = ({ scope, finding }: ScopedFinding): string => [
  scope,
  finding.outcome,
  finding.code,
  finding.path,
  stableEvidence(finding.evidence),
].join("\u0000");

const scopedFindings = (reports: GateReport[]): ScopedFinding[] => reports.flatMap((report) =>
  report.findings.map((finding) => ({ scope: report.scope, finding })),
);

function unmatched(
  candidates: ScopedFinding[],
  references: ScopedFinding[],
): P0Finding[] {
  const remaining = new Map<string, number>();
  for (const item of references) {
    const key = identity(item);
    remaining.set(key, (remaining.get(key) ?? 0) + 1);
  }

  const result: P0Finding[] = [];
  for (const item of candidates) {
    const key = identity(item);
    const available = remaining.get(key) ?? 0;
    if (available > 0) {
      remaining.set(key, available - 1);
    } else {
      result.push(item.finding);
    }
  }
  return result;
}

export function assessRepairAdmission(
  baselineReports: GateReport[],
  candidateReports: GateReport[],
): RepairAdmission {
  const baseline = scopedFindings(baselineReports);
  const candidate = scopedFindings(candidateReports);
  const introduced = unmatched(candidate, baseline);
  const resolved = unmatched(baseline, candidate);

  let reason: RepairAdmissionReason;
  if (introduced.length > 0) {
    reason = "introduced-p0-finding";
  } else if (candidate.length === 0) {
    reason = "candidate-green";
  } else if (resolved.length > 0) {
    reason = "improved-without-regression";
  } else {
    reason = "no-p0-improvement";
  }

  return {
    passed: reason === "candidate-green" || reason === "improved-without-regression",
    reason,
    baselineFindingCount: baseline.length,
    candidateFindingCount: candidate.length,
    introduced,
    resolved,
  };
}
