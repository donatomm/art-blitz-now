import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface SiteSetting {
  id: string;
  key: string;
  value: Json;
  created_at: string;
  updated_at: string;
}

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");
      
      if (error) throw error;
      return data as SiteSetting[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to prevent redundant API calls
  });
};

export const useUpdateSiteSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Json }) => {
      // Use upsert to create or update the setting
      const { data, error } = await supabase
        .from("site_settings")
        .upsert({ key, value }, { onConflict: 'key' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
};

// Helper function to get a specific setting value
export const getSettingValue = <T>(settings: SiteSetting[] | undefined, key: string, defaultValue: T): T => {
  if (!settings) return defaultValue;
  const setting = settings.find(s => s.key === key);
  if (!setting) return defaultValue;
  return setting.value as T;
};
