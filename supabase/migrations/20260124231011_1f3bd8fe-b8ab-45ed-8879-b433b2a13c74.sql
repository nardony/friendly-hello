-- Allow landing page owners to view orders for their pages
CREATE POLICY "Page owners can view their page orders"
ON public.orders
FOR SELECT
USING (
  landing_page_id IN (
    SELECT id FROM public.landing_pages WHERE user_id = auth.uid()
  )
);