import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { tierName, credits, price, customerEmail, customerName, customerWhatsapp, landingPageId, bonusCredits, successUrl, cancelUrl } = await req.json();

    if (!tierName || !credits || !price || !customerEmail) {
      throw new Error("Missing required fields");
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: tierName,
              description: `${credits.toLocaleString()} créditos${bonusCredits ? ` + ${bonusCredits.toLocaleString()} bônus` : ""}`,
            },
            unit_amount: Math.round(price * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        tier_name: tierName,
        credits: String(credits),
        bonus_credits: String(bonusCredits || 0),
        customer_name: customerName || "",
        customer_whatsapp: customerWhatsapp || "",
        customer_email: customerEmail,
        landing_page_id: landingPageId || "",
      },
      success_url: successUrl || `${req.headers.get("origin")}/`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
