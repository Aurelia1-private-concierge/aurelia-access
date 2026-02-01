import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduleRequest {
  action: "schedule" | "reschedule" | "cancel" | "publish_now" | "get_queue" | "process_pending" | "fetch_metrics";
  content_id?: string;
  schedule_id?: string;
  platform?: string;
  account_id?: string;
  scheduled_for?: string;
  timezone?: string;
  campaign_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: ScheduleRequest = await req.json();

    console.log("[social-scheduler] Action:", body.action);

    switch (body.action) {
      case "schedule": {
        if (!body.content_id || !body.scheduled_for) {
          throw new Error("content_id and scheduled_for are required");
        }

        // Verify content exists and is approved
        const { data: content, error: contentError } = await supabase
          .from("social_content")
          .select("*")
          .eq("id", body.content_id)
          .single();

        if (contentError || !content) {
          throw new Error("Content not found");
        }

        if (content.approval_status !== "approved") {
          throw new Error("Content must be approved before scheduling");
        }

        const scheduledDate = new Date(body.scheduled_for);
        if (scheduledDate <= new Date()) {
          throw new Error("Scheduled time must be in the future");
        }

        const { data: schedule, error: scheduleError } = await supabase
          .from("social_post_schedule")
          .insert({
            content_id: body.content_id,
            platform: content.platform,
            account_id: body.account_id,
            scheduled_for: body.scheduled_for,
            timezone: body.timezone || "UTC",
            status: "scheduled",
          })
          .select()
          .single();

        if (scheduleError) throw scheduleError;

        return new Response(
          JSON.stringify({
            success: true,
            schedule,
            message: `Post scheduled for ${scheduledDate.toISOString()}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "reschedule": {
        if (!body.schedule_id || !body.scheduled_for) {
          throw new Error("schedule_id and scheduled_for are required");
        }

        const scheduledDate = new Date(body.scheduled_for);
        if (scheduledDate <= new Date()) {
          throw new Error("Scheduled time must be in the future");
        }

        const { data: schedule, error: updateError } = await supabase
          .from("social_post_schedule")
          .update({
            scheduled_for: body.scheduled_for,
            timezone: body.timezone,
            status: "scheduled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.schedule_id)
          .eq("status", "scheduled")
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ success: true, schedule }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "cancel": {
        if (!body.schedule_id) {
          throw new Error("schedule_id is required");
        }

        const { data: schedule, error: cancelError } = await supabase
          .from("social_post_schedule")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.schedule_id)
          .in("status", ["scheduled", "failed"])
          .select()
          .single();

        if (cancelError) throw cancelError;

        return new Response(
          JSON.stringify({ success: true, schedule, message: "Post cancelled" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "publish_now": {
        if (!body.content_id) {
          throw new Error("content_id is required");
        }

        // Get content
        const { data: content, error: contentError } = await supabase
          .from("social_content")
          .select("*")
          .eq("id", body.content_id)
          .single();

        if (contentError || !content) {
          throw new Error("Content not found");
        }

        // Simulate publishing (in real implementation, this would call platform APIs)
        const publishResult = await simulatePublish(content, body.account_id);

        // Create schedule record for tracking
        const { data: schedule, error: scheduleError } = await supabase
          .from("social_post_schedule")
          .insert({
            content_id: body.content_id,
            platform: content.platform,
            account_id: body.account_id,
            scheduled_for: new Date().toISOString(),
            status: publishResult.success ? "published" : "failed",
            published_at: publishResult.success ? new Date().toISOString() : null,
            platform_post_id: publishResult.post_id,
            platform_response: publishResult.response,
            error_message: publishResult.error,
          })
          .select()
          .single();

        if (scheduleError) throw scheduleError;

        return new Response(
          JSON.stringify({
            success: publishResult.success,
            schedule,
            platform_post_id: publishResult.post_id,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_queue": {
        const query = supabase
          .from("social_post_schedule")
          .select(`
            *,
            content:social_content(*)
          `)
          .in("status", ["scheduled", "publishing"])
          .order("scheduled_for", { ascending: true });

        if (body.platform) {
          query.eq("platform", body.platform);
        }

        const { data: queue, error: queueError } = await query;

        if (queueError) throw queueError;

        // Group by date
        const groupedQueue: Record<string, any[]> = {};
        for (const item of queue || []) {
          const date = new Date(item.scheduled_for).toISOString().split("T")[0];
          if (!groupedQueue[date]) {
            groupedQueue[date] = [];
          }
          groupedQueue[date].push(item);
        }

        return new Response(
          JSON.stringify({
            success: true,
            total: queue?.length || 0,
            queue,
            grouped: groupedQueue,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "process_pending": {
        // Find posts due for publishing
        const now = new Date();
        const windowEnd = new Date(now.getTime() + 5 * 60 * 1000); // 5-minute window

        const { data: pendingPosts, error: fetchError } = await supabase
          .from("social_post_schedule")
          .select(`
            *,
            content:social_content(*)
          `)
          .eq("status", "scheduled")
          .lte("scheduled_for", windowEnd.toISOString())
          .order("scheduled_for", { ascending: true })
          .limit(10);

        if (fetchError) throw fetchError;

        const results = [];

        for (const post of pendingPosts || []) {
          // Mark as publishing
          await supabase
            .from("social_post_schedule")
            .update({ status: "publishing" })
            .eq("id", post.id);

          // Attempt publish
          const publishResult = await simulatePublish(post.content, post.account_id);

          // Update status
          const { data: updated } = await supabase
            .from("social_post_schedule")
            .update({
              status: publishResult.success ? "published" : "failed",
              published_at: publishResult.success ? new Date().toISOString() : null,
              platform_post_id: publishResult.post_id,
              platform_response: publishResult.response,
              error_message: publishResult.error,
              retry_count: publishResult.success ? post.retry_count : post.retry_count + 1,
            })
            .eq("id", post.id)
            .select()
            .single();

          results.push({
            schedule_id: post.id,
            success: publishResult.success,
            platform_post_id: publishResult.post_id,
            error: publishResult.error,
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            processed: results.length,
            results,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "fetch_metrics": {
        if (!body.schedule_id) {
          throw new Error("schedule_id is required");
        }

        const { data: schedule, error: scheduleError } = await supabase
          .from("social_post_schedule")
          .select("*")
          .eq("id", body.schedule_id)
          .single();

        if (scheduleError || !schedule) {
          throw new Error("Schedule not found");
        }

        if (schedule.status !== "published" || !schedule.platform_post_id) {
          throw new Error("Post has not been published yet");
        }

        // Simulate metrics fetch (in real implementation, this would call platform APIs)
        const metrics = simulateMetricsFetch(schedule.platform, schedule.platform_post_id);

        // Save metrics
        const { data: savedMetrics, error: metricsError } = await supabase
          .from("social_performance_metrics")
          .upsert({
            post_schedule_id: body.schedule_id,
            platform: schedule.platform,
            platform_post_id: schedule.platform_post_id,
            impressions: metrics.impressions,
            reach: metrics.reach,
            likes: metrics.likes,
            comments: metrics.comments,
            shares: metrics.shares,
            saves: metrics.saves,
            clicks: metrics.clicks,
            engagement_rate: metrics.engagement_rate,
            fetched_at: new Date().toISOString(),
          }, { onConflict: "post_schedule_id" })
          .select()
          .single();

        if (metricsError) throw metricsError;

        return new Response(
          JSON.stringify({ success: true, metrics: savedMetrics }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown action: ${body.action}`);
    }
  } catch (error: any) {
    console.error("[social-scheduler] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

interface PublishResult {
  success: boolean;
  post_id?: string;
  response?: Record<string, any>;
  error?: string;
}

async function simulatePublish(content: any, accountId?: string): Promise<PublishResult> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 95% success rate simulation
  const success = Math.random() > 0.05;

  if (success) {
    const postId = `${content.platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      success: true,
      post_id: postId,
      response: {
        id: postId,
        created_at: new Date().toISOString(),
        url: `https://${content.platform}.com/post/${postId}`,
      },
    };
  } else {
    return {
      success: false,
      error: "Simulated API error - rate limit exceeded",
    };
  }
}

function simulateMetricsFetch(platform: string, postId: string): Record<string, number> {
  // Generate realistic-looking metrics
  const baseImpressions = Math.floor(Math.random() * 10000) + 1000;
  const reach = Math.floor(baseImpressions * (0.6 + Math.random() * 0.3));
  const likes = Math.floor(reach * (0.02 + Math.random() * 0.08));
  const comments = Math.floor(likes * (0.05 + Math.random() * 0.15));
  const shares = Math.floor(likes * (0.02 + Math.random() * 0.1));
  const saves = Math.floor(likes * (0.1 + Math.random() * 0.2));
  const clicks = Math.floor(reach * (0.01 + Math.random() * 0.04));

  const totalEngagement = likes + comments + shares + saves;
  const engagementRate = reach > 0 ? totalEngagement / reach : 0;

  return {
    impressions: baseImpressions,
    reach,
    likes,
    comments,
    shares,
    saves,
    clicks,
    engagement_rate: Math.round(engagementRate * 10000) / 10000,
  };
}