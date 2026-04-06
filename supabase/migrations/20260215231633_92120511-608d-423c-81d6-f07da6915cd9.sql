
-- Fix: Allow public to read non-sensitive app settings (whatsapp message template)
-- but keep phone number restricted
DROP POLICY IF EXISTS "Authenticated users can view app settings" ON public.app_settings;
CREATE POLICY "Public can view non-sensitive app settings"
ON public.app_settings
FOR SELECT
USING (
  key NOT IN ('whatsapp_number')
  OR auth.uid() IS NOT NULL
);
