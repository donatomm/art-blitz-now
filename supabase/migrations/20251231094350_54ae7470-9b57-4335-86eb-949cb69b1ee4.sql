-- Drop the broken triggers that use pg_net (not available in Lovable Cloud)
DROP TRIGGER IF EXISTS on_product_insert_regenerate_sitemap ON public.products;
DROP TRIGGER IF EXISTS on_product_update_regenerate_sitemap ON public.products;
DROP TRIGGER IF EXISTS on_product_delete_regenerate_sitemap ON public.products;

-- Update function to be a no-op (safe fallback if called elsewhere)
CREATE OR REPLACE FUNCTION public.trigger_sitemap_regeneration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- pg_net is not available in Lovable Cloud
  -- Sitemap regeneration is now handled by frontend after product changes
  RETURN COALESCE(NEW, OLD);
END;
$$;