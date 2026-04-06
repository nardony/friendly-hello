-- Add typography fields to landing_pages
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS font_heading text DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS font_body text DEFAULT 'Inter';