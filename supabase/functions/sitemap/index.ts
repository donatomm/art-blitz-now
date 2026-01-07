import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Sitemap generation started");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const baseUrl = "https://octowonders.com";
    const today = new Date().toISOString().split("T")[0];

    // Fixed routes (never change, always included)
    const fixedRoutes = [
      { loc: "/", changefreq: "weekly", priority: "1.0" },
      { loc: "/sitemap", changefreq: "weekly", priority: "0.4" },
    ];

    // Fetch CMS pages from database
    let pages: { slug: string; updated_at: string | null }[] = [];
    try {
      const { data, error } = await supabase
        .from("pages")
        .select("slug, updated_at")
        .order("slug");

      if (error) {
        console.error("Pages fetch error:", error);
      } else {
        pages = data || [];
        console.log(`Fetched ${pages.length} CMS pages`);
      }
    } catch (e) {
      console.error("Pages query failed:", e);
    }

    // Fetch active products with slugs
    let products: { slug: string; updated_at: string | null }[] = [];
    try {
      const { data, error } = await supabase
        .from("products")
        .select("slug, updated_at")
        .eq("is_active", true)
        .not("slug", "is", null)
        .order("display_order");

      if (error) {
        console.error("Products fetch error:", error);
      } else {
        products = data || [];
        console.log(`Fetched ${products.length} active products`);
      }
    } catch (e) {
      console.error("Products query failed:", e);
    }

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add fixed routes
    for (const route of fixedRoutes) {
      xml += `  <url>
    <loc>${baseUrl}${route.loc}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
    }

    // Add CMS pages (e.g., /artista, /contatti, /storie-fatti-scientifici-polpo)
    for (const page of pages) {
      if (!page.slug) continue;
      
      const lastmod = page.updated_at 
        ? new Date(page.updated_at).toISOString().split("T")[0]
        : today;
      
      xml += `  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }

    // Add product pages
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

    xml += `</urlset>`;

    console.log(`Sitemap generated: ${fixedRoutes.length} fixed + ${pages.length} pages + ${products.length} products`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
