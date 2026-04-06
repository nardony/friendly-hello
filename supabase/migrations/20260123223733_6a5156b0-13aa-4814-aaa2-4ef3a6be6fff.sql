-- Add text color fields to landing_pages table
ALTER TABLE public.landing_pages
ADD COLUMN IF NOT EXISTS color_text text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS color_text_highlight text DEFAULT '#a855f7';