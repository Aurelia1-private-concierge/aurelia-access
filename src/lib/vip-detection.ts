// VIP Detection Engine for Aurelia
// Real-time identification of high-value prospects with admin alerts

import { supabase } from "@/integrations/supabase/client";
import { calculateLeadScore, getLeadSessionId, getStoredSignals, LeadScore } from "./lead-scoring";

export interface VIPAlert {
  id: string;
  lead_score_id: string | null;
  session_id: string;
  email: string | null;
  score: number;
  tier: string;
  signals: Record<string, unknown>;
  alert_type: "ultra_high_intent" | "high_intent" | "qualified_lead";
  status: "new" | "contacted" | "converted" | "dismissed";
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface VIPDetectionResult {
  isVIP: boolean;
  score: LeadScore;
  alertType: VIPAlert["alert_type"] | null;
  shouldNotifyAdmin: boolean;
  shouldEngageOrla: boolean;
}

// VIP threshold configuration
const VIP_THRESHOLDS = {
  qualified: 70,
  hot: 80,
  ultra: 90,
} as const;

// Check if current visitor qualifies as VIP
export const detectVIP = (): VIPDetectionResult => {
  const signals = getStoredSignals();
  const score = calculateLeadScore(signals);
  
  const isVIP = score.total >= VIP_THRESHOLDS.qualified;
  
  let alertType: VIPAlert["alert_type"] | null = null;
  if (score.total >= VIP_THRESHOLDS.ultra) {
    alertType = "ultra_high_intent";
  } else if (score.total >= VIP_THRESHOLDS.hot) {
    alertType = "high_intent";
  } else if (score.total >= VIP_THRESHOLDS.qualified) {
    alertType = "qualified_lead";
  }
  
  return {
    isVIP,
    score,
    alertType,
    shouldNotifyAdmin: isVIP && alertType === "ultra_high_intent",
    shouldEngageOrla: isVIP,
  };
};

// Sync VIP status to database and trigger alerts
export const syncVIPStatus = async (email?: string): Promise<VIPDetectionResult> => {
  const sessionId = getLeadSessionId();
  const signals = getStoredSignals();
  const score = calculateLeadScore(signals);
  const detection = detectVIP();
  
  try {
    // Check if lead score record exists
    const { data: existing } = await supabase
      .from("lead_scores")
      .select("id, is_vip, admin_notified, orla_engaged")
      .eq("session_id", sessionId)
      .maybeSingle();
    
    const leadData = {
      session_id: sessionId,
      score: score.total,
      tier: score.tier,
      signals: JSON.parse(JSON.stringify(signals)),
      email: email || null,
      is_vip: detection.isVIP,
      vip_detected_at: detection.isVIP ? new Date().toISOString() : null,
      last_activity_at: new Date().toISOString(),
    };
    
    if (existing) {
      // Update existing record
      await supabase
        .from("lead_scores")
        .update(leadData)
        .eq("session_id", sessionId);
      
      // If newly detected as VIP and admin not yet notified
      if (detection.isVIP && !existing.admin_notified && detection.shouldNotifyAdmin) {
        await notifyAdminOfVIP(sessionId, email, score, detection.alertType!);
      }
    } else {
      // Insert new record
      await supabase.from("lead_scores").insert([leadData]);
    }
    
    // Log VIP detection event
    if (detection.isVIP) {
      await supabase.from("analytics_events").insert([{
        event_name: "vip_detected",
        event_category: "lead_scoring",
        session_id: sessionId,
        event_data: {
          score: score.total,
          tier: score.tier,
          alert_type: detection.alertType,
          signals_summary: Object.keys(score.breakdown),
        },
      }]);
    }
  } catch (error) {
    console.error("Failed to sync VIP status:", error);
  }
  
  return detection;
};

// Notify admin of high-value VIP
const notifyAdminOfVIP = async (
  sessionId: string,
  email: string | undefined,
  score: LeadScore,
  alertType: VIPAlert["alert_type"]
): Promise<void> => {
  try {
    // Call edge function to send admin notification
    await supabase.functions.invoke("vip-alert-notify", {
      body: {
        sessionId,
        email,
        score: score.total,
        tier: score.tier,
        breakdown: score.breakdown,
        alertType,
      },
    });
    
    // Mark as notified
    await supabase
      .from("lead_scores")
      .update({ admin_notified: true })
      .eq("session_id", sessionId);
  } catch (error) {
    console.error("Failed to notify admin of VIP:", error);
  }
};

// Mark VIP as engaged by Orla
export const markOrlaEngaged = async (sessionId?: string): Promise<void> => {
  const sid = sessionId || getLeadSessionId();
  try {
    await supabase
      .from("lead_scores")
      .update({ orla_engaged: true })
      .eq("session_id", sid);
  } catch (error) {
    console.error("Failed to mark Orla engagement:", error);
  }
};

// Get VIP alerts for admin dashboard
export const getVIPAlerts = async (status?: VIPAlert["status"]): Promise<VIPAlert[]> => {
  let query = supabase
    .from("vip_alerts")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (status) {
    query = query.eq("status", status);
  }
  
  const { data, error } = await query.limit(100);
  
  if (error) {
    console.error("Failed to fetch VIP alerts:", error);
    return [];
  }
  
  return (data || []) as VIPAlert[];
};

// Update VIP alert status
export const updateVIPAlertStatus = async (
  alertId: string,
  status: VIPAlert["status"],
  notes?: string
): Promise<boolean> => {
  const { error } = await supabase
    .from("vip_alerts")
    .update({
      status,
      notes,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", alertId);
  
  if (error) {
    console.error("Failed to update VIP alert:", error);
    return false;
  }
  
  return true;
};

// Get VIP statistics for dashboard
export const getVIPStats = async (): Promise<{
  totalVIPs: number;
  newAlerts: number;
  converted: number;
  avgScore: number;
}> => {
  try {
    const { data: vipData } = await supabase
      .from("lead_scores")
      .select("score")
      .eq("is_vip", true);
    
    const { data: alertData } = await supabase
      .from("vip_alerts")
      .select("status");
    
    const totalVIPs = vipData?.length || 0;
    const avgScore = totalVIPs > 0
      ? Math.round(vipData!.reduce((sum, v) => sum + (v.score || 0), 0) / totalVIPs)
      : 0;
    
    const newAlerts = alertData?.filter(a => a.status === "new").length || 0;
    const converted = alertData?.filter(a => a.status === "converted").length || 0;
    
    return { totalVIPs, newAlerts, converted, avgScore };
  } catch (error) {
    console.error("Failed to fetch VIP stats:", error);
    return { totalVIPs: 0, newAlerts: 0, converted: 0, avgScore: 0 };
  }
};