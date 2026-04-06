
-- 1. Enable leaked password protection (already handled via auth config)

-- 2. Restrict app_settings to authenticated users only (protect phone numbers)
DROP POLICY IF EXISTS "Anyone can view app settings" ON public.app_settings;
CREATE POLICY "Authenticated users can view app settings"
ON public.app_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 3. Restrict homepage_settings to authenticated users for sensitive keys, public for non-sensitive
DROP POLICY IF EXISTS "Anyone can view homepage settings" ON public.homepage_settings;
CREATE POLICY "Anyone can view homepage settings"
ON public.homepage_settings
FOR SELECT
USING (
  key NOT IN ('pix_key', 'pix_name') 
  OR auth.uid() IS NOT NULL
);

-- 4. Add admin DELETE policies for profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Add admin policies for user_roles management
CREATE POLICY "Admins can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user roles"
ON public.user_roles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Add admin DELETE for user_balances
CREATE POLICY "Admins can delete balances"
ON public.user_balances
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Add admin policies for balance_transactions corrections
CREATE POLICY "Admins can update transactions"
ON public.balance_transactions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete transactions"
ON public.balance_transactions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
