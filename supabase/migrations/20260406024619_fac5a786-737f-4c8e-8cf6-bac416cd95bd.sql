
ALTER TABLE public.landing_pages
  ADD COLUMN checkout_show_balance BOOLEAN DEFAULT true,
  ADD COLUMN checkout_balance_label TEXT DEFAULT 'Seu saldo:',
  ADD COLUMN checkout_security_text TEXT DEFAULT 'Pagamento 100% seguro',
  ADD COLUMN checkout_invite_enabled BOOLEAN DEFAULT true,
  ADD COLUMN checkout_invite_label TEXT DEFAULT 'Link de Convite',
  ADD COLUMN checkout_invite_placeholder TEXT DEFAULT 'https://lovable.dev/invite/...',
  ADD COLUMN checkout_coupon_enabled BOOLEAN DEFAULT true,
  ADD COLUMN checkout_coupon_label TEXT DEFAULT 'Cupom de Desconto',
  ADD COLUMN checkout_button_text TEXT DEFAULT 'Continuar para Pagamento',
  ADD COLUMN checkout_whatsapp_message TEXT;

ALTER TABLE public.landing_pages
  ALTER COLUMN price_installments TYPE NUMERIC USING price_installments::NUMERIC;
