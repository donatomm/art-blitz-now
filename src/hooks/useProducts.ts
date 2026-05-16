import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductSize, MockRoom } from "@/types/product";
import { Json } from "@/integrations/supabase/types";

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

interface UseProductsOptions {
  enabled?: boolean;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  // Only run the query on the client (not during SSG)
  const isClient = typeof window !== 'undefined';
  
  // Allow caller to control enabled state (e.g., only fetch when authenticated)
  const shouldFetch = isClient && (options.enabled !== false);
  
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      console.log('[useProducts] Fetching products from database...');
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      console.log('[useProducts] Got', data?.length, 'products, first:', data?.[0]?.name, 'order:', data?.[0]?.display_order);
      
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
    // Only fetch when explicitly enabled AND on client-side
    enabled: shouldFetch,
    // Ensure fresh data - no caching
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Partial<Product> & { id: string }) => {
      const { error } = await supabase
        .from("products")
        .update({
          name: product.name?.normalize("NFKC"),
          medium: product.medium?.normalize("NFKC"),
          description: product.description?.normalize("NFKC"),
          image_url: product.image_url,
          sizes: product.sizes as unknown as Json,
          display_order: product.display_order,
          deal_label_enabled: product.deal_label_enabled,
          deal_label_text: product.deal_label_text,
          mock_rooms: product.mock_rooms as unknown as Json,
          is_active: product.is_active,
          is_new: product.is_new,
          slug: product.slug || null,
        })
        .eq("id", product.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<Product, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("products").insert({
        name: product.name,
        medium: product.medium,
        description: product.description,
        image_url: product.image_url,
        sizes: product.sizes as unknown as Json,
        display_order: product.display_order,
        deal_label_enabled: product.deal_label_enabled,
        deal_label_text: product.deal_label_text,
        mock_rooms: product.mock_rooms as unknown as Json,
        is_active: product.is_active ?? true,
        is_new: product.is_new ?? false,
        slug: product.slug || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};