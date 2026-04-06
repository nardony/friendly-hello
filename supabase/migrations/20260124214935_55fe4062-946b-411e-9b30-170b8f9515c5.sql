-- Create user_balances table to track user credits balance
CREATE TABLE public.user_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create balance_transactions table to track all balance changes
CREATE TABLE public.balance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'adjustment')),
  description text,
  order_id uuid REFERENCES public.orders(id),
  admin_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_balances
CREATE POLICY "Users can view their own balance"
ON public.user_balances
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all balances"
ON public.user_balances
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert balances"
ON public.user_balances
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update balances"
ON public.user_balances
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for balance_transactions
CREATE POLICY "Users can view their own transactions"
ON public.balance_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.balance_transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert transactions"
ON public.balance_transactions
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create function to update balance and log transaction
CREATE OR REPLACE FUNCTION public.update_user_balance(
  _user_id uuid,
  _amount numeric,
  _type text,
  _description text DEFAULT NULL,
  _order_id uuid DEFAULT NULL,
  _admin_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update balance
  INSERT INTO user_balances (user_id, balance)
  VALUES (_user_id, CASE WHEN _type = 'debit' THEN -_amount ELSE _amount END)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    balance = user_balances.balance + (CASE WHEN _type = 'debit' THEN -_amount ELSE _amount END),
    updated_at = now();
  
  -- Log transaction
  INSERT INTO balance_transactions (user_id, amount, type, description, order_id, admin_id)
  VALUES (_user_id, _amount, _type, _description, _order_id, _admin_id);
END;
$$;

-- Create trigger to update balance when order status changes to 'approved'
CREATE OR REPLACE FUNCTION public.handle_order_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    PERFORM public.update_user_balance(
      NEW.user_id,
      NEW.credits,
      'credit',
      'Recarga aprovada - ' || NEW.tier_name,
      NEW.id,
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_approved
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_approval();