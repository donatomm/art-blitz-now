import assert from "node:assert/strict";
import test from "node:test";
import { checkoutOrigin, checkoutRequest, selectedPrice } from "../../supabase/functions/_shared/checkoutPolicy.ts";

test("live checkout accepts only the two production origins", () => {
  assert.equal(checkoutOrigin("https://octowonders.com", "live"), "https://octowonders.com");
  for (const origin of [null, "https://evil.example", "https://octowonders.com.evil.example", "https://preview.vercel.app"]) {
    assert.throws(() => checkoutOrigin(origin, "live", "https://preview.vercel.app"));
  }
});
test("test checkout requires an exact configured test origin", () => {
  assert.equal(checkoutOrigin("http://localhost:5173", "test", "http://localhost:5173"), "http://localhost:5173");
  assert.throws(() => checkoutOrigin("http://localhost:5173", "test"));
});
test("rejects malformed carts, fractional quantities and invalid legacy indexes", () => {
  for (const body of [null, {}, { items: [] }, { items: "bad" }, { product_id: "a", size_index: -1 },
    { product_id: "a", size_index: 0.5 },
    ...[0, -1, 1.5, 100, "1"].map(quantity => ({ items: [{ product_id: "a", size_dimensions: "40x60", quantity }] }))]) {
    assert.throws(() => checkoutRequest(body));
  }
});
test("rejects duplicate items and oversized carts", () => {
  const item = { product_id: "a", size_dimensions: "40x60", quantity: 1 };
  assert.throws(() => checkoutRequest({ items: [item, item] }));
  assert.throws(() => checkoutRequest({ items: Array.from({ length: 51 }, (_, i) => ({ ...item, product_id: String(i) })) }));
});
test("preserves the catalogue mapping requirement without changing content", () => {
  assert.equal(selectedPrice({ is_active: true }, { price: 59, stripe_product_id: "prod_example" }), 59);
  assert.throws(() => selectedPrice({ is_active: true }, { price: 59 }));
  assert.throws(() => selectedPrice({ is_active: false }, { price: 59, stripe_product_id: "prod_example" }));
});
test("rejects invalid enabled deals instead of silently charging the regular price", () => {
  assert.throws(() => selectedPrice({ is_active: true }, {
    price: 59, stripe_product_id: "prod_example", deal_label_enabled: true, deal_price: 0,
  }));
});
