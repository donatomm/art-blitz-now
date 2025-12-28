-- Add hero_image setting
INSERT INTO public.site_settings (key, value) 
VALUES ('hero_image', '""')
ON CONFLICT (key) DO NOTHING;