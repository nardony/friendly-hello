-- Add donation section fields to landing_pages
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS donation_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS donation_title text DEFAULT '💚 Apoie o Desenvolvedor',
ADD COLUMN IF NOT EXISTS donation_description text DEFAULT 'Gostou do sistema? Considere fazer uma doação via PIX para ajudar no desenvolvimento!',
ADD COLUMN IF NOT EXISTS donation_pix_key text DEFAULT '48996029392',
ADD COLUMN IF NOT EXISTS donation_pix_name text DEFAULT 'Marcondes Jorge Machado',
ADD COLUMN IF NOT EXISTS donation_qr_code text,
ADD COLUMN IF NOT EXISTS access_key text;