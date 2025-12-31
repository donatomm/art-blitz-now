import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DefaultPrice {
  dimension: string;
  price: number;
}

// Normalize dimension so "40x60" and "60x40" map to the same key
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
    queryFn: async () => {
      const { data, error } = await supabase
        .from("default_prices")
        .select("dimension, price");
      
      if (error) throw error;
      
      // Create a map with normalized dimensions for easy lookup
      const priceMap = new Map<string, number>();
      (data || []).forEach((item) => {
        priceMap.set(normalizeDimension(item.dimension), Number(item.price));
      });
      
      return priceMap;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

// Helper to get default price for a dimension
export const getDefaultPrice = (
  priceMap: Map<string, number> | undefined,
  dimension: string
): number | null => {
  if (!priceMap) return null;
  return priceMap.get(normalizeDimension(dimension)) ?? null;
};
