-- Add facebook_pixel column to landing_pages for tracking scripts
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS facebook_pixel TEXT;