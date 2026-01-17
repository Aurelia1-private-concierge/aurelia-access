import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { getStoredUTMParams } from "./useUTMTracking";

export interface CampaignContent {
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  source: string | null;
}

interface CampaignConfig {
  badge: string;
  title: string;
  subtitle: string;
  ctaText?: string;
}

// Campaign-specific messaging based on UTM source/medium
const campaignConfigs: Record<string, CampaignConfig> = {
  // Finance & Wealth Management
  "linkedin-finance": {
    badge: "For Discerning Professionals",
    title: "Discrete Wealth Management Support",
    subtitle: "A private concierge service trusted by executives who value confidentiality, efficiency, and exceptional service.",
  },
  "linkedin-exec": {
    badge: "Executive Concierge",
    title: "Your Time is Your Greatest Asset",
    subtitle: "Delegate life's complexities to Aurelia. From travel to investments, we handle the details so you can focus on what matters.",
  },
  
  // Travel & Lifestyle
  "instagram-travel": {
    badge: "Curated Journeys Await",
    title: "Travel Beyond the Ordinary",
    subtitle: "Private jets, yacht charters, and exclusive experiences—crafted by those who understand true luxury.",
  },
  "instagram-lifestyle": {
    badge: "Elevated Living",
    title: "A Life Without Limits",
    subtitle: "From bespoke experiences to rare acquisitions, Aurelia opens doors that others cannot.",
  },
  
  // Real Estate
  "linkedin-realestate": {
    badge: "Premier Property Access",
    title: "Exclusive Properties. Private Access.",
    subtitle: "Off-market estates, luxury penthouses, and investment properties—discovered before they reach the market.",
  },
  
  // Events & Entertainment
  "facebook-events": {
    badge: "Exclusive Access",
    title: "Be Where Others Cannot",
    subtitle: "VIP access to the world's most coveted events, from galas to private gatherings.",
  },
  
  // Tech & Innovation
  "twitter-tech": {
    badge: "The Future of Concierge",
    title: "AI-Powered. Human-Centered.",
    subtitle: "Where cutting-edge technology meets white-glove service. Experience the evolution of luxury concierge.",
  },
  
  // Partner referrals
  "partner-referral": {
    badge: "By Invitation",
    title: "Welcome to the Inner Circle",
    subtitle: "You've been referred by a trusted member. Experience the same exceptional service they enjoy.",
    ctaText: "Accept Invitation",
  },
  
  // Referral program
  "referral": {
    badge: "By Recommendation",
    title: "A Friend Believes You Belong Here",
    subtitle: "You've been invited by someone who knows exceptional service. Discover what they've been enjoying.",
    ctaText: "Claim Your Invitation",
  },
  
  // Google Ads
  "google-luxury": {
    badge: "Luxury Redefined",
    title: "The Concierge Service You Deserve",
    subtitle: "24/7 access to a dedicated team handling travel, lifestyle, and everything in between.",
  },
  "google-travel": {
    badge: "Travel Excellence",
    title: "Private Aviation. Yacht Charters. Curated Journeys.",
    subtitle: "Your next extraordinary journey begins with a single conversation.",
  },
  
  // Email campaigns
  "email-nurture": {
    badge: "Welcome Back",
    title: "Your Exceptional Life Awaits",
    subtitle: "You've been considering Aurelia. Today is the perfect day to begin.",
    ctaText: "Start Your Journey",
  },
  "email-exclusive": {
    badge: "Exclusive Offer",
    title: "A Special Invitation Just for You",
    subtitle: "As a valued prospect, you're invited to experience Aurelia with exclusive founding member benefits.",
    ctaText: "Claim Your Offer",
  },
};

// Map UTM parameters to campaign config keys
function getCampaignKey(source?: string, medium?: string, campaign?: string): string | null {
  if (!source) return null;
  
  const sourceLower = source.toLowerCase();
  const mediumLower = medium?.toLowerCase() || "";
  const campaignLower = campaign?.toLowerCase() || "";
  
  // Check for referral first
  if (sourceLower === "referral" || campaignLower.includes("referral")) {
    return "referral";
  }
  
  if (sourceLower === "partner" || campaignLower.includes("partner")) {
    return "partner-referral";
  }
  
  // LinkedIn campaigns
  if (sourceLower === "linkedin") {
    if (campaignLower.includes("finance") || campaignLower.includes("wealth") || campaignLower.includes("hnwi")) {
      return "linkedin-finance";
    }
    if (campaignLower.includes("exec") || campaignLower.includes("ceo") || campaignLower.includes("founder")) {
      return "linkedin-exec";
    }
    if (campaignLower.includes("realestate") || campaignLower.includes("property")) {
      return "linkedin-realestate";
    }
    return "linkedin-exec"; // Default LinkedIn
  }
  
  // Instagram campaigns
  if (sourceLower === "instagram") {
    if (campaignLower.includes("travel") || campaignLower.includes("journey")) {
      return "instagram-travel";
    }
    return "instagram-lifestyle";
  }
  
  // Facebook campaigns
  if (sourceLower === "facebook") {
    return "facebook-events";
  }
  
  // Twitter/X campaigns
  if (sourceLower === "twitter" || sourceLower === "x") {
    return "twitter-tech";
  }
  
  // Google campaigns
  if (sourceLower === "google") {
    if (campaignLower.includes("travel") || campaignLower.includes("jet") || campaignLower.includes("yacht")) {
      return "google-travel";
    }
    return "google-luxury";
  }
  
  // Email campaigns
  if (sourceLower === "email" || mediumLower === "email") {
    if (campaignLower.includes("exclusive") || campaignLower.includes("vip")) {
      return "email-exclusive";
    }
    return "email-nurture";
  }
  
  return null;
}

export const useCampaignPersonalization = (): CampaignContent => {
  const [searchParams] = useSearchParams();
  
  return useMemo(() => {
    // First check URL params (fresh visit)
    let source = searchParams.get("utm_source");
    let medium = searchParams.get("utm_medium");
    let campaign = searchParams.get("utm_campaign");
    
    // Fall back to stored UTM params
    if (!source) {
      const stored = getStoredUTMParams();
      if (stored) {
        source = stored.utm_source || null;
        medium = stored.utm_medium || null;
        campaign = stored.utm_campaign || null;
      }
    }
    
    // Check for ref parameter (referral shortcut)
    const ref = searchParams.get("ref");
    if (ref && !source) {
      source = "referral";
    }
    
    const campaignKey = getCampaignKey(source || undefined, medium || undefined, campaign || undefined);
    
    if (campaignKey && campaignConfigs[campaignKey]) {
      const config = campaignConfigs[campaignKey];
      return {
        badge: config.badge,
        title: config.title,
        subtitle: config.subtitle,
        ctaText: config.ctaText || "Begin Your Journey",
        source: source,
      };
    }
    
    // Default content (no personalization)
    return {
      badge: "",
      title: "",
      subtitle: "",
      ctaText: "",
      source: null,
    };
  }, [searchParams]);
};

export default useCampaignPersonalization;
