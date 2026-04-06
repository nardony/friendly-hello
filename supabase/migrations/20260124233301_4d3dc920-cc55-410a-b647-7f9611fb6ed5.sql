-- Allow landing page owners to update orders for their pages
CREATE POLICY "Page owners can update their page orders"
ON public.orders
FOR UPDATE
USING (
  landing_page_id IN (
    SELECT id FROM public.landing_pages WHERE user_id = auth.uid()
  )
);