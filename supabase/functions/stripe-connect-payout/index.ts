import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-PAYOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { commission_id } = await req.json();
    if (!commission_id) throw new Error("commission_id is required");

    logStep("Processing payout for commission", { commissionId: commission_id });

    // Get commission details
    const { data: commission, error: commissionError } = await supabaseClient
      .from("partner_commissions")
      .select(`
        *,
        partners:partner_id (
          id,
          company_name,
          stripe_account_id,
          stripe_payouts_enabled
        )
      `)
      .eq("id", commission_id)
      .single();

    if (commissionError || !commission) {
      throw new Error("Commission not found");
    }

    logStep("Commission found", { 
      amount: commission.commission_amount,
      partnerId: commission.partner_id,
      status: commission.status 
    });

    if (commission.status === "paid") {
      throw new Error("Commission already paid");
    }

    if (commission.stripe_transfer_id) {
      throw new Error("Transfer already processed");
    }

    const partner = commission.partners;
    if (!partner?.stripe_account_id) {
      throw new Error("Partner has not connected Stripe account");
    }

    if (!partner.stripe_payouts_enabled) {
      throw new Error("Partner payouts not enabled - onboarding incomplete");
    }

    logStep("Partner verified", { 
      companyName: partner.company_name,
      stripeAccountId: partner.stripe_account_id 
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Create transfer to partner's connected account
    const amountInCents = Math.round(commission.commission_amount * 100);
    
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: "usd",
      destination: partner.stripe_account_id,
      metadata: {
        commission_id: commission.id,
        partner_id: partner.id,
        service_title: commission.service_title,
      },
      description: `Commission for: ${commission.service_title}`,
    });

    logStep("Transfer created", { 
      transferId: transfer.id, 
      amount: amountInCents 
    });

    // Update commission record
    const { error: updateError } = await supabaseClient
      .from("partner_commissions")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_transfer_id: transfer.id,
      })
      .eq("id", commission_id);

    if (updateError) {
      logStep("Error updating commission", { error: updateError.message });
      // Transfer was successful, so we log but don't throw
    }

    logStep("Payout completed successfully");

    return new Response(JSON.stringify({ 
      success: true,
      transferId: transfer.id,
      amount: commission.commission_amount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
