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

// Plugin to fetch products at build time for SSG
const prebuildPlugin = () => ({
  name: "prebuild-products",
  async buildStart() {
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
        throw new Error(`Failed to fetch: ${response.status}`);
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

      // Write to generated folder
      const generatedDir = path.join(process.cwd(), 'src', 'generated');
      fs.mkdirSync(generatedDir, { recursive: true });
      fs.writeFileSync(
        path.join(generatedDir, 'products.json'),
        JSON.stringify(products, null, 2)
      );

      console.log(`✅ Fetched ${products.length} products for SSG`);
    } catch (error) {
      console.error("❌ Prebuild failed:", error);
      // Don't throw - allow build to continue with empty products
    }
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy sitemap.xml to edge function in development
      '/sitemap.xml': {
        target: 'https://xqubydbsoucrwqhddodw.supabase.co',
        changeOrigin: true,
        rewrite: () => '/functions/v1/sitemap',
      },
    },
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
    beastiesOptions: {
      reduceInlineStyles: false,
    },
  },
}));
