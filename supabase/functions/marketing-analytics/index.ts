import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsRequest {
  action: "campaign_summary" | "content_performance" | "platform_comparison" | "ab_test_results" | "roi_report" | "trend_analysis" | "aggregate_daily";
  campaign_id?: string;
  content_ids?: string[];
  platform?: string;
  test_id?: string;
  start_date?: string;
  end_date?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: AnalyticsRequest = await req.json();

    console.log("[marketing-analytics] Action:", body.action);

    const startDate = body.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const endDate = body.end_date || new Date().toISOString().split("T")[0];

    switch (body.action) {
      case "campaign_summary": {
        if (!body.campaign_id) {
          throw new Error("campaign_id is required");
        }

        // Get campaign details
        const { data: campaign, error: campaignError } = await supabase
          .from("marketing_campaigns")
          .select("*")
          .eq("id", body.campaign_id)
          .single();

        if (campaignError || !campaign) {
          throw new Error("Campaign not found");
        }

        // Get campaign content
        const { data: contentLinks } = await supabase
          .from("campaign_content")
          .select(`
            content:social_content(
              id,
              platform,
              generated_text,
              approval_status
            )
          `)
          .eq("campaign_id", body.campaign_id);

        // Get scheduled posts
        const contentIds = contentLinks?.map((l: any) => l.content?.id).filter(Boolean) || [];
        
        let postsData: any[] = [];
        let metricsData: any[] = [];

        if (contentIds.length > 0) {
          const { data: posts } = await supabase
            .from("social_post_schedule")
            .select("*")
            .in("content_id", contentIds);
          postsData = posts || [];

          const scheduleIds = postsData.map((p) => p.id);
          if (scheduleIds.length > 0) {
            const { data: metrics } = await supabase
              .from("social_performance_metrics")
              .select("*")
              .in("post_schedule_id", scheduleIds);
            metricsData = metrics || [];
          }
        }

        // Aggregate metrics
        const aggregatedMetrics = {
          total_impressions: 0,
          total_reach: 0,
          total_engagement: 0,
          total_clicks: 0,
          avg_engagement_rate: 0,
        };

        for (const metric of metricsData) {
          aggregatedMetrics.total_impressions += metric.impressions || 0;
          aggregatedMetrics.total_reach += metric.reach || 0;
          aggregatedMetrics.total_engagement += (metric.likes || 0) + (metric.comments || 0) + (metric.shares || 0) + (metric.saves || 0);
          aggregatedMetrics.total_clicks += metric.clicks || 0;
        }

        if (metricsData.length > 0) {
          aggregatedMetrics.avg_engagement_rate =
            metricsData.reduce((sum, m) => sum + (m.engagement_rate || 0), 0) / metricsData.length;
        }

        // Calculate ROI
        const roi = campaign.spent_amount > 0
          ? ((aggregatedMetrics.total_clicks * 10 - campaign.spent_amount) / campaign.spent_amount) * 100 // Assuming $10 value per click
          : 0;

        return new Response(
          JSON.stringify({
            success: true,
            campaign,
            content_count: contentIds.length,
            posts_published: postsData.filter((p) => p.status === "published").length,
            posts_scheduled: postsData.filter((p) => p.status === "scheduled").length,
            metrics: aggregatedMetrics,
            estimated_roi: Math.round(roi * 100) / 100,
            budget_utilization: campaign.budget_amount > 0
              ? ((campaign.spent_amount || 0) / campaign.budget_amount) * 100
              : 0,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "content_performance": {
        const query = supabase
          .from("social_post_schedule")
          .select(`
            id,
            platform,
            scheduled_for,
            published_at,
            status,
            content:social_content(
              id,
              generated_text,
              hashtags,
              content_type
            ),
            metrics:social_performance_metrics(*)
          `)
          .eq("status", "published")
          .gte("published_at", startDate)
          .lte("published_at", endDate + "T23:59:59Z")
          .order("published_at", { ascending: false });

        if (body.platform) {
          query.eq("platform", body.platform);
        }

        const { data: posts, error: postsError } = await query;

        if (postsError) throw postsError;

        // Rank by engagement
        const rankedPosts = (posts || [])
          .map((post) => {
            const metrics = Array.isArray(post.metrics) ? post.metrics[0] : post.metrics;
            return {
              ...post,
              engagement_score: metrics
                ? (metrics.likes || 0) + (metrics.comments || 0) * 2 + (metrics.shares || 0) * 3 + (metrics.saves || 0) * 1.5
                : 0,
            };
          })
          .sort((a, b) => b.engagement_score - a.engagement_score);

        return new Response(
          JSON.stringify({
            success: true,
            period: { start: startDate, end: endDate },
            total_posts: rankedPosts.length,
            top_performers: rankedPosts.slice(0, 5),
            low_performers: rankedPosts.slice(-5).reverse(),
            all_posts: rankedPosts,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "platform_comparison": {
        const { data: metrics, error: metricsError } = await supabase
          .from("social_performance_metrics")
          .select("*")
          .gte("fetched_at", startDate)
          .lte("fetched_at", endDate + "T23:59:59Z");

        if (metricsError) throw metricsError;

        // Aggregate by platform
        const platformStats: Record<string, any> = {};

        for (const metric of metrics || []) {
          const platform = metric.platform;
          if (!platformStats[platform]) {
            platformStats[platform] = {
              platform,
              post_count: 0,
              total_impressions: 0,
              total_reach: 0,
              total_likes: 0,
              total_comments: 0,
              total_shares: 0,
              total_saves: 0,
              total_clicks: 0,
              engagement_rates: [],
            };
          }

          platformStats[platform].post_count += 1;
          platformStats[platform].total_impressions += metric.impressions || 0;
          platformStats[platform].total_reach += metric.reach || 0;
          platformStats[platform].total_likes += metric.likes || 0;
          platformStats[platform].total_comments += metric.comments || 0;
          platformStats[platform].total_shares += metric.shares || 0;
          platformStats[platform].total_saves += metric.saves || 0;
          platformStats[platform].total_clicks += metric.clicks || 0;
          if (metric.engagement_rate) {
            platformStats[platform].engagement_rates.push(metric.engagement_rate);
          }
        }

        // Calculate averages
        const comparison = Object.values(platformStats).map((stat: any) => ({
          platform: stat.platform,
          post_count: stat.post_count,
          total_impressions: stat.total_impressions,
          total_reach: stat.total_reach,
          total_engagement: stat.total_likes + stat.total_comments + stat.total_shares + stat.total_saves,
          total_clicks: stat.total_clicks,
          avg_engagement_rate: stat.engagement_rates.length > 0
            ? stat.engagement_rates.reduce((a: number, b: number) => a + b, 0) / stat.engagement_rates.length
            : 0,
          avg_impressions_per_post: stat.post_count > 0 ? stat.total_impressions / stat.post_count : 0,
        }));

        // Rank platforms
        const ranked = comparison.sort((a, b) => b.avg_engagement_rate - a.avg_engagement_rate);

        return new Response(
          JSON.stringify({
            success: true,
            period: { start: startDate, end: endDate },
            platforms: ranked,
            best_platform: ranked[0]?.platform || "N/A",
            recommendations: generatePlatformRecommendations(ranked),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "ab_test_results": {
        if (!body.test_id) {
          throw new Error("test_id is required");
        }

        const { data: test, error: testError } = await supabase
          .from("content_ab_tests")
          .select(`
            *,
            variant_a:social_content!variant_a_content_id(*),
            variant_b:social_content!variant_b_content_id(*)
          `)
          .eq("id", body.test_id)
          .single();

        if (testError || !test) {
          throw new Error("A/B test not found");
        }

        // Get metrics for both variants
        const variantIds = [test.variant_a_content_id, test.variant_b_content_id].filter(Boolean);

        const { data: schedules } = await supabase
          .from("social_post_schedule")
          .select("id, content_id")
          .in("content_id", variantIds);

        const scheduleMap: Record<string, string[]> = {};
        for (const s of schedules || []) {
          if (!scheduleMap[s.content_id]) {
            scheduleMap[s.content_id] = [];
          }
          scheduleMap[s.content_id].push(s.id);
        }

        const allScheduleIds = (schedules || []).map((s) => s.id);

        let metricsData: any[] = [];
        if (allScheduleIds.length > 0) {
          const { data: metrics } = await supabase
            .from("social_performance_metrics")
            .select("*")
            .in("post_schedule_id", allScheduleIds);
          metricsData = metrics || [];
        }

        // Aggregate metrics by variant
        const aggregateMetrics = (contentId: string) => {
          const scheduleIds = scheduleMap[contentId] || [];
          const variantMetrics = metricsData.filter((m) => scheduleIds.includes(m.post_schedule_id));

          return {
            sample_size: variantMetrics.length,
            total_impressions: variantMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
            total_reach: variantMetrics.reduce((sum, m) => sum + (m.reach || 0), 0),
            total_engagement: variantMetrics.reduce(
              (sum, m) => sum + (m.likes || 0) + (m.comments || 0) + (m.shares || 0) + (m.saves || 0),
              0
            ),
            avg_engagement_rate: variantMetrics.length > 0
              ? variantMetrics.reduce((sum, m) => sum + (m.engagement_rate || 0), 0) / variantMetrics.length
              : 0,
          };
        };

        const variantAMetrics = aggregateMetrics(test.variant_a_content_id);
        const variantBMetrics = aggregateMetrics(test.variant_b_content_id);

        // Determine winner based on metric to optimize
        let winner: "A" | "B" | "inconclusive" = "inconclusive";
        let confidence = 0;

        const metricKey = test.metric_to_optimize || "avg_engagement_rate";
        const aValue = variantAMetrics[metricKey as keyof typeof variantAMetrics] || variantAMetrics.avg_engagement_rate;
        const bValue = variantBMetrics[metricKey as keyof typeof variantBMetrics] || variantBMetrics.avg_engagement_rate;

        if (variantAMetrics.sample_size >= 3 && variantBMetrics.sample_size >= 3) {
          const diff = Math.abs(aValue - bValue);
          const avg = (aValue + bValue) / 2;
          const relDiff = avg > 0 ? diff / avg : 0;

          if (relDiff > 0.1) {
            winner = aValue > bValue ? "A" : "B";
            confidence = Math.min(0.95, 0.5 + relDiff * 2);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            test: {
              id: test.id,
              name: test.name,
              status: test.status,
              metric_to_optimize: test.metric_to_optimize,
              started_at: test.started_at,
            },
            variant_a: {
              content_id: test.variant_a_content_id,
              preview: test.variant_a?.generated_text?.substring(0, 100),
              metrics: variantAMetrics,
            },
            variant_b: {
              content_id: test.variant_b_content_id,
              preview: test.variant_b?.generated_text?.substring(0, 100),
              metrics: variantBMetrics,
            },
            results: {
              winner,
              confidence: Math.round(confidence * 100),
              recommendation: winner !== "inconclusive"
                ? `Variant ${winner} outperforms by ${Math.round(Math.abs(aValue - bValue) / Math.max(aValue, bValue, 0.001) * 100)}%`
                : "Need more data for statistical significance",
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "roi_report": {
        const { data: campaigns, error: campaignsError } = await supabase
          .from("marketing_campaigns")
          .select("*")
          .in("status", ["active", "completed"])
          .gte("start_date", startDate)
          .lte("end_date", endDate);

        if (campaignsError) throw campaignsError;

        const campaignRoi = [];

        for (const campaign of campaigns || []) {
          // Get campaign analytics
          const { data: analytics } = await supabase
            .from("campaign_analytics")
            .select("*")
            .eq("campaign_id", campaign.id);

          const totals = (analytics || []).reduce(
            (acc, a) => ({
              impressions: acc.impressions + (a.total_impressions || 0),
              clicks: acc.clicks + (a.total_clicks || 0),
              conversions: acc.conversions + (a.total_conversions || 0),
              conversion_value: acc.conversion_value + (a.conversion_value || 0),
            }),
            { impressions: 0, clicks: 0, conversions: 0, conversion_value: 0 }
          );

          const spent = campaign.spent_amount || 0;
          const cpc = totals.clicks > 0 ? spent / totals.clicks : 0;
          const cpa = totals.conversions > 0 ? spent / totals.conversions : 0;
          const roas = spent > 0 ? totals.conversion_value / spent : 0;

          campaignRoi.push({
            campaign_id: campaign.id,
            campaign_name: campaign.name,
            status: campaign.status,
            budget: campaign.budget_amount,
            spent: spent,
            impressions: totals.impressions,
            clicks: totals.clicks,
            conversions: totals.conversions,
            revenue: totals.conversion_value,
            cpc: Math.round(cpc * 100) / 100,
            cpa: Math.round(cpa * 100) / 100,
            roas: Math.round(roas * 100) / 100,
            roi_percent: spent > 0 ? Math.round(((totals.conversion_value - spent) / spent) * 10000) / 100 : 0,
          });
        }

        // Overall totals
        const overallTotals = campaignRoi.reduce(
          (acc, c) => ({
            spent: acc.spent + c.spent,
            revenue: acc.revenue + c.revenue,
            clicks: acc.clicks + c.clicks,
            conversions: acc.conversions + c.conversions,
          }),
          { spent: 0, revenue: 0, clicks: 0, conversions: 0 }
        );

        return new Response(
          JSON.stringify({
            success: true,
            period: { start: startDate, end: endDate },
            campaigns: campaignRoi.sort((a, b) => b.roas - a.roas),
            overall: {
              total_spent: overallTotals.spent,
              total_revenue: overallTotals.revenue,
              total_clicks: overallTotals.clicks,
              total_conversions: overallTotals.conversions,
              overall_roas: overallTotals.spent > 0 ? Math.round((overallTotals.revenue / overallTotals.spent) * 100) / 100 : 0,
              overall_roi: overallTotals.spent > 0
                ? Math.round(((overallTotals.revenue - overallTotals.spent) / overallTotals.spent) * 10000) / 100
                : 0,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "trend_analysis": {
        // Get daily metrics for trend analysis
        const { data: dailyMetrics, error: metricsError } = await supabase
          .from("social_performance_metrics")
          .select("*")
          .gte("fetched_at", startDate)
          .lte("fetched_at", endDate + "T23:59:59Z")
          .order("fetched_at", { ascending: true });

        if (metricsError) throw metricsError;

        // Group by date
        const dailyData: Record<string, any> = {};

        for (const metric of dailyMetrics || []) {
          const date = metric.fetched_at.split("T")[0];
          if (!dailyData[date]) {
            dailyData[date] = {
              date,
              posts: 0,
              impressions: 0,
              reach: 0,
              engagement: 0,
              clicks: 0,
            };
          }

          dailyData[date].posts += 1;
          dailyData[date].impressions += metric.impressions || 0;
          dailyData[date].reach += metric.reach || 0;
          dailyData[date].engagement += (metric.likes || 0) + (metric.comments || 0) + (metric.shares || 0);
          dailyData[date].clicks += metric.clicks || 0;
        }

        const trends = Object.values(dailyData).sort((a: any, b: any) => a.date.localeCompare(b.date));

        // Calculate week-over-week changes
        const weeklyChange = calculateTrend(trends, 7);
        const monthlyChange = calculateTrend(trends, 30);

        return new Response(
          JSON.stringify({
            success: true,
            period: { start: startDate, end: endDate },
            daily_data: trends,
            trends: {
              weekly_change: weeklyChange,
              monthly_change: monthlyChange,
            },
            insights: generateTrendInsights(trends, weeklyChange),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "aggregate_daily": {
        // Aggregate yesterday's metrics into campaign_analytics
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const { data: campaigns } = await supabase.from("marketing_campaigns").select("id").eq("status", "active");

        const aggregated = [];

        for (const campaign of campaigns || []) {
          // Get content IDs for this campaign
          const { data: contentLinks } = await supabase
            .from("campaign_content")
            .select("content_id")
            .eq("campaign_id", campaign.id);

          const contentIds = contentLinks?.map((l) => l.content_id) || [];
          if (contentIds.length === 0) continue;

          // Get schedules
          const { data: schedules } = await supabase
            .from("social_post_schedule")
            .select("id")
            .in("content_id", contentIds)
            .eq("status", "published");

          const scheduleIds = schedules?.map((s) => s.id) || [];
          if (scheduleIds.length === 0) continue;

          // Get metrics from yesterday
          const { data: metrics } = await supabase
            .from("social_performance_metrics")
            .select("*")
            .in("post_schedule_id", scheduleIds)
            .gte("fetched_at", yesterday)
            .lt("fetched_at", yesterday + "T23:59:59Z");

          if (!metrics || metrics.length === 0) continue;

          const totals = metrics.reduce(
            (acc, m) => ({
              impressions: acc.impressions + (m.impressions || 0),
              reach: acc.reach + (m.reach || 0),
              engagement: acc.engagement + (m.likes || 0) + (m.comments || 0) + (m.shares || 0) + (m.saves || 0),
              clicks: acc.clicks + (m.clicks || 0),
            }),
            { impressions: 0, reach: 0, engagement: 0, clicks: 0 }
          );

          const { data: saved } = await supabase
            .from("campaign_analytics")
            .upsert({
              campaign_id: campaign.id,
              date: yesterday,
              total_impressions: totals.impressions,
              total_reach: totals.reach,
              total_engagement: totals.engagement,
              total_clicks: totals.clicks,
            }, { onConflict: "campaign_id,date" })
            .select()
            .single();

          if (saved) aggregated.push(saved);
        }

        return new Response(
          JSON.stringify({
            success: true,
            date: yesterday,
            campaigns_processed: aggregated.length,
            aggregated,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        throw new Error(`Unknown action: ${body.action}`);
    }
  } catch (error: any) {
    console.error("[marketing-analytics] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generatePlatformRecommendations(platforms: any[]): string[] {
  const recommendations: string[] = [];

  if (platforms.length === 0) {
    return ["Start publishing content to gather performance data"];
  }

  const best = platforms[0];
  const worst = platforms[platforms.length - 1];

  if (best) {
    recommendations.push(`Focus more resources on ${best.platform} - highest engagement rate at ${(best.avg_engagement_rate * 100).toFixed(2)}%`);
  }

  if (worst && platforms.length > 1 && worst.avg_engagement_rate < best.avg_engagement_rate * 0.5) {
    recommendations.push(`Consider optimizing content strategy for ${worst.platform} or reallocating budget`);
  }

  // Check for low click-through
  for (const p of platforms) {
    if (p.total_impressions > 1000 && p.total_clicks / p.total_impressions < 0.01) {
      recommendations.push(`${p.platform}: Low click-through rate. Test stronger CTAs`);
    }
  }

  return recommendations;
}

function calculateTrend(data: any[], days: number): Record<string, number> {
  if (data.length < days * 2) {
    return { impressions: 0, engagement: 0, clicks: 0 };
  }

  const recent = data.slice(-days);
  const previous = data.slice(-days * 2, -days);

  const sum = (arr: any[], key: string) => arr.reduce((s, d) => s + (d[key] || 0), 0);

  const recentImpressions = sum(recent, "impressions");
  const previousImpressions = sum(previous, "impressions");
  const recentEngagement = sum(recent, "engagement");
  const previousEngagement = sum(previous, "engagement");
  const recentClicks = sum(recent, "clicks");
  const previousClicks = sum(previous, "clicks");

  const pctChange = (current: number, prev: number) =>
    prev > 0 ? Math.round(((current - prev) / prev) * 10000) / 100 : 0;

  return {
    impressions: pctChange(recentImpressions, previousImpressions),
    engagement: pctChange(recentEngagement, previousEngagement),
    clicks: pctChange(recentClicks, previousClicks),
  };
}

function generateTrendInsights(trends: any[], weeklyChange: Record<string, number>): string[] {
  const insights: string[] = [];

  if (weeklyChange.engagement > 10) {
    insights.push(`📈 Engagement up ${weeklyChange.engagement}% week-over-week - your content is resonating!`);
  } else if (weeklyChange.engagement < -10) {
    insights.push(`📉 Engagement down ${Math.abs(weeklyChange.engagement)}% - consider refreshing content strategy`);
  }

  if (weeklyChange.impressions > 20) {
    insights.push(`🚀 Impressions surging ${weeklyChange.impressions}% - great visibility growth`);
  }

  if (trends.length > 7) {
    const lastWeek = trends.slice(-7);
    const avgEngagement = lastWeek.reduce((s, d) => s + d.engagement, 0) / 7;
    const bestDay = lastWeek.reduce((best, d) => (d.engagement > best.engagement ? d : best), lastWeek[0]);
    
    const dayOfWeek = new Date(bestDay.date).toLocaleDateString("en-US", { weekday: "long" });
    insights.push(`📅 Best performing day: ${dayOfWeek} - consider scheduling more content`);
  }

  return insights;
}