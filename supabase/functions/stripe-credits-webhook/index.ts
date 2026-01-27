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

// Map product IDs to monthly credit allocations
const TIER_CREDITS: Record<string, number> = {
  "prod_Ts5HAYiH4FXdPJ": 5,    // Silver Monthly
  "prod_Ts5IziHQ8aBVBk": 5,    // Silver Annual
  "prod_Ts5J8xal3xrVGe": 15,   // Gold Monthly
  "prod_Ts5JJ4lhh13l9m": 15,   // Gold Annual
  "prod_Ts5KqzhPH0Zbto": 999,  // Platinum Monthly (unlimited)
  "prod_Ts5K3NqvPvE4BO": 999,  // Platinum Annual (unlimited)
  // Legacy product IDs
  "prod_TkuyLghfj6iAvD": 5,
  "prod_TkuyMbYydw2D3z": 5,
  "prod_TkuyEsqqaYVkqj": 15,
  "prod_Tkuy4Hr5m0YSCZ": 15,
  "prod_TkuzCZQ1Wyg24N": 999,
  "prod_Tkv18can27J3JZ": 999,
};

const TIER_NAMES: Record<string, string> = {
  "prod_Ts5HAYiH4FXdPJ": "Silver",
  "prod_Ts5IziHQ8aBVBk": "Silver",
  "prod_Ts5J8xal3xrVGe": "Gold",
  "prod_Ts5JJ4lhh13l9m": "Gold",
  "prod_Ts5KqzhPH0Zbto": "Platinum",
  "prod_Ts5K3NqvPvE4BO": "Platinum",
  "prod_TkuyLghfj6iAvD": "Silver",
  "prod_TkuyMbYydw2D3z": "Silver",
  "prod_TkuyEsqqaYVkqj": "Gold",
  "prod_Tkuy4Hr5m0YSCZ": "Gold",
  "prod_TkuzCZQ1Wyg24N": "Platinum",
  "prod_Tkv18can27J3JZ": "Platinum",
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

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });
  
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

    // Handle invoice.paid for subscription credit allocation
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      
      // Only process subscription invoices (not one-time payments)
      if (invoice.subscription && invoice.customer_email) {
        logStep("Processing subscription invoice", { 
          invoiceId: invoice.id,
          email: invoice.customer_email,
          subscriptionId: invoice.subscription
        });

        // Get the subscription to find the product
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const productId = subscription.items.data[0]?.price.product as string;
        
        const credits = TIER_CREDITS[productId];
        const tierName = TIER_NAMES[productId] || "Member";
        
        if (credits) {
          // Find the user by email
          const { data: userData, error: userError } = await supabaseClient.auth.admin
            .listUsers();
          
          if (userError) {
            logStep("Error finding user", { error: userError.message });
          } else {
            const user = userData.users.find(u => u.email === invoice.customer_email);
            
            if (user) {
              // Get current credits
              const { data: currentCredits } = await supabaseClient
                .from("user_credits")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

              let newBalance: number;

              if (currentCredits) {
                newBalance = currentCredits.balance + credits;
                await supabaseClient
                  .from("user_credits")
                  .update({ 
                    balance: newBalance,
                    monthly_allocation: credits,
                  })
                  .eq("user_id", user.id);
              } else {
                newBalance = credits;
                await supabaseClient
                  .from("user_credits")
                  .insert({
                    user_id: user.id,
                    balance: credits,
                    monthly_allocation: credits,
                  });
              }

              // Record the allocation transaction
              await supabaseClient
                .from("credit_transactions")
                .insert({
                  user_id: user.id,
                  amount: credits,
                  transaction_type: "allocation",
                  description: `Monthly ${tierName} membership credit allocation`,
                  balance_after: newBalance,
                });

              // Notify user
              await supabaseClient
                .from("notifications")
                .insert({
                  user_id: user.id,
                  type: "credit_allocation",
                  title: "Monthly Credits Added",
                  description: `Your ${credits === 999 ? "unlimited" : credits} monthly ${tierName} credits have been added to your account.`,
                  action_url: "/dashboard",
                });

              logStep("Monthly credits allocated", { 
                userId: user.id, 
                credits, 
                tierName,
                newBalance 
              });
            }
          }
        }
      }
    }

    // Handle customer.subscription.deleted for cleanup
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      logStep("Subscription cancelled", { 
        subscriptionId: subscription.id,
        customerId 
      });

      // Get customer email
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !customer.deleted && customer.email) {
        // Find user and update their monthly allocation to 0
        const { data: userData } = await supabaseClient.auth.admin.listUsers();
        const user = userData?.users.find(u => u.email === customer.email);
        
        if (user) {
          await supabaseClient
            .from("user_credits")
            .update({ monthly_allocation: 0 })
            .eq("user_id", user.id);

          await supabaseClient
            .from("notifications")
            .insert({
              user_id: user.id,
              type: "subscription_cancelled",
              title: "Subscription Ended",
              description: "Your subscription has ended. You can still use your remaining credits or subscribe again anytime.",
              action_url: "/membership",
            });

          logStep("User subscription cleanup complete", { userId: user.id });
        }
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
