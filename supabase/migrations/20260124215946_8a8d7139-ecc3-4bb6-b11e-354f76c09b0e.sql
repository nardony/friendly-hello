-- Update trigger to handle re-approval from cancelled status
CREATE OR REPLACE FUNCTION public.handle_order_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only add credits if changing TO approved from a non-approved status
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Only add if user_id is not null
    IF NEW.user_id IS NOT NULL THEN
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
  RETURN NEW;
END;
$$;