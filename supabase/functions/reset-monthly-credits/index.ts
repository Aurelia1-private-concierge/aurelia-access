import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tier credit allocations - must match membership-tiers.ts
const TIER_CREDITS: Record<string, number> = {
  // Silver tier products (monthly & annual)
  "prod_TkuyLghfj6iAvD": 5,
  "prod_TkuyMbYydw2D3z": 5,
  // Gold tier products (monthly & annual)
  "prod_TkuyEsqqaYVkqj": 15,
  "prod_Tkuy4Hr5m0YSCZ": 15,
  // Platinum tier products (monthly & annual) - unlimited
  "prod_TkuzCZQ1Wyg24N": 999,
  "prod_Tkv18can27J3JZ": 999,
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RESET-MONTHLY-CREDITS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    logStep("ERROR: Missing STRIPE_SECRET_KEY");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-01-27.acacia" });
  
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Starting monthly credit reset");

    // Get all users with credits
    const { data: usersWithCredits, error: fetchError } = await supabaseClient
      .from("user_credits")
      .select("user_id, balance, monthly_allocation");

    if (fetchError) throw fetchError;

    if (!usersWithCredits || usersWithCredits.length === 0) {
      logStep("No users with credits found");
      return new Response(JSON.stringify({ message: "No users to process" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found users with credits", { count: usersWithCredits.length });

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const userCredits of usersWithCredits) {
      try {
        // Get user email from auth
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(
          userCredits.user_id
        );

        if (userError || !userData?.user?.email) {
          logStep("Could not get user email", { userId: userCredits.user_id });
          skipped++;
          continue;
        }

        const userEmail = userData.user.email;

        // Check if user has active Stripe subscription
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        
        if (customers.data.length === 0) {
          logStep("No Stripe customer found", { userId: userCredits.user_id });
          skipped++;
          continue;
        }

        const customerId = customers.data[0].id;

        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length === 0) {
          logStep("No active subscription", { userId: userCredits.user_id });
          skipped++;
          continue;
        }

        const subscription = subscriptions.data[0];
        const productId = subscription.items.data[0]?.price.product as string;
        const monthlyCredits = TIER_CREDITS[productId] || 0;

        if (monthlyCredits === 0) {
          logStep("Unknown product ID", { userId: userCredits.user_id, productId });
          skipped++;
          continue;
        }

        // Reset credits to monthly allocation
        const { error: updateError } = await supabaseClient
          .from("user_credits")
          .update({
            balance: monthlyCredits,
            monthly_allocation: monthlyCredits,
            last_allocation_at: new Date().toISOString(),
          })
          .eq("user_id", userCredits.user_id);

        if (updateError) throw updateError;

        // Record the allocation transaction
        await supabaseClient.from("credit_transactions").insert({
          user_id: userCredits.user_id,
          amount: monthlyCredits,
          transaction_type: "allocation",
          description: "Monthly credit allocation reset",
          balance_after: monthlyCredits,
        });

        // Create notification
        await supabaseClient.from("notifications").insert({
          user_id: userCredits.user_id,
          type: "credit_allocation",
          title: "Monthly Credits Refreshed",
          description: `Your monthly allocation of ${monthlyCredits === 999 ? "unlimited" : monthlyCredits} credits has been applied.`,
          action_url: "/dashboard",
        });

        logStep("Reset credits for user", {
          userId: userCredits.user_id,
          previousBalance: userCredits.balance,
          newBalance: monthlyCredits,
        });

        processed++;
      } catch (userError) {
        const errorMessage = userError instanceof Error ? userError.message : String(userError);
        logStep("Error processing user", { userId: userCredits.user_id, error: errorMessage });
        errors++;
      }
    }

    logStep("Monthly credit reset completed", { processed, skipped, errors });

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        skipped,
        errors,
        message: `Reset credits for ${processed} users`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
