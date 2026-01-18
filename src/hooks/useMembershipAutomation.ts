/**
 * Hook for membership tier automation
 * Handles tier-based access, upgrade suggestions, and benefit management
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSubscription } from "./useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  MEMBERSHIP_TIERS,
  getTierById,
  MembershipTier,
} from "@/lib/membership-tiers";
import {
  getTierBenefits,
  canAccessService,
  TierBenefits,
} from "@/lib/business-logic";

interface UsageMetrics {
  requestsThisMonth: number;
  creditsUsed: number;
  creditsRemaining: number;
  averageResponseTime: number;
  completedRequests: number;
}

interface UpgradeRecommendation {
  shouldUpgrade: boolean;
  reason: string;
  suggestedTier: MembershipTier | null;
  savings?: number;
}

export const useMembershipAutomation = () => {
  const { user } = useAuth();
  const { tier, tierDetails, subscribed, isTrial, trialEndsAt, createCheckout } = useSubscription();
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get current tier benefits
  const benefits = useMemo((): TierBenefits => {
    return getTierBenefits(tier || "silver");
  }, [tier]);

  // Get available tiers for upgrade
  const availableUpgrades = useMemo((): MembershipTier[] => {
    if (!tier) return MEMBERSHIP_TIERS;
    
    const tierOrder = ["silver", "gold", "platinum"];
    const currentIndex = tierOrder.indexOf(tier);
    
    return MEMBERSHIP_TIERS.filter((t) => {
      const tierIndex = tierOrder.indexOf(t.id);
      return tierIndex > currentIndex;
    });
  }, [tier]);

  // Check if user can access a specific service category
  const checkServiceAccess = useCallback(
    (serviceCategory: string): { canAccess: boolean; requiredTier?: string } => {
      if (!subscribed) {
        return { canAccess: false, requiredTier: "silver" };
      }

      const hasAccess = canAccessService(tier || "silver", serviceCategory);
      
      if (!hasAccess) {
        // Find minimum tier that grants access
        const requiredTier = MEMBERSHIP_TIERS.find((t) =>
          canAccessService(t.id, serviceCategory)
        );
        return {
          canAccess: false,
          requiredTier: requiredTier?.id || "platinum",
        };
      }

      return { canAccess: true };
    },
    [tier, subscribed]
  );

  // Fetch usage metrics
  const fetchUsageMetrics = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Get requests this month
      const { data: requests } = await supabase
        .from("service_requests")
        .select("id, status, created_at")
        .eq("client_id", user.id)
        .gte("created_at", startOfMonth.toISOString());

      // Get credit transactions this month
      const { data: transactions } = await supabase
        .from("credit_transactions")
        .select("amount, transaction_type")
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString());

      // Get current credit balance
      const { data: credits } = await supabase
        .from("user_credits")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      const creditsUsed = transactions
        ?.filter((t) => t.transaction_type === "usage")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

      setUsageMetrics({
        requestsThisMonth: requests?.length || 0,
        creditsUsed,
        creditsRemaining: credits?.balance || 0,
        averageResponseTime: 0, // Would need response time tracking
        completedRequests: requests?.filter((r) => r.status === "completed").length || 0,
      });
    } catch (error) {
      console.error("Error fetching usage metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Generate upgrade recommendation
  const getUpgradeRecommendation = useCallback((): UpgradeRecommendation => {
    if (!usageMetrics || !tier) {
      return {
        shouldUpgrade: false,
        reason: "Unable to analyze usage",
        suggestedTier: null,
      };
    }

    const currentTierDetails = getTierById(tier);
    const monthlyCredits = currentTierDetails?.monthlyCredits || 0;

    // Check if user is using most of their credits
    if (usageMetrics.creditsUsed > monthlyCredits * 0.9) {
      const nextTier = availableUpgrades[0];
      if (nextTier) {
        return {
          shouldUpgrade: true,
          reason: "You've used over 90% of your monthly credits. Upgrade for more capacity.",
          suggestedTier: nextTier,
        };
      }
    }

    // Check if user needs faster response times
    if (tier === "silver" && usageMetrics.requestsThisMonth > 3) {
      return {
        shouldUpgrade: true,
        reason: "Upgrade to Gold for priority response times and a dedicated account manager.",
        suggestedTier: getTierById("gold") || null,
      };
    }

    // Check for power users
    if (tier === "gold" && usageMetrics.requestsThisMonth > 10) {
      return {
        shouldUpgrade: true,
        reason: "Your usage suggests Platinum would provide better value with unlimited requests.",
        suggestedTier: getTierById("platinum") || null,
      };
    }

    return {
      shouldUpgrade: false,
      reason: "Your current tier matches your usage pattern.",
      suggestedTier: null,
    };
  }, [tier, usageMetrics, availableUpgrades]);

  // Initiate upgrade
  const initiateUpgrade = useCallback(
    async (tierId: string, annual: boolean = false) => {
      const targetTier = getTierById(tierId);
      if (!targetTier) {
        toast.error("Invalid tier selected");
        return { success: false };
      }

      try {
        const priceId = annual ? targetTier.annualPriceId : targetTier.monthlyPriceId;
        await createCheckout(priceId);
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to initiate upgrade";
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [createCheckout]
  );

  // Calculate trial days remaining
  const trialDaysRemaining = useMemo(() => {
    if (!isTrial || !trialEndsAt) return null;
    const endDate = new Date(trialEndsAt);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [isTrial, trialEndsAt]);

  // Unlock celebration for tier upgrades
  const celebrateUpgrade = useCallback((newTier: string) => {
    const tierNames: Record<string, string> = {
      silver: "Silver",
      gold: "Gold", 
      platinum: "Platinum",
    };
    
    toast.success(`Welcome to ${tierNames[newTier] || newTier}! 🎉`, {
      description: "Your new benefits are now active.",
      duration: 5000,
    });
  }, []);

  // Load metrics on mount
  useEffect(() => {
    if (user && subscribed) {
      fetchUsageMetrics();
    }
  }, [user, subscribed, fetchUsageMetrics]);

  return {
    // Current state
    tier,
    tierDetails,
    benefits,
    subscribed,
    isTrial,
    trialDaysRemaining,
    
    // Usage data
    usageMetrics,
    isLoading,
    
    // Access control
    checkServiceAccess,
    
    // Upgrade management
    availableUpgrades,
    getUpgradeRecommendation,
    initiateUpgrade,
    celebrateUpgrade,
    
    // Refresh
    refreshMetrics: fetchUsageMetrics,
  };
};

export default useMembershipAutomation;
