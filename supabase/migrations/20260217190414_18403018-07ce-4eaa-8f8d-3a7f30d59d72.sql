
-- Trigger para proteger as chaves PIX no homepage_settings
CREATE OR REPLACE FUNCTION public.protect_pix_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Proteger pix_key
  IF OLD.key = 'pix_key' AND NEW.value IS DISTINCT FROM OLD.value THEN
    RAISE EXCEPTION 'Não é permitido alterar a chave PIX protegida';
  END IF;
  
  -- Proteger pix_name
  IF OLD.key = 'pix_name' AND NEW.value IS DISTINCT FROM OLD.value THEN
    RAISE EXCEPTION 'Não é permitido alterar o nome PIX protegido';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_pix_settings_trigger
BEFORE UPDATE ON public.homepage_settings
FOR EACH ROW
EXECUTE FUNCTION public.protect_pix_settings();

-- Trigger para proteger campos PIX nas landing_pages
CREATE OR REPLACE FUNCTION public.protect_landing_page_pix()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Impedir alteração de donation_pix_key
  IF NEW.donation_pix_key IS DISTINCT FROM OLD.donation_pix_key THEN
    NEW.donation_pix_key := OLD.donation_pix_key;
  END IF;
  
  -- Impedir alteração de donation_pix_name  
  IF NEW.donation_pix_name IS DISTINCT FROM OLD.donation_pix_name THEN
    NEW.donation_pix_name := OLD.donation_pix_name;
  END IF;
  
  -- Impedir alteração de pix_key
  IF NEW.pix_key IS DISTINCT FROM OLD.pix_key THEN
    NEW.pix_key := OLD.pix_key;
  END IF;
  
  -- Impedir alteração de pix_name
  IF NEW.pix_name IS DISTINCT FROM OLD.pix_name THEN
    NEW.pix_name := OLD.pix_name;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_landing_page_pix_trigger
BEFORE UPDATE ON public.landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.protect_landing_page_pix();

-- Impedir exclusão das configurações PIX do homepage_settings
CREATE OR REPLACE FUNCTION public.protect_pix_settings_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.key IN ('pix_key', 'pix_name', 'whatsapp_number') THEN
    RAISE EXCEPTION 'Não é permitido excluir configurações PIX protegidas';
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER protect_pix_settings_delete_trigger
BEFORE DELETE ON public.homepage_settings
FOR EACH ROW
EXECUTE FUNCTION public.protect_pix_settings_delete();
