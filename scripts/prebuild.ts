/**
 * Prebuild script - Fetches all data from Supabase and generates static files
 * Run this script BEFORE committing when database content changes:
 *   npm run prebuild
 * 
 * This populates src/generated/*.ts files which SSG uses for static HTML generation.
 */

import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = "https://xqubydbsoucrwqhddodw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdWJ5ZGJzb3VjcndxaGRkb2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzc3MTEsImV4cCI6MjA4MDQxMzcxMX0.gf9hyzaMNAolSwlmUzVlkpopoM24jWiyiGuGsL5REnI";

// Normalize slug to URL-safe format (supports nested paths like "blog/article")
const normalizeSlug = (slug: string | null | undefined): string | null => {
  if (!slug) return null;
  return slug
    .toLowerCase()
    .normalize('NFD')                    // Decompose accented chars (è → e + combining accent)
    .replace(/[\u0300-\u036f]/g, '')     // Remove combining accents
    .replace(/\s+/g, '-')                // Spaces → hyphens
    .replace(/[^a-z0-9\/-]/g, '')        // Keep / for nested paths
    .replace(/-+/g, '-')                 // Collapse multiple hyphens
    .replace(/\/+/g, '/')                // Collapse multiple slashes
    .replace(/^[-\/]+|[-\/]+$/g, '');    // Trim leading/trailing hyphens and slashes
};

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

async function fetchProducts() {
  console.log("🔄 Fetching products...");
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
  
  return data.map((item) => ({
    ...item,
    slug: normalizeSlug(item.slug),      // Normalize slug to URL-safe format
    sizes: normalizeSizes(item.sizes),
    deal_label_enabled: item.deal_label_enabled ?? false,
    deal_label_text: item.deal_label_text ?? '',
    description: item.description ?? '',
    mock_rooms: normalizeMockRooms(item.mock_rooms),
    is_active: item.is_active ?? true,
    is_new: item.is_new ?? false,
  }));
}

async function fetchSiteSettings() {
  console.log("🔄 Fetching site settings...");
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
    for (const item of data) {
      settings[item.key] = item.value;
    }
  }

  // Apply sensible defaults for ALL settings used in critical path
  return {
    // Hero settings
    hero_title: settings.hero_title || "Opere magnetiche. Uniche. Non per tutti.",
    hero_subtitle: settings.hero_subtitle || "Trasforma la tua parete in un'esperienza visiva che cattura lo sguardo e non lo lascia andare.",
    hero_cta_text: settings.hero_cta_text || "ESPLORA LA COLLEZIONE",
    hero_image: settings.hero_image || "",
    trust_bar_items: Array.isArray(settings.trust_bar_items) ? settings.trust_bar_items : [],
    
    // Navigation settings
    nav_items: Array.isArray(settings.nav_items) ? settings.nav_items : [
      { label: "Autore", href: "/artista", order: 0 },
      { label: "Regole di Spedizione", href: "/spedizione", order: 1 },
      { label: "Politica Prezzi", href: "/pricing-policy", order: 2 },
      { label: "Contatti", href: "/contatti", order: 3 },
    ],
    
    // HelloBar settings (all fields)
    hellobar_enabled: settings.hellobar_enabled ?? false,
    hellobar_text: settings.hellobar_text || "SPEDIZIONE GRATUITA in Italia - 30% fino a capodanno!",
    hellobar_text_color: settings.hellobar_text_color || "#FFFFFF",
    hellobar_bg_color: settings.hellobar_bg_color || "#16A34A",
    hellobar_bg_opacity: settings.hellobar_bg_opacity ?? 100,
    hellobar_countdown_enabled: settings.hellobar_countdown_enabled ?? true,
    hellobar_countdown_end: settings.hellobar_countdown_end || "2025-01-01T00:00:00",
    hellobar_countdown_text_color: settings.hellobar_countdown_text_color || "#FFFFFF",
    hellobar_countdown_bg_color: settings.hellobar_countdown_bg_color || "#15803D",
    hellobar_button_enabled: settings.hellobar_button_enabled ?? true,
    hellobar_button_text: settings.hellobar_button_text || "Dettagli",
    hellobar_button_text_color: settings.hellobar_button_text_color || "#16A34A",
    hellobar_button_bg_color: settings.hellobar_button_bg_color || "#FFFFFF",
    hellobar_button_border_color: settings.hellobar_button_border_color || "#FFFFFF",
    hellobar_popup_content: settings.hellobar_popup_content || "",
    hellobar_whatsapp_number: settings.hellobar_whatsapp_number || "393666295174",
    hellobar_contact_email: settings.hellobar_contact_email || "me@octowonders.com",
  };
}

async function fetchPages() {
  console.log("🔄 Fetching pages...");
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/pages?select=*&order=slug.asc`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch pages: ${response.status}`);
  }

  const data = await response.json() as any[];

  return data.map((item) => ({
    ...item,
    slug: normalizeSlug(item.slug),      // Normalize slug to URL-safe format
  }));
}

async function main() {
  console.log('🚀 Prebuild: Fetching all data from database...\n');
  
  const generatedDir = path.join(process.cwd(), 'src', 'generated');
  fs.mkdirSync(generatedDir, { recursive: true });

  try {
    // Fetch all data in parallel
    const [products, siteSettings, pages] = await Promise.all([
      fetchProducts(),
      fetchSiteSettings(),
      fetchPages(),
    ]);

    // Write staticProducts.ts
    const staticProductsContent = `/**
 * Static products data for SSG
 * Auto-generated by prebuild script - DO NOT EDIT MANUALLY
 * Run "npm run prebuild" to regenerate
 */

import { Product } from '@/types/product';

export const staticProducts: Product[] = ${JSON.stringify(products, null, 2)};

export default staticProducts;
`;
    fs.writeFileSync(path.join(generatedDir, 'staticProducts.ts'), staticProductsContent);
    console.log(`✅ staticProducts.ts: ${products.length} products`);

    // Write products.json (for sitemap generation)
    fs.writeFileSync(path.join(generatedDir, 'products.json'), JSON.stringify(products, null, 2));

  // Add build timestamp for pipeline verification
    const buildTimestamp = new Date().toISOString();
    const siteSettingsWithTimestamp = {
      ...siteSettings,
      build_timestamp: buildTimestamp,
    };

    // Write staticSiteSettings.ts with COMPLETE interface
    const staticSiteSettingsContent = `/**
 * Static site settings data for SSG
 * Auto-generated by prebuild script - DO NOT EDIT MANUALLY
 * Run "npm run prebuild" to regenerate
 */

export interface NavItem {
  label: string;
  href: string;
  order?: number;
}

export interface StaticSiteSettings {
  // Hero settings
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_image: string;
  trust_bar_items: string[];
  
  // Navigation settings
  nav_items: NavItem[];
  
  // HelloBar settings
  hellobar_enabled: boolean;
  hellobar_text: string;
  hellobar_text_color: string;
  hellobar_bg_color: string;
  hellobar_bg_opacity: number;
  hellobar_countdown_enabled: boolean;
  hellobar_countdown_end: string;
  hellobar_countdown_text_color: string;
  hellobar_countdown_bg_color: string;
  hellobar_button_enabled: boolean;
  hellobar_button_text: string;
  hellobar_button_text_color: string;
  hellobar_button_bg_color: string;
  hellobar_button_border_color: string;
  hellobar_popup_content: string;
  hellobar_whatsapp_number: string;
  hellobar_contact_email: string;
  
  // Build metadata
  build_timestamp: string;
}

export const staticSiteSettings: StaticSiteSettings = ${JSON.stringify(siteSettingsWithTimestamp, null, 2)};

export default staticSiteSettings;
`;
    console.log(`✅ Build timestamp: ${buildTimestamp}`);
    fs.writeFileSync(path.join(generatedDir, 'staticSiteSettings.ts'), staticSiteSettingsContent);
    console.log(`✅ staticSiteSettings.ts: settings loaded`);

    // Write staticPages.ts
    const staticPagesContent = `/**
 * Static pages data for SSG
 * Auto-generated by prebuild script - DO NOT EDIT MANUALLY
 * Run "npm run prebuild" to regenerate
 */

import { Page } from '@/hooks/usePages';

export const staticPages: Page[] = ${JSON.stringify(pages, null, 2)};

export default staticPages;
`;
    fs.writeFileSync(path.join(generatedDir, 'staticPages.ts'), staticPagesContent);
    console.log(`✅ staticPages.ts: ${pages.length} pages`);

    // Write pages.json (for sitemap generation)
    fs.writeFileSync(path.join(generatedDir, 'pages.json'), JSON.stringify(pages, null, 2));

    console.log('\n✅ Prebuild complete! Files ready for commit.');
    console.log('📦 Run "git add src/generated && git commit" to save changes.');

  } catch (error) {
    console.error('❌ Prebuild failed:', error);
    process.exit(1);
  }
}

main();
