-- Add nav_buttons JSON column to landing_pages for configurable header navigation buttons
ALTER TABLE public.landing_pages
ADD COLUMN nav_buttons jsonb DEFAULT '[
  {"id": "painel_gerador", "label": "Painel Gerador", "enabled": true, "action": "scroll", "target": "#checkout"},
  {"id": "comprar_agora", "label": "Comprar Agora", "enabled": true, "action": "cta", "target": ""},
  {"id": "compra_creditos", "label": "Compra de Créditos", "enabled": true, "action": "scroll", "target": "#pacotes"},
  {"id": "como_funciona", "label": "Como Funciona", "enabled": true, "action": "scroll", "target": "#how-it-works"},
  {"id": "faq", "label": "FAQ", "enabled": true, "action": "scroll", "target": "#faq"}
]'::jsonb;