
-- Forçar RLS em todas as tabelas (caso alguma não tenha)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;

-- Revogar acesso direto do anon a tabelas sensíveis
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.balance_transactions FROM anon;
REVOKE ALL ON public.user_balances FROM anon;

-- Garantir que anon só pode SELECT em app_settings e homepage_settings (não INSERT/UPDATE/DELETE)
REVOKE INSERT, UPDATE, DELETE ON public.app_settings FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.homepage_settings FROM anon;

-- Remover permissão de anon inserir orders sem autenticação (manter apenas authenticated)
REVOKE INSERT ON public.orders FROM anon;

-- Criar política para orders: anon pode apenas inserir pedidos (checkout público usa service role via edge function)
-- Usuários autenticados veem apenas seus próprios pedidos
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

-- Admins podem ver todos os pedidos
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem atualizar pedidos
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Proteger user_balances: usuário vê apenas seu próprio saldo
DROP POLICY IF EXISTS "Users can view own balance" ON public.user_balances;
CREATE POLICY "Users can view own balance"
ON public.user_balances FOR SELECT
USING (auth.uid() = user_id);

-- Proteger balance_transactions: usuário vê apenas suas transações
DROP POLICY IF EXISTS "Users can view own transactions" ON public.balance_transactions;
CREATE POLICY "Users can view own transactions"
ON public.balance_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Admins podem ver todas as transações
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.balance_transactions;
CREATE POLICY "Admins can view all transactions"
ON public.balance_transactions FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem ver todos os saldos
DROP POLICY IF EXISTS "Admins can view all balances" ON public.user_balances;
CREATE POLICY "Admins can view all balances"
ON public.user_balances FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
