import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
  source: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { event, data, webhookUrl } = body;

    console.log(`Zapier webhook triggered: ${event}`, data);

    if (!webhookUrl) {
      // If no webhook URL provided, try to get from settings
      const { data: settings } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "zapier_partner_webhook")
        .single();

      if (!settings?.value) {
        console.log("No Zapier webhook configured, skipping");
        return new Response(
          JSON.stringify({ success: true, message: "No webhook configured" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      body.webhookUrl = settings.value;
    }

    // Prepare the payload for Zapier
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      source: "aurelia_concierge",
    };

    // Send to Zapier webhook
    console.log(`Sending to Zapier: ${body.webhookUrl}`);
    
    const zapierResponse = await fetch(body.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!zapierResponse.ok) {
      console.error(`Zapier webhook failed: ${zapierResponse.status}`);
      throw new Error(`Zapier webhook failed with status ${zapierResponse.status}`);
    }

    console.log("Zapier webhook sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Webhook sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Zapier webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to send webhook";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
