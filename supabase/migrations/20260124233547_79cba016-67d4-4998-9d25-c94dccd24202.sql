-- Add PIX payment configuration fields to landing_pages
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS pix_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS pix_key text DEFAULT null,
ADD COLUMN IF NOT EXISTS pix_name text DEFAULT null,
ADD COLUMN IF NOT EXISTS pix_qr_base text DEFAULT null;