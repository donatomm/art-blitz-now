-- Create function to call the regenerate-sitemap edge function
CREATE OR REPLACE FUNCTION public.trigger_sitemap_regeneration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use pg_net to call the edge function asynchronously
  PERFORM net.http_post(
    url := 'https://xqubydbsoucrwqhddodw.supabase.co/functions/v1/regenerate-sitemap',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for INSERT
CREATE TRIGGER on_product_insert_regenerate_sitemap
  AFTER INSERT ON public.products
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_sitemap_regeneration();

-- Create trigger for UPDATE
CREATE TRIGGER on_product_update_regenerate_sitemap
  AFTER UPDATE ON public.products
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_sitemap_regeneration();

-- Create trigger for DELETE
CREATE TRIGGER on_product_delete_regenerate_sitemap
  AFTER DELETE ON public.products
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_sitemap_regeneration();