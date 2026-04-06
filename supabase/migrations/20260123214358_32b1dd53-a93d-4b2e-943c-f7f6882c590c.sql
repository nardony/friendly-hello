-- Add TikTok Pixel column to landing_pages
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS tiktok_pixel TEXT;