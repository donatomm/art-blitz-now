import { useQuery } from '@tanstack/react-query';
import { staticProducts } from '@/generated/staticProducts';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductSize, MockRoom } from '@/types/product';

// Check if running in Lovable preview (not production)
const isLovablePreview = typeof window !== 'undefined' && 
  (window.location.hostname.includes('lovable.app') || 
   window.location.hostname.includes('localhost'));

// Helper to normalize mock_rooms from DB
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
  return sizes.map((size) => ({
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

/**
 * Get static products data pre-fetched at build time
 * This enables SSG to render complete product pages with SEO tags
 */
export const getStaticProducts = (): Product[] => {
  return staticProducts as Product[];
};

/**
 * Get a single product by slug from static data
 */
export const getStaticProductBySlug = (slug: string): Product | undefined => {
  const products = getStaticProducts();
  return products.find(p => p.slug === slug) || products.find(p => p.id === slug);
};

/**
 * Hook for components that need products
 * In Lovable preview: fetches LIVE data from database
 * In production: returns static data (baked in at build time)
 */
export const useStaticProducts = () => {
  const staticData = getStaticProducts();
  
  // In Lovable preview, fetch live data from database
  const { data: liveProducts, isLoading } = useQuery({
    queryKey: ['products-live'],
    queryFn: async () => {
      console.log('[useStaticProducts] Fetching LIVE products for preview...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map((item) => ({
        ...item,
        sizes: normalizeSizes(item.sizes),
        deal_label_enabled: item.deal_label_enabled ?? false,
        deal_label_text: item.deal_label_text ?? '',
        description: item.description ?? '',
        mock_rooms: normalizeMockRooms(item.mock_rooms),
        is_active: (item as any).is_active ?? true,
        is_new: item.is_new ?? false,
      })) as Product[];
    },
    enabled: isLovablePreview,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
  
  // Use live data in preview, static data in production
  const products = isLovablePreview && liveProducts ? liveProducts : staticData;
  
  return { 
    products,
    getBySlug: (slug: string) => products.find(p => p.slug === slug),
    data: products, 
    isLoading: isLovablePreview ? isLoading : false,
    isError: false,
  };
};
