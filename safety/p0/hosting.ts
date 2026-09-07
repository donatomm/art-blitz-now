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

const ARTICLE_PATH = "/storie-fatti-scientifici-polpo";
const LEGACY_ARTICLE_PATH = "/Octopus-Facts";
const REQUIRED_REWRITES = new Map<string, string>([
  [ARTICLE_PATH, `${ARTICLE_PATH}/index.html`],
  ["/checkout/success", "/checkout/success/index.html"],
  ["/image-rename", "/image-rename/index.html"],
  ["/image-rename-tool", "/image-rename-tool/index.html"],
  ["/.lovable/oauth/consent", "/.lovable/oauth/consent/index.html"],
]);

export function validateHostingRules(config: HostingConfig): P0Finding[] {
  const findings: P0Finding[] = [];

  for (const rule of config.redirects ?? []) {
    const source = text(rule.source);
    const destination = text(rule.destination);
    if (source === ARTICLE_PATH && destination !== ARTICLE_PATH) {
      findings.push({
        code: "HOSTING_ARTICLE_REDIRECT",
        outcome: "discoverable",
        path: ARTICLE_PATH,
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

export function validateHostingContract(config: HostingConfig): P0Finding[] {
  const findings = validateHostingRules(config);
  const legacyRedirect = (config.redirects ?? []).find((rule) => (
    text(rule.source) === LEGACY_ARTICLE_PATH
    && text(rule.destination) === ARTICLE_PATH
    && rule.permanent === true
  ));

  if (!legacyRedirect) {
    findings.push({
      code: "HOSTING_LEGACY_ARTICLE_REDIRECT",
      outcome: "discoverable",
      path: LEGACY_ARTICLE_PATH,
      message: "The legacy article address must redirect directly to the intended article.",
      evidence: { destination: ARTICLE_PATH },
    });
  }

  for (const [source, destination] of REQUIRED_REWRITES) {
    const hasRewrite = (config.rewrites ?? []).some((rule) => (
      text(rule.source) === source && text(rule.destination) === destination
    ));
    if (!hasRewrite) {
      findings.push({
        code: "HOSTING_REQUIRED_REWRITE_MISSING",
        outcome: "discoverable",
        path: source,
        message: "An intended application route lacks its explicit hosting rewrite.",
        evidence: { destination },
      });
    }
  }

  return findings;
}
