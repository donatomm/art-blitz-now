import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Check if running in Lovable preview (not production)
const isLovablePreview = typeof window !== 'undefined' && 
  (window.location.hostname.includes('lovable.app') || 
   window.location.hostname.includes('localhost'));

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  content_type: 'markdown' | 'html';
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string;
  updated_at: string;
}

export const usePages = (options?: { forceLive?: boolean }) => {
  const forceLive = options?.forceLive ?? false;
  
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .order("slug");

      if (error) throw error;
      return data as Page[];
    },
    enabled: forceLive || isLovablePreview,
  });
};

export const usePage = (slug: string, options?: { forceLive?: boolean }) => {
  const forceLive = options?.forceLive ?? false;
  
  return useQuery({
    queryKey: ["pages", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as Page | null;
    },
    enabled: forceLive || isLovablePreview,
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      slug,
      title, 
      content,
      content_type,
      seo_title,
      seo_description 
    }: { 
      id: string; 
      slug?: string;
      title: string; 
      content: string;
      content_type?: 'markdown' | 'html';
      seo_title?: string | null;
      seo_description?: string | null;
    }) => {
      const updateData: Record<string, any> = { title, content, seo_title, seo_description };
      if (content_type) {
        updateData.content_type = content_type;
      }
      if (slug) {
        updateData.slug = slug;
      }
      
      const { data, error } = await supabase
        .from("pages")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
};

export const useCreatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      slug,
      title, 
      content,
      content_type = 'markdown',
      seo_title,
      seo_description 
    }: { 
      slug: string;
      title: string; 
      content: string;
      content_type?: 'markdown' | 'html';
      seo_title?: string | null;
      seo_description?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("pages")
        .insert({ slug, title, content, content_type, seo_title, seo_description })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
};

export const useDeletePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
};
