-- Add Google Analytics and GTM columns to landing_pages
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS google_analytics TEXT,
ADD COLUMN IF NOT EXISTS google_tag_manager TEXT;