import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { inspectHtml } from "./html";
import type { RouteContractEntry } from "./routes";
import type { P0Finding } from "./types";

const CRITICAL_ASSETS = ["/logo.png", "/artworks/octoheaded.jpg"];

const pageFile = (distDir: string, path: string): string =>
  path === "/" ? join(distDir, "index.html") : join(distDir, path.slice(1), "index.html");

const finding = (
  code: string,
  outcome: "available" | "discoverable",
  path: string,
  message: string,
  evidence: Record<string, string | number | boolean | null> = {},
): P0Finding => ({ code, outcome, path, message, evidence });

const endsWith = (buffer: Buffer, suffix: readonly number[]): boolean => {
  if (buffer.length < suffix.length) return false;
  return suffix.every((byte, index) => buffer[buffer.length - suffix.length + index] === byte);
};

function isImage(buffer: Buffer): boolean {
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const pngEnd = [0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82];
  const png = buffer.length >= 20
    && pngSignature.every((byte, index) => buffer[index] === byte)
    && endsWith(buffer, pngEnd);

  const jpeg = buffer.length >= 20
    && buffer[0] === 0xff
    && buffer[1] === 0xd8
    && buffer[2] === 0xff
    && endsWith(buffer, [0xff, 0xd9]);

  const webp = buffer.length >= 20
    && buffer.subarray(0, 4).toString("ascii") === "RIFF"
    && buffer.subarray(8, 12).toString("ascii") === "WEBP"
    && buffer.readUInt32LE(4) + 8 === buffer.length;

  return png || jpeg || webp;
}

const sitemapLocations = (xml: string): string[] =>
  [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => match[1].replaceAll("&amp;", "&").trim());

export function validateSeoArtifact(distDir: string, routes: RouteContractEntry[]): P0Finding[] {
  const findings: P0Finding[] = [];

  for (const route of routes) {
    const file = pageFile(distDir, route.path);
    if (!existsSync(file)) {
      findings.push(finding(
        "ARTIFACT_ROUTE_MISSING",
        "available",
        route.path,
        "Expected built page is missing.",
      ));
      continue;
    }
    findings.push(...inspectHtml(readFileSync(file, "utf8"), route));
  }

  const sitemapFile = join(distDir, "sitemap.xml");
  if (!existsSync(sitemapFile)) {
    findings.push(finding(
      "SITEMAP_MISSING",
      "discoverable",
      "/sitemap.xml",
      "Built sitemap is missing.",
    ));
  } else {
    const sitemap = readFileSync(sitemapFile, "utf8");
    const hasUrlset = /<urlset\b[^>]*>/i.test(sitemap) && /<\/urlset>\s*$/i.test(sitemap);
    if (!hasUrlset) {
      findings.push(finding(
        "SITEMAP_MALFORMED",
        "discoverable",
        "/sitemap.xml",
        "Built sitemap does not contain one complete urlset document.",
      ));
    }
    const counts = new Map<string, number>();
    for (const location of sitemapLocations(sitemap)) {
      counts.set(location, (counts.get(location) ?? 0) + 1);
    }
    for (const route of routes) {
      const count = counts.get(route.canonical) ?? 0;
      if (count === 0) {
        findings.push(finding(
          "SITEMAP_ROUTE_MISSING",
          "discoverable",
          route.path,
          "Expected route is absent from the sitemap.",
        ));
      }
      if (count > 1) {
        findings.push(finding(
          "SITEMAP_ROUTE_DUPLICATE",
          "discoverable",
          route.path,
          "Route appears more than once in the sitemap.",
          { count },
        ));
      }
      counts.delete(route.canonical);
    }
    for (const unexpected of counts.keys()) {
      findings.push(finding(
        "SITEMAP_ROUTE_UNEXPECTED",
        "discoverable",
        unexpected,
        "Sitemap contains an unexpected route.",
      ));
    }
  }

  return findings;
}

export function validateArtifact(distDir: string, routes: RouteContractEntry[]): P0Finding[] {
  const findings = validateSeoArtifact(distDir, routes);

  for (const asset of CRITICAL_ASSETS) {
    const file = join(distDir, asset.slice(1));
    if (!existsSync(file)) {
      findings.push(finding(
        "ASSET_MISSING",
        "discoverable",
        asset,
        "Required shared image is missing.",
      ));
    } else if (!isImage(readFileSync(file))) {
      findings.push(finding(
        "ASSET_NOT_IMAGE",
        "discoverable",
        asset,
        "Required shared image is not a supported image file.",
      ));
    }
  }

  return findings;
}
