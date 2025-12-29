import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { execSync } from "child_process";

// Plugin to run prebuild script before SSG build
const prebuildPlugin = () => ({
  name: "prebuild",
  buildStart() {
    console.log("🔄 Running prebuild script to fetch products...");
    try {
      execSync("npx tsx scripts/prebuild.ts", { stdio: "inherit" });
      console.log("✅ Prebuild completed successfully");
    } catch (error) {
      console.error("❌ Prebuild failed:", error);
      throw error;
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
    formatting: "minify",
    crittersOptions: {
      reduceInlineStyles: false,
    },
  },
}));
