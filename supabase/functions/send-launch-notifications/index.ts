import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  signupIds: string[];
  message: string;
}

interface NotificationResult {
  sent: number;
  failed: number;
  errors: string[];
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      console.error("Admin check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Access denied. Admin role required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { signupIds, message }: NotificationRequest = await req.json();

    if (!signupIds || signupIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No signup IDs provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${signupIds.length} notifications`);

    // Fetch signups
    const { data: signups, error: fetchError } = await supabase
      .from("launch_signups")
      .select("*")
      .in("id", signupIds);

    if (fetchError) {
      console.error("Error fetching signups:", fetchError);
      throw fetchError;
    }

    const result: NotificationResult = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    // Get Twilio credentials
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    // Get Resend API key for emails
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // Process each signup
    for (const signup of signups || []) {
      try {
        const shouldSendSms = 
          (signup.notification_preference === "sms" || signup.notification_preference === "both") && 
          signup.phone;
        
        const shouldSendEmail = 
          (signup.notification_preference === "email" || signup.notification_preference === "both") && 
          signup.email;

        let smsSuccess = true;
        let emailSuccess = true;

        // Send SMS via Twilio
        if (shouldSendSms && twilioSid && twilioToken && twilioPhone) {
          const fullPhone = `${signup.country_code || "+1"}${signup.phone}`;
          
          try {
            const twilioResponse = await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
              {
                method: "POST",
                headers: {
                  "Authorization": `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  To: fullPhone,
                  From: twilioPhone,
                  Body: message,
                }),
              }
            );

            if (!twilioResponse.ok) {
              const errorData = await twilioResponse.json();
              console.error("Twilio error:", errorData);
              smsSuccess = false;
              result.errors.push(`SMS to ${fullPhone}: ${errorData.message}`);
            } else {
              console.log(`SMS sent to ${fullPhone}`);
            }
          } catch (smsError: unknown) {
            const errorMessage = smsError instanceof Error ? smsError.message : String(smsError);
            console.error("SMS error:", smsError);
            smsSuccess = false;
            result.errors.push(`SMS to ${fullPhone}: ${errorMessage}`);
          }
        } else if (shouldSendSms && (!twilioSid || !twilioToken || !twilioPhone)) {
          console.log("Twilio credentials not configured, skipping SMS");
          result.errors.push("Twilio credentials not configured");
        }

        // Send Email via Resend
        if (shouldSendEmail && resendApiKey) {
          try {
            const emailResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "Aurelia Private Concierge <launch@aurelia-privateconcierge.com>",
                to: [signup.email],
                subject: "Aurelia Private Concierge is Now Live",
                html: `
                  <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #f5f5f5; padding: 40px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <h1 style="color: #D4AF37; font-size: 28px; margin: 0;">Aurelia</h1>
                      <p style="color: #888; font-size: 12px; letter-spacing: 2px;">PRIVATE CONCIERGE</p>
                    </div>
                    <div style="border-top: 1px solid #D4AF37; border-bottom: 1px solid #D4AF37; padding: 30px 0; margin: 20px 0;">
                      <p style="font-size: 16px; line-height: 1.8; color: #e0e0e0;">
                        ${message}
                      </p>
                    </div>
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="https://www.aurelia-privateconcierge.com" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0a0a0f; padding: 15px 40px; text-decoration: none; font-weight: bold; letter-spacing: 1px;">
                        BEGIN YOUR JOURNEY
                      </a>
                    </div>
                    <p style="text-align: center; color: #666; font-size: 12px; margin-top: 40px;">
                      Beyond Concierge
                    </p>
                  </div>
                `,
              }),
            });

            if (!emailResponse.ok) {
              const errorData = await emailResponse.json();
              console.error("Resend error:", errorData);
              emailSuccess = false;
              result.errors.push(`Email to ${signup.email}: ${errorData.message}`);
            } else {
              console.log(`Email sent to ${signup.email}`);
            }
          } catch (emailError: unknown) {
            const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
            console.error("Email error:", emailError);
            emailSuccess = false;
            result.errors.push(`Email to ${signup.email}: ${errorMessage}`);
          }
        } else if (shouldSendEmail && !resendApiKey) {
          console.log("Resend API key not configured, skipping email");
          result.errors.push("Resend API key not configured");
        }

        // Update notification_sent_at if at least one channel succeeded
        if ((shouldSendSms && smsSuccess) || (shouldSendEmail && emailSuccess)) {
          await supabase
            .from("launch_signups")
            .update({ notification_sent_at: new Date().toISOString() })
            .eq("id", signup.id);
          
          result.sent++;
        } else if (shouldSendSms || shouldSendEmail) {
          result.failed++;
        } else {
          // No channels to send to
          result.sent++;
          await supabase
            .from("launch_signups")
            .update({ notification_sent_at: new Date().toISOString() })
            .eq("id", signup.id);
        }
      } catch (signupError: unknown) {
        const errorMessage = signupError instanceof Error ? signupError.message : String(signupError);
        console.error(`Error processing signup ${signup.id}:`, signupError);
        result.failed++;
        result.errors.push(`Signup ${signup.id}: ${errorMessage}`);
      }
    }

    console.log("Notification results:", result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in send-launch-notifications:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
