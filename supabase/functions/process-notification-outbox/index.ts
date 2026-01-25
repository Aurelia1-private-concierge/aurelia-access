import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Process notification outbox - retry failed notifications and send pending ones
 * This function should be called periodically (e.g., every 5 minutes via cron)
 */
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending and retrying notifications that are due
    const { data: notifications, error: fetchError } = await supabase
      .from("notification_outbox")
      .select("*, partners(company_name, webhook_url)")
      .in("status", ["pending", "retrying"])
      .lte("next_retry_at", new Date().toISOString())
      .lt("attempts", 3)
      .limit(50)
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Failed to fetch notifications:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch notifications", details: fetchError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: "No pending notifications" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[OUTBOX] Processing ${notifications.length} notifications`);

    let processed = 0;
    let failed = 0;
    let sent = 0;

    for (const notification of notifications) {
      const webhookUrl = notification.partners?.webhook_url;
      
      // Mark as processing
      await supabase
        .from("notification_outbox")
        .update({ 
          status: "processing",
          last_attempt_at: new Date().toISOString(),
          attempts: notification.attempts + 1 
        })
        .eq("id", notification.id);

      processed++;

      // If no webhook URL, mark as sent (notification was stored in DB already)
      if (!webhookUrl) {
        await supabase
          .from("notification_outbox")
          .update({ 
            status: "sent",
            sent_at: new Date().toISOString() 
          })
          .eq("id", notification.id);
        
        sent++;
        console.log(`[OUTBOX] Notification ${notification.id} marked as sent (no webhook)`);
        continue;
      }

      // Send webhook
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "partner_notification",
            partnerRef: notification.partner_ref,
            eventSummary: notification.event_summary,
            notificationId: notification.id,
            timestamp: Date.now(),
          }),
        });

        if (response.ok) {
          await supabase
            .from("notification_outbox")
            .update({ 
              status: "sent",
              sent_at: new Date().toISOString() 
            })
            .eq("id", notification.id);
          
          sent++;
          console.log(`[OUTBOX] Notification ${notification.id} delivered successfully`);
        } else {
          throw new Error(`Webhook returned ${response.status}: ${await response.text()}`);
        }
      } catch (webhookError: any) {
        const newAttempts = notification.attempts + 1;
        const shouldRetry = newAttempts < 3;
        
        // Exponential backoff: 5min, 15min, 45min
        const retryDelayMinutes = Math.pow(3, newAttempts) * 5;
        const nextRetry = new Date(Date.now() + retryDelayMinutes * 60 * 1000);

        await supabase
          .from("notification_outbox")
          .update({ 
            status: shouldRetry ? "retrying" : "failed",
            error_message: webhookError.message,
            next_retry_at: shouldRetry ? nextRetry.toISOString() : null
          })
          .eq("id", notification.id);

        failed++;
        console.error(`[OUTBOX] Notification ${notification.id} failed: ${webhookError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        processed,
        sent,
        failed,
        message: `Processed ${processed} notifications: ${sent} sent, ${failed} failed`
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Outbox processor error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
