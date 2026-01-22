import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type FunnelStage =
  | "landing"
  | "page_view"
  // Auth flow stages
  | "auth_page_view"
  | "auth_form_focus"
  | "auth_login_attempt"
  | "auth_login_success"
  | "auth_login_failed"
  | "auth_signup_view"
  | "signup_started"
  | "signup_completed"
  | "signup_failed"
  | "auth_password_reset"
  | "auth_google_attempt"
  | "auth_mfa_required"
  | "auth_mfa_success"
  | "auth_mfa_failed"
  // Onboarding flow stages
  | "onboarding_started"
  | "onboarding_step_1"
  | "onboarding_step_2"
  | "onboarding_step_3"
  | "onboarding_step_4"
  | "onboarding_step_5"
  | "onboarding_step_6"
  | "onboarding_step_7"
  | "onboarding_skipped"
  | "onboarding_completed"
  // Conversion stages
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

  // ===== Auth Flow Tracking =====
  const trackAuthPageView = useCallback(
    (isLogin: boolean) => trackStage("auth_page_view", { mode: isLogin ? "login" : "signup" }),
    [trackStage]
  );

  const trackAuthFormFocus = useCallback(
    (field: string) => trackStage("auth_form_focus", { field }),
    [trackStage]
  );

  const trackLoginAttempt = useCallback(
    () => trackStage("auth_login_attempt"),
    [trackStage]
  );

  const trackLoginSuccess = useCallback(
    (email?: string) => trackStage("auth_login_success", { email }),
    [trackStage]
  );

  const trackLoginFailed = useCallback(
    (reason?: string) => trackStage("auth_login_failed", { reason }),
    [trackStage]
  );

  const trackSignupView = useCallback(
    () => trackStage("auth_signup_view"),
    [trackStage]
  );

  const trackSignupStarted = useCallback(
    () => trackStage("signup_started"),
    [trackStage]
  );

  const trackSignupCompleted = useCallback(
    (email?: string) => trackStage("signup_completed", { email }),
    [trackStage]
  );

  const trackSignupFailed = useCallback(
    (reason?: string) => trackStage("signup_failed", { reason }),
    [trackStage]
  );

  const trackPasswordReset = useCallback(
    () => trackStage("auth_password_reset"),
    [trackStage]
  );

  const trackGoogleAuthAttempt = useCallback(
    () => trackStage("auth_google_attempt"),
    [trackStage]
  );

  const trackMFARequired = useCallback(
    () => trackStage("auth_mfa_required"),
    [trackStage]
  );

  const trackMFASuccess = useCallback(
    () => trackStage("auth_mfa_success"),
    [trackStage]
  );

  const trackMFAFailed = useCallback(
    () => trackStage("auth_mfa_failed"),
    [trackStage]
  );

  // ===== Onboarding Flow Tracking =====
  const trackOnboardingStarted = useCallback(
    () => trackStage("onboarding_started"),
    [trackStage]
  );

  const trackOnboardingStep = useCallback(
    (step: number, stepName: string, data?: Record<string, unknown>) => {
      const stageMap: Record<number, FunnelStage> = {
        1: "onboarding_step_1",
        2: "onboarding_step_2",
        3: "onboarding_step_3",
        4: "onboarding_step_4",
        5: "onboarding_step_5",
        6: "onboarding_step_6",
        7: "onboarding_step_7",
      };
      const stage = stageMap[step] || "page_view";
      trackStage(stage, { stepName, step, ...data });
    },
    [trackStage]
  );

  const trackOnboardingSkipped = useCallback(
    (atStep: number) => trackStage("onboarding_skipped", { atStep }),
    [trackStage]
  );

  const trackOnboardingCompleted = useCallback(
    (data?: Record<string, unknown>) => trackStage("onboarding_completed", data),
    [trackStage]
  );

  // ===== Conversion Tracking =====
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
    // Auth tracking
    trackAuthPageView,
    trackAuthFormFocus,
    trackLoginAttempt,
    trackLoginSuccess,
    trackLoginFailed,
    trackSignupView,
    trackSignupStarted,
    trackSignupCompleted,
    trackSignupFailed,
    trackPasswordReset,
    trackGoogleAuthAttempt,
    trackMFARequired,
    trackMFASuccess,
    trackMFAFailed,
    // Onboarding tracking
    trackOnboardingStarted,
    trackOnboardingStep,
    trackOnboardingSkipped,
    trackOnboardingCompleted,
    // Conversion tracking
    trackTrialStarted,
    trackTrialCompleted,
    trackSubscriptionStarted,
    trackConverted,
    trackPageView,
  };
};

export default useFunnelTracking;
