-- Add Hero section advanced fields to landing_pages
ALTER TABLE public.landing_pages
ADD COLUMN IF NOT EXISTS hero_title_highlight text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS hero_badge_text text DEFAULT 'Oferta Limitada',
ADD COLUMN IF NOT EXISTS hero_daily_renewal_text text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS hero_extra_prices jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hero_extra_renewals jsonb DEFAULT '[]'::jsonb;