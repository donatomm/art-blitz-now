import { jsonResponse, corsHeaders, paymentRuntime } from "../_shared/paymentRuntime.ts";

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);
  let id: unknown;
  try {
    id = (await req.json()).session_id;
  } catch {
    return jsonResponse({ error: "Invalid request" }, 400);
  }
  if (typeof id !== "string" || !/^cs_(test_|live_)?[A-Za-z0-9]{6,}$/.test(id)) {
    return jsonResponse({ error: "Invalid session" }, 400);
  }
  try {
    return jsonResponse(await paymentRuntime().confirm(id));
  } catch {
    // Do not log URLs, session capabilities, customer data or provider errors.
    console.error("[VERIFY-CHECKOUT] Confirmation could not be established");
    return jsonResponse({ error: "Payment confirmation temporarily unavailable" }, 503);
  }
});
