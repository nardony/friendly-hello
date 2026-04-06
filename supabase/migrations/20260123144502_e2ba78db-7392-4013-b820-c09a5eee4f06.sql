-- Create storage bucket for landing page images
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing-pages', 'landing-pages', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'landing-pages');

-- Allow authenticated users to update their images
CREATE POLICY "Authenticated users can update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'landing-pages');

-- Allow authenticated users to delete their images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'landing-pages');

-- Allow public read access to landing page images
CREATE POLICY "Public read access for landing page images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'landing-pages');

-- Add new image columns to landing_pages table
ALTER TABLE public.landing_pages
ADD COLUMN IF NOT EXISTS hero_image TEXT,
ADD COLUMN IF NOT EXISTS product_image TEXT,
ADD COLUMN IF NOT EXISTS background_image TEXT;