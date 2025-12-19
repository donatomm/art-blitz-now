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

interface CartItem {
  product_id: string;
  size_dimensions: string;
  quantity: number;
}

interface LegacyRequest {
  product_id: string;
  size_index: number;
  customer_email?: string;
}

interface CartRequest {
  items: CartItem[];
  customer_email?: string;
}

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
    const body = await req.json();
    logStep("Request body", body);

    // Determine if this is a cart request or legacy single-item request
    const isCartRequest = Array.isArray(body.items);
    logStep("Request type", { isCart: isCartRequest });

    // Create Supabase client to fetch product data
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://octowonders.lovable.app";

    // Calculate days remaining until December 14, 2025
    const deadline = new Date('2025-12-14T23:59:59');
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let metadata: Record<string, string> = {};
    let customerEmail = body.customer_email;

    if (isCartRequest) {
      // ========== CART REQUEST (new) ==========
      const cartRequest = body as CartRequest;
      logStep("Processing cart request", { itemCount: cartRequest.items.length });

      if (!cartRequest.items || cartRequest.items.length === 0) {
        throw new Error("Cart is empty");
      }

      // Fetch all products in one query
      const productIds = [...new Set(cartRequest.items.map(item => item.product_id))];
      const { data: products, error: productsError } = await supabaseClient
        .from("products")
        .select("*")
        .in("id", productIds);

      if (productsError) throw new Error(`Database error: ${productsError.message}`);
      logStep("Products fetched", { count: products?.length });

      // Build line items for each cart item
      for (const cartItem of cartRequest.items) {
        const product = products?.find(p => p.id === cartItem.product_id);
        if (!product) {
          throw new Error(`Product not found: ${cartItem.product_id}`);
        }

        const sizes = product.sizes as Array<{
          dimensions: string;
          price: number;
          stripe_product_id?: string;
          deal_label_enabled?: boolean;
          deal_price?: number;
        }>;

        // Find size by dimensions (stable identifier)
        const selectedSize = sizes.find(s => s.dimensions === cartItem.size_dimensions);
        if (!selectedSize) {
          throw new Error(`Size "${cartItem.size_dimensions}" not available for "${product.name}"`);
        }

        if (!selectedSize.stripe_product_id) {
          throw new Error(`Stripe not configured for "${product.name}" - ${cartItem.size_dimensions}`);
        }

        // Use deal_price if offer is enabled
        const effectivePrice = (selectedSize.deal_label_enabled && selectedSize.deal_price && selectedSize.deal_price > 0)
          ? selectedSize.deal_price
          : selectedSize.price;

        if (!effectivePrice || effectivePrice <= 0) {
          throw new Error(`Invalid price for "${product.name}" - ${cartItem.size_dimensions}`);
        }

        // Get image from Stripe product or Supabase
        let images: string[] = [];
        try {
          const stripeProduct = await stripe.products.retrieve(selectedSize.stripe_product_id);
          if (stripeProduct.images && stripeProduct.images.length > 0) {
            images = [stripeProduct.images[0]];
          }
        } catch (e) {
          logStep("Could not fetch Stripe product image", { error: String(e) });
        }
        if (images.length === 0 && product.image_url && product.image_url.startsWith('http')) {
          images = [product.image_url];
        }

        // Build description with Christmas guarantee
        let description = `Stampa su Tela Premium`;
        if (daysRemaining > 0) {
          description += ` | Consegna Natale garantita entro 14 Dic`;
        }

        lineItems.push({
          price_data: {
            currency: "eur",
            product_data: {
              name: `★ ${product.name.toUpperCase()} ★ ${selectedSize.dimensions} cm`,
              description,
              images,
            },
            unit_amount: Math.round(effectivePrice * 100),
          },
          quantity: cartItem.quantity,
        });

        logStep("Line item added", { product: product.name, size: cartItem.size_dimensions, qty: cartItem.quantity });
      }

      metadata = {
        type: "cart",
        item_count: cartRequest.items.length.toString(),
        items_summary: cartRequest.items.map(i => `${i.product_id}:${i.size_dimensions}:${i.quantity}`).join("|"),
      };

    } else {
      // ========== LEGACY SINGLE-ITEM REQUEST ==========
      const legacyRequest = body as LegacyRequest;
      const { product_id, size_index, customer_email: email } = legacyRequest;
      customerEmail = email;
      
      logStep("Processing legacy request", { product_id, size_index });

      if (!product_id || size_index === undefined) {
        throw new Error("Missing required parameters: product_id and size_index");
      }

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
      const sizes = product.sizes as Array<{
        dimensions: string;
        price: number;
        stripe_product_id?: string;
        deal_label_enabled?: boolean;
        deal_price?: number;
      }>;
      if (!sizes || size_index >= sizes.length) {
        throw new Error("Invalid size index");
      }

      const selectedSize = sizes[size_index];
      logStep("Size selected", selectedSize);

      if (!selectedSize.stripe_product_id) {
        throw new Error("Stripe Product ID not configured for this size. Please add it in the Admin Panel.");
      }

      // Use deal_price if offer is enabled
      const effectivePrice = (selectedSize.deal_label_enabled && selectedSize.deal_price && selectedSize.deal_price > 0)
        ? selectedSize.deal_price
        : selectedSize.price;

      if (!effectivePrice || effectivePrice <= 0) {
        throw new Error("Invalid price for selected size");
      }
      logStep("Effective price", { regular: selectedSize.price, deal: selectedSize.deal_price, effective: effectivePrice });

      // Get image from Stripe product or Supabase
      let images: string[] = [];
      try {
        const stripeProduct = await stripe.products.retrieve(selectedSize.stripe_product_id);
        if (stripeProduct.images && stripeProduct.images.length > 0) {
          images = [stripeProduct.images[0]];
        }
      } catch (e) {
        logStep("Could not fetch Stripe product image", { error: String(e) });
      }
      if (images.length === 0 && product.image_url && product.image_url.startsWith('http')) {
        images = [product.image_url];
      }

      // Build description with Christmas guarantee
      let description = `Stampa su Tela Premium`;
      if (daysRemaining > 0) {
        description += `\n\n⚠️ATTENZIONE ⚠️\nConsegna per Natale GARANTITA\nper acquisti ‼️ENTRO IL 14 Dicembre‼️ Mancano solo ♥️ ${daysRemaining} GIORNI ♥️.`;
      }

      lineItems = [{
        price_data: {
          currency: "eur",
          product_data: {
            name: `★ ${product.name.toUpperCase()} ★ ${selectedSize.dimensions} cm`,
            description,
            images,
          },
          unit_amount: Math.round(effectivePrice * 100),
        },
        quantity: 1,
      }];

      metadata = {
        type: "single",
        product_id: product_id,
        product_name: product.name,
        size_dimensions: selectedSize.dimensions,
        size_index: size_index.toString(),
      };
    }

    // Check if customer exists
    let customerId: string | undefined;
    if (customerEmail) {
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Existing customer found", { customerId });
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      shipping_address_collection: {
        allowed_countries: ["IT"],
      },
      metadata,
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
