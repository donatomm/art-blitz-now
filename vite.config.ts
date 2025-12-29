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

// Helper to generate SEO meta tags for a product
const generateProductSEO = (product: any) => {
  const BASE_URL = 'https://octowonders.com';
  const SITE_NAME = 'OctoWonders';
  
  const activeSizes = (product.sizes || []).filter((s: any) => s.price > 0);
  const prices = activeSizes.map((s: any) => {
    if (s.deal_label_enabled && s.deal_price && s.deal_price > 0) {
      return s.deal_price;
    }
    return s.price;
  });
  const minPrice = Math.min(...prices) || 0;
  const maxPrice = Math.max(...prices) || 0;

  const title = `${product.name} | ${SITE_NAME}`;
  const description = product.description 
    ? product.description.substring(0, 160).replace(/"/g, '&quot;').replace(/\n/g, ' ')
    : `${product.name} - ${product.medium}. Stampa su tela di alta qualità. Da €${minPrice}.`;
  const canonicalUrl = `${BASE_URL}/product/${product.slug}`;
  const imageUrl = product.image_url;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": description,
    "image": imageUrl,
    "brand": { "@type": "Brand", "name": SITE_NAME },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": minPrice.toString(),
      "highPrice": maxPrice.toString(),
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "offerCount": activeSizes.length
    }
  });

  return { title, description, canonicalUrl, imageUrl, jsonLd };
};

// Plugin to fetch products at build time for SSG and generate static HTML
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
    }
  },
  async writeBundle(options: any, bundle: any) {
    // Generate static HTML files for each product after the bundle is written
    console.log("🔄 Generating static product HTML files...");
    try {
      const productsPath = path.join(process.cwd(), 'src', 'generated', 'products.json');
      if (!fs.existsSync(productsPath)) {
        console.log("⚠️ No products.json found, skipping HTML generation");
        return;
      }

      const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
      const distDir = options.dir || path.join(process.cwd(), 'dist');
      
      // Read the main index.html as template
      const indexHtmlPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexHtmlPath)) {
        console.log("⚠️ No index.html found in dist, skipping");
        return;
      }
      
      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
      
      // Create product directory
      const productDir = path.join(distDir, 'product');
      fs.mkdirSync(productDir, { recursive: true });

      let count = 0;
      for (const product of products) {
        if (!product.slug || product.is_active === false) continue;

        const seo = generateProductSEO(product);
        
        // Replace meta tags in the HTML template
        let productHtml = indexHtml
          // Replace title
          .replace(/<title>.*?<\/title>/i, `<title>${seo.title}</title>`)
          // Add/replace meta description
          .replace(
            /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="description" content="${seo.description}">`
          )
          // Add canonical link if not present
          .replace(
            /<\/head>/i,
            `  <link rel="canonical" href="${seo.canonicalUrl}">
  <meta property="og:title" content="${seo.title}">
  <meta property="og:description" content="${seo.description}">
  <meta property="og:image" content="${seo.imageUrl}">
  <meta property="og:url" content="${seo.canonicalUrl}">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="OctoWonders">
  <meta property="og:locale" content="it_IT">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${seo.title}">
  <meta name="twitter:description" content="${seo.description}">
  <meta name="twitter:image" content="${seo.imageUrl}">
  <script type="application/ld+json">${seo.jsonLd}</script>
</head>`
          );

        const filePath = path.join(productDir, `${product.slug}.html`);
        fs.writeFileSync(filePath, productHtml);
        count++;
      }

      console.log(`✅ Generated ${count} static product HTML files`);
    } catch (error) {
      console.error("❌ HTML generation failed:", error);
    }
  }
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
