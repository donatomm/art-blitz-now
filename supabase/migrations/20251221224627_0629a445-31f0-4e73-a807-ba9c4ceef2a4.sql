-- Add nullable slug column with unique constraint (when not null)
ALTER TABLE products ADD COLUMN slug text;

-- Create unique index that only applies to non-null values
CREATE UNIQUE INDEX products_slug_unique ON products (slug) WHERE slug IS NOT NULL;