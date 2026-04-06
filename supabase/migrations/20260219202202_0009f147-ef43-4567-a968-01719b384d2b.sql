
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can delete homepage settings" ON public.homepage_settings;
DROP POLICY IF EXISTS "Admins can insert homepage settings" ON public.homepage_settings;
DROP POLICY IF EXISTS "Admins can update homepage settings" ON public.homepage_settings;
DROP POLICY IF EXISTS "Anyone can view homepage settings" ON public.homepage_settings;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Admins can delete homepage settings"
ON public.homepage_settings FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert homepage settings"
ON public.homepage_settings FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update homepage settings"
ON public.homepage_settings FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view homepage settings"
ON public.homepage_settings FOR SELECT
USING ((key <> ALL (ARRAY['pix_key'::text, 'pix_name'::text])) OR (auth.uid() IS NOT NULL));
