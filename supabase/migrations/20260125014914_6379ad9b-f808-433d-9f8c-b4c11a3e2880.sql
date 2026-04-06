-- Create homepage_settings table to store main page configuration
CREATE TABLE public.homepage_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read homepage settings (public page)
CREATE POLICY "Anyone can view homepage settings"
ON public.homepage_settings
FOR SELECT
USING (true);

-- Only admins can modify homepage settings
CREATE POLICY "Admins can insert homepage settings"
ON public.homepage_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update homepage settings"
ON public.homepage_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete homepage settings"
ON public.homepage_settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_homepage_settings_updated_at
BEFORE UPDATE ON public.homepage_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pricing tiers
INSERT INTO public.homepage_settings (key, value) VALUES
('pricing_tiers', '[
  {
    "id": "1",
    "name": "Pacote Iniciante",
    "credits": 1000,
    "price_original": 50,
    "price_current": 29.99,
    "available": 50,
    "sales": 127,
    "checkout_link": "/checkout",
    "highlight": false
  },
  {
    "id": "2",
    "name": "Pacote Básico",
    "credits": 5000,
    "price_original": 600,
    "price_current": 349.99,
    "available": 30,
    "sales": 243,
    "checkout_link": "/checkout",
    "highlight": true
  },
  {
    "id": "3",
    "name": "Pacote Profissional",
    "credits": 10000,
    "price_original": 280,
    "price_current": 179.99,
    "available": 20,
    "sales": 89,
    "checkout_link": "/checkout",
    "highlight": false
  },
  {
    "id": "4",
    "name": "Pacote Empresarial",
    "credits": 50000,
    "price_original": 1200,
    "price_current": 799.99,
    "available": 10,
    "sales": 34,
    "checkout_link": "/checkout",
    "highlight": false
  }
]'::jsonb),
('hero', '{
  "title": "Créditos Infinitos na Lovable.",
  "title_highlight": "Simples. Rápido. Automático.",
  "subtitle": "Use nosso painel exclusivo e gere créditos ilimitados para seus projetos Lovable e revenda créditos.",
  "price_original": 600,
  "price_current": 349.99,
  "cta_text": "Comprar Agora"
}'::jsonb);