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

// Whitelist of allowed webhook domains for SSRF prevention
const ALLOWED_WEBHOOK_DOMAINS = [
  "hooks.zapier.com",
  "hooks.zapier.app",
];

function isAllowedWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Must be HTTPS
    if (parsed.protocol !== "https:") {
      console.log(`Rejected URL: protocol must be https, got ${parsed.protocol}`);
      return false;
    }
    
    // Must match allowed domains
    const isAllowed = ALLOWED_WEBHOOK_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowed) {
      console.log(`Rejected URL: hostname ${parsed.hostname} not in allowed list`);
    }
    
    return isAllowed;
  } catch (error) {
    console.log(`Rejected URL: invalid URL format - ${error}`);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // SECURITY: Verify admin role before allowing webhook operations
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("Zapier webhook rejected: No authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log("Zapier webhook rejected: Invalid authentication", authError);
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role - only admins can trigger webhooks
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      console.log(`Zapier webhook rejected: User ${user.id} is not admin`);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { event, data, webhookUrl } = body;

    console.log(`Zapier webhook triggered by admin ${user.id}: ${event}`, data);

    let finalWebhookUrl = webhookUrl;

    if (!finalWebhookUrl) {
      // If no webhook URL provided, get from settings
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

      finalWebhookUrl = settings.value;
    }

    // SECURITY: Validate webhook URL against whitelist to prevent SSRF
    if (!isAllowedWebhookUrl(finalWebhookUrl)) {
      console.error(`SSRF attempt blocked: ${finalWebhookUrl}`);
      return new Response(
        JSON.stringify({ error: "Invalid webhook URL. Only Zapier webhooks (https://hooks.zapier.com) are allowed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare the payload for Zapier
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      source: "aurelia_concierge",
    };

    // Send to Zapier webhook
    console.log(`Sending to Zapier: ${finalWebhookUrl}`);
    
    const zapierResponse = await fetch(finalWebhookUrl, {
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
