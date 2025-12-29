/**
 * Prebuild script - Fetches all products from Supabase and saves to JSON
 * This runs before vite build to enable SSG with product data
 */

import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = "https://xqubydbsoucrwqhddodw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdWJ5ZGJzb3VjcndxaGRkb2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzc3MTEsImV4cCI6MjA4MDQxMzcxMX0.gf9hyzaMNAolSwlmUzVlkpopoM24jWiyiGuGsL5REnI";

interface ProductSize {
  dimensions: string;
  price: number;
  stripe_product_id?: string;
  deal_label_enabled?: boolean;
  deal_label_text?: string;
  deal_price?: number;
  mock_room_url?: string;
  mock_room_label?: string;
}

interface MockRoom {
  url: string;
  label?: string;
}

interface Product {
  id: string;
  name: string;
  medium: string;
  description: string;
  image_url: string;
  sizes: ProductSize[];
  display_order: number;
  deal_label_enabled: boolean;
  deal_label_text: string;
  mock_rooms?: MockRoom[];
  is_active: boolean;
  is_new?: boolean;
  slug?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

// Helper to normalize mock_rooms from DB (can be string[] or MockRoom[])
const normalizeMockRooms = (mockRooms: unknown): MockRoom[] => {
  if (!Array.isArray(mockRooms)) return [];
  return mockRooms.map((item) => {
    if (typeof item === 'string') {
      return { url: item, label: '' };
    }
    return item as MockRoom;
  });
};

// Normalize sizes to ensure all fields have defaults
const normalizeSizes = (sizes: unknown): ProductSize[] => {
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

async function fetchProducts(): Promise<Product[]> {
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
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Normalize data (same logic as useProducts)
  return data.map((item: any) => ({
    ...item,
    sizes: normalizeSizes(item.sizes),
    deal_label_enabled: item.deal_label_enabled ?? false,
    deal_label_text: item.deal_label_text ?? '',
    description: item.description ?? '',
    mock_rooms: normalizeMockRooms(item.mock_rooms),
    is_active: item.is_active ?? true,
    is_new: item.is_new ?? false,
  })) as Product[];
}

async function main() {
  console.log('🚀 Prebuild: Fetching products from database...');
  
  try {
    const products = await fetchProducts();
    
    // Ensure directory exists
    const generatedDir = path.join(process.cwd(), 'src', 'generated');
    fs.mkdirSync(generatedDir, { recursive: true });
    
    // Write products JSON
    const outputPath = path.join(generatedDir, 'products.json');
    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
    
    console.log(`✅ Pre-fetched ${products.length} products to src/generated/products.json`);
    
    // Log active products with slugs for verification
    const activeWithSlugs = products.filter(p => p.is_active && p.slug);
    console.log(`📄 ${activeWithSlugs.length} active products with slugs ready for SSG`);
    
  } catch (error) {
    console.error('❌ Prebuild failed:', error);
    process.exit(1);
  }
}

main();
