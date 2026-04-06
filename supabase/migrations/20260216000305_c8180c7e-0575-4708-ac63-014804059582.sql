
-- Create customers table for tracking buyers
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  credits_purchased INTEGER NOT NULL DEFAULT 0,
  purchase_type TEXT NOT NULL DEFAULT 'painel' CHECK (purchase_type IN ('painel', 'creditos')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  notes TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS policies - only admins can manage customers
CREATE POLICY "Admins can view all customers"
ON public.customers FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert customers"
ON public.customers FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update customers"
ON public.customers FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete customers"
ON public.customers FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Page owners can view customers from their pages
CREATE POLICY "Page owners can view their page customers"
ON public.customers FOR SELECT
USING (landing_page_id IN (
  SELECT id FROM landing_pages WHERE user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create customer from approved order
CREATE OR REPLACE FUNCTION public.handle_customer_from_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When order is approved, auto-create customer record if not exists
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO public.customers (name, whatsapp, email, credits_purchased, purchase_type, status, landing_page_id, order_id, created_by, purchased_at)
    VALUES (
      NEW.customer_name,
      NEW.customer_whatsapp,
      NEW.customer_email,
      NEW.credits,
      'creditos',
      'active',
      NEW.landing_page_id,
      NEW.id,
      COALESCE(NEW.user_id, '00000000-0000-0000-0000-000000000000'::uuid),
      NEW.created_at
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-create customer on order approval
CREATE TRIGGER create_customer_on_order_approval
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_customer_from_order();
