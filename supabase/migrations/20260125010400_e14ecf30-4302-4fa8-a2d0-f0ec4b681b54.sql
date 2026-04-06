-- Criar função para proteger admin principal de ter role removido
CREATE OR REPLACE FUNCTION public.protect_main_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Proteger o admin principal (marcondesgestaotrafego@gmail.com)
  IF OLD.user_id = '1633e23a-6a48-42b7-92cf-21cd3ec33ca4' AND OLD.role = 'admin' THEN
    RAISE EXCEPTION 'Não é permitido remover o role de administrador da conta principal';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para impedir DELETE do role do admin principal
CREATE TRIGGER protect_main_admin_role_delete
BEFORE DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.protect_main_admin_role();

-- Trigger para impedir UPDATE do role do admin principal
CREATE TRIGGER protect_main_admin_role_update
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
WHEN (OLD.user_id = '1633e23a-6a48-42b7-92cf-21cd3ec33ca4' AND OLD.role = 'admin')
EXECUTE FUNCTION public.protect_main_admin_role();

-- Adicionar comentário para documentação
COMMENT ON FUNCTION public.protect_main_admin_role() IS 'Protege o administrador principal (marcondesgestaotrafego@gmail.com) de ter seu role removido ou alterado';