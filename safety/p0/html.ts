import type { RouteContractEntry } from "./routes";
import type { P0Finding } from "./types";

const withoutRawText = (html: string): string => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

const matches = (html: string, pattern: RegExp): string[] => html.match(pattern) ?? [];

const attribute = (tag: string, name: string): string | null =>
  tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"))?.[1] ?? null;

function htmlFinding(
  code: string,
  route: RouteContractEntry,
  message: string,
  evidence: Record<string, string | number | boolean | null>,
): P0Finding {
  return {
    code,
    outcome: "discoverable",
    path: route.path,
    message,
    evidence,
  };
}

export function inspectHtml(html: string, route: RouteContractEntry): P0Finding[] {
  const source = withoutRawText(html);
  const titles = matches(source, /<title\b[^>]*>/gi);
  const descriptions = matches(source, /<meta\b[^>]*name\s*=\s*["']description["'][^>]*>/gi);
  const canonicals = matches(source, /<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/gi);
  const headings = matches(source, /<h1\b[^>]*>/gi);
  const robots = matches(source, /<meta\b[^>]*name\s*=\s*["']robots["'][^>]*>/gi);
  const findings: P0Finding[] = [];

  if (titles.length !== 1) {
    findings.push(htmlFinding(
      "HTML_TITLE_COUNT",
      route,
      "Document must have one effective title.",
      { count: titles.length },
    ));
  }
  if (descriptions.length !== 1) {
    findings.push(htmlFinding(
      "HTML_DESCRIPTION_COUNT",
      route,
      "Document must have one description.",
      { count: descriptions.length },
    ));
  }
  if (canonicals.length !== 1) {
    findings.push(htmlFinding(
      "HTML_CANONICAL_COUNT",
      route,
      "Document must have one canonical.",
      { count: canonicals.length },
    ));
  } else {
    const actual = attribute(canonicals[0], "href");
    if (actual !== route.canonical) {
      findings.push(htmlFinding(
        "HTML_CANONICAL_MISMATCH",
        route,
        "Canonical does not identify this route.",
        { expected: route.canonical, actual },
      ));
    }
  }
  if (headings.length !== 1) {
    findings.push(htmlFinding(
      "HTML_H1_COUNT",
      route,
      "Document must have one primary heading.",
      { count: headings.length },
    ));
  }
  for (const tag of robots) {
    const content = attribute(tag, "content");
    if ((content ?? "").toLowerCase().includes("noindex")) {
      findings.push(htmlFinding(
        "HTML_NOINDEX",
        route,
        "Intended public route is marked not for indexing.",
        { content },
      ));
    }
  }

  return findings;
}
