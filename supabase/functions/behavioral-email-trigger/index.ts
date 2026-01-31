import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface BehavioralTrigger {
  id: string;
  email: string;
  trigger_type: string;
  trigger_data: Record<string, unknown>;
  status: string;
}

const EMAIL_TEMPLATES: Record<string, {
  subject: string;
  getHtml: (data: Record<string, unknown>) => string;
}> = {
  abandoned_trial: {
    subject: "Complete Your Aurelia Application – Priority Access Awaits",
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafafa;">
        <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Your Application is Waiting</h1>
          <p style="color: #666; line-height: 1.8;">
            We noticed you started your Aurelia trial application but didn't complete it. 
            Your priority access spot is still reserved.
          </p>
          <p style="color: #666; line-height: 1.8;">
            Complete your application today and unlock:
          </p>
          <ul style="color: #666; line-height: 1.8;">
            <li>7-day complimentary trial</li>
            <li>Personal concierge consultation</li>
            <li>Founding member pricing</li>
          </ul>
          <a href="https://aureliaprivateconcierge.lovable.app/apply" 
             style="display: inline-block; background: #D4AF37; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">
            Complete Application
          </a>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">
            Questions? Reply to this email or contact concierge@aurelia.com
          </p>
        </div>
      </body>
      </html>
    `
  },
  pricing_reminder: {
    subject: "Questions About Aurelia Membership? Let's Talk",
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafafa;">
        <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Considering Aurelia?</h1>
          <p style="color: #666; line-height: 1.8;">
            We noticed you've been exploring our membership options. If you have any questions 
            about which tier would best suit your lifestyle, we'd love to help.
          </p>
          <p style="color: #666; line-height: 1.8;">
            Schedule a complimentary consultation with our membership team to discuss:
          </p>
          <ul style="color: #666; line-height: 1.8;">
            <li>Your specific concierge needs</li>
            <li>Customized membership recommendations</li>
            <li>Exclusive founding member benefits</li>
          </ul>
          <a href="https://aureliaprivateconcierge.lovable.app/contact" 
             style="display: inline-block; background: #D4AF37; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">
            Schedule Consultation
          </a>
        </div>
      </body>
      </html>
    `
  },
  media_kit_followup: {
    subject: "Following Up on Your Aurelia Media Kit Download",
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafafa;">
        <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Thank You for Your Interest</h1>
          <p style="color: #666; line-height: 1.8;">
            We hope you found our media kit informative. As a luxury brand, we're always 
            interested in meaningful partnerships and collaborations.
          </p>
          <p style="color: #666; line-height: 1.8;">
            If you'd like to discuss partnership opportunities, press inquiries, or have 
            any questions, our team would be delighted to connect.
          </p>
          <a href="https://aureliaprivateconcierge.lovable.app/partners" 
             style="display: inline-block; background: #D4AF37; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">
            Explore Partnership
          </a>
        </div>
      </body>
      </html>
    `
  },
  reactivation_14d: {
    subject: "We Miss You at Aurelia – Here's What's New",
    getHtml: (data) => `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafafa;">
        <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">Your Extraordinary Life Awaits</h1>
          <p style="color: #666; line-height: 1.8;">
            It's been a while since we've seen you. At Aurelia, we've been busy curating 
            new experiences and expanding our exclusive partnerships.
          </p>
          <p style="color: #666; line-height: 1.8;">
            Here's what's new:
          </p>
          <ul style="color: #666; line-height: 1.8;">
            <li>New superyacht charter partnerships in the Mediterranean</li>
            <li>Exclusive access to private art collections</li>
            <li>Enhanced AI concierge capabilities</li>
          </ul>
          <a href="https://aureliaprivateconcierge.lovable.app/discover" 
             style="display: inline-block; background: #D4AF37; color: #1a1a1a; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px;">
            Discover New Experiences
          </a>
        </div>
      </body>
      </html>
    `
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { action, trigger_type, email, trigger_data } = await req.json();

    // Handle different actions
    if (action === "process_queue") {
      // Process pending triggers
      const { data: pendingTriggers, error: fetchError } = await supabase
        .from("behavioral_triggers")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_for", new Date().toISOString())
        .limit(10);

      if (fetchError) throw fetchError;

      const results = [];
      for (const trigger of (pendingTriggers || []) as BehavioralTrigger[]) {
        const template = EMAIL_TEMPLATES[trigger.trigger_type];
        if (!template) {
          console.error(`Unknown trigger type: ${trigger.trigger_type}`);
          continue;
        }

        try {
          await resend.emails.send({
            from: "Aurelia Concierge <concierge@aurelia-privateconcierge.com>",
            to: trigger.email,
            subject: template.subject,
            html: template.getHtml(trigger.trigger_data),
          });

          await supabase
            .from("behavioral_triggers")
            .update({ 
              status: "sent", 
              sent_at: new Date().toISOString() 
            })
            .eq("id", trigger.id);

          results.push({ id: trigger.id, status: "sent" });
        } catch (emailError) {
          console.error(`Failed to send email for trigger ${trigger.id}:`, emailError);
          
          await supabase
            .from("behavioral_triggers")
            .update({ 
              status: "failed", 
              error_message: emailError instanceof Error ? emailError.message : String(emailError)
            })
            .eq("id", trigger.id);

          results.push({ id: trigger.id, status: "failed", error: emailError instanceof Error ? emailError.message : String(emailError) });
        }
      }

      return new Response(
        JSON.stringify({ processed: results.length, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "create_trigger") {
      // Create a new behavioral trigger
      if (!email || !trigger_type) {
        return new Response(
          JSON.stringify({ error: "Email and trigger_type are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if we already have a pending trigger of this type for this email
      const { data: existing } = await supabase
        .from("behavioral_triggers")
        .select("id")
        .eq("email", email)
        .eq("trigger_type", trigger_type)
        .eq("status", "pending")
        .single();

      if (existing) {
        return new Response(
          JSON.stringify({ message: "Trigger already exists", id: existing.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Schedule trigger (default: 2 hours from now)
      const scheduledFor = new Date();
      scheduledFor.setHours(scheduledFor.getHours() + 2);

      const { data: newTrigger, error: insertError } = await supabase
        .from("behavioral_triggers")
        .insert({
          email,
          trigger_type,
          trigger_data: trigger_data || {},
          scheduled_for: scheduledFor.toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ created: true, trigger: newTrigger }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "cancel_trigger") {
      // Cancel a pending trigger (e.g., user completed the action)
      if (!email || !trigger_type) {
        return new Response(
          JSON.stringify({ error: "Email and trigger_type are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: updateError } = await supabase
        .from("behavioral_triggers")
        .update({ status: "cancelled" })
        .eq("email", email)
        .eq("trigger_type", trigger_type)
        .eq("status", "pending");

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ cancelled: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Behavioral email trigger error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
