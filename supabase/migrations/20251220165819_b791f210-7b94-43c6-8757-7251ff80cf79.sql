-- Add is_active column to products table with default true
ALTER TABLE public.products 
ADD COLUMN is_active boolean NOT NULL DEFAULT true;