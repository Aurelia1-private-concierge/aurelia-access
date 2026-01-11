import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type FunnelStage =
  | "landing"
  | "page_view"
  | "signup_started"
  | "signup_completed"
  | "onboarding_started"
  | "onboarding_completed"
  | "trial_started"
  | "trial_completed"
  | "subscription_started"
  | "converted";

interface UTMParams {
  source: string | null;
  medium: string | null;
  campaign: string | null;
}

const SESSION_KEY = "funnel_session_id";
const UTM_KEY = "funnel_utm_params";

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

// Parse and store UTM parameters
const getUTMParams = (): UTMParams => {
  // Check if we already stored UTM params this session
  const storedParams = sessionStorage.getItem(UTM_KEY);
  if (storedParams) {
    return JSON.parse(storedParams);
  }

  // Parse from URL
  const params = new URLSearchParams(window.location.search);
  const utmParams: UTMParams = {
    source: params.get("utm_source"),
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
  };

  // Store for session
  sessionStorage.setItem(UTM_KEY, JSON.stringify(utmParams));
  return utmParams;
};

export const useFunnelTracking = () => {
  const { user } = useAuth();
  const location = useLocation();
  const hasTrackedLanding = useRef(false);

  const trackStage = useCallback(
    async (
      stage: FunnelStage,
      metadata?: Record<string, unknown>
    ): Promise<void> => {
      try {
        const sessionId = getSessionId();
        const utmParams = getUTMParams();

        const { error } = await supabase.from("funnel_events").insert([{
          session_id: sessionId,
          user_id: user?.id || null,
          stage,
          source: utmParams.source,
          medium: utmParams.medium,
          campaign: utmParams.campaign,
          referrer: document.referrer || null,
          landing_page: window.location.pathname,
          metadata: (metadata || {}) as Record<string, string | number | boolean | null>,
        }]);

        if (error) {
          console.error("Failed to track funnel stage:", error);
        }
      } catch (err) {
        console.error("Funnel tracking error:", err);
      }
    },
    [user]
  );

  // Auto-track landing on first visit
  useEffect(() => {
    if (!hasTrackedLanding.current) {
      hasTrackedLanding.current = true;
      trackStage("landing", { 
        initialPath: location.pathname,
        queryParams: Object.fromEntries(new URLSearchParams(location.search)),
      });
    }
  }, [trackStage, location.pathname, location.search]);

  // Helper functions for common stages
  const trackSignupStarted = useCallback(
    () => trackStage("signup_started"),
    [trackStage]
  );

  const trackSignupCompleted = useCallback(
    (email?: string) => trackStage("signup_completed", { email }),
    [trackStage]
  );

  const trackOnboardingStarted = useCallback(
    () => trackStage("onboarding_started"),
    [trackStage]
  );

  const trackOnboardingCompleted = useCallback(
    (data?: Record<string, unknown>) => trackStage("onboarding_completed", data),
    [trackStage]
  );

  const trackTrialStarted = useCallback(
    () => trackStage("trial_started"),
    [trackStage]
  );

  const trackTrialCompleted = useCallback(
    () => trackStage("trial_completed"),
    [trackStage]
  );

  const trackSubscriptionStarted = useCallback(
    (plan?: string) => trackStage("subscription_started", { plan }),
    [trackStage]
  );

  const trackConverted = useCallback(
    (value?: number, plan?: string) => trackStage("converted", { value, plan }),
    [trackStage]
  );

  const trackPageView = useCallback(
    (pageName: string) => trackStage("page_view", { page: pageName }),
    [trackStage]
  );

  return {
    trackStage,
    trackSignupStarted,
    trackSignupCompleted,
    trackOnboardingStarted,
    trackOnboardingCompleted,
    trackTrialStarted,
    trackTrialCompleted,
    trackSubscriptionStarted,
    trackConverted,
    trackPageView,
  };
};

export default useFunnelTracking;
