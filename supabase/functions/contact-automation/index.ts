import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  source?: string;
  created_at: string;
}

interface AutomationResult {
  autoResponder: { success: boolean; error?: string };
  adminNotification: { success: boolean; error?: string };
  webhooks: { sent: number; failed: number; details: Array<{ name: string; success: boolean; error?: string }> };
  leadScore: number;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Calculate lead score based on message content
function calculateLeadScore(submission: ContactSubmission): number {
  let score = 50; // Base score
  
  // Phone provided = higher intent
  if (submission.phone) score += 15;
  
  // Message length indicates engagement
  if (submission.message.length > 200) score += 10;
  if (submission.message.length > 500) score += 10;
  
  // High-value keywords
  const highValueKeywords = ['membership', 'private jet', 'yacht', 'investment', 'portfolio', 'estate', 'acquisition'];
  const messageLower = submission.message.toLowerCase();
  highValueKeywords.forEach(keyword => {
    if (messageLower.includes(keyword)) score += 5;
  });
  
  // Urgency indicators
  const urgencyKeywords = ['urgent', 'asap', 'immediately', 'today', 'this week'];
  urgencyKeywords.forEach(keyword => {
    if (messageLower.includes(keyword)) score += 5;
  });
  
  return Math.min(score, 100);
}

// HTML escape for security
const escapeHtml = (text: string | undefined | null): string => {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Send auto-response email to the contact
async function sendAutoResponse(submission: ContactSubmission): Promise<{ success: boolean; error?: string }> {
  try {
    const firstName = submission.name.split(' ')[0];
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; background: #0a0a0a; color: #f5f5f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 30px; margin-bottom: 30px; }
          .logo { font-size: 28px; letter-spacing: 8px; color: #D4AF37; font-weight: 300; }
          .tagline { color: #888; font-size: 11px; letter-spacing: 3px; margin-top: 8px; text-transform: uppercase; }
          .content { line-height: 1.8; color: #c0c0c0; }
          .content h1 { color: #f5f5f0; font-weight: 400; font-size: 24px; margin-bottom: 20px; }
          .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #666; }
          .gold { color: #D4AF37; }
          .highlight-box { background: rgba(212, 175, 55, 0.1); border-left: 3px solid #D4AF37; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0a0a0a; padding: 14px 32px; text-decoration: none; font-weight: 500; letter-spacing: 2px; margin: 24px 0; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">AURELIA</div>
            <p class="tagline">Private Concierge</p>
          </div>
          <div class="content">
            <h1>Thank You, ${escapeHtml(firstName)}</h1>
            <p>We have received your inquiry and appreciate you reaching out to Aurelia Private Concierge.</p>
            
            <div class="highlight-box">
              <p style="margin: 0; color: #f5f5f0;"><strong>What happens next?</strong></p>
              <p style="margin: 10px 0 0 0; color: #888;">A member of our dedicated concierge team will review your message and respond within 24 hours. For urgent matters, please contact us directly via WhatsApp.</p>
            </div>
            
            <p>In the meantime, you may explore our services or speak with <span class="gold">Orla</span>, our AI lifestyle companion, who is available 24/7.</p>
            
            <center>
              <a href="https://aurelia-privateconcierge.com/orla" class="button">SPEAK WITH ORLA</a>
            </center>
            
            <p style="font-size: 13px; color: #666; text-align: center; margin-top: 30px;">
              For immediate assistance: <a href="https://wa.me/+447309935106" style="color: #D4AF37;">+44 730 993 5106</a>
            </p>
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
    
    await resend.emails.send({
      from: "Aurelia <concierge@aurelia-privateconcierge.com>",
      to: [submission.email],
      subject: "Thank you for contacting Aurelia Private Concierge",
      html: html,
    });
    
    console.log(`Auto-response sent to ${submission.email}`);
    return { success: true };
  } catch (error: any) {
    console.error("Auto-response error:", error);
    return { success: false, error: error.message };
  }
}

// Send admin notification
async function sendAdminNotification(submission: ContactSubmission, leadScore: number): Promise<{ success: boolean; error?: string }> {
  try {
    const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL");
    if (!adminEmail) {
      throw new Error("ADMIN_NOTIFICATION_EMAIL not configured");
    }
    
    const priorityBadge = leadScore >= 80 ? "🔥 HIGH PRIORITY" : leadScore >= 60 ? "⭐ MEDIUM PRIORITY" : "📋 STANDARD";
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; background: #0a0a0a; color: #f5f5f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; border-bottom: 1px solid #D4AF37; padding-bottom: 30px; margin-bottom: 30px; }
          .logo { font-size: 28px; letter-spacing: 8px; color: #D4AF37; font-weight: 300; }
          .priority { display: inline-block; padding: 8px 16px; background: ${leadScore >= 80 ? '#ff4444' : leadScore >= 60 ? '#D4AF37' : '#666'}; color: ${leadScore >= 80 ? '#fff' : '#0a0a0a'}; font-size: 12px; letter-spacing: 1px; margin-top: 10px; }
          .content { line-height: 1.8; color: #c0c0c0; }
          .field { margin-bottom: 16px; }
          .field-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
          .field-value { font-size: 16px; color: #f5f5f0; margin-top: 4px; }
          .message-box { background: #1a1a1a; padding: 20px; border-left: 3px solid #D4AF37; margin-top: 20px; white-space: pre-wrap; }
          .score-badge { display: inline-block; padding: 4px 12px; background: #D4AF37; color: #0a0a0a; font-weight: bold; font-size: 14px; border-radius: 4px; }
          .footer { margin-top: 40px; padding-top: 30px; border-top: 1px solid #333; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: #0a0a0a; padding: 14px 32px; text-decoration: none; font-weight: 500; letter-spacing: 2px; margin: 24px 0; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">AURELIA</div>
            <div class="priority">${priorityBadge}</div>
          </div>
          <div class="content">
            <h1 style="color: #f5f5f0; font-weight: 400;">New Contact Submission</h1>
            
            <div class="field">
              <div class="field-label">Lead Score</div>
              <div class="field-value"><span class="score-badge">${leadScore}/100</span></div>
            </div>
            
            <div class="field">
              <div class="field-label">Name</div>
              <div class="field-value">${escapeHtml(submission.name)}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Email</div>
              <div class="field-value"><a href="mailto:${escapeHtml(submission.email)}" style="color: #D4AF37;">${escapeHtml(submission.email)}</a></div>
            </div>
            
            ${submission.phone ? `
            <div class="field">
              <div class="field-label">Phone</div>
              <div class="field-value"><a href="tel:${escapeHtml(submission.phone)}" style="color: #D4AF37;">${escapeHtml(submission.phone)}</a></div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="field-label">Source</div>
              <div class="field-value">${escapeHtml(submission.source) || 'Direct'}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Message</div>
              <div class="message-box">${escapeHtml(submission.message)}</div>
            </div>
            
            <center>
              <a href="https://aurelia-privateconcierge.com/admin" class="button">VIEW IN ADMIN PANEL</a>
            </center>
          </div>
          <div class="footer">
            <p>Auto-response has been sent to the contact.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await resend.emails.send({
      from: "Aurelia <notifications@aurelia-privateconcierge.com>",
      to: [adminEmail],
      subject: `${priorityBadge} | New Contact: ${submission.name}`,
      html: html,
    });
    
    console.log(`Admin notification sent for ${submission.email}`);
    return { success: true };
  } catch (error: any) {
    console.error("Admin notification error:", error);
    return { success: false, error: error.message };
  }
}

// Send to all configured webhooks (n8n, Slack, CRM, etc.)
async function sendToWebhooks(
  supabase: any,
  submission: ContactSubmission,
  leadScore: number
): Promise<{ sent: number; failed: number; details: Array<{ name: string; success: boolean; error?: string }> }> {
  const results: Array<{ name: string; success: boolean; error?: string }> = [];
  
  try {
    // Fetch active webhook endpoints for contact_form events
    const { data: webhooks, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('is_active', true)
      .contains('events', ['contact_form']);
    
    if (error) throw error;
    if (!webhooks || webhooks.length === 0) {
      console.log("No active webhooks configured");
      return { sent: 0, failed: 0, details: [] };
    }
    
    const payload = {
      event: 'contact_form_submission',
      timestamp: new Date().toISOString(),
      data: {
        id: submission.id,
        name: submission.name,
        email: submission.email,
        phone: submission.phone || null,
        message: submission.message,
        source: submission.source || 'direct',
        lead_score: leadScore,
        created_at: submission.created_at,
      }
    };
    
    // Send to each webhook in parallel
    const promises = webhooks.map(async (webhook: any) => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(webhook.headers || {})
        };
        
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log(`Webhook sent to ${webhook.name}`);
        results.push({ name: webhook.name, success: true });
      } catch (error: any) {
        console.error(`Webhook failed for ${webhook.name}:`, error);
        results.push({ name: webhook.name, success: false, error: error.message });
      }
    });
    
    await Promise.all(promises);
    
  } catch (error: any) {
    console.error("Webhook fetch error:", error);
  }
  
  return {
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    details: results,
  };
}

// Log automation event
async function logAutomation(
  supabase: any,
  contactId: string,
  type: string,
  status: string,
  details: any,
  errorMessage?: string
) {
  try {
    await supabase.from('contact_automation_logs').insert({
      contact_id: contactId,
      automation_type: type,
      status,
      details,
      error_message: errorMessage,
    });
  } catch (error) {
    console.error("Failed to log automation:", error);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const submission: ContactSubmission = await req.json();
    
    if (!submission.id || !submission.email || !submission.name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: id, email, name" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing automation for contact: ${submission.id}`);

    // Calculate lead score
    const leadScore = calculateLeadScore(submission);
    console.log(`Lead score: ${leadScore}`);

    // Run all automations in parallel
    const [autoResponderResult, adminNotificationResult, webhookResults] = await Promise.all([
      sendAutoResponse(submission),
      sendAdminNotification(submission, leadScore),
      sendToWebhooks(supabase, submission, leadScore),
    ]);

    // Update contact submission with automation status
    await supabase
      .from('contact_submissions')
      .update({
        lead_score: leadScore,
        auto_response_sent: autoResponderResult.success,
        admin_notified: adminNotificationResult.success,
        webhook_sent: webhookResults.sent > 0,
        processed_at: new Date().toISOString(),
      })
      .eq('id', submission.id);

    // Log each automation
    await Promise.all([
      logAutomation(supabase, submission.id, 'auto_response', autoResponderResult.success ? 'success' : 'failed', autoResponderResult, autoResponderResult.error),
      logAutomation(supabase, submission.id, 'admin_notification', adminNotificationResult.success ? 'success' : 'failed', adminNotificationResult, adminNotificationResult.error),
      logAutomation(supabase, submission.id, 'webhooks', webhookResults.failed === 0 ? 'success' : 'partial', webhookResults),
    ]);

    const result: AutomationResult = {
      autoResponder: autoResponderResult,
      adminNotification: adminNotificationResult,
      webhooks: webhookResults,
      leadScore,
    };

    console.log("Automation complete:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Contact automation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
