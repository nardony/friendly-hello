-- Remover a foreign key existente e recriar com ON DELETE CASCADE
ALTER TABLE public.balance_transactions 
DROP CONSTRAINT IF EXISTS balance_transactions_order_id_fkey;

ALTER TABLE public.balance_transactions
ADD CONSTRAINT balance_transactions_order_id_fkey 
FOREIGN KEY (order_id) 
REFERENCES public.orders(id) 
ON DELETE SET NULL;