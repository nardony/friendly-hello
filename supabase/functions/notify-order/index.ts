import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    tier_name: string;
    credits: number;
    price: number;
    customer_name: string;
    customer_whatsapp: string;
    customer_email: string;
    invite_link: string | null;
    coupon_code: string | null;
    status: string;
    landing_page_id: string | null;
    created_at: string;
  };
  schema: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: OrderPayload = await req.json();
    console.log('Order notification triggered:', payload);

    // Only process INSERT events
    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Not an INSERT event' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const order = payload.record;
    
    // Get the admin WhatsApp number from the landing page configuration
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let adminWhatsapp = '5548996029392'; // Default admin number

    // Try to get the landing page's configured WhatsApp number
    if (order.landing_page_id) {
      const { data: landingPage } = await supabase
        .from('landing_pages')
        .select('whatsapp_number, title')
        .eq('id', order.landing_page_id)
        .single();

      if (landingPage?.whatsapp_number) {
        adminWhatsapp = landingPage.whatsapp_number;
      }
    }

    // Format price in BRL
    const formattedPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(order.price);

    // Format date
    const orderDate = new Date(order.created_at).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });

    // Build WhatsApp message
    const message = `🛒 *NOVO PEDIDO RECEBIDO!*

📦 *Pacote:* ${order.tier_name}
💳 *Créditos:* ${order.credits.toLocaleString('pt-BR')}
💰 *Valor:* ${formattedPrice}

👤 *Cliente:*
• Nome: ${order.customer_name}
• WhatsApp: ${order.customer_whatsapp}
• Email: ${order.customer_email}

${order.invite_link ? `🔗 *Link de Convite:* ${order.invite_link}` : '⏳ *Link de Convite:* Será enviado depois'}
${order.coupon_code ? `🎫 *Cupom:* ${order.coupon_code}` : ''}

📅 *Data:* ${orderDate}
🆔 *ID:* ${order.id.slice(0, 8)}

_Acesse o painel admin para gerenciar este pedido._`;

    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${adminWhatsapp}?text=${encodedMessage}`;

    console.log('WhatsApp notification URL generated:', whatsappUrl);

    // Store notification info in the response for potential future use
    // (e.g., sending via WhatsApp Business API if configured)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order notification processed',
        whatsapp_url: whatsappUrl,
        admin_number: adminWhatsapp
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing order notification:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
