-- Update storage policies for product-images bucket to require admin role for modifications
-- Keep public READ access, but restrict INSERT/UPDATE/DELETE to admins only

-- First, drop existing policies that allow any authenticated user to modify
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create admin-only policies for modifications
CREATE POLICY "Only admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND public.has_role(auth.uid(), 'admin')
);