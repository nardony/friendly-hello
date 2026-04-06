-- Add promo banner fields to landing_pages
ALTER TABLE public.landing_pages
ADD COLUMN IF NOT EXISTS promo_text text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS promo_link text DEFAULT NULL;