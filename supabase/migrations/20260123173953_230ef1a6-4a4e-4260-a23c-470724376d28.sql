-- Add faqs column to landing_pages table
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb;