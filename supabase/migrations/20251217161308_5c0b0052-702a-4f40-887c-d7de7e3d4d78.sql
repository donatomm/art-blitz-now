-- Add SEO fields to pages table
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;