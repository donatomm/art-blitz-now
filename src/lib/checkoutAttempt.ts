import type { ReceiptCartItem } from "./checkoutReceipt";

export function checkoutRequestId(payload: unknown): string {
  const key = "octowonders_checkout_attempt";
  const signature = JSON.stringify(payload);
  try {
    const prior = JSON.parse(localStorage.getItem(key) || "null");
    if (prior?.signature === signature && Date.now() - prior.created < 30 * 60 * 1000) return prior.id;
  } catch { /* Storage may be disabled; checkout can still proceed. */ }
  const id = crypto.randomUUID();
  try { localStorage.setItem(key, JSON.stringify({ id, signature, created: Date.now() })); } catch { /* noop */ }
  return id;
}

export function rememberCheckout(sessionId: string, items: ReceiptCartItem[]) {
  try {
    const key = "octowonders_receipt:" + sessionId;
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ items, consumed: false }));
  } catch { /* If storage is unavailable, never clear the cart automatically. */ }
}
