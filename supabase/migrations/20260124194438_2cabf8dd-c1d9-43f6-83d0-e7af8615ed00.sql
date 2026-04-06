-- Add social proof notifications configuration
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS social_proof_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS social_proof_product_name text DEFAULT 'o Gerador',
ADD COLUMN IF NOT EXISTS social_proof_customers jsonb DEFAULT '[
  {"name": "Carlos M.", "city": "São Paulo", "state": "SP"},
  {"name": "Ana Paula S.", "city": "Rio de Janeiro", "state": "RJ"},
  {"name": "Roberto F.", "city": "Belo Horizonte", "state": "MG"},
  {"name": "Juliana C.", "city": "Curitiba", "state": "PR"},
  {"name": "Fernando L.", "city": "Salvador", "state": "BA"},
  {"name": "Mariana R.", "city": "Brasília", "state": "DF"},
  {"name": "Pedro H.", "city": "Porto Alegre", "state": "RS"},
  {"name": "Thiago N.", "city": "Florianópolis", "state": "SC"}
]'::jsonb;