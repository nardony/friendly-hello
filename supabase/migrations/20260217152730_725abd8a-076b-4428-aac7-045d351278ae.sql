
-- Table to track users with daily credit renewals
CREATE TABLE public.daily_renewals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  daily_limit INTEGER NOT NULL DEFAULT 5000,
  tier_name TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_renewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.daily_renewals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own renewal" ON public.daily_renewals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all renewals" ON public.daily_renewals
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert renewals" ON public.daily_renewals
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update renewals" ON public.daily_renewals
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete renewals" ON public.daily_renewals
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_daily_renewals_updated_at
  BEFORE UPDATE ON public.daily_renewals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create daily renewal when order with daily_renewal is approved
CREATE OR REPLACE FUNCTION public.handle_daily_renewal_from_order()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  _daily_renewal INTEGER;
BEGIN
  -- Only process when changing TO approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.user_id IS NOT NULL THEN
    -- Check if the tier name contains daily renewal info by looking at homepage_settings
    -- We store daily_renewal in the order's tier metadata
    -- For now, we'll check if there's existing renewal config
    -- The edge function / admin will handle setting this up
    NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Enable realtime for daily_renewals
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_renewals;
