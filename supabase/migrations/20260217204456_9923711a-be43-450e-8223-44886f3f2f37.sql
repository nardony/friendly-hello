
-- Add checkout configuration fields to landing_pages
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS checkout_product_subtitle text DEFAULT 'Acesso Completo',
ADD COLUMN IF NOT EXISTS checkout_product_description text DEFAULT 'Acesso vitalício • Sem mensalidades',
ADD COLUMN IF NOT EXISTS checkout_badge_text text DEFAULT 'OFERTA LIMITADA',
ADD COLUMN IF NOT EXISTS checkout_benefits jsonb DEFAULT '["Acesso Vitalício ao Painel","Gerador de Créditos Ilimitado","Suporte Premium 24/7","Atualizações Gratuitas","Comunidade Exclusiva"]'::jsonb,
ADD COLUMN IF NOT EXISTS checkout_enabled boolean DEFAULT true;
