-- Add logo_size column to landing_pages table
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS logo_size text DEFAULT 'medium';

-- Add comment to explain the column
COMMENT ON COLUMN public.landing_pages.logo_size IS 'Size of the logo in the header: small, medium, large, xlarge';