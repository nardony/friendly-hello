-- Add video section fields to landing_pages table
ALTER TABLE public.landing_pages
ADD COLUMN IF NOT EXISTS video_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS video_title text,
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS video_thumbnail text;