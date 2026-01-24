// Orla VIP Engagement - Proactive engagement for high-value prospects
// Connects VIP detection with Orla's AI assistant capabilities

import { VIPDetectionResult, detectVIP, markOrlaEngaged } from "@/lib/vip-detection";
import { getStoredSignals } from "@/lib/lead-scoring";

export interface OrlaVIPContext {
  isVIP: boolean;
  score: number;
  tier: string;
  alertType: string | null;
  topSignals: string[];
  suggestedGreeting: string;
  suggestedOffers: string[];
  urgency: "low" | "medium" | "high" | "critical";
}

// Generate VIP context for Orla's personalized engagement
export const getOrlaVIPContext = (): OrlaVIPContext => {
  const detection = detectVIP();
  const signals = getStoredSignals();
  
  // Get top contributing signals
  const topSignals: string[] = [];
  if (signals.pagesVisited?.includes("/pricing")) topSignals.push("viewed_pricing");
  if (signals.pagesVisited?.includes("/membership")) topSignals.push("viewed_membership");
  if (signals.pagesVisited?.includes("/trial")) topSignals.push("viewed_trial");
  if ((signals.returnVisits || 0) > 0) topSignals.push("returning_visitor");
  if ((signals.timeOnSite || 0) > 300) topSignals.push("high_engagement");
  if (signals.utmSource === "linkedin") topSignals.push("linkedin_referral");
  if ((signals.servicesViewed || 0) >= 3) topSignals.push("explored_services");
  
  // Generate personalized greeting based on context
  let suggestedGreeting = "Welcome to Aurelia. How may I assist you today?";
  
  if (detection.alertType === "ultra_high_intent") {
    suggestedGreeting = "Welcome back. I noticed you've been exploring our membership options. May I share some exclusive benefits tailored to your interests?";
  } else if (detection.alertType === "high_intent") {
    suggestedGreeting = "Good to see you again. I'd be delighted to discuss how our concierge services could complement your lifestyle.";
  } else if (detection.alertType === "qualified_lead") {
    suggestedGreeting = "Welcome to Aurelia Private Concierge. I'm here to help you discover our bespoke luxury services.";
  }
  
  // Suggest offers based on signals
  const suggestedOffers: string[] = [];
  
  if (topSignals.includes("viewed_pricing") || topSignals.includes("viewed_membership")) {
    suggestedOffers.push("7-day complimentary trial");
    suggestedOffers.push("Private consultation with a lifestyle manager");
  }
  
  if (topSignals.includes("high_engagement")) {
    suggestedOffers.push("Exclusive access to our partner network");
  }
  
  if (topSignals.includes("linkedin_referral")) {
    suggestedOffers.push("Professional networking concierge services");
  }
  
  if (topSignals.includes("explored_services")) {
    suggestedOffers.push("Customized service package");
  }
  
  // Default offers
  if (suggestedOffers.length === 0) {
    suggestedOffers.push("Introduction to Aurelia's signature services");
  }
  
  // Determine urgency for follow-up
  let urgency: OrlaVIPContext["urgency"] = "low";
  if (detection.score.total >= 90) urgency = "critical";
  else if (detection.score.total >= 80) urgency = "high";
  else if (detection.score.total >= 70) urgency = "medium";
  
  return {
    isVIP: detection.isVIP,
    score: detection.score.total,
    tier: detection.score.tier,
    alertType: detection.alertType,
    topSignals,
    suggestedGreeting,
    suggestedOffers,
    urgency,
  };
};

// Generate system prompt enhancement for Orla when engaging VIPs
export const getOrlaVIPSystemPrompt = (): string | null => {
  const context = getOrlaVIPContext();
  
  if (!context.isVIP) return null;
  
  return `
[VIP VISITOR DETECTED - Priority Engagement Mode]
Lead Score: ${context.score}/100 (${context.tier.toUpperCase()})
Urgency Level: ${context.urgency.toUpperCase()}
Key Signals: ${context.topSignals.join(", ")}

ENGAGEMENT GUIDELINES:
- This visitor shows ${context.tier === "qualified" ? "exceptional" : "strong"} purchase intent
- Proactively offer value without being pushy
- Mention the 7-day complimentary trial naturally when relevant
- Emphasize exclusivity and personalization
- If they express interest, offer to connect them with a dedicated liaison

SUGGESTED OPENING: "${context.suggestedGreeting}"

RECOMMENDED OFFERS TO WEAVE IN:
${context.suggestedOffers.map((o, i) => `${i + 1}. ${o}`).join("\n")}

Remember: This is a high-value prospect. Prioritize building rapport while subtly guiding toward trial signup or consultation booking.
`.trim();
};

// Track when Orla engages with a VIP
export const trackOrlaVIPEngagement = async (): Promise<void> => {
  const context = getOrlaVIPContext();
  
  if (context.isVIP) {
    await markOrlaEngaged();
  }
};

export default {
  getOrlaVIPContext,
  getOrlaVIPSystemPrompt,
  trackOrlaVIPEngagement,
};