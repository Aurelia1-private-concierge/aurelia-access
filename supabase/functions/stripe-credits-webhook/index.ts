import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CREDITS-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

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
    logStep("Webhook received");
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified", { eventType: event.type });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        logStep("Webhook signature verification failed", { error: message });
        return new Response(JSON.stringify({ error: `Webhook Error: ${message}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    } else {
      // For testing without webhook secret
      event = JSON.parse(body);
      logStep("Webhook parsed without signature verification", { eventType: event.type });
    }

    // Handle the checkout.session.completed event for credit purchases
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      logStep("Processing checkout session", { 
        sessionId: session.id, 
        metadata: session.metadata 
      });

      // Check if this is a credit purchase
      if (session.metadata?.type === "credit_purchase") {
        const userId = session.metadata.user_id;
        const credits = parseInt(session.metadata.credits, 10);
        const packageName = session.metadata.package_name;

        if (!userId || isNaN(credits)) {
          logStep("Invalid credit purchase metadata", { userId, credits });
          return new Response(JSON.stringify({ error: "Invalid metadata" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }

        logStep("Fulfilling credit purchase", { userId, credits, packageName });

        // Get current credit balance
        const { data: currentCredits, error: fetchError } = await supabaseClient
          .from("user_credits")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        let newBalance: number;

        if (currentCredits) {
          newBalance = currentCredits.balance + credits;
          const { error: updateError } = await supabaseClient
            .from("user_credits")
            .update({ balance: newBalance })
            .eq("user_id", userId);

          if (updateError) throw updateError;
          logStep("Updated existing credits", { 
            previousBalance: currentCredits.balance, 
            newBalance 
          });
        } else {
          newBalance = credits;
          const { error: insertError } = await supabaseClient
            .from("user_credits")
            .insert({
              user_id: userId,
              balance: credits,
              monthly_allocation: 0,
            });

          if (insertError) throw insertError;
          logStep("Created new credits record", { newBalance });
        }

        // Record the transaction
        const { error: txError } = await supabaseClient
          .from("credit_transactions")
          .insert({
            user_id: userId,
            amount: credits,
            transaction_type: "purchase",
            description: `Purchased ${packageName} - ${credits} credits`,
            balance_after: newBalance,
          });

        if (txError) {
          logStep("Warning: Failed to record transaction", { error: txError.message });
        }

        // Create a notification for the user
        await supabaseClient
          .from("notifications")
          .insert({
            user_id: userId,
            type: "credit_purchase",
            title: "Credits Added",
            description: `${credits} credits have been added to your account from your ${packageName} purchase.`,
            action_url: "/dashboard",
          });

        logStep("Credit purchase fulfilled successfully", { 
          userId, 
          credits, 
          newBalance,
          sessionId: session.id 
        });
      }
    }

    // Handle payment_intent.payment_failed for failed credit purchases
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      logStep("Payment failed", { 
        paymentIntentId: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message 
      });
    }

    return new Response(JSON.stringify({ received: true }), {
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
