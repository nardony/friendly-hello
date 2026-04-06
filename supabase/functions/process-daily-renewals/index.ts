import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all active daily renewals
    const { data: renewals, error: renewalsError } = await supabase
      .from("daily_renewals")
      .select("*")
      .eq("is_active", true);

    if (renewalsError) throw renewalsError;

    if (!renewals || renewals.length === 0) {
      return new Response(JSON.stringify({ message: "No active renewals", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    const errors: string[] = [];

    for (const renewal of renewals) {
      try {
        // Check if already renewed today
        const today = new Date().toISOString().split("T")[0];
        const lastRenewed = renewal.last_renewed_at 
          ? new Date(renewal.last_renewed_at).toISOString().split("T")[0] 
          : null;

        if (lastRenewed === today) {
          continue; // Already renewed today
        }

        // Get current user balance
        const { data: balanceData } = await supabase
          .from("user_balances")
          .select("balance")
          .eq("user_id", renewal.user_id)
          .maybeSingle();

        const currentBalance = balanceData?.balance || 0;

        // Only renew if balance is below the daily limit
        if (currentBalance < renewal.daily_limit) {
          const creditsToAdd = renewal.daily_limit - currentBalance;

          // Add credits using the RPC function
          const { error: balanceError } = await supabase.rpc("update_user_balance", {
            _user_id: renewal.user_id,
            _amount: creditsToAdd,
            _type: "credit",
            _description: `Renovação diária - ${renewal.tier_name} (${renewal.daily_limit.toLocaleString()} créditos)`,
            _order_id: null,
            _admin_id: null,
          });

          if (balanceError) throw balanceError;
        }

        // Update last_renewed_at
        await supabase
          .from("daily_renewals")
          .update({ last_renewed_at: new Date().toISOString() })
          .eq("id", renewal.id);

        processed++;
      } catch (err) {
        errors.push(`User ${renewal.user_id}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Daily renewals processed", 
        processed, 
        total: renewals.length,
        errors: errors.length > 0 ? errors : undefined 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing daily renewals:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
