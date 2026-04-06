-- Adicionar campos de configuração do WhatsApp na tabela landing_pages
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS whatsapp_message TEXT DEFAULT NULL;