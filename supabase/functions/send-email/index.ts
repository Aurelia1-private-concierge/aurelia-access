import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

const getEmailTemplate = (template: string, data: EmailRequest["data"]) => {
  const name = data?.name || "Valued Member";
  
  const baseStyles = `
    <style>
      body { font-family: 'Georgia', serif; background: #0a0a0a; color: #f5f5f0; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
      .header { text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 30px; margin-bottom: 30px; }
      .logo { font-size: 28px; letter-spacing: 8px; color: #D4AF37; font-weight: 300; }
      .content { line-height: 1.8; color: #c0c0c0; }
      .content h1 { color: #f5f5f0; font-weight: 400; font-size: 24px; }
      .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #666; }
      .gold { color: #D4AF37; }
      .button { display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0a0a0a; padding: 14px 32px; text-decoration: none; font-weight: 500; letter-spacing: 1px; margin: 20px 0; }
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
              <p style="color: #888; font-size: 12px; letter-spacing: 2px; margin-top: 10px;">PRIVATE CONCIERGE</p>
            </div>
            <div class="content">
              <h1>Welcome to Aurelia, ${name}</h1>
              <p>Your membership has been activated. You now have access to the world's most exclusive concierge service.</p>
              <p>Our team of dedicated lifestyle managers is ready to assist you with:</p>
              <ul style="color: #888; padding-left: 20px;">
                <li>Private aviation and yacht charters</li>
                <li>Exclusive real estate acquisitions</li>
                <li>Priority access to sold-out events</li>
                <li>Bespoke travel experiences worldwide</li>
                <li>24/7 personal concierge support</li>
              </ul>
              <p>To begin, simply reach out to <span class="gold">Orla</span>, your AI-powered lifestyle companion, available around the clock.</p>
              <center>
                <a href="https://aurelia-privateconcierge.com/dashboard" class="button">ACCESS YOUR DASHBOARD</a>
              </center>
            </div>
            <div class="footer">
              <p>Aurelia Holdings Ltd. &bull; Geneva &bull; London &bull; Singapore</p>
              <p style="color: #444;">This email was sent to you as a registered member of Aurelia Private Concierge.</p>
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
              <p>Aurelia Holdings Ltd. &bull; Geneva &bull; London &bull; Singapore</p>
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
