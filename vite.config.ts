import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import * as fs from "fs";

const SUPABASE_URL = "https://xqubydbsoucrwqhddodw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdWJ5ZGJzb3VjcndxaGRkb2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzc3MTEsImV4cCI6MjA4MDQxMzcxMX0.gf9hyzaMNAolSwlmUzVlkpopoM24jWiyiGuGsL5REnI";

// Normalize sizes to ensure all fields have defaults
const normalizeSizes = (sizes: unknown) => {
  if (!Array.isArray(sizes)) return [];
  return sizes.map((size: any) => ({
    dimensions: size.dimensions || '',
    price: size.price || 0,
    stripe_product_id: size.stripe_product_id || '',
    deal_label_enabled: size.deal_label_enabled ?? false,
    deal_label_text: size.deal_label_text || '',
    deal_price: size.deal_price || 0,
    mock_room_url: size.mock_room_url || '',
    mock_room_label: size.mock_room_label || '',
  }));
};

// Normalize mock_rooms from DB
const normalizeMockRooms = (mockRooms: unknown) => {
  if (!Array.isArray(mockRooms)) return [];
  return mockRooms.map((item) => {
    if (typeof item === 'string') return { url: item, label: '' };
    return item;
  });
};

// Plugin to fetch products and site settings at build time for SSG and generate sitemap
const prebuildPlugin = () => ({
  name: "prebuild-products",
  async buildStart() {
    const generatedDir = path.join(process.cwd(), 'src', 'generated');
    fs.mkdirSync(generatedDir, { recursive: true });

    // Fetch products
    console.log("🔄 Fetching products for SSG...");
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/products?select=*&order=display_order.asc`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json() as any[];
      
      // Normalize products
      const products = data.map((item) => ({
        ...item,
        sizes: normalizeSizes(item.sizes),
        deal_label_enabled: item.deal_label_enabled ?? false,
        deal_label_text: item.deal_label_text ?? '',
        description: item.description ?? '',
        mock_rooms: normalizeMockRooms(item.mock_rooms),
        is_active: item.is_active ?? true,
        is_new: item.is_new ?? false,
      }));

      // Write TypeScript file for SSG (this is what routes.tsx imports)
      const staticProductsContent = `/**
 * Static products data for SSG
 * Auto-generated at build time - DO NOT EDIT MANUALLY
 */

import { Product } from '@/types/product';

export const staticProducts: Product[] = ${JSON.stringify(products, null, 2)};

export default staticProducts;
`;
      fs.writeFileSync(
        path.join(generatedDir, 'staticProducts.ts'),
        staticProductsContent
      );
      console.log(`✅ Updated staticProducts.ts with ${products.length} products for SSG`);
      
      // Also keep products.json for sitemap generation in writeBundle
      fs.writeFileSync(
        path.join(generatedDir, 'products.json'),
        JSON.stringify(products, null, 2)
      );
    } catch (error) {
      console.error("❌ Products prebuild failed:", error);
    }

    // Fetch site settings for hero SSG
    console.log("🔄 Fetching site settings for SSG...");
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/site_settings?select=key,value`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      let settings: Record<string, any> = {};
      
      if (response.ok) {
        const data = await response.json() as { key: string; value: any }[];
        // Transform array of key-value pairs into object
        for (const item of data) {
          settings[item.key] = item.value;
        }
      }

      // Apply sensible defaults
      const staticSettings = {
        hero_title: settings.hero_title || "Opere magnetiche. Uniche. Non per tutti.",
        hero_subtitle: settings.hero_subtitle || "Trasforma la tua parete in un'esperienza visiva che cattura lo sguardo e non lo lascia andare.",
        hero_cta_text: settings.hero_cta_text || "ESPLORA LA COLLEZIONE",
        hero_image: settings.hero_image || "",
        trust_bar_items: Array.isArray(settings.trust_bar_items) ? settings.trust_bar_items : [],
      };

      const staticSiteSettingsContent = `/**
 * Static site settings data for SSG
 * Auto-generated at build time - DO NOT EDIT MANUALLY
 */

export interface StaticSiteSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_image: string;
  trust_bar_items: string[];
}

export const staticSiteSettings: StaticSiteSettings = ${JSON.stringify(staticSettings, null, 2)};

export default staticSiteSettings;
`;
      fs.writeFileSync(
        path.join(generatedDir, 'staticSiteSettings.ts'),
        staticSiteSettingsContent
      );
      console.log(`✅ Updated staticSiteSettings.ts for SSG`);
    } catch (error) {
      console.error("❌ Site settings prebuild failed (using defaults):", error);
      // Don't throw - we have defaults in the file already
    }
  },
  async writeBundle(options: any) {
    // Generate sitemap.xml after the bundle is written
    // vite-react-ssg handles product HTML generation, we only do sitemap here
    console.log("🔄 Generating sitemap.xml...");
    try {
      const productsPath = path.join(process.cwd(), 'src', 'generated', 'products.json');
      if (!fs.existsSync(productsPath)) {
        console.log("⚠️ No products.json found, skipping sitemap generation");
        return;
      }

      const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
      const distDir = options.dir || path.join(process.cwd(), 'dist');
      
      const BASE_URL = 'https://octowonders.com';
      const today = new Date().toISOString().split('T')[0];

      const staticPages = [
        { loc: '/', changefreq: 'weekly', priority: '1.0' },
        { loc: '/artist', changefreq: 'monthly', priority: '0.8' },
        { loc: '/shipping', changefreq: 'monthly', priority: '0.7' },
        { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
        { loc: '/pricing-policy', changefreq: 'monthly', priority: '0.5' },
        { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
        { loc: '/cookies', changefreq: 'yearly', priority: '0.3' },
        { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
        { loc: '/resi-rimborsi', changefreq: 'monthly', priority: '0.5' },
        { loc: '/ordine-personalizzato', changefreq: 'monthly', priority: '0.7' },
        { loc: '/sitemap', changefreq: 'weekly', priority: '0.4' },
      ];

      let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

      // Add static pages
      for (const page of staticPages) {
        sitemapXml += `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
      }

      // Add product pages (only active products with slugs)
      let productCount = 0;
      for (const product of products) {
        if (!product.slug || product.is_active === false) continue;
        const lastmod = product.updated_at 
          ? new Date(product.updated_at).toISOString().split('T')[0]
          : today;
        sitemapXml += `  <url>
    <loc>${BASE_URL}/product/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
        productCount++;
      }

      sitemapXml += '</urlset>';

      // Write to public directory (will be copied to dist during build)
      const publicDir = path.join(process.cwd(), 'public');
      fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
      
      // Also write directly to dist for safety
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);
      
      console.log(`✅ Generated sitemap.xml with ${staticPages.length} static pages + ${productCount} product pages`);

    } catch (error) {
      console.error("❌ Sitemap generation failed:", error);
    }
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    prebuildPlugin(),
    react(),
    mode === "development" && componentTagger(),
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: false,
        quality: 80,
        alphaQuality: 80,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  // SSG options for prerendering
  ssgOptions: {
    script: "async",
    formatting: "none",
    mock: true,  // Mock browser globals (window, document, localStorage) during SSG
    dirStyle: "nested",  // Generate /product/slug/index.html for clean URLs
    beastiesOptions: {
      reduceInlineStyles: false,
    },
    // Debug hook to verify SSG content in build logs
    onPageRendered: (route: string, html: string) => {
      const hasContent = html.includes('<h1') && !html.includes('id="root"></div>');
      console.log(`[SSG] ${route}: ${hasContent ? '✅ Content rendered' : '❌ Empty body'}`);
      return html;
    },
  },
}));
