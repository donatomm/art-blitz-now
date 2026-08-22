export type P0Outcome = "available" | "discoverable" | "transactable";
export type GateScope = "source" | "artifact";

export interface P0Finding {
  code: string;
  outcome: P0Outcome;
  path: string;
  message: string;
  evidence: Record<string, string | number | boolean | null>;
}

export interface GateReport {
  schemaVersion: 1;
  scope: GateScope;
  passed: boolean;
  generatedAt: string;
  gitCommit: string;
  findings: P0Finding[];
  counts: Record<P0Outcome, number>;
}
