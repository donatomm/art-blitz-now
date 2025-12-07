-- Note: The sizes column is already JSONB and stores an array of size objects
-- Each size object structure: { dimension: string, price: number }
-- We need to add stripe_product_id to each size object
-- This is handled at the application level when saving products
-- No schema migration needed - JSONB is flexible

-- Add a comment to document the expected structure
COMMENT ON COLUMN products.sizes IS 'Array of size objects: { dimension: string, price: number, stripe_product_id?: string }';