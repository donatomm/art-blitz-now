-- Add description column to products table
ALTER TABLE public.products ADD COLUMN description text NOT NULL DEFAULT '';