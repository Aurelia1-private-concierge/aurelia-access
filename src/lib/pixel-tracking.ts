// Centralized Pixel Tracking Utility for Aurelia
// Manages Meta, Google, LinkedIn, TikTok, and GA4 pixel events

import { supabase } from "@/integrations/supabase/client";

interface PixelConfig {
  metaPixelId: string | null;
  googleAdsId: string | null;
  linkedInPartnerId: string | null;
  tiktokPixelId: string | null;
  ga4MeasurementId: string | null;
  metaActive: boolean;
  googleActive: boolean;
  linkedInActive: boolean;
  tiktokActive: boolean;
  ga4Active: boolean;
}

let pixelConfig: PixelConfig | null = null;
let configPromise: Promise<PixelConfig> | null = null;

// Load pixel configuration from app_settings
export const loadPixelConfig = async (): Promise<PixelConfig> => {
  if (pixelConfig) return pixelConfig;
  if (configPromise) return configPromise;

  configPromise = (async () => {
    const keys = [
      "meta_pixel_id", "meta_pixel_id_active",
      "google_ads_id", "google_ads_id_active",
      "linkedin_partner_id", "linkedin_partner_id_active",
      "tiktok_pixel_id", "tiktok_pixel_id_active",
      "ga4_measurement_id", "ga4_measurement_id_active"
    ];

    const { data } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", keys);

    const settings = new Map((data || []).map(s => [s.key, s.value]));

    pixelConfig = {
      metaPixelId: settings.get("meta_pixel_id") || null,
      googleAdsId: settings.get("google_ads_id") || null,
      linkedInPartnerId: settings.get("linkedin_partner_id") || null,
      tiktokPixelId: settings.get("tiktok_pixel_id") || null,
      ga4MeasurementId: settings.get("ga4_measurement_id") || null,
      metaActive: settings.get("meta_pixel_id_active") === "true",
      googleActive: settings.get("google_ads_id_active") === "true",
      linkedInActive: settings.get("linkedin_partner_id_active") === "true",
      tiktokActive: settings.get("tiktok_pixel_id_active") === "true",
      ga4Active: settings.get("ga4_measurement_id_active") === "true"
    };

    return pixelConfig;
  })();

  return configPromise;
};

// Check if user has consented to tracking
const hasConsent = (): boolean => {
  try {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) return false;
    const parsed = JSON.parse(consent);
    return parsed.analytics === true;
  } catch {
    return false;
  }
};

// Fire Meta Pixel event
const fireMetaEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (!pixelConfig?.metaActive || !pixelConfig.metaPixelId) return;
  
  // @ts-ignore
  if (typeof fbq === "function") {
    // @ts-ignore
    fbq("track", eventName, params);
  }
};

// Fire Google Ads event
const fireGoogleEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (!pixelConfig?.googleActive || !pixelConfig.googleAdsId) return;
  
  // @ts-ignore
  if (typeof gtag === "function") {
    // @ts-ignore
    gtag("event", eventName, params);
  }
};

// Fire LinkedIn event
const fireLinkedInEvent = (conversionId?: string) => {
  if (!pixelConfig?.linkedInActive || !pixelConfig.linkedInPartnerId) return;
  
  // @ts-ignore
  if (typeof lintrk === "function" && conversionId) {
    // @ts-ignore
    lintrk("track", { conversion_id: conversionId });
  }
};

// Fire TikTok event
const fireTikTokEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (!pixelConfig?.tiktokActive || !pixelConfig.tiktokPixelId) return;
  
  // @ts-ignore
  if (typeof ttq === "object" && ttq.track) {
    // @ts-ignore
    ttq.track(eventName, params);
  }
};

// Fire GA4 event
const fireGA4Event = (eventName: string, params?: Record<string, unknown>) => {
  if (!pixelConfig?.ga4Active || !pixelConfig.ga4MeasurementId) return;
  
  // @ts-ignore
  if (typeof gtag === "function") {
    // @ts-ignore
    gtag("event", eventName, params);
  }
};

// Unified event firing
export const firePixelEvent = async (
  eventName: string,
  params?: Record<string, unknown>
): Promise<void> => {
  // Respect user consent
  if (!hasConsent()) {
    console.log("[Pixels] Skipping - no consent");
    return;
  }

  // Ensure config is loaded
  await loadPixelConfig();

  // Map common event names to platform-specific names
  const eventMappings: Record<string, {
    meta: string;
    google: string;
    linkedin?: string;
    tiktok: string;
    ga4: string;
  }> = {
    page_view: {
      meta: "PageView",
      google: "page_view",
      tiktok: "PageView",
      ga4: "page_view"
    },
    lead: {
      meta: "Lead",
      google: "generate_lead",
      linkedin: "submit_form",
      tiktok: "SubmitForm",
      ga4: "generate_lead"
    },
    sign_up: {
      meta: "CompleteRegistration",
      google: "sign_up",
      linkedin: "conversion",
      tiktok: "CompleteRegistration",
      ga4: "sign_up"
    },
    trial_start: {
      meta: "StartTrial",
      google: "start_trial",
      tiktok: "Subscribe",
      ga4: "start_trial"
    },
    membership_interest: {
      meta: "InitiateCheckout",
      google: "begin_checkout",
      tiktok: "InitiateCheckout",
      ga4: "begin_checkout"
    }
  };

  const mapping = eventMappings[eventName];
  
  if (mapping) {
    fireMetaEvent(mapping.meta, params);
    fireGoogleEvent(mapping.google, params);
    if (mapping.linkedin) fireLinkedInEvent(mapping.linkedin);
    fireTikTokEvent(mapping.tiktok, params);
    fireGA4Event(mapping.ga4, params);
  } else {
    // Fire custom event to all platforms
    fireMetaEvent(eventName, params);
    fireGoogleEvent(eventName, params);
    fireTikTokEvent(eventName, params);
    fireGA4Event(eventName, params);
  }
};

// Track page view (call on route changes)
export const trackPixelPageView = async (): Promise<void> => {
  await firePixelEvent("page_view", {
    page_path: window.location.pathname,
    page_title: document.title
  });
};

// Track lead capture
export const trackPixelLead = async (email?: string): Promise<void> => {
  await firePixelEvent("lead", { email });
};

// Track sign up completion
export const trackPixelSignUp = async (method?: string): Promise<void> => {
  await firePixelEvent("sign_up", { method });
};

// Track trial start
export const trackPixelTrialStart = async (): Promise<void> => {
  await firePixelEvent("trial_start");
};

// Track membership interest
export const trackPixelMembershipInterest = async (tier?: string): Promise<void> => {
  await firePixelEvent("membership_interest", { tier });
};
