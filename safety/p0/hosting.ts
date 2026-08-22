import type { P0Finding } from "./types";

interface Rule {
  source?: unknown;
  destination?: unknown;
  permanent?: unknown;
}

export interface HostingConfig {
  redirects?: Rule[];
  rewrites?: Rule[];
}

const text = (value: unknown): string => typeof value === "string" ? value : "";

export function validateHostingRules(config: HostingConfig): P0Finding[] {
  const findings: P0Finding[] = [];
  const article = "/storie-fatti-scientifici-polpo";

  for (const rule of config.redirects ?? []) {
    const source = text(rule.source);
    const destination = text(rule.destination);
    if (source === article && destination !== article) {
      findings.push({
        code: "HOSTING_ARTICLE_REDIRECT",
        outcome: "discoverable",
        path: article,
        message: "The intended article is overridden by a redirect.",
        evidence: { destination: destination || null },
      });
    }
  }

  for (const rule of config.rewrites ?? []) {
    const source = text(rule.source);
    const destination = text(rule.destination);
    const looksBroad = source.includes(".*") || source.includes(":path*") || source.includes("(?!");
    if (looksBroad && destination === "/index.html") {
      findings.push({
        code: "HOSTING_FALSE_200_CATCHALL",
        outcome: "discoverable",
        path: source,
        message: "Unknown pages or assets can be replaced by homepage HTML.",
        evidence: { destination },
      });
    }
  }

  return findings;
}
