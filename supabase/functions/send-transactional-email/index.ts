import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-TRANSACTIONAL-EMAIL] ${step}${detailsStr}`);
};

// Email templates
const templates: Record<string, (data: Record<string, unknown>) => { subject: string; html: string }> = {
  service_request_submitted: (data) => ({
    subject: `Your Request "${data.title}" Has Been Received`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f0f; color: #ffffff; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border-radius: 12px; border: 1px solid #333; }
            .header { padding: 40px 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: 300; letter-spacing: 8px; color: #c9a45c; margin-bottom: 8px; }
            .tagline { font-size: 10px; letter-spacing: 4px; color: #888; text-transform: uppercase; }
            .content { padding: 20px 40px 40px; }
            h2 { color: #c9a45c; font-size: 20px; font-weight: 500; margin-bottom: 16px; }
            p { color: #ccc; line-height: 1.6; margin-bottom: 16px; }
            .highlight { background: rgba(201, 164, 92, 0.1); border-left: 3px solid #c9a45c; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .btn { display: inline-block; background: #c9a45c; color: #000; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; }
            .footer { padding: 20px 40px; border-top: 1px solid #333; text-align: center; }
            .footer p { font-size: 12px; color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AURELIA</div>
              <div class="tagline">Private Concierge</div>
            </div>
            <div class="content">
              <h2>Your Request Has Been Received</h2>
              <p>Dear ${data.name || 'Valued Member'},</p>
              <p>Thank you for submitting your request. Our dedicated concierge team is now reviewing your requirements and will be in touch shortly.</p>
              <div class="highlight">
                <strong style="color: #c9a45c;">Request Details:</strong><br/>
                <span style="color: #fff;">${data.title}</span><br/>
                <span style="color: #888; font-size: 14px;">${data.category} • ${data.priority} Priority</span>
              </div>
              <p>You can track the status of your request in your dashboard.</p>
              <p style="text-align: center; margin-top: 30px;">
                <a href="${data.dashboard_url || 'https://aurelia-privateconcierge.com/dashboard'}" class="btn">View Dashboard</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Aurelia Private Concierge. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  service_request_update: (data) => ({
    subject: `Update on Your Request: ${data.title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f0f; color: #ffffff; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border-radius: 12px; border: 1px solid #333; }
            .header { padding: 40px 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: 300; letter-spacing: 8px; color: #c9a45c; margin-bottom: 8px; }
            .tagline { font-size: 10px; letter-spacing: 4px; color: #888; text-transform: uppercase; }
            .content { padding: 20px 40px 40px; }
            h2 { color: #c9a45c; font-size: 20px; font-weight: 500; margin-bottom: 16px; }
            p { color: #ccc; line-height: 1.6; margin-bottom: 16px; }
            .status-badge { display: inline-block; background: rgba(201, 164, 92, 0.2); color: #c9a45c; padding: 6px 16px; border-radius: 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .update-box { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; margin: 20px 0; }
            .btn { display: inline-block; background: #c9a45c; color: #000; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; }
            .footer { padding: 20px 40px; border-top: 1px solid #333; text-align: center; }
            .footer p { font-size: 12px; color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AURELIA</div>
              <div class="tagline">Private Concierge</div>
            </div>
            <div class="content">
              <h2>${data.update_title || 'Request Update'}</h2>
              <p>Dear ${data.name || 'Valued Member'},</p>
              <p>There's an update on your service request:</p>
              <div class="update-box">
                <p style="margin: 0 0 12px;"><strong style="color: #fff;">${data.title}</strong></p>
                <span class="status-badge">${data.new_status || data.status}</span>
                <p style="margin-top: 16px; margin-bottom: 0;">${data.update_description || ''}</p>
              </div>
              <p style="text-align: center; margin-top: 30px;">
                <a href="${data.dashboard_url || 'https://aurelia-privateconcierge.com/dashboard'}" class="btn">View Details</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Aurelia Private Concierge. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  subscription_confirmed: (data) => ({
    subject: `Welcome to Aurelia ${data.tier} Membership`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f0f; color: #ffffff; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border-radius: 12px; border: 1px solid #333; }
            .header { padding: 40px 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: 300; letter-spacing: 8px; color: #c9a45c; margin-bottom: 8px; }
            .tagline { font-size: 10px; letter-spacing: 4px; color: #888; text-transform: uppercase; }
            .content { padding: 20px 40px 40px; }
            h2 { color: #c9a45c; font-size: 24px; font-weight: 500; margin-bottom: 16px; text-align: center; }
            p { color: #ccc; line-height: 1.6; margin-bottom: 16px; }
            .tier-badge { display: block; width: 120px; height: 120px; margin: 30px auto; border-radius: 50%; background: linear-gradient(135deg, #c9a45c 0%, #8b6914 100%); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 300; color: #000; text-transform: uppercase; letter-spacing: 2px; }
            .features { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; margin: 20px 0; }
            .features li { color: #ccc; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
            .features li:last-child { border-bottom: none; }
            .btn { display: inline-block; background: #c9a45c; color: #000; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; }
            .footer { padding: 20px 40px; border-top: 1px solid #333; text-align: center; }
            .footer p { font-size: 12px; color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AURELIA</div>
              <div class="tagline">Private Concierge</div>
            </div>
            <div class="content">
              <h2>Welcome to ${data.tier} Membership</h2>
              <div class="tier-badge">${(data.tier as string)?.charAt(0) || 'M'}</div>
              <p>Dear ${data.name || 'Valued Member'},</p>
              <p>Your ${data.tier} membership is now active. You now have access to our exclusive concierge services and premium benefits.</p>
              <p>Your dedicated concierge team is ready to assist you with any request, from luxury travel arrangements to exclusive event access.</p>
              <p style="text-align: center; margin-top: 30px;">
                <a href="${data.dashboard_url || 'https://aurelia-privateconcierge.com/dashboard'}" class="btn">Start Exploring</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Aurelia Private Concierge. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  new_message: (data) => ({
    subject: `New Message from Aurelia Concierge`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f0f0f; color: #ffffff; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border-radius: 12px; border: 1px solid #333; }
            .header { padding: 40px 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: 300; letter-spacing: 8px; color: #c9a45c; margin-bottom: 8px; }
            .content { padding: 20px 40px 40px; }
            h2 { color: #c9a45c; font-size: 20px; font-weight: 500; margin-bottom: 16px; }
            p { color: #ccc; line-height: 1.6; margin-bottom: 16px; }
            .message-box { background: rgba(255,255,255,0.05); border-left: 3px solid #c9a45c; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .btn { display: inline-block; background: #c9a45c; color: #000; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; }
            .footer { padding: 20px 40px; border-top: 1px solid #333; text-align: center; }
            .footer p { font-size: 12px; color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AURELIA</div>
            </div>
            <div class="content">
              <h2>New Message</h2>
              <p>Dear ${data.name || 'Valued Member'},</p>
              <p>You have a new message from your concierge:</p>
              <div class="message-box">
                <p style="margin: 0; color: #fff;">${data.message_preview || 'You have a new message waiting for you.'}</p>
              </div>
              <p style="text-align: center; margin-top: 30px;">
                <a href="${data.dashboard_url || 'https://aurelia-privateconcierge.com/dashboard'}" class="btn">View Message</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Aurelia Private Concierge. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { to, template, data, notificationId } = await req.json();
    logStep("Request received", { to, template, notificationId });

    if (!to || !template) {
      throw new Error("Missing required fields: to, template");
    }

    const templateFn = templates[template];
    if (!templateFn) {
      throw new Error(`Unknown template: ${template}`);
    }

    const { subject, html } = templateFn(data || {});
    logStep("Template rendered", { subject });

    const resend = new Resend(resendKey);
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Aurelia Concierge <concierge@aurelia-privateconcierge.com>",
      to: [to],
      subject,
      html,
    });

    if (emailError) {
      logStep("Email send failed", { error: emailError });
      
      // Update notification status if ID provided
      if (notificationId) {
        await supabaseClient
          .from("email_notifications")
          .update({
            status: "failed",
            error_message: emailError.message,
            retry_count: 1,
          })
          .eq("id", notificationId);
      }

      throw emailError;
    }

    logStep("Email sent successfully", { emailId: emailData?.id });

    // Update notification status if ID provided
    if (notificationId) {
      await supabaseClient
        .from("email_notifications")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", notificationId);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailData?.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
