-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create function to notify admin via edge function when order is created
CREATE OR REPLACE FUNCTION public.notify_order_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  edge_function_url text;
  payload jsonb;
BEGIN
  -- Build the edge function URL
  edge_function_url := 'https://flanziflwdvhrxoiaovp.supabase.co/functions/v1/notify-order';
  
  -- Build the payload matching webhook format
  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', 'orders',
    'schema', 'public',
    'record', jsonb_build_object(
      'id', NEW.id,
      'tier_name', NEW.tier_name,
      'credits', NEW.credits,
      'price', NEW.price,
      'customer_name', NEW.customer_name,
      'customer_whatsapp', NEW.customer_whatsapp,
      'customer_email', NEW.customer_email,
      'invite_link', NEW.invite_link,
      'coupon_code', NEW.coupon_code,
      'status', NEW.status,
      'landing_page_id', NEW.landing_page_id,
      'created_at', NEW.created_at
    )
  );

  -- Call edge function asynchronously
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYW56aWZsd2R2aHJ4b2lhb3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODY3MjIsImV4cCI6MjA4NDc2MjcyMn0.9u1Zx2LNn--BM9DHcw4WPtQWW3nb1vidmJ-IJZzrd38'
    ),
    body := payload
  );

  RETURN NEW;
END;
$$;

-- Create trigger to run after order is inserted
DROP TRIGGER IF EXISTS on_order_created ON public.orders;
CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_created();