export function checkoutOrigin(origin: string | null, mode: string, additionalOrigins = "") {
  if (!["live", "test"].includes(mode)) throw new Error("Payment environment is not configured");
  const allowed = mode === "live"
    ? ["https://octowonders.com", "https://www.octowonders.com"]
    : additionalOrigins.split(",").map(s => s.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) throw new Error("Checkout origin not allowed");
  return origin;
}

export function checkoutRequest(body: unknown) {
  if (!body || typeof body !== "object") throw new Error("Invalid checkout request");
  const data = body as Record<string, unknown>;
  if (data.request_id !== undefined && (typeof data.request_id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.request_id))) {
    throw new Error("Invalid checkout request identifier");
  }
  if (data.customer_email !== undefined && (typeof data.customer_email !== "string" ||
    data.customer_email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customer_email))) {
    throw new Error("Invalid email");
  }
  if ("items" in data) {
    if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 50) throw new Error("Invalid cart");
    const seen = new Set<string>();
    for (const item of data.items) {
      if (!item || typeof item.product_id !== "string" || !item.product_id ||
        typeof item.size_dimensions !== "string" || !item.size_dimensions ||
        !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error("Invalid cart item");
      const key = JSON.stringify([item.product_id, item.size_dimensions]);
      if (seen.has(key)) throw new Error("Duplicate cart item");
      seen.add(key);
    }
  } else if (typeof data.product_id !== "string" || !data.product_id ||
    !Number.isSafeInteger(data.size_index) || (data.size_index as number) < 0) {
    throw new Error("Invalid product selection");
  }
}

export function selectedPrice(product: { is_active?: boolean }, size: {
  price: number; stripe_product_id?: string; deal_label_enabled?: boolean; deal_price?: number;
}) {
  if (product.is_active !== true) throw new Error("Artwork is not available");
  if (!size.stripe_product_id?.trim()) throw new Error("Payment is not configured for this size");
  const price = size.deal_label_enabled ? size.deal_price : size.price;
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0 ||
    !Number.isSafeInteger(Math.round(price * 100)) || Math.round(price * 100) <= 0) throw new Error("Invalid price");
  return price;
}
