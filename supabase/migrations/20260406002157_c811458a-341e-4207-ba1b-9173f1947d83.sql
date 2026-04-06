-- Remove the trigger that prevents donation PIX fields from being updated
DROP TRIGGER IF EXISTS protect_landing_page_pix_trigger ON public.landing_pages;

-- Update the function to only protect pix_key and pix_name (checkout PIX), not donation fields
CREATE OR REPLACE FUNCTION public.protect_landing_page_pix()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Protect checkout PIX fields only (not donation fields)
  IF NEW.pix_key IS DISTINCT FROM OLD.pix_key THEN
    NEW.pix_key := OLD.pix_key;
  END IF;
  
  IF NEW.pix_name IS DISTINCT FROM OLD.pix_name THEN
    NEW.pix_name := OLD.pix_name;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Re-create the trigger with updated function
CREATE TRIGGER protect_landing_page_pix_trigger
  BEFORE UPDATE ON public.landing_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_landing_page_pix();