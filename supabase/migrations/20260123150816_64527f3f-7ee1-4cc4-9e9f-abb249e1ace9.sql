-- Add color palette fields to landing_pages table
ALTER TABLE public.landing_pages 
ADD COLUMN color_primary text DEFAULT '#8B5CF6',
ADD COLUMN color_accent text DEFAULT '#10B981',
ADD COLUMN color_background text DEFAULT '#0a0a0f';