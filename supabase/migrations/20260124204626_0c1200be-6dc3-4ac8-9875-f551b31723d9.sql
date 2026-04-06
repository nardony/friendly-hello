-- Add checkout WhatsApp message template column
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS checkout_whatsapp_message text DEFAULT '🛒 *NOVO PEDIDO*

📦 *Pacote:* {pacote}
💳 *Créditos:* {creditos}
💰 *Valor:* {valor}

👤 *Cliente:*
• Nome: {nome}
• WhatsApp: {whatsapp}
• Email: {email}

{link_convite}
{cupom}

📅 *Data:* {data}';