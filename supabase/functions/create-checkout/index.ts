import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Parse request body
    const { product_id, size_index, customer_email } = await req.json();
    logStep("Request parsed", { product_id, size_index, customer_email });

    if (!product_id || size_index === undefined) {
      throw new Error("Missing required parameters: product_id and size_index");
    }

    // Create Supabase client to fetch product data
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Fetch the product from database
    const { data: product, error: productError } = await supabaseClient
      .from("products")
      .select("*")
      .eq("id", product_id)
      .maybeSingle();

    if (productError) throw new Error(`Database error: ${productError.message}`);
    if (!product) throw new Error("Product not found");
    logStep("Product fetched", { name: product.name });

    // Get the specific size variant
    const sizes = product.sizes as Array<{ dimensions: string; price: number; stripe_product_id?: string }>;
    if (!sizes || size_index >= sizes.length) {
      throw new Error("Invalid size index");
    }

    const selectedSize = sizes[size_index];
    logStep("Size selected", selectedSize);

    if (!selectedSize.stripe_product_id) {
      throw new Error("Stripe Product ID not configured for this size. Please add it in the Admin Panel.");
    }

    if (!selectedSize.price || selectedSize.price <= 0) {
      throw new Error("Invalid price for selected size");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists (optional - for guest checkout)
    let customerId: string | undefined;
    if (customer_email) {
      const customers = await stripe.customers.list({ email: customer_email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      }
    }

    // Create checkout session with dynamic pricing
    const origin = req.headers.get("origin") || "https://octowonders.lovable.app";
    
    // Build absolute image URL for Stripe - use production URL for local paths
    // Stripe needs publicly accessible URLs, preview URLs may not work
    const productionUrl = "https://octowonders.lovable.app";
    let imageUrl = product.image_url;
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `${productionUrl}${imageUrl}`;
    }
    logStep("Image URL for Stripe", { imageUrl });
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customer_email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${product.name.toUpperCase()} | ${selectedSize.dimensions} cm`,
              description: `Stampa su Tela - Dimensioni: ${selectedSize.dimensions} cm`,
              images: imageUrl ? [imageUrl] : [],
            },
            unit_amount: Math.round(selectedSize.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/product/${product_id}`,
      shipping_address_collection: {
        allowed_countries: ["IT"], // Italy only for now
      },
      metadata: {
        product_id: product_id,
        product_name: product.name,
        size_dimensions: selectedSize.dimensions,
        size_index: size_index.toString(),
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
