-- Add logo_image column to landing_pages
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS logo_image text;