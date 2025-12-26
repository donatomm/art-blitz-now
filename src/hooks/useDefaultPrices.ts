import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DefaultPrice {
  id: string;
  dimension: string;
  price: number;
  created_at: string;
  updated_at: string;
}

// Normalize dimension to canonical form (smaller x larger)
export const normalizeDimension = (dim: string): string => {
  const match = dim.match(/^(\d+)x(\d+)(.*)$/);
  if (!match) return dim;
  const [, a, b, suffix] = match;
  const numA = parseInt(a);
  const numB = parseInt(b);
  if (numA <= numB) return dim;
  return `${numB}x${numA}${suffix}`;
};

export const useDefaultPrices = () => {
  return useQuery({
    queryKey: ["default_prices"],
    queryFn: async (): Promise<DefaultPrice[]> => {
      const { data, error } = await supabase
        .from("default_prices")
        .select("*")
        .order("dimension");
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useUpdateDefaultPrice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ dimension, price }: { dimension: string; price: number }) => {
      const normalizedDim = normalizeDimension(dimension);
      
      // Upsert - insert or update
      const { data, error } = await supabase
        .from("default_prices")
        .upsert(
          { dimension: normalizedDim, price },
          { onConflict: "dimension" }
        )
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["default_prices"] });
    },
  });
};

export const useBatchUpdateDefaultPrices = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: { dimension: string; price: number }[]) => {
      const normalizedUpdates = updates.map(u => ({
        dimension: normalizeDimension(u.dimension),
        price: u.price,
      }));
      
      const { data, error } = await supabase
        .from("default_prices")
        .upsert(normalizedUpdates, { onConflict: "dimension" })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["default_prices"] });
    },
  });
};

export const useDeleteDefaultPrice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dimension: string) => {
      const normalizedDim = normalizeDimension(dimension);
      
      const { error } = await supabase
        .from("default_prices")
        .delete()
        .eq("dimension", normalizedDim);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["default_prices"] });
    },
  });
};

// Helper to get master price for a dimension
export const getMasterPrice = (
  defaultPrices: DefaultPrice[],
  dimension: string
): number | null => {
  const normalizedDim = normalizeDimension(dimension);
  const match = defaultPrices.find(dp => dp.dimension === normalizedDim);
  return match ? match.price : null;
};

// Helper to check if a price is overridden (different from master)
export const isPriceOverridden = (
  defaultPrices: DefaultPrice[],
  dimension: string,
  actualPrice: number
): boolean => {
  const masterPrice = getMasterPrice(defaultPrices, dimension);
  if (masterPrice === null) return false;
  return actualPrice !== masterPrice;
};
