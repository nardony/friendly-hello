-- Add credit options to social proof
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS social_proof_credits integer[] DEFAULT ARRAY[200, 500, 1000, 2000];