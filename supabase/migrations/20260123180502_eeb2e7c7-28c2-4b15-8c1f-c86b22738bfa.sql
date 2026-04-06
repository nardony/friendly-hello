-- Add section_order column to store the order of sections
ALTER TABLE public.landing_pages 
ADD COLUMN section_order JSONB DEFAULT '["hero", "features", "about", "how-it-works", "testimonials", "faq", "cta", "donation"]'::jsonb;