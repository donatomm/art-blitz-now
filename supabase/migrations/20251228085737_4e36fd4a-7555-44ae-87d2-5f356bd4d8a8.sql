-- Add tags column to products table for related products filtering
ALTER TABLE products ADD COLUMN tags text[] DEFAULT '{}';