import assert from "node:assert/strict";
import test from "node:test";
import { cartAfterPayment, isPaidReceipt } from "../../src/lib/checkoutReceipt";

const cart = [{ productId: "a", sizeDimensions: "40x60", quantity: 1 }];
test("only an authoritative matching paid receipt permits cart completion", () => {
  for (const value of [null, {}, { status: "pending" }, { status: "paid", order_reference: "other" }]) {
    assert.equal(isPaidReceipt(value, "cs_test_example"), false);
  }
  assert.equal(isPaidReceipt({ status: "paid", order_reference: "cs_test_example" }, "cs_test_example"), true);
});
test("clears the exact submitted cart only after confirmation", () => {
  assert.deepEqual(cartAfterPayment(cart, cart), []);
});
test("preserves added items, changed quantities and unrelated direct purchases", () => {
  for (const current of [[...cart, { productId: "b", sizeDimensions: "60x60", quantity: 1 }],
    [{ ...cart[0], quantity: 2 }]]) {
    assert.deepEqual(cartAfterPayment(current, cart), current);
  }
  assert.deepEqual(cartAfterPayment(cart, []), cart);
});
