-- Allow users to insert their own balance record (for initial creation)
CREATE POLICY "Users can insert their own balance"
ON public.user_balances
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own balance (for the RPC function)
CREATE POLICY "Users can update their own balance"
ON public.user_balances
FOR UPDATE
USING (auth.uid() = user_id);

-- Also allow balance_transactions to be inserted by users (for debit transactions from checkout)
CREATE POLICY "Users can insert their own transactions"
ON public.balance_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);