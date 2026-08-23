import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateCatalog, type ProductInput } from "./catalog";
import { validateHostingRules, type HostingConfig } from "./hosting";
import { makeReport, printSummary, writeReport } from "./report";
import { buildRouteContract, type PageInput } from "./routes";

const json = <T>(path: string): T => JSON.parse(readFileSync(resolve(path), "utf8")) as T;

const products = json<ProductInput[]>("src/generated/products.json");
const pages = json<PageInput[]>("src/generated/pages.json");
const hosting = json<HostingConfig>("vercel.json");
const routeResult = buildRouteContract(products, pages);
const findings = [
  ...validateCatalog(products),
  ...routeResult.findings,
  ...validateHostingRules(hosting),
];
const gitCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const report = makeReport("source", findings, { now: new Date(), gitCommit });

writeReport(report, ".safety-evidence/p0-source.json");
printSummary(report);
process.exitCode = report.passed ? 0 : 1;
