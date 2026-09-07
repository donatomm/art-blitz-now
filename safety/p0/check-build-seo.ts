import { validateBuiltSeo } from "./build-seo";

const findings = validateBuiltSeo(process.cwd());

if (findings.length === 0) {
  console.log("BUILD SEO STRUCTURE: GREEN");
} else {
  console.error("BUILD SEO STRUCTURE: RED");
  for (const finding of findings) {
    console.error(`[${finding.outcome}] ${finding.code} ${finding.path}: ${finding.message}`);
  }
  process.exitCode = 1;
}
