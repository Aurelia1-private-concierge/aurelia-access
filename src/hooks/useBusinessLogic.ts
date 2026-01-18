/**
 * React hook for comprehensive business logic
 * Provides partner booking, credit management, service pipeline, and tier automation
 */

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "./useSubscription";
import { useCredits } from "./useCredits";
import { toast } from "sonner";
import {
  SERVICE_CREDIT_COSTS,
  SERVICE_STATUS_FLOW,
  RequestStatus,
  calculateServiceCreditCost,
  advanceServiceStatus,
  assignPartnerToRequest,
  getTierBenefits,
  canAccessService,
  checkAndSuggestUpgrade,
  calculateSLAMetrics,
  PartnerBookingRequest,
  TierBenefits,
} from "@/lib/business-logic";

interface UseBusinessLogicReturn {
  // Credit operations
  getServiceCost: (category: string, priority?: string, budgetMax?: number) => number;
  checkCredits: (requiredCredits: number) => Promise<{ sufficient: boolean; balance: number }>;
  
  // Service pipeline
  canTransitionTo: (currentStatus: RequestStatus, targetStatus: RequestStatus) => boolean;
  updateServiceStatus: (
    requestId: string,
    newStatus: RequestStatus,
    notes?: string
  ) => Promise<{ success: boolean; error?: string }>;
  
  // Partner booking
  assignPartner: (booking: PartnerBookingRequest) => Promise<{ success: boolean; error?: string }>;
  
  // Tier management
  benefits: TierBenefits;
  canAccess: (serviceCategory: string) => boolean;
  checkUpgradeNeeded: (serviceCategory: string) => Promise<{
    needsUpgrade: boolean;
    suggestedTier?: string;
    reason?: string;
  }>;
  
  // SLA
  getSLAMetrics: (createdAt: string, firstResponseAt?: string) => ReturnType<typeof calculateSLAMetrics>;
  
  // Loading states
  isProcessing: boolean;
}

export const useBusinessLogic = (): UseBusinessLogicReturn => {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const { balance, isUnlimited, useCredit } = useCredits();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get the cost for a service request
  const getServiceCost = useCallback(
    (category: string, priority: string = "standard", budgetMax?: number) => {
      if (isUnlimited) return 0;
      return calculateServiceCreditCost(category, priority, budgetMax);
    },
    [isUnlimited]
  );

  // Check if user has sufficient credits
  const checkCredits = useCallback(
    async (requiredCredits: number) => {
      if (!user) {
        return { sufficient: false, balance: 0 };
      }

      if (isUnlimited) {
        return { sufficient: true, balance: 999 };
      }

      return { sufficient: balance >= requiredCredits, balance };
    },
    [user, balance, isUnlimited]
  );

  // Check if status transition is valid
  const canTransitionTo = useCallback(
    (currentStatus: RequestStatus, targetStatus: RequestStatus) => {
      const allowedTransitions = SERVICE_STATUS_FLOW[currentStatus] || [];
      return allowedTransitions.includes(targetStatus);
    },
    []
  );

  // Update service request status
  const updateServiceStatus = useCallback(
    async (requestId: string, newStatus: RequestStatus, notes?: string) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      setIsProcessing(true);
      try {
        const result = await advanceServiceStatus(
          requestId,
          newStatus,
          user.id,
          "client",
          notes
        );

        if (result.success) {
          toast.success(`Status updated to ${newStatus}`);
        } else {
          toast.error(result.error || "Failed to update status");
        }

        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsProcessing(false);
      }
    },
    [user]
  );

  // Assign partner to request
  const assignPartner = useCallback(
    async (booking: PartnerBookingRequest) => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      setIsProcessing(true);
      try {
        await assignPartnerToRequest(booking);
        toast.success("Partner assigned successfully");
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to assign partner";
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsProcessing(false);
      }
    },
    [user]
  );

  // Get tier benefits
  const benefits = getTierBenefits(tier || "silver");

  // Check service access
  const canAccess = useCallback(
    (serviceCategory: string) => {
      if (!tier) return false;
      return canAccessService(tier, serviceCategory);
    },
    [tier]
  );

  // Check if upgrade is needed
  const checkUpgradeNeeded = useCallback(
    async (serviceCategory: string) => {
      if (!user) {
        return { needsUpgrade: true, suggestedTier: "silver", reason: "Login required" };
      }
      return checkAndSuggestUpgrade(user.id, serviceCategory);
    },
    [user]
  );

  // Get SLA metrics
  const getSLAMetrics = useCallback(
    (createdAt: string, firstResponseAt?: string) => {
      return calculateSLAMetrics(createdAt, tier || "silver", firstResponseAt);
    },
    [tier]
  );

  return {
    getServiceCost,
    checkCredits,
    canTransitionTo,
    updateServiceStatus,
    assignPartner,
    benefits,
    canAccess,
    checkUpgradeNeeded,
    getSLAMetrics,
    isProcessing,
  };
};

export default useBusinessLogic;
