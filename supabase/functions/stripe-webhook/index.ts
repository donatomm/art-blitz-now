import Stripe from "https://esm.sh/stripe@18.5.0";
import { paymentRuntime, requiredEnv, jsonResponse } from "../_shared/paymentRuntime.ts";
import { handlePaymentWebhook } from "../_shared/webhookHandler.ts";

Deno.serve(async req => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  try {
    const runtime = paymentRuntime();
    const secret = requiredEnv("STRIPE_WEBHOOK_SECRET");
    return await handlePaymentWebhook(req, {
      verify: (body, signature) => runtime.stripe.webhooks.constructEventAsync(
        body, signature, secret, undefined, Stripe.createSubtleCryptoProvider(),
      ),
      confirm: runtime.confirm,
    });
  } catch {
    return jsonResponse({ error: "Service unavailable" }, 503);
  }
});
