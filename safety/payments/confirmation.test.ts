import assert from "node:assert/strict";
import test from "node:test";
import { confirmPayment, type PaymentSession, type ConfirmedOrder } from "../../supabase/functions/_shared/paymentConfirmation.ts";

const session = (patch: Partial<PaymentSession> = {}): PaymentSession => ({
  id: "cs_test_example", mode: "payment", status: "complete", payment_status: "paid",
  livemode: false, currency: "eur", amount_total: 11800, payment_intent: "pi_example",
  metadata: { integration: "octowonders-v1" },
  lines: [{ quantity: 2, amount_total: 11800, currency: "eur",
    product: { name: "Artwork 40x60", metadata: { artwork_id: "art-1", size_dimensions: "40x60" } } }],
  ...patch,
});

function harness(value = session()) {
  const orders = new Map<string, ConfirmedOrder>();
  let writes = 0;
  return {
    orders,
    writes: () => writes,
    dependencies: {
      liveMode: false,
      retrieveSession: async () => value,
      saveOrder: async (order: ConfirmedOrder) => {
        writes++;
        if (!orders.has(order.stripe_session_id)) orders.set(order.stripe_session_id, order);
        return orders.get(order.stripe_session_id)!;
      },
    },
  };
}

test("records an authoritative paid order and returns a minimal receipt", async () => {
  const h = harness();
  const result = await confirmPayment("cs_test_example", h.dependencies);
  assert.equal(result.status, "paid");
  assert.equal(h.orders.size, 1);
  assert.equal(h.orders.get("cs_test_example")?.amount_total, 11800);
  assert.deepEqual(Object.keys(result).sort(), ["order_reference", "status"]);
});

test("concurrent and repeated confirmations converge on one order", async () => {
  const h = harness();
  const results = await Promise.all(Array.from({ length: 5 }, () => confirmPayment("cs_test_example", h.dependencies)));
  assert.equal(h.orders.size, 1);
  assert.equal(new Set(results.map(r => r.order_reference)).size, 1);
});

for (const state of ["unpaid", "no_payment_required"]) {
  test("does not record " + state + " as a paid purchase", async () => {
    const h = harness(session({ payment_status: state }));
    assert.equal((await confirmPayment("cs_test_example", h.dependencies)).status, "pending");
    assert.equal(h.writes(), 0);
  });
}

test("handles delayed payment: pending can later become paid", async () => {
  const current = session({ payment_status: "unpaid" });
  const h = harness(current);
  assert.equal((await confirmPayment("cs_test_example", h.dependencies)).status, "pending");
  current.payment_status = "paid";
  assert.equal((await confirmPayment("cs_test_example", h.dependencies)).status, "paid");
});

for (const [label, patch] of [
  ["another integration", { metadata: {} }],
  ["wrong session", { id: "cs_test_different" }],
  ["wrong environment", { livemode: true }],
  ["wrong currency", { currency: "usd" }],
  ["wrong total", { amount_total: 1 }],
  ["zero total", { amount_total: 0 }],
  ["missing payment", { payment_intent: null }],
  ["missing line items", { lines: [] }],
  ["unknown artwork", { lines: [{ ...session().lines[0], product: { name: "Other", metadata: {} } }] }],
] as [string, Partial<PaymentSession>][]) {
  test("rejects " + label + " without writing an order", async () => {
    const h = harness(session(patch));
    await assert.rejects(confirmPayment("cs_test_example", h.dependencies));
    assert.equal(h.writes(), 0);
  });
}

test("database failure never produces a success receipt", async () => {
  const h = harness();
  h.dependencies.saveOrder = async () => { throw new Error("unavailable"); };
  await assert.rejects(confirmPayment("cs_test_example", h.dependencies), /unavailable/);
});

test("Stripe failure never produces a success receipt", async () => {
  const h = harness();
  h.dependencies.retrieveSession = async () => { throw new Error("Stripe unavailable"); };
  await assert.rejects(confirmPayment("cs_test_example", h.dependencies));
  assert.equal(h.writes(), 0);
});

test("rejects a persisted receipt whose amount disagrees with Stripe", async () => {
  const h = harness();
  h.dependencies.saveOrder = async order => ({ ...order, amount_total: 1 });
  await assert.rejects(confirmPayment("cs_test_example", h.dependencies));
});

test("invalid session identifiers do not reach Stripe", async () => {
  const h = harness();
  h.dependencies.retrieveSession = async () => { throw new Error("must not call"); };
  await assert.rejects(confirmPayment("fake", h.dependencies), /Invalid session/);
});
