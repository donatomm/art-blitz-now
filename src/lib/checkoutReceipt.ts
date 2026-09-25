export interface ReceiptCartItem {
  productId: string;
  sizeDimensions: string;
  quantity: number;
}

// Clear only the exact cart submitted for this checkout. If the customer has
// since changed it, preserve it rather than deleting newly added items.
export function cartAfterPayment(current: ReceiptCartItem[], submitted: ReceiptCartItem[]) {
  const key = (items: ReceiptCartItem[]) => JSON.stringify(items.map(item =>
    [item.productId, item.sizeDimensions, item.quantity]).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))));
  return submitted.length > 0 && key(current) === key(submitted) ? [] : current;
}

export function isPaidReceipt(data: unknown, sessionId: string): boolean {
  if (!data || typeof data !== "object") return false;
  const receipt = data as Record<string, unknown>;
  return receipt.status === "paid" && receipt.order_reference === sessionId;
}
