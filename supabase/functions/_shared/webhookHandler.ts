export interface PaymentEvent {
  type: string;
  data: { object: { id: string; metadata?: Record<string, string> | null } };
}

export async function handlePaymentWebhook(req: Request, dependencies: {
  verify: (body: string, signature: string) => Promise<PaymentEvent>;
  confirm: (sessionId: string) => Promise<unknown>;
}): Promise<Response> {
  const response = (status: number) => new Response(JSON.stringify({ received: status === 200 }), {
    status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
  if (req.method !== "POST") return response(405);
  const signature = req.headers.get("stripe-signature");
  if (!signature) return response(400);
  let event: PaymentEvent;
  try {
    // Never parse and re-serialize before checking Stripe's signature.
    event = await dependencies.verify(await req.text(), signature);
  } catch {
    return response(400);
  }
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type) ||
    event.data.object.metadata?.integration !== "octowonders-v1") return response(200);
  try {
    await dependencies.confirm(event.data.object.id);
    return response(200);
  } catch {
    console.error("[STRIPE-WEBHOOK] Confirmation failed; delivery must retry");
    return response(503);
  }
}
