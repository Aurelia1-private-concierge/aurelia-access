import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const ADMIN_EMAIL = "Tye3to1@outlook.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyAdminRequest {
  type: "contact_form" | "partner_application";
  data: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    companyName?: string;
    contactName?: string;
    website?: string;
    categories?: string[];
    description?: string;
  };
}

const getContactFormHtml = (data: NotifyAdminRequest["data"]) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Georgia', serif; background: #0a0a0a; color: #f5f5f0; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
      .header { text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 30px; margin-bottom: 30px; }
      .logo { font-size: 28px; letter-spacing: 8px; color: #D4AF37; font-weight: 300; }
      .content { line-height: 1.8; color: #c0c0c0; }
      .content h1 { color: #f5f5f0; font-weight: 400; font-size: 24px; }
      .field { margin-bottom: 16px; }
      .field-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
      .field-value { font-size: 16px; color: #f5f5f0; margin-top: 4px; }
      .message-box { background: #1a1a1a; padding: 20px; border-left: 3px solid #D4AF37; margin-top: 20px; }
      .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">AURELIA</div>
        <p style="color: #888; font-size: 12px; letter-spacing: 2px; margin-top: 10px;">NEW CONTACT SUBMISSION</p>
      </div>
      <div class="content">
        <h1>New Contact Form Submission</h1>
        <div class="field">
          <div class="field-label">Name</div>
          <div class="field-value">${data.name || "N/A"}</div>
        </div>
        <div class="field">
          <div class="field-label">Email</div>
          <div class="field-value">${data.email || "N/A"}</div>
        </div>
        ${data.phone ? `
        <div class="field">
          <div class="field-label">Phone</div>
          <div class="field-value">${data.phone}</div>
        </div>
        ` : ''}
        <div class="field">
          <div class="field-label">Message</div>
          <div class="message-box">${data.message || "No message provided"}</div>
        </div>
      </div>
      <div class="footer">
        <p>Submitted via Aurelia Website Contact Form</p>
      </div>
    </div>
  </body>
  </html>
`;

const getPartnerApplicationHtml = (data: NotifyAdminRequest["data"]) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Georgia', serif; background: #0a0a0a; color: #f5f5f0; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
      .header { text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 30px; margin-bottom: 30px; }
      .logo { font-size: 28px; letter-spacing: 8px; color: #D4AF37; font-weight: 300; }
      .content { line-height: 1.8; color: #c0c0c0; }
      .content h1 { color: #f5f5f0; font-weight: 400; font-size: 24px; }
      .field { margin-bottom: 16px; }
      .field-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
      .field-value { font-size: 16px; color: #f5f5f0; margin-top: 4px; }
      .categories { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
      .category-tag { background: rgba(212, 175, 55, 0.2); color: #D4AF37; padding: 6px 12px; font-size: 12px; border-radius: 4px; }
      .description-box { background: #1a1a1a; padding: 20px; border-left: 3px solid #D4AF37; margin-top: 20px; }
      .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #666; }
      .action-button { display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0a0a0a; padding: 14px 32px; text-decoration: none; font-weight: 500; letter-spacing: 2px; margin: 24px 0; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">AURELIA</div>
        <p style="color: #888; font-size: 12px; letter-spacing: 2px; margin-top: 10px;">NEW PARTNER APPLICATION</p>
      </div>
      <div class="content">
        <h1>New Partner Application</h1>
        <div class="field">
          <div class="field-label">Company Name</div>
          <div class="field-value">${data.companyName || "N/A"}</div>
        </div>
        <div class="field">
          <div class="field-label">Contact Name</div>
          <div class="field-value">${data.contactName || "N/A"}</div>
        </div>
        <div class="field">
          <div class="field-label">Email</div>
          <div class="field-value">${data.email || "N/A"}</div>
        </div>
        ${data.phone ? `
        <div class="field">
          <div class="field-label">Phone</div>
          <div class="field-value">${data.phone}</div>
        </div>
        ` : ''}
        ${data.website ? `
        <div class="field">
          <div class="field-label">Website</div>
          <div class="field-value"><a href="${data.website}" style="color: #D4AF37;">${data.website}</a></div>
        </div>
        ` : ''}
        <div class="field">
          <div class="field-label">Service Categories</div>
          <div class="categories">
            ${(data.categories || []).map(cat => `<span class="category-tag">${cat.replace(/_/g, ' ')}</span>`).join('')}
          </div>
        </div>
        ${data.description ? `
        <div class="field">
          <div class="field-label">Company Description</div>
          <div class="description-box">${data.description}</div>
        </div>
        ` : ''}
        <center>
          <a href="https://aurelia-privateconcierge.com/admin" class="action-button">REVIEW IN ADMIN PANEL</a>
        </center>
      </div>
      <div class="footer">
        <p>Submitted via Aurelia Partner Application Form</p>
      </div>
    </div>
  </body>
  </html>
`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: NotifyAdminRequest = await req.json();

    if (!type || !data) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let subject: string;
    let html: string;

    switch (type) {
      case "contact_form":
        subject = `New Contact Form Submission from ${data.name || "Unknown"}`;
        html = getContactFormHtml(data);
        break;
      case "partner_application":
        subject = `New Partner Application: ${data.companyName || "Unknown Company"}`;
        html = getPartnerApplicationHtml(data);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid notification type" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    console.log(`Sending ${type} notification to admin: ${ADMIN_EMAIL}`);

    const emailResponse = await resend.emails.send({
      from: "Aurelia <notifications@aurelia-privateconcierge.com>",
      to: [ADMIN_EMAIL],
      subject: subject,
      html: html,
    });

    console.log("Admin notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending admin notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
