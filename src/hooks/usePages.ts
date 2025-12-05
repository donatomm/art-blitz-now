import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const usePages = () => {
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
  });
};

export const usePage = (slug: string) => {
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
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const { data, error } = await supabase
        .from("pages")
        .update({ title, content })
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
