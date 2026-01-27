import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Map product IDs to tiers
const TIER_MAP: Record<string, string> = {
  "prod_Ts5HAYiH4FXdPJ": "silver",
  "prod_Ts5IziHQ8aBVBk": "silver",
  "prod_Ts5J8xal3xrVGe": "gold",
  "prod_Ts5JJ4lhh13l9m": "gold",
  "prod_Ts5KqzhPH0Zbto": "platinum",
  "prod_Ts5K3NqvPvE4BO": "platinum",
  // Legacy product IDs
  "prod_TkuyLghfj6iAvD": "silver",
  "prod_TkuyMbYydw2D3z": "silver",
  "prod_TkuyEsqqaYVkqj": "gold",
  "prod_Tkuy4Hr5m0YSCZ": "gold",
  "prod_TkuzCZQ1Wyg24N": "platinum",
  "prod_Tkv18can27J3JZ": "platinum",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    // Handle expired/invalid tokens gracefully - return unsubscribed state instead of error
    if (userError) {
      logStep("Auth failed - returning unsubscribed state", { error: userError.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: null,
        subscription_end: null,
        is_trial: false,
        is_paygo: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("No user email - returning unsubscribed state");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: null,
        subscription_end: null,
        is_trial: false,
        is_paygo: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found, checking for active trial or PAYGO");
      
      // Check for active trial
      const { data: trialData } = await supabaseClient
        .from("trial_applications")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .gte("trial_ends_at", new Date().toISOString())
        .single();

      if (trialData) {
        logStep("Active trial found", { trialEnds: trialData.trial_ends_at });
        return new Response(JSON.stringify({ 
          subscribed: true,
          tier: "gold",
          subscription_end: trialData.trial_ends_at,
          is_trial: true,
          trial_ends_at: trialData.trial_ends_at,
          is_paygo: false,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Check for PAYGO user (has credits but no subscription)
      const { data: creditsData } = await supabaseClient
        .from("user_credits")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (creditsData && creditsData.balance > 0) {
        logStep("PAYGO user with credits", { balance: creditsData.balance });
        return new Response(JSON.stringify({ 
          subscribed: true,
          tier: "paygo",
          subscription_end: null,
          is_trial: false,
          is_paygo: true,
          credit_balance: creditsData.balance,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      logStep("No trial or credits found, returning unsubscribed state");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier: null,
        subscription_end: null,
        is_trial: false,
        is_paygo: false,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let tier: string | null = null;
    let subscriptionEnd: string | null = null;
    let productId: string | null = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      productId = subscription.items.data[0].price.product as string;
      
      tier = TIER_MAP[productId] || "member";
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        tier, 
        productId,
        endDate: subscriptionEnd 
      });
    } else {
      // No active subscription - check for PAYGO
      const { data: creditsData } = await supabaseClient
        .from("user_credits")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (creditsData && creditsData.balance > 0) {
        logStep("No subscription but has credits - PAYGO user", { balance: creditsData.balance });
        return new Response(JSON.stringify({ 
          subscribed: true,
          tier: "paygo",
          subscription_end: null,
          is_trial: false,
          is_paygo: true,
          credit_balance: creditsData.balance,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      logStep("No active subscription found");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      tier,
      product_id: productId,
      subscription_end: subscriptionEnd,
      is_trial: false,
      is_paygo: false,
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
