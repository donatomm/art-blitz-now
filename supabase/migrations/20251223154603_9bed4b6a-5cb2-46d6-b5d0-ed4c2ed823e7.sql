-- Add is_new column to products table for "NEW" badge toggle
ALTER TABLE public.products ADD COLUMN is_new boolean NOT NULL DEFAULT false;