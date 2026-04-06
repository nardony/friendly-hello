-- Allow admins to view ALL landing pages (including drafts from other users)
CREATE POLICY "Admins can view all landing pages"
ON public.landing_pages
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update all landing pages
CREATE POLICY "Admins can update all landing pages"
ON public.landing_pages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));