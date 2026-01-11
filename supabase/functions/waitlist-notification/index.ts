import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistRequest {
  email: string;
  feature: string;
  source?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, feature, source = "wearables-hub" }: WaitlistRequest = await req.json();

    if (!email || !feature) {
      return new Response(
        JSON.stringify({ error: "Email and feature are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Store in launch_signups table with feature tag
    const { data, error } = await supabase
      .from("launch_signups")
      .upsert(
        {
          email: email.toLowerCase().trim(),
          source: `${source}:${feature}`,
          notification_preference: "email",
          verified: false,
        },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save to waitlist" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send confirmation email via Resend if configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      try {
        const featureNames: Record<string, string> = {
          carplay: "CarPlay Integration",
          yacht: "Yacht Bridge Controls",
          jet: "Private Jet Cabin",
        };

        const featureDisplay = featureNames[feature] || feature;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "Aurelia <concierge@aurelia-privateconcierge.com>",
            to: [email],
            subject: `You're on the ${featureDisplay} Waitlist`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: 'Georgia', serif; background: #0a0a0a; color: #f5f5f0; margin: 0; padding: 0; }
                  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                  .header { text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 30px; margin-bottom: 30px; }
                  .logo { font-size: 28px; letter-spacing: 8px; color: #D4AF37; font-weight: 300; }
                  .content { line-height: 1.8; color: #c0c0c0; }
                  .gold { color: #D4AF37; }
                  .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #666; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <div class="logo">AURELIA</div>
                    <p style="color: #888; font-size: 12px; letter-spacing: 2px; margin-top: 10px;">PRIVATE CONCIERGE</p>
                  </div>
                  <div class="content">
                    <h1 style="color: #f5f5f0; font-weight: 400; font-size: 24px;">You're on the List</h1>
                    <p>Thank you for your interest in <span class="gold">${featureDisplay}</span>.</p>
                    <p>We're crafting something extraordinary. As a waitlist member, you'll be among the first to experience this new capability when it launches.</p>
                    <p>We'll be in touch soon with exclusive updates.</p>
                    <p style="margin-top: 30px; color: #888;">— The Aurelia Team</p>
                  </div>
                  <div class="footer">
                    <p>Aurelia Holdings Ltd. • Geneva • London • Singapore</p>
                  </div>
                </div>
              </body>
              </html>
            `,
          }),
        });
        console.log("Confirmation email sent to:", email);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the request if email fails
      }
    }

    console.log(`Added ${email} to waitlist for ${feature}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Added to ${feature} waitlist`,
        data,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Waitlist error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
