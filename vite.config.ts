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
        // /colors excluded from sitemap — developer tool, wastes crawl budget
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

      // Note: <head> injection is handled by postbuild-inject-head.cjs
      // Do NOT inject here — it causes duplicate <head> blocks.

      return html;
    },
  },
}));
