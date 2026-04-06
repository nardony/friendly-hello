-- Update trigger to prevent duplicate credits for the same order
CREATE OR REPLACE FUNCTION public.handle_order_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_credited boolean;
BEGIN
  -- Only process if changing TO approved from a non-approved status
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Only proceed if user_id is not null
    IF NEW.user_id IS NOT NULL THEN
      -- Check if credits were already added for this order
      SELECT EXISTS (
        SELECT 1 FROM balance_transactions 
        WHERE order_id = NEW.id 
        AND type = 'credit'
      ) INTO already_credited;
      
      -- Only add credits if not already credited
      IF NOT already_credited THEN
        PERFORM public.update_user_balance(
          NEW.user_id,
          NEW.credits,
          'credit',
          'Recarga aprovada - ' || NEW.tier_name,
          NEW.id,
          NULL
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;