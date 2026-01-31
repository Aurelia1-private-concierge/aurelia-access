import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VIPAlertRequest {
  sessionId: string;
  email?: string;
  score: number;
  tier: string;
  breakdown: Record<string, number>;
  alertType: "ultra_high_intent" | "high_intent" | "qualified_lead";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "Tyrone.mitchell76@hotmail.com";
    const resendKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: VIPAlertRequest = await req.json();

    const { sessionId, email, score, tier, breakdown, alertType } = body;

    console.log(`[VIP-ALERT] Processing VIP alert for session ${sessionId}`, {
      score,
      tier,
      alertType,
      hasEmail: !!email,
    });

    // Log to audit
    await supabase.from("audit_logs").insert({
      action: "vip_alert_triggered",
      resource_type: "lead_score",
      resource_id: sessionId,
      details: { score, tier, alertType, email },
    });

    // Get lead score record
    const { data: leadScore } = await supabase
      .from("lead_scores")
      .select("id")
      .eq("session_id", sessionId)
      .single();

    // Create VIP alert record
    const { error: alertError } = await supabase.from("vip_alerts").insert({
      lead_score_id: leadScore?.id || null,
      session_id: sessionId,
      email: email || null,
      score,
      tier,
      signals: breakdown,
      alert_type: alertType,
      status: "new",
    });

    if (alertError) {
      console.error("[VIP-ALERT] Failed to create alert record:", alertError);
    }

    // Send email notification to admin if Resend is configured
    if (resendKey && alertType !== "qualified_lead") {
      const urgency = alertType === "ultra_high_intent" ? "🔥 URGENT" : "⚡ Priority";
      const tierEmoji = tier === "qualified" ? "💎" : tier === "hot" ? "🔥" : "🌡️";
      
      const breakdownHtml = Object.entries(breakdown)
        .map(([key, value]) => `<li><strong>${key.replace(/_/g, " ")}:</strong> +${value} points</li>`)
        .join("");

      const emailHtml = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #ffffff; padding: 40px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">${urgency} VIP Detected</h1>
            <p style="color: #888; margin-top: 10px;">Aurelia Private Concierge</p>
          </div>
          
          <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #D4AF37; margin: 0 0 16px 0; font-size: 20px;">${tierEmoji} Lead Score: ${score}/100</h2>
            <p style="margin: 0; color: #ccc;"><strong>Tier:</strong> ${tier.toUpperCase()}</p>
            ${email ? `<p style="margin: 8px 0 0 0; color: #ccc;"><strong>Email:</strong> ${email}</p>` : ""}
            <p style="margin: 8px 0 0 0; color: #ccc;"><strong>Session:</strong> ${sessionId.substring(0, 20)}...</p>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="color: #D4AF37; margin: 0 0 16px 0;">Score Breakdown</h3>
            <ul style="color: #ccc; padding-left: 20px; margin: 0;">
              ${breakdownHtml}
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://aureliaprivateconcierge.lovable.app/admin?tab=leads" 
               style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #1a1a2e; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              View in Dashboard →
            </a>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated alert from Aurelia's VIP Detection System
          </p>
        </div>
      `;

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Aurelia VIP Alerts <concierge@aurelia-privateconcierge.com>",
            to: [adminEmail],
            subject: `${urgency}: ${tier.toUpperCase()} Lead Detected (Score: ${score})`,
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error("[VIP-ALERT] Email send failed:", errorText);
        } else {
          console.log("[VIP-ALERT] Admin notification email sent successfully");
        }
      } catch (emailError) {
        console.error("[VIP-ALERT] Email error:", emailError);
      }
    }

    // Check for N8N webhook
    const { data: webhookSetting } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "n8n_webhook_vip_alert")
      .single();

    if (webhookSetting?.value) {
      try {
        await fetch(webhookSetting.value, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "vip_detected",
            timestamp: new Date().toISOString(),
            data: {
              sessionId,
              email,
              score,
              tier,
              alertType,
              breakdown,
            },
          }),
        });
        console.log("[VIP-ALERT] N8N webhook triggered");
      } catch (webhookError) {
        console.error("[VIP-ALERT] N8N webhook failed:", webhookError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, alertType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[VIP-ALERT] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});