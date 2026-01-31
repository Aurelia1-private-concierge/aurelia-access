import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  to: string;
  subject: string;
  template: "welcome" | "notification" | "custom";
  data?: {
    name?: string;
    message?: string;
    html?: string;
  };
}

// SECURITY: Validate service role authorization
function validateServiceRoleAuth(req: Request): boolean {
  const authHeader = req.headers.get("Authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!authHeader || !serviceRoleKey) {
    console.log("Authorization header or service role key missing");
    return false;
  }
  
  // Accept both "Bearer <key>" format and direct key comparison
  const token = authHeader.replace("Bearer ", "");
  return token === serviceRoleKey;
}

const getEmailTemplate = (template: string, data: EmailRequest["data"]) => {
  const name = data?.name || "Valued Member";
  
  const baseStyles = `
    <style>
      body { font-family: 'Georgia', serif; background: #0a0a0a; color: #f5f5f0; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
      .header { text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 30px; margin-bottom: 30px; }
      .logo { font-size: 28px; letter-spacing: 8px; color: #D4AF37; font-weight: 300; }
      .tagline { color: #888; font-size: 11px; letter-spacing: 3px; margin-top: 8px; text-transform: uppercase; }
      .content { line-height: 1.8; color: #c0c0c0; }
      .content h1 { color: #f5f5f0; font-weight: 400; font-size: 24px; margin-bottom: 20px; }
      .content h2 { color: #D4AF37; font-weight: 400; font-size: 18px; margin-top: 30px; }
      .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #666; }
      .gold { color: #D4AF37; }
      .button { display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0a0a0a; padding: 16px 40px; text-decoration: none; font-weight: 500; letter-spacing: 2px; margin: 24px 0; font-size: 13px; }
      .divider { height: 1px; background: linear-gradient(to right, transparent, #D4AF37, transparent); margin: 30px 0; }
      .highlight-box { background: rgba(212, 175, 55, 0.1); border-left: 3px solid #D4AF37; padding: 20px; margin: 20px 0; }
      .social-links { margin-top: 20px; }
      .social-links a { display: inline-block; margin: 0 8px; color: #888; text-decoration: none; }
    </style>
  `;

  switch (template) {
    case "welcome":
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AURELIA</div>
              <p class="tagline">Private Concierge</p>
            </div>
            <div class="content">
              <h1>Welcome to Aurelia, ${name}</h1>
              <p>Your membership has been activated. You now have access to the world's most exclusive concierge service.</p>
              
              <div class="highlight-box">
                <p style="margin: 0; color: #f5f5f0;"><strong>Your dedicated lifestyle managers are ready.</strong></p>
                <p style="margin: 10px 0 0 0; color: #888;">Available 24/7 across Geneva, London & Singapore.</p>
              </div>

              <h2>What Awaits You</h2>
              <ul style="color: #888; padding-left: 20px; line-height: 2;">
                <li>Private aviation and yacht charters worldwide</li>
                <li>Off-market real estate acquisitions</li>
                <li>Priority access to sold-out events & experiences</li>
                <li>Fine art and collectibles curation</li>
                <li>Bespoke travel experiences designed around you</li>
              </ul>
              
              <div class="divider"></div>
              
              <p>To begin your journey, reach out to <span class="gold">Orla</span>—your AI-powered lifestyle companion, available around the clock.</p>
              
              <center>
                <a href="https://aurelia-privateconcierge.com/dashboard" class="button">ACCESS YOUR DASHBOARD</a>
              </center>
              
              <p style="font-size: 13px; color: #666; text-align: center; margin-top: 30px;">
                Questions? Simply reply to this email or contact your dedicated concierge.
              </p>
            </div>
            <div class="footer">
              <p style="color: #D4AF37; margin-bottom: 15px;">AURELIA</p>
              <p>Geneva &bull; London &bull; Singapore</p>
              <p style="color: #444; margin-top: 15px;">This email was sent to you as a registered member of Aurelia Private Concierge.</p>
              <p style="color: #444;">© 2026 Aurelia Holdings Ltd. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "waitlist_confirmation":
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AURELIA</div>
              <p class="tagline">Private Concierge</p>
            </div>
            <div class="content">
              <h1>You're on the List, ${name}</h1>
              <p>Welcome to an exclusive circle of individuals who expect nothing less than extraordinary.</p>
              
              <div class="highlight-box">
                <p style="margin: 0; color: #f5f5f0;"><strong>What happens next?</strong></p>
                <p style="margin: 10px 0 0 0; color: #888;">You'll be among the first to know when Aurelia launches. Founding members receive exclusive benefits that will never be offered again.</p>
              </div>

              <h2>Founding Member Benefits</h2>
              <ul style="color: #888; padding-left: 20px; line-height: 2;">
                <li><strong style="color: #D4AF37;">Priority Access</strong> — Be first to experience our services</li>
                <li><strong style="color: #D4AF37;">Waived Initiation</strong> — £15,000 initiation fee waived</li>
                <li><strong style="color: #D4AF37;">Preferential Rates</strong> — Locked-in founding member pricing</li>
                <li><strong style="color: #D4AF37;">VIP Onboarding</strong> — Personal concierge introduction</li>
              </ul>
              
              <div class="divider"></div>
              
              <p style="text-align: center;">Share Aurelia with others who belong in this circle:</p>
              
              <center>
                <a href="https://aurelia-privateconcierge.com/?ref=waitlist" class="button">SHARE THE WAITLIST</a>
              </center>
            </div>
            <div class="footer">
              <p style="color: #D4AF37; margin-bottom: 15px;">AURELIA</p>
              <p>Geneva &bull; London &bull; Singapore</p>
              <p style="color: #444; margin-top: 15px;">© 2026 Aurelia Holdings Ltd. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "launch_notification":
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AURELIA</div>
              <p class="tagline">Private Concierge</p>
            </div>
            <div class="content">
              <h1>The Wait Is Over</h1>
              <p>Dear ${name},</p>
              <p>Aurelia Private Concierge is now live. As a founding member of our waitlist, you have priority access to activate your membership.</p>
              
              <div class="highlight-box">
                <p style="margin: 0; color: #f5f5f0;"><strong>Your exclusive benefits are waiting:</strong></p>
                <ul style="margin: 15px 0 0 0; padding-left: 20px; color: #888;">
                  <li>Initiation fee waived (valued at £15,000)</li>
                  <li>Founding member rates locked for life</li>
                  <li>Priority concierge allocation</li>
                </ul>
              </div>

              <center>
                <a href="https://aurelia-privateconcierge.com/auth" class="button">ACTIVATE MEMBERSHIP</a>
              </center>
              
              <div class="divider"></div>
              
              <p style="font-size: 13px; color: #666;">This offer is available for the next 7 days. After that, standard membership terms will apply.</p>
            </div>
            <div class="footer">
              <p style="color: #D4AF37; margin-bottom: 15px;">AURELIA</p>
              <p>Geneva &bull; London &bull; Singapore</p>
              <p style="color: #444; margin-top: 15px;">© 2026 Aurelia Holdings Ltd. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "notification":
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AURELIA</div>
              <p class="tagline">Private Concierge</p>
            </div>
            <div class="content">
              <h1>Notification</h1>
              <p>Dear ${name},</p>
              <p>${data?.message || "You have a new notification from Aurelia."}</p>
              <center>
                <a href="https://aurelia-privateconcierge.com/dashboard" class="button">VIEW DETAILS</a>
              </center>
            </div>
            <div class="footer">
              <p style="color: #D4AF37; margin-bottom: 15px;">AURELIA</p>
              <p>Geneva &bull; London &bull; Singapore</p>
              <p style="color: #444; margin-top: 15px;">© 2026 Aurelia Holdings Ltd. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "custom":
      return data?.html || "";

    default:
      return "";
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // SECURITY: Require service role authorization to prevent unauthorized email sending
  if (!validateServiceRoleAuth(req)) {
    console.log("Unauthorized email request rejected - invalid or missing service role key");
    return new Response(
      JSON.stringify({ error: "Unauthorized - service role authentication required" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { to, subject, template, data }: EmailRequest = await req.json();

    if (!to || !subject || !template) {
      console.error("Missing required fields:", { to, subject, template });
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, template" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const html = getEmailTemplate(template, data);

    console.log(`Sending ${template} email to ${to}`);

    const emailResponse = await resend.emails.send({
      from: "Aurelia <concierge@aurelia-privateconcierge.com>",
      to: [to],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
