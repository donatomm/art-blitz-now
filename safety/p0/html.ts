import { createHash } from "node:crypto";
import type { RouteContractEntry } from "./routes";
import type { P0Finding } from "./types";

const withoutRawText = (html: string): string => html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

const matches = (html: string, pattern: RegExp): string[] => html.match(pattern) ?? [];

const attribute = (tag: string, name: string): string | null =>
  tag.match(new RegExp(`${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"))?.[2] ?? null;

const normalizedText = (value: string): string => value
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const elementText = (html: string, pattern: RegExp): string[] =>
  [...html.matchAll(pattern)].map((match) => normalizedText(match[1]));

const distinct = (values: (string | null)[]): string[] =>
  [...new Set(values.map((value) => value ?? ""))].sort();

const DEFAULT_OG_IMAGE = "https://octowonders.com/artworks/octoheaded.jpg";

const metaPropertyValues = (source: string, property: string): (string | null)[] =>
  matches(source, /<meta\b[^>]*>/gi)
    .filter((tag) => attribute(tag, "property")?.toLowerCase() === property)
    .map((tag) => attribute(tag, "content"));

const identityEvidence = (values: (string | null)[]): Record<string, string | number> => ({
  count: values.length,
  identityHash: createHash("sha256").update(distinct(values).join("\u0000")).digest("hex"),
});

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
  const titles = elementText(source, /<title\b[^>]*>([\s\S]*?)<\/title>/gi);
  const descriptions = matches(source, /<meta\b[^>]*name\s*=\s*["']description["'][^>]*>/gi)
    .map((tag) => attribute(tag, "content"));
  const canonicals = matches(source, /<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/gi);
  const headings = elementText(source, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi);
  const robots = matches(source, /<meta\b[^>]*name\s*=\s*["']robots["'][^>]*>/gi);
  const findings: P0Finding[] = [];

  if (titles.length !== 1) {
    findings.push(htmlFinding(
      "HTML_TITLE_COUNT",
      route,
      "Document must have exactly one title.",
      identityEvidence(titles),
    ));
  }
  if (descriptions.length !== 1) {
    findings.push(htmlFinding(
      "HTML_DESCRIPTION_COUNT",
      route,
      "Document must have exactly one description.",
      identityEvidence(descriptions),
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
  if (headings.length === 0 || distinct(headings).length > 1) {
    findings.push(htmlFinding(
      "HTML_H1_COUNT",
      route,
      "Document has no primary heading or has conflicting primary headings.",
      identityEvidence(headings),
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

  const requiredOpenGraph = ["og:title", "og:description", "og:type", "og:image", "og:url"];
  const incompleteOpenGraph = requiredOpenGraph.filter((property) => {
    const values = metaPropertyValues(source, property);
    return values.length !== 1 || !values[0]?.trim();
  });
  if (incompleteOpenGraph.length > 0) {
    findings.push(htmlFinding(
      "HTML_OG_REQUIRED",
      route,
      "Document must have one complete Open Graph identity.",
      { properties: incompleteOpenGraph.join(",") },
    ));
  }

  const openGraphUrl = metaPropertyValues(source, "og:url");
  if (openGraphUrl.length === 1 && openGraphUrl[0] !== route.canonical) {
    findings.push(htmlFinding(
      "HTML_OG_URL_MISMATCH",
      route,
      "Open Graph URL does not identify this route.",
      { expected: route.canonical, actual: openGraphUrl[0] },
    ));
  }

  const openGraphImage = metaPropertyValues(source, "og:image");
  if (openGraphImage.length === 1 && openGraphImage[0] === DEFAULT_OG_IMAGE) {
    const requiredImageMetadata = new Map([
      ["og:image:secure_url", DEFAULT_OG_IMAGE],
      ["og:image:type", "image/jpeg"],
      ["og:image:width", "1200"],
      ["og:image:height", "630"],
    ]);
    const incompleteImageMetadata = [...requiredImageMetadata.entries()]
      .filter(([property, expected]) => {
        const values = metaPropertyValues(source, property);
        return values.length !== 1 || values[0] !== expected;
      })
      .map(([property]) => property);
    const imageAlt = metaPropertyValues(source, "og:image:alt");
    if (imageAlt.length !== 1 || !imageAlt[0]?.trim()) {
      incompleteImageMetadata.push("og:image:alt");
    }
    if (incompleteImageMetadata.length > 0) {
      findings.push(htmlFinding(
        "HTML_OG_IMAGE_METADATA",
        route,
        "Default Open Graph image metadata must declare its secure URL, type, dimensions and alternative text.",
        { properties: incompleteImageMetadata.join(",") },
      ));
    }
  }

  return findings;
}
