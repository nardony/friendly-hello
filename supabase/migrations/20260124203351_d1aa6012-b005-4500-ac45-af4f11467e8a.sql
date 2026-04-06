-- Add checkout configuration fields to landing_pages
ALTER TABLE public.landing_pages
ADD COLUMN IF NOT EXISTS checkout_show_balance boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_balance_label text DEFAULT 'Seu saldo:',
ADD COLUMN IF NOT EXISTS checkout_security_text text DEFAULT 'Pagamento 100% seguro',
ADD COLUMN IF NOT EXISTS checkout_invite_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_invite_label text DEFAULT 'Link de Convite',
ADD COLUMN IF NOT EXISTS checkout_invite_placeholder text DEFAULT 'https://lovable.dev/invite/...',
ADD COLUMN IF NOT EXISTS checkout_coupon_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS checkout_coupon_label text DEFAULT 'Cupom de Desconto',
ADD COLUMN IF NOT EXISTS checkout_button_text text DEFAULT 'Continuar para Pagamento';