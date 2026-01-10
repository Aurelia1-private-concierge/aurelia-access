import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[FULFILL-CREDITS] ${step}${detailsStr}`);
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

    // This can be called after successful payment to fulfill credits
    // Either from a webhook or directly after confirming payment
    const { userId, credits, sessionId, description } = await req.json();
    
    if (!userId || !credits) {
      throw new Error("Missing userId or credits");
    }
    logStep("Fulfillment request", { userId, credits, sessionId });

    // Get current credit balance
    const { data: currentCredits, error: fetchError } = await supabaseClient
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let newBalance: number;

    if (currentCredits) {
      // Update existing balance
      newBalance = currentCredits.balance + credits;
      const { error: updateError } = await supabaseClient
        .from("user_credits")
        .update({ balance: newBalance })
        .eq("user_id", userId);

      if (updateError) throw updateError;
      logStep("Updated existing credits", { previousBalance: currentCredits.balance, newBalance });
    } else {
      // Create new credits record
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
        description: description || `Purchased ${credits} credits`,
        balance_after: newBalance,
      });

    if (txError) {
      logStep("Warning: Failed to record transaction", { error: txError.message });
    }

    logStep("Credits fulfilled successfully", { userId, credits, newBalance });

    return new Response(JSON.stringify({ 
      success: true, 
      newBalance,
      credits_added: credits 
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