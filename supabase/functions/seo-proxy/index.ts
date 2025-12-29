import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://octowonders.com";
const SITE_NAME = "OctoWonders";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  medium: string;
  image_url: string;
  sizes: Array<{
    price: number;
    deal_price?: number;
    dimensions: string;
    deal_label_enabled?: boolean;
  }>;
  is_active: boolean;
}

function getProductSchema(product: Product) {
  const activeSizes = product.sizes.filter(s => s.price > 0);
  const prices = activeSizes.map(s => {
    if (s.deal_label_enabled && s.deal_price && s.deal_price > 0) {
      return s.deal_price;
    }
    return s.price;
  });
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - ${product.medium}`,
    "image": product.image_url,
    "brand": {
      "@type": "Brand",
      "name": SITE_NAME
    },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": lowPrice.toString(),
      "highPrice": highPrice.toString(),
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "offerCount": activeSizes.length
    }
  };
}

serve(async (req) => {
  // Allow CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Check User-Agent to detect crawlers
  const userAgent = req.headers.get("user-agent") || "";
  const isCrawler = /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|whatsapp|crawler|spider|bot/i.test(userAgent);

  try {
    const url = new URL(req.url);
    // Get slug from query param OR from path (for /seo-proxy/slug-here format)
    let slug = url.searchParams.get("slug");
    
    // Also support path-based: /functions/v1/seo-proxy/my-product-slug
    if (!slug) {
      const pathParts = url.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart !== "seo-proxy") {
        slug = lastPart;
      }
    }

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch product by slug
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Calculate min price for description
    const activeSizes = product.sizes.filter((s: any) => s.price > 0);
    const prices = activeSizes.map((s: any) => {
      if (s.deal_label_enabled && s.deal_price && s.deal_price > 0) {
        return s.deal_price;
      }
      return s.price;
    });
    const minPrice = Math.min(...prices);

    // Build meta tags
    const title = `${product.name} | ${SITE_NAME}`;
    const description = product.description 
      ? product.description.substring(0, 160)
      : `${product.name} - ${product.medium}. Stampa su tela di alta qualità. Da €${minPrice}. Spedizione gratuita in Italia.`;
    const canonicalUrl = `${BASE_URL}/product/${product.slug}`;
    const imageUrl = product.image_url;

    // Generate HTML with SEO tags
    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:locale" content="it_IT">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(getProductSchema(product as Product))}
  </script>
  
  ${!isCrawler ? `
  <!-- Redirect to actual page for browsers -->
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
  <script>window.location.href = "${canonicalUrl}";</script>
  ` : '<!-- Crawler detected - no redirect -->'}
</head>
<body>
  <h1>${product.name}</h1>
  <p>${description}</p>
  <p>Prezzo: da €${minPrice}</p>
  <img src="${imageUrl}" alt="${product.name} - ${product.medium}">
  <a href="${canonicalUrl}">Vai al prodotto</a>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (error) {
    console.error("SEO proxy error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
