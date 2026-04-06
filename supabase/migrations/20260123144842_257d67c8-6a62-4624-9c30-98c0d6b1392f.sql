-- Add unique constraint on slug to ensure friendly URLs never repeat
ALTER TABLE public.landing_pages 
ADD CONSTRAINT landing_pages_slug_unique UNIQUE (slug);