-- Add CTA section fields to landing_pages table
ALTER TABLE public.landing_pages 
ADD COLUMN cta_title text DEFAULT 'Pronto para começar?',
ADD COLUMN cta_subtitle text DEFAULT 'Garanta seu acesso agora e transforme seus resultados';