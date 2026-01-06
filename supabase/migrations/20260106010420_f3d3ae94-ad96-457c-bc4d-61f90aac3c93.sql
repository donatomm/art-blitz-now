-- Add RLS policies for article-images bucket

-- Allow public read access to article images
CREATE POLICY "Article images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'article-images');

-- Allow admins to upload article images
CREATE POLICY "Only admins can upload article images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'article-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update article images
CREATE POLICY "Only admins can update article images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'article-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete article images
CREATE POLICY "Only admins can delete article images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'article-images' AND has_role(auth.uid(), 'admin'::app_role));