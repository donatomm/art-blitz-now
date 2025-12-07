-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Recreate with proper auth check
CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'product-images');