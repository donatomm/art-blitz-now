import Stripe from "https://esm.sh/stripe@18.5.0";
import { handlePaymentWebhook } from "../../supabase/functions/_shared/webhookHandler.ts";

const secret = "whsec_local_fixture_not_a_real_credential";
const stripe = new Stripe("sk_test_local_fixture", { apiVersion: "2025-08-27.basil" });
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const payload = JSON.stringify({
  id: "evt_fixture", object: "event", type: "checkout.session.completed",
  data: { object: { id: "cs_test_fixture", metadata: { integration: "octowonders-v1" } } },
});
const verify = (body: string, signature: string) =>
  stripe.webhooks.constructEventAsync(body, signature, secret, undefined, cryptoProvider);
const assertStatus = (actual: number, expected: number) => {
  if (actual !== expected) throw new Error(`Expected ${expected}, received ${actual}`);
};
async function signed(body: string, timestamp = Math.floor(Date.now() / 1000)) {
  return await stripe.webhooks.generateTestHeaderStringAsync({ payload: body, secret, timestamp, cryptoProvider });
}
function request(body: string, signature?: string) {
  return new Request("http://localhost/stripe-webhook", {
    method: "POST", body, headers: signature ? { "stripe-signature": signature } : {},
  });
}

Deno.test("a genuine signature reaches confirmation", async () => {
  let count = 0;
  const result = await handlePaymentWebhook(request(payload, await signed(payload)), {
    verify, confirm: async id => { if (id !== "cs_test_fixture") throw new Error("Wrong session"); count++; },
  });
  assertStatus(result.status, 200);
  if (count !== 1) throw new Error("Confirmation not called");
});
Deno.test("missing, forged, expired and modified signatures cannot confirm", async () => {
  const fixtures = [
    request(payload), request(payload, "t=1,v1=forged"),
    request(payload, await signed(payload, 1)),
    request(payload + " ", await signed(payload)),
  ];
  for (const req of fixtures) {
    const result = await handlePaymentWebhook(req, { verify, confirm: async () => { throw new Error("Must not confirm"); } });
    assertStatus(result.status, 400);
  }
});
Deno.test("storage failure returns retryable 503, then redelivery succeeds", async () => {
  const signature = await signed(payload);
  const failed = await handlePaymentWebhook(request(payload, signature), {
    verify, confirm: async () => { throw new Error("Database unavailable"); },
  });
  assertStatus(failed.status, 503);
  const retried = await handlePaymentWebhook(request(payload, signature), { verify, confirm: async () => {} });
  assertStatus(retried.status, 200);
});
Deno.test("unrelated checkout events are acknowledged without creating orders", async () => {
  const other = payload.replace("octowonders-v1", "another-store");
  let called = false;
  const result = await handlePaymentWebhook(request(other, await signed(other)), {
    verify, confirm: async () => { called = true; },
  });
  assertStatus(result.status, 200);
  if (called) throw new Error("Unrelated integration was confirmed");
});
