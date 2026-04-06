-- Adicionar política para admins poderem excluir landing pages
CREATE POLICY "Admins can delete landing pages" 
ON public.landing_pages 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));