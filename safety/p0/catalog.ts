import { canonicalDimension } from "./dimensions";
import type { P0Finding } from "./types";

export interface SizeInput {
  dimensions?: unknown;
  price?: unknown;
  stripe_product_id?: unknown;
  deal_label_enabled?: unknown;
  deal_price?: unknown;
}

export interface ProductInput {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  is_active?: unknown;
  sizes?: unknown;
}

const text = (value: unknown): string => typeof value === "string" ? value.trim() : "";

function finding(
  code: string,
  product: ProductInput,
  message: string,
  extra: Record<string, string | number | boolean | null> = {},
): P0Finding {
  return {
    code,
    outcome: "transactable",
    path: text(product.slug) ? `/product/${text(product.slug)}` : `/product-id/${text(product.id) || "unknown"}`,
    message,
    evidence: {
      productId: text(product.id) || null,
      productName: text(product.name) || null,
      ...extra,
    },
  };
}

export function validateCatalog(products: ProductInput[]): P0Finding[] {
  const findings: P0Finding[] = [];
  for (const product of products) {
    if (product.is_active === false) continue;
    if (!text(product.slug)) {
      findings.push(finding("CATALOG_ACTIVE_PRODUCT_NO_SLUG", product, "Active artwork has no public address."));
    }

    const sizes = Array.isArray(product.sizes) ? product.sizes as SizeInput[] : [];
    const visible = sizes.filter((size) => typeof size.price === "number" && size.price > 0);
    if (visible.length === 0) {
      findings.push(finding("CATALOG_NO_VISIBLE_SIZE", product, "Active artwork has no visible positive-price size."));
      continue;
    }

    const seen = new Set<string>();
    for (const size of visible) {
      const canonical = canonicalDimension(size.dimensions);
      if (!canonical) {
        findings.push(finding(
          "CATALOG_INVALID_DIMENSION",
          product,
          "Visible size is not one ordinary dimension.",
          { dimensions: text(size.dimensions) || null },
        ));
        continue;
      }
      if (seen.has(canonical)) {
        findings.push(finding(
          "CATALOG_DUPLICATE_CANONICAL_SIZE",
          product,
          "The same size exists in both orientations.",
          { canonicalSize: canonical },
        ));
      }
      seen.add(canonical);

      if (!text(size.stripe_product_id)) {
        findings.push(finding(
          "CATALOG_MISSING_STRIPE_MAPPING",
          product,
          "Visible size has no exact payment mapping.",
          { canonicalSize: canonical },
        ));
      }
      if (size.deal_label_enabled === true && (typeof size.deal_price !== "number" || size.deal_price <= 0)) {
        findings.push(finding(
          "CATALOG_INVALID_DEAL_PRICE",
          product,
          "Enabled offer has no positive offer price.",
          { canonicalSize: canonical },
        ));
      }
    }
  }
  return findings;
}
