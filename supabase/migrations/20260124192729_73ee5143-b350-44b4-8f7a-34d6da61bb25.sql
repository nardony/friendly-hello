-- Add pricing tiers column for credit packages
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS pricing_tiers JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.landing_pages.pricing_tiers IS 'Array of credit packages: [{name, credits, price_original, price_current, available, sales, checkout_link}]';