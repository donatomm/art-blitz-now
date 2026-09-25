import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { confirmPayment, type ConfirmedOrder, type PaymentSession } from "./paymentConfirmation.ts";

export function requiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error("Payment service configuration incomplete");
  return value;
}

export function paymentRuntime() {
  const key = requiredEnv("STRIPE_SECRET_KEY");
  const mode = requiredEnv("STRIPE_MODE");
  if (!["live", "test"].includes(mode) || !key.startsWith(mode === "live" ? "sk_live_" : "sk_test_")) {
    throw new Error("Payment environment mismatch");
  }
  const stripe = new Stripe(key, { apiVersion: "2025-08-27.basil", timeout: 10000, maxNetworkRetries: 1 });
  const db = createClient(requiredEnv("SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const confirm = (id: string) => confirmPayment(id, {
    liveMode: mode === "live",
    retrieveSession: async (sessionId): Promise<PaymentSession> => {
      const s = await stripe.checkout.sessions.retrieve(sessionId);
      if (s.metadata?.integration !== "octowonders-v1") throw new Error("Unrecognized checkout");
      const lines = await stripe.checkout.sessions.listLineItems(sessionId, {
        limit: 100, expand: ["data.price.product"],
      });
      if (lines.has_more) throw new Error("Too many checkout lines");
      return {
        id: s.id, mode: s.mode, status: s.status, payment_status: s.payment_status,
        livemode: s.livemode, currency: s.currency, amount_total: s.amount_total,
        metadata: s.metadata ?? {},
        payment_intent: typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id ?? null,
        lines: lines.data.map((line: Stripe.LineItem) => {
          const p = line.price?.product;
          return {
            quantity: line.quantity, amount_total: line.amount_total, currency: line.currency,
            product: p && typeof p !== "string" && !p.deleted
              ? { name: p.name, metadata: p.metadata } : null,
          };
        }),
      };
    },
    saveOrder: async (order: ConfirmedOrder) => {
      const { error: insertError } = await db.from("confirmed_orders").upsert(order, {
        onConflict: "stripe_session_id", ignoreDuplicates: true,
      });
      if (insertError) throw new Error("Order persistence unavailable");
      const { data, error } = await db.from("confirmed_orders")
        .select("stripe_session_id,stripe_payment_intent_id,livemode,amount_total,currency,items")
        .eq("stripe_session_id", order.stripe_session_id).single();
      if (error || !data) throw new Error("Order confirmation unavailable");
      return data as ConfirmedOrder;
    },
  });
  return { stripe, confirm, mode };
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
