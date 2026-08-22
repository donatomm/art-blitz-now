import assert from "node:assert/strict";
import test from "node:test";
import { validateCatalog, type ProductInput } from "./catalog";

const healthy: ProductInput = {
  id: "art-1",
  name: "Healthy artwork",
  slug: "healthy-artwork",
  is_active: true,
  sizes: [{ dimensions: "40x60", price: 45, stripe_product_id: "prod_healthy" }],
};

const codesFor = (product: ProductInput): string[] =>
  validateCatalog([product]).map((finding) => finding.code);

test("accepts an active artwork with one exact mapping per visible size", () => {
  assert.deepEqual(validateCatalog([healthy]), []);
});

test("ignores an inactive artwork", () => {
  assert.deepEqual(validateCatalog([{
    ...healthy,
    slug: null,
    is_active: false,
    sizes: [],
  }]), []);
});

test("does not promote a non-public artwork record to a software P0", () => {
  assert.deepEqual(validateCatalog([{ ...healthy, slug: "   " }]), []);
});

test("does not promote a draft without a positive-price size to a software P0", () => {
  assert.deepEqual(validateCatalog([{
    ...healthy,
    sizes: [{ dimensions: "40x60", price: 0, stripe_product_id: "" }],
  }]), []);
});

test("reports a visible size without a payment mapping", () => {
  assert.ok(codesFor({
    ...healthy,
    sizes: [{ dimensions: "40x60", price: 45, stripe_product_id: "   " }],
  }).includes("CATALOG_MISSING_STRIPE_MAPPING"));
});

test("does not call a mapped positive composite owner label a software P0", () => {
  assert.deepEqual(validateCatalog([{
    ...healthy,
    sizes: [{ dimensions: "2x90x60", price: 80, stripe_product_id: "prod_x" }],
  }]), []);
});

test("reports a visible size whose label cannot identify a positive size", () => {
  assert.ok(codesFor({
    ...healthy,
    sizes: [{ dimensions: "axb", price: 80, stripe_product_id: "prod_x" }],
  }).includes("CATALOG_INVALID_DIMENSION"));
});

test("reports one size represented in both orientations", () => {
  assert.ok(codesFor({
    ...healthy,
    sizes: [
      { dimensions: "40x60", price: 45, stripe_product_id: "prod_x" },
      { dimensions: "60x40", price: 45, stripe_product_id: "prod_x" },
    ],
  }).includes("CATALOG_DUPLICATE_CANONICAL_SIZE"));
});

test("reports an enabled offer without a positive offer price", () => {
  assert.ok(codesFor({
    ...healthy,
    sizes: [{
      dimensions: "40x60",
      price: 45,
      stripe_product_id: "prod_x",
      deal_label_enabled: true,
      deal_price: 0,
    }],
  }).includes("CATALOG_INVALID_DEAL_PRICE"));
});
