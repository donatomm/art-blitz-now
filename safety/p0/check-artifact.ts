import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateArtifact } from "./artifact";
import type { ProductInput } from "./catalog";
import { makeReport, printSummary, writeReport } from "./report";
import { buildRouteContract, type PageInput } from "./routes";

const json = <T>(path: string): T => JSON.parse(readFileSync(resolve(path), "utf8")) as T;

const products = json<ProductInput[]>("src/generated/products.json");
const pages = json<PageInput[]>("src/generated/pages.json");
const routeResult = buildRouteContract(products, pages);
const findings = [
  ...routeResult.findings,
  ...validateArtifact(resolve("dist"), routeResult.routes),
];
const gitCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const report = makeReport("artifact", findings, { now: new Date(), gitCommit });

writeReport(report, ".safety-evidence/p0-artifact.json");
printSummary(report);
process.exitCode = report.passed ? 0 : 1;
