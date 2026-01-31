import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistEntry {
  id: string;
  email: string;
  company_name?: string;
  interest_type: "partner" | "member";
  category_preferences?: string[];
  message?: string;
  created_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("partner-waitlist-notify: Request received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!adminEmail) {
      console.error("ADMIN_NOTIFICATION_EMAIL not configured");
      return new Response(
        JSON.stringify({ error: "Admin email not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const entry: WaitlistEntry = await req.json();
    console.log("partner-waitlist-notify: Processing entry", { 
      email: entry.email, 
      interest_type: entry.interest_type,
      company_name: entry.company_name 
    });

    const resend = new Resend(resendApiKey);

    const isPartner = entry.interest_type === "partner";
    const subjectPrefix = isPartner ? "🤝 New Partner Application" : "📧 New Member Waitlist Signup";
    
    const categoriesHtml = entry.category_preferences?.length 
      ? `<p><strong>Categories of Interest:</strong></p><ul>${entry.category_preferences.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>`
      : '';

    const messageHtml = entry.message 
      ? `<p><strong>Message:</strong></p><p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${escapeHtml(entry.message)}</p>`
      : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #b8860b 0%, #d4a84b 100%); color: white; padding: 24px; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
          .badge-partner { background: #dbeafe; color: #1d4ed8; }
          .badge-member { background: #dcfce7; color: #166534; }
          .detail { margin-bottom: 12px; }
          .detail strong { color: #666; }
          .cta { display: inline-block; background: #b8860b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Aurelia Partner Network</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">${subjectPrefix}</p>
          </div>
          <div class="content">
            <span class="badge ${isPartner ? 'badge-partner' : 'badge-member'}">
              ${isPartner ? '🏢 Partner Application' : '👤 Member Signup'}
            </span>
            
            <div class="detail">
              <strong>Email:</strong> ${escapeHtml(entry.email)}
            </div>
            
            ${entry.company_name ? `<div class="detail"><strong>Company:</strong> ${escapeHtml(entry.company_name)}</div>` : ''}
            
            ${categoriesHtml}
            ${messageHtml}
            
            <div class="detail">
              <strong>Submitted:</strong> ${new Date(entry.created_at).toLocaleString('en-GB', { 
                dateStyle: 'full', 
                timeStyle: 'short' 
              })}
            </div>
            
            <a href="https://aureliaprivateconcierge.lovable.app/admin" class="cta">
              View in Admin Panel →
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: "Aurelia <concierge@aurelia-privateconcierge.com>",
      to: [adminEmail],
      subject: `${subjectPrefix}: ${entry.company_name || entry.email}`,
      html: emailHtml,
    });

    if (error) {
      console.error("partner-waitlist-notify: Resend error", error);
      throw error;
    }

    console.log("partner-waitlist-notify: Email sent successfully", data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("partner-waitlist-notify: Error", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

// HTML escape helper to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

serve(handler);
