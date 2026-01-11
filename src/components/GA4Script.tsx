import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Replace with your actual GA4 Measurement ID
const GA4_MEASUREMENT_ID = "G-XXXXXXXXXX";

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

interface GA4ScriptProps {
  measurementId?: string;
}

const GA4Script = ({ measurementId = GA4_MEASUREMENT_ID }: GA4ScriptProps) => {
  const location = useLocation();

  useEffect(() => {
    // Skip if measurement ID is not configured
    if (measurementId === "G-XXXXXXXXXX") {
      console.info("GA4: Measurement ID not configured. Analytics disabled.");
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    // Check if script already exists
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
      return;
    }

    // Create and inject GA4 script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize GA4
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: true,
      // Enhanced measurement settings
      enhanced_measurement: {
        scrolls: true,
        outbound_clicks: true,
        site_search: true,
        video_engagement: true,
        file_downloads: true,
      },
      // Custom dimensions for luxury tracking
      custom_map: {
        dimension1: "user_tier",
        dimension2: "referral_source",
        dimension3: "service_category",
      },
    });

    return () => {
      // Cleanup if needed
    };
  }, [measurementId]);

  // Track page views on route change
  useEffect(() => {
    if (measurementId === "G-XXXXXXXXXX" || !window.gtag) return;

    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [location, measurementId]);

  return null;
};

// Utility functions for custom event tracking
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, parameters);
  }
};

export const trackConversion = (
  conversionId: string,
  value?: number,
  currency?: string
) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: conversionId,
      value: value,
      currency: currency || "USD",
    });
  }
};

export const trackUserProperties = (properties: Record<string, any>) => {
  if (typeof window.gtag === "function") {
    window.gtag("set", "user_properties", properties);
  }
};

// E-commerce tracking
export const trackPurchase = (
  transactionId: string,
  value: number,
  items: any[]
) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", "purchase", {
      transaction_id: transactionId,
      value: value,
      currency: "USD",
      items: items,
    });
  }
};

// Lead tracking for luxury services
export const trackLead = (
  leadType: string,
  leadValue?: number,
  serviceCategory?: string
) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", {
      lead_type: leadType,
      value: leadValue || 0,
      currency: "USD",
      service_category: serviceCategory,
    });
  }
};

// Membership interest tracking
export const trackMembershipInterest = (
  tier: string,
  action: string
) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", "membership_interest", {
      membership_tier: tier,
      action: action,
    });
  }
};

export default GA4Script;
