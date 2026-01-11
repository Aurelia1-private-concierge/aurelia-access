import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT-STATUS] ${step}${detailsStr}`);
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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get partner record
    const { data: partner, error: partnerError } = await supabaseClient
      .from("partners")
      .select("id, stripe_account_id, stripe_onboarding_complete, stripe_payouts_enabled")
      .eq("user_id", user.id)
      .single();

    if (partnerError || !partner) {
      throw new Error("Partner record not found");
    }

    if (!partner.stripe_account_id) {
      return new Response(JSON.stringify({ 
        connected: false,
        onboardingComplete: false,
        payoutsEnabled: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Checking Stripe account status", { accountId: partner.stripe_account_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const account = await stripe.accounts.retrieve(partner.stripe_account_id);

    const onboardingComplete = account.details_submitted ?? false;
    const payoutsEnabled = account.payouts_enabled ?? false;
    const chargesEnabled = account.charges_enabled ?? false;

    logStep("Account status retrieved", { 
      onboardingComplete, 
      payoutsEnabled, 
      chargesEnabled 
    });

    // Update database if status changed
    if (onboardingComplete !== partner.stripe_onboarding_complete || 
        payoutsEnabled !== partner.stripe_payouts_enabled) {
      await supabaseClient
        .from("partners")
        .update({ 
          stripe_onboarding_complete: onboardingComplete,
          stripe_payouts_enabled: payoutsEnabled,
        })
        .eq("id", partner.id);
      
      logStep("Updated partner record with new status");
    }

    return new Response(JSON.stringify({ 
      connected: true,
      accountId: partner.stripe_account_id,
      onboardingComplete,
      payoutsEnabled,
      chargesEnabled,
      requirements: account.requirements,
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
