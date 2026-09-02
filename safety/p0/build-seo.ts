import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { validateSeoArtifact } from "./artifact";
import type { ProductInput } from "./catalog";
import { buildRouteContract, type PageInput } from "./routes";
import type { P0Finding } from "./types";

const json = <T>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T;

export function validateBuiltSeo(projectRoot: string): P0Finding[] {
  const root = resolve(projectRoot);
  const products = json<ProductInput[]>(join(root, "src", "generated", "products.json"));
  const pages = json<PageInput[]>(join(root, "src", "generated", "pages.json"));
  const routeResult = buildRouteContract(products, pages);

  return [
    ...routeResult.findings,
    ...validateSeoArtifact(join(root, "dist"), routeResult.routes),
  ];
}
