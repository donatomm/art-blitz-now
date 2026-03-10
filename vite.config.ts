import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import * as fs from "fs";

/**
 * Sitemap generation plugin
 * Runs after bundle is written to generate sitemap.xml from pre-generated JSON files
 * 
 * NOTE: Product/page data is populated by running "npm run prebuild" before building.
 * The prebuild script fetches from database and writes to src/generated/*.ts files.
 */
const sitemapPlugin = () => ({
  name: "generate-sitemap",
  async writeBundle(options: any) {
    console.log("🔄 Generating sitemap.xml...");
    try {
      const generatedDir = path.join(process.cwd(), 'src', 'generated');
      const productsPath = path.join(generatedDir, 'products.json');
      const pagesPath = path.join(generatedDir, 'pages.json');
      
      // Check if generated files exist
      if (!fs.existsSync(productsPath)) {
        console.log("⚠️ No products.json found. Run 'npm run prebuild' first.");
        return;
      }

      const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
      const distDir = options.dir || path.join(process.cwd(), 'dist');
      
      const BASE_URL = 'https://octowonders.com';
      const today = new Date().toISOString().split('T')[0];

      // Fixed routes (not from CMS)
      const fixedRoutes = [
        { loc: '/', changefreq: 'weekly', priority: '1.0' },
        { loc: '/sitemap', changefreq: 'weekly', priority: '0.4' },
        { loc: '/colors', changefreq: 'monthly', priority: '0.3' },
      ];

      // Load CMS pages
      let cmsPages: any[] = [];
      if (fs.existsSync(pagesPath)) {
        cmsPages = JSON.parse(fs.readFileSync(pagesPath, 'utf-8'));
      }

      let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

      // Add fixed routes
      for (const route of fixedRoutes) {
        sitemapXml += `  <url>
    <loc>${BASE_URL}${route.loc}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
      }

      // Add CMS pages
      for (const page of cmsPages) {
        const lastmod = page.updated_at 
          ? new Date(page.updated_at).toISOString().split('T')[0]
          : today;
        sitemapXml += `  <url>
    <loc>${BASE_URL}/${page.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
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

      // Write to public directory
      const publicDir = path.join(process.cwd(), 'public');
      fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml);
      
      // Also write directly to dist
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);
      
      console.log(`✅ Generated sitemap.xml: ${fixedRoutes.length} fixed + ${cmsPages.length} CMS + ${productCount} products`);

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
    sitemapPlugin(),
    react(),
    mode === "development" && componentTagger(),
    ViteImageOptimizer({
      includePublic: true,
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
    mock: true,
    dirStyle: "nested",
    beastiesOptions: {
      reduceInlineStyles: false,
    },
    onPageRendered: (route: string, html: string) => {
      const hasContent = html.includes('<h1') && !html.includes('id="root"></div>');
      console.log(`[SSG] ${route}: ${hasContent ? '✅ Content rendered' : '❌ Empty body'}`);

      // Fix: beasties CSS inliner strips <head> during SSG build.
      // If <head> is missing, inject it before <body> with essential meta tags.
      if (!html.includes('<head>') && !html.includes('<head ')) {
        console.log(`[SSG] ${route}: ⚠️ Missing <head>, injecting fallback`);
        const headBlock = `<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="google-site-verification" content="piIPB5x5MjblaPWAVjsiaeV8Gc3AbIFnq1yZItrhUlM" />
    <link rel="preconnect" href="https://xqubydbsoucrwqhddodw.supabase.co" crossorigin />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300&display=swap" />
    <meta name="p:domain_verify" content="488c339e7167063621a6662be6c159b8" />
    <title>OctoWonders by Marco De Francesco - Stampe d'Arte su Tela</title>
    <meta name="description" content="Stampe d'arte originali su tela di alta qualità. Opere uniche a tema marino." />
    <meta name="author" content="Marco De Francesco" />
  </head>`;
        html = html.replace('<body>', headBlock + '\n  <body>');
      }

      return html;
    },
  },
}));
