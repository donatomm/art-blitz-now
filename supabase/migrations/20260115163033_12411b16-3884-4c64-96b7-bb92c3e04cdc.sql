-- Layer 1: Create normalize_slug function
CREATE OR REPLACE FUNCTION public.normalize_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NOT NULL THEN
    NEW.slug := LOWER(NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add trigger to pages table
CREATE TRIGGER enforce_lowercase_slug_pages
BEFORE INSERT OR UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.normalize_slug();

-- Add trigger to products table
CREATE TRIGGER enforce_lowercase_slug_products
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.normalize_slug();

-- Layer 2: Fix existing uppercase slugs
UPDATE public.pages SET slug = LOWER(slug) WHERE slug <> LOWER(slug);
UPDATE public.products SET slug = LOWER(slug) WHERE slug IS NOT NULL AND slug <> LOWER(slug);