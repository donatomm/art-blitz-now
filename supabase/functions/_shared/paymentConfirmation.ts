// Pure confirmation policy, shared by the return page and signed webhooks.
export interface PaymentSession {
  id: string;
  mode: string | null;
  status: string | null;
  payment_status: string;
  livemode: boolean;
  currency: string | null;
  amount_total: number | null;
  payment_intent: string | null;
  metadata: Record<string, string>;
  lines: {
    quantity: number | null;
    amount_total: number;
    currency: string;
    product: { name: string; metadata: Record<string, string> } | null;
  }[];
}

export interface ConfirmedOrder {
  stripe_session_id: string;
  stripe_payment_intent_id: string;
  livemode: boolean;
  amount_total: number;
  currency: "eur";
  items: { artwork_id: string; name: string; dimensions: string; quantity: number; amount_total: number }[];
}

export interface ConfirmationDependencies {
  liveMode: boolean;
  retrieveSession: (id: string) => Promise<PaymentSession>;
  // Implemented as insert-on-conflict-do-nothing + read; the DB unique key
  // arbitrates webhook/return-page races, not an in-memory duplicate check.
  saveOrder: (order: ConfirmedOrder) => Promise<ConfirmedOrder>;
}

export async function confirmPayment(id: string, deps: ConfirmationDependencies) {
  if (!/^cs_(test_|live_)?[A-Za-z0-9]{6,}$/.test(id)) throw new Error("Invalid session");
  const session = await deps.retrieveSession(id);
  if (session.id !== id || session.mode !== "payment" ||
    session.metadata.integration !== "octowonders-v1" || session.livemode !== deps.liveMode) {
    throw new Error("Session does not belong to this checkout environment");
  }
  if (session.status !== "complete" || session.payment_status !== "paid") {
    return { status: session.status === "expired" ? "expired" : "pending", order_reference: null };
  }
  if (session.currency !== "eur" || !Number.isSafeInteger(session.amount_total) ||
    session.amount_total! <= 0 || !session.payment_intent?.startsWith("pi_") ||
    session.lines.length === 0 || session.lines.length > 50) {
    throw new Error("Invalid paid session");
  }
  const items = session.lines.map(line => {
    if (!Number.isSafeInteger(line.quantity) || line.quantity! < 1 || line.quantity! > 99 ||
      !Number.isSafeInteger(line.amount_total) || line.amount_total <= 0 || line.currency !== "eur" ||
      !line.product?.metadata.artwork_id || !line.product.metadata.size_dimensions) {
      throw new Error("Invalid paid line item");
    }
    return {
      artwork_id: line.product.metadata.artwork_id,
      name: line.product.name,
      dimensions: line.product.metadata.size_dimensions,
      quantity: line.quantity!,
      amount_total: line.amount_total,
    };
  });
  if (items.reduce((sum, item) => sum + item.amount_total, 0) !== session.amount_total) {
    throw new Error("Paid amount does not match line items");
  }
  const order: ConfirmedOrder = {
    stripe_session_id: id,
    stripe_payment_intent_id: session.payment_intent,
    livemode: session.livemode,
    amount_total: session.amount_total!,
    currency: "eur",
    items,
  };
  const saved = await deps.saveOrder(order);
  if (saved.stripe_session_id !== id || saved.stripe_payment_intent_id !== order.stripe_payment_intent_id ||
    saved.amount_total !== order.amount_total || saved.currency !== order.currency ||
    saved.livemode !== order.livemode || saved.items.length !== order.items.length ||
    saved.items.some((item, i) => item.artwork_id !== order.items[i].artwork_id ||
      item.name !== order.items[i].name || item.dimensions !== order.items[i].dimensions ||
      item.quantity !== order.items[i].quantity || item.amount_total !== order.items[i].amount_total)) {
    throw new Error("Persisted payment does not match Stripe");
  }
  // No customer, address, email or line-item details are exposed by this API.
  return { status: "paid", order_reference: id };
}
