import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🗺️ Regenerating sitemap...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all products
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, slug, updated_at")
      .order("display_order");

    if (error) throw error;

    const baseUrl = "https://octowonders.com";
    const today = new Date().toISOString().split("T")[0];

    // Static pages
    const staticPages = [
      { loc: "/", changefreq: "weekly", priority: "1.0" },
      { loc: "/artist", changefreq: "monthly", priority: "0.8" },
      { loc: "/shipping", changefreq: "monthly", priority: "0.7" },
      { loc: "/contact", changefreq: "monthly", priority: "0.7" },
      { loc: "/pricing-policy", changefreq: "monthly", priority: "0.5" },
      { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
      { loc: "/cookies", changefreq: "yearly", priority: "0.3" },
      { loc: "/terms", changefreq: "yearly", priority: "0.3" },
      { loc: "/resi-rimborsi", changefreq: "monthly", priority: "0.5" },
      { loc: "/ordine-personalizzato", changefreq: "monthly", priority: "0.7" },
      { loc: "/sitemap", changefreq: "weekly", priority: "0.4" },
    ];

    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add product pages
    if (products) {
      for (const product of products) {
        if (!product.slug) continue;
        
        const lastmod = product.updated_at 
          ? new Date(product.updated_at).toISOString().split("T")[0]
          : today;
        
        xml += `  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload("sitemap.xml", xml, {
        contentType: "application/xml",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const productCount = products?.filter(p => p.slug).length || 0;
    console.log(`✅ Sitemap regenerated with ${staticPages.length + productCount} URLs`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sitemap regenerated with ${staticPages.length + productCount} URLs` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Sitemap regeneration error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});