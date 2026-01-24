// Smart Lead Scoring Engine for Aurelia
// Tracks behavioral signals to prioritize high-intent visitors

import { supabase } from "@/integrations/supabase/client";

export interface LeadSignals {
  pagesVisited: string[];
  timeOnSite: number; // seconds
  scrollDepth: number; // 0-100
  returnVisits: number;
  utmSource: string | null;
  utmMedium: string | null;
  formInteractions: number;
  pricingPageViews: number;
  servicesViewed: number;
  trialStarted: boolean;
  referralSource: string | null;
}

export interface LeadScore {
  total: number;
  breakdown: Record<string, number>;
  tier: "cold" | "warm" | "hot" | "qualified";
}

// Scoring weights
const SCORING_RULES = {
  // Page visits
  pricing_page: 15,
  membership_page: 15,
  services_page: 10,
  contact_page: 10,
  trial_page: 20,
  
  // Engagement
  services_viewed_3plus: 10,
  time_on_site_2min: 5,
  time_on_site_5min: 10,
  time_on_site_10min: 15,
  scroll_depth_50: 3,
  scroll_depth_75: 5,
  scroll_depth_90: 8,
  
  // Return behavior
  return_visitor: 20,
  multiple_sessions: 15,
  
  // UTM quality
  utm_linkedin: 25,
  utm_google_paid: 20,
  utm_referral: 15,
  utm_email: 10,
  
  // Actions
  form_interaction: 5,
  trial_started: 30,
  waitlist_signup: 25,
};

const SESSION_KEY = "aurelia_lead_session";
const SIGNALS_KEY = "aurelia_lead_signals";

export const getLeadSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const getStoredSignals = (): Partial<LeadSignals> => {
  try {
    const stored = localStorage.getItem(SIGNALS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const updateSignals = (updates: Partial<LeadSignals>): Partial<LeadSignals> => {
  const current = getStoredSignals();
  const updated = { ...current, ...updates };
  
  // Merge arrays
  if (updates.pagesVisited && current.pagesVisited) {
    updated.pagesVisited = [...new Set([...current.pagesVisited, ...updates.pagesVisited])];
  }
  
  localStorage.setItem(SIGNALS_KEY, JSON.stringify(updated));
  return updated;
};

export const calculateLeadScore = (signals: Partial<LeadSignals>): LeadScore => {
  const breakdown: Record<string, number> = {};
  
  // Page-based scoring
  const pages = signals.pagesVisited || [];
  if (pages.includes("/pricing") || pages.includes("/membership")) {
    breakdown.pricing_page = SCORING_RULES.pricing_page;
  }
  if (pages.includes("/services")) {
    breakdown.services_page = SCORING_RULES.services_page;
  }
  if (pages.includes("/contact")) {
    breakdown.contact_page = SCORING_RULES.contact_page;
  }
  if (pages.includes("/trial") || pages.includes("/apply")) {
    breakdown.trial_page = SCORING_RULES.trial_page;
  }
  
  // Services engagement
  if ((signals.servicesViewed || 0) >= 3) {
    breakdown.services_viewed = SCORING_RULES.services_viewed_3plus;
  }
  
  // Time on site
  const time = signals.timeOnSite || 0;
  if (time >= 600) {
    breakdown.time_engagement = SCORING_RULES.time_on_site_10min;
  } else if (time >= 300) {
    breakdown.time_engagement = SCORING_RULES.time_on_site_5min;
  } else if (time >= 120) {
    breakdown.time_engagement = SCORING_RULES.time_on_site_2min;
  }
  
  // Scroll depth
  const scroll = signals.scrollDepth || 0;
  if (scroll >= 90) {
    breakdown.scroll_depth = SCORING_RULES.scroll_depth_90;
  } else if (scroll >= 75) {
    breakdown.scroll_depth = SCORING_RULES.scroll_depth_75;
  } else if (scroll >= 50) {
    breakdown.scroll_depth = SCORING_RULES.scroll_depth_50;
  }
  
  // Return visits
  if ((signals.returnVisits || 0) > 0) {
    breakdown.return_visitor = SCORING_RULES.return_visitor;
  }
  if ((signals.returnVisits || 0) >= 3) {
    breakdown.multiple_sessions = SCORING_RULES.multiple_sessions;
  }
  
  // UTM source quality
  const source = signals.utmSource?.toLowerCase();
  const medium = signals.utmMedium?.toLowerCase();
  if (source === "linkedin") {
    breakdown.utm_quality = SCORING_RULES.utm_linkedin;
  } else if (source === "google" && medium === "cpc") {
    breakdown.utm_quality = SCORING_RULES.utm_google_paid;
  } else if (medium === "referral") {
    breakdown.utm_quality = SCORING_RULES.utm_referral;
  } else if (medium === "email") {
    breakdown.utm_quality = SCORING_RULES.utm_email;
  }
  
  // Form interactions
  if ((signals.formInteractions || 0) > 0) {
    breakdown.form_interaction = Math.min(
      signals.formInteractions! * SCORING_RULES.form_interaction,
      25
    );
  }
  
  // Trial started
  if (signals.trialStarted) {
    breakdown.trial_started = SCORING_RULES.trial_started;
  }
  
  // Calculate total
  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  
  // Determine tier
  let tier: LeadScore["tier"];
  if (total >= 80) tier = "qualified";
  else if (total >= 50) tier = "hot";
  else if (total >= 25) tier = "warm";
  else tier = "cold";
  
  return { total, breakdown, tier };
};

export const syncLeadScore = async (email?: string): Promise<void> => {
  const sessionId = getLeadSessionId();
  const signals = getStoredSignals();
  const score = calculateLeadScore(signals);
  
  try {
    // Check if record exists
    const { data: existing } = await supabase
      .from("lead_scores")
      .select("id, is_vip, admin_notified")
      .eq("session_id", sessionId)
      .maybeSingle();
    
    const leadData = {
      session_id: sessionId,
      score: score.total,
      tier: score.tier,
      signals: JSON.parse(JSON.stringify(signals)),
      email: email || null,
      last_activity_at: new Date().toISOString()
    };
    
    if (existing) {
      await supabase
        .from("lead_scores")
        .update(leadData)
        .eq("session_id", sessionId);
    } else {
      await supabase
        .from("lead_scores")
        .insert([leadData]);
    }
    
    // Trigger N8N if score is high
    if (score.total >= 80 && email) {
      try {
        const webhookUrl = await getN8NWebhook("high_lead_score");
        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "high_lead_score",
              email,
              score: score.total,
              tier: score.tier,
              signals,
              timestamp: new Date().toISOString()
            })
          });
        }
      } catch (e) {
        console.error("Failed to trigger N8N for high lead score:", e);
      }
    }
  } catch (error) {
    console.error("Failed to sync lead score:", error);
  }
};

async function getN8NWebhook(key: string): Promise<string | null> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", `n8n_webhook_${key}`)
    .single();
  return data?.value || null;
}

// Track page visit
export const trackPageForScoring = (path: string): void => {
  const signals = getStoredSignals();
  const pages = signals.pagesVisited || [];
  
  if (!pages.includes(path)) {
    updateSignals({ pagesVisited: [path] });
  }
  
  // Increment return visits if this is a new session
  const lastVisit = localStorage.getItem("aurelia_last_visit");
  const now = Date.now();
  if (lastVisit) {
    const elapsed = now - parseInt(lastVisit, 10);
    // If more than 30 minutes since last visit, count as return
    if (elapsed > 30 * 60 * 1000) {
      updateSignals({ returnVisits: (signals.returnVisits || 0) + 1 });
    }
  }
  localStorage.setItem("aurelia_last_visit", now.toString());
};

// Track scroll depth
export const trackScrollDepth = (depth: number): void => {
  const current = getStoredSignals().scrollDepth || 0;
  if (depth > current) {
    updateSignals({ scrollDepth: depth });
  }
};

// Track time on site
export const trackTimeOnSite = (seconds: number): void => {
  const current = getStoredSignals().timeOnSite || 0;
  updateSignals({ timeOnSite: current + seconds });
};

// Track form interaction
export const trackFormInteraction = (): void => {
  const current = getStoredSignals().formInteractions || 0;
  updateSignals({ formInteractions: current + 1 });
};

// Track services viewed
export const trackServiceView = (): void => {
  const current = getStoredSignals().servicesViewed || 0;
  updateSignals({ servicesViewed: current + 1 });
};

// Track UTM parameters
export const trackUTMParams = (source: string | null, medium: string | null): void => {
  if (source || medium) {
    updateSignals({ utmSource: source, utmMedium: medium });
  }
};
