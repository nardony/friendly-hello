-- Add custom_package_options column to landing_pages for per-page custom packages
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS custom_package_options jsonb DEFAULT '[]'::jsonb;