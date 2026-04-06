-- Add icon color field to landing_pages table
ALTER TABLE public.landing_pages
ADD COLUMN IF NOT EXISTS color_icons text DEFAULT '#8B5CF6';