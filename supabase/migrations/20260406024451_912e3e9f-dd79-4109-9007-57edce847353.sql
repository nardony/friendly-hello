
-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- USER_BALANCES
-- =============================================
CREATE TABLE public.user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balance" ON public.user_balances FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all balances" ON public.user_balances FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all balances" ON public.user_balances FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- BALANCE_TRANSACTIONS
-- =============================================
CREATE TABLE public.balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC NOT NULL,
  description TEXT,
  order_id UUID,
  admin_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.balance_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.balance_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all transactions" ON public.balance_transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- update_user_balance RPC
-- =============================================
CREATE OR REPLACE FUNCTION public.update_user_balance(
  _user_id UUID,
  _amount NUMERIC,
  _type TEXT,
  _description TEXT DEFAULT NULL,
  _order_id UUID DEFAULT NULL,
  _admin_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Upsert balance
  INSERT INTO public.user_balances (user_id, balance, updated_at)
  VALUES (_user_id, CASE WHEN _type = 'credit' THEN _amount ELSE -_amount END, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = user_balances.balance + CASE WHEN _type = 'credit' THEN _amount ELSE -_amount END,
    updated_at = now();

  -- Record transaction
  INSERT INTO public.balance_transactions (user_id, type, amount, description, order_id, admin_id)
  VALUES (_user_id, _type, _amount, _description, _order_id, _admin_id);
END;
$$;

-- =============================================
-- LANDING_PAGES
-- =============================================
CREATE TABLE public.landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'Minha Página',
  settings JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pages" ON public.landing_pages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pages" ON public.landing_pages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pages" ON public.landing_pages FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pages" ON public.landing_pages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Published pages are public" ON public.landing_pages FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage all pages" ON public.landing_pages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  tier_id TEXT,
  tier_name TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  invite_link TEXT,
  coupon_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- =============================================
-- CUSTOMERS
-- =============================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  credits_purchased INTEGER NOT NULL DEFAULT 0,
  purchase_type TEXT NOT NULL DEFAULT 'painel',
  status TEXT NOT NULL DEFAULT 'active',
  landing_page_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  notes TEXT,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customers" ON public.customers FOR SELECT TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can insert their own customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own customers" ON public.customers FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own customers" ON public.customers FOR DELETE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Admins can manage all customers" ON public.customers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- APP_SETTINGS (key-value global settings)
-- =============================================
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read app_settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage app_settings" ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- HOMEPAGE_SETTINGS (key-value for homepage config)
-- =============================================
CREATE TABLE public.homepage_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read homepage_settings" ON public.homepage_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage homepage_settings" ON public.homepage_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- DAILY_RENEWALS
-- =============================================
CREATE TABLE public.daily_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier_name TEXT NOT NULL,
  daily_limit INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_renewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_renewals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own renewals" ON public.daily_renewals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all renewals" ON public.daily_renewals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for user_balances
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_balances;
