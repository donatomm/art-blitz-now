import type { ProductInput } from "./catalog";
import type { P0Finding } from "./types";

const BASE_URL = "https://octowonders.com";
const REQUIRED_ROUTES = ["/blog", "/storie-fatti-scientifici-polpo"];
const VALID_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface PageInput {
  slug?: unknown;
  title?: unknown;
}

export interface RouteContractEntry {
  path: string;
  canonical: string;
  kind: "home" | "page" | "product";
}

export interface RouteContractResult {
  routes: RouteContractEntry[];
  findings: P0Finding[];
}

const text = (value: unknown): string => typeof value === "string" ? value.trim() : "";

const validPageSlug = (slug: string): boolean => {
  const segments = slug.split("/");
  return segments.length <= 2 && segments.every((segment) => VALID_SEGMENT.test(segment));
};

const routeFinding = (code: string, path: string, message: string): P0Finding => ({
  code,
  outcome: "discoverable",
  path,
  message,
  evidence: { path },
});

export function buildRouteContract(products: ProductInput[], pages: PageInput[]): RouteContractResult {
  const candidates: RouteContractEntry[] = [{
    path: "/",
    canonical: `${BASE_URL}/`,
    kind: "home",
  }];
  const findings: P0Finding[] = [];

  for (const page of pages) {
    const slug = text(page.slug);
    if (!validPageSlug(slug)) {
      findings.push(routeFinding("ROUTE_INVALID_SLUG", slug || "(empty)", "CMS page has an invalid public address."));
      continue;
    }
    const path = `/${slug}`;
    candidates.push({ path, canonical: `${BASE_URL}${path}`, kind: "page" });
  }

  for (const product of products) {
    if (product.is_active === false) continue;
    const slug = text(product.slug);
    if (!slug) continue;
    if (!VALID_SEGMENT.test(slug)) {
      findings.push(routeFinding("ROUTE_INVALID_SLUG", slug, "Product has an invalid public address."));
      continue;
    }
    const path = `/product/${slug}`;
    candidates.push({ path, canonical: `${BASE_URL}${path}`, kind: "product" });
  }

  const seen = new Set<string>();
  const routes: RouteContractEntry[] = [];
  for (const candidate of candidates.sort((a, b) => a.path.localeCompare(b.path))) {
    if (seen.has(candidate.path)) {
      findings.push(routeFinding("ROUTE_DUPLICATE", candidate.path, "Two records claim the same public address."));
      continue;
    }
    seen.add(candidate.path);
    routes.push(candidate);
  }

  for (const required of REQUIRED_ROUTES) {
    if (!seen.has(required)) {
      findings.push(routeFinding("ROUTE_REQUIRED_MISSING", required, "Required public page is absent."));
    }
  }

  return { routes, findings };
}
