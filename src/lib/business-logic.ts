/**
 * Comprehensive Business Logic Module
 * Handles partner booking, credits, service pipelines, and membership automation
 */

import { supabase } from "@/integrations/supabase/client";
import { MEMBERSHIP_TIERS, getTierById, getCreditsByTier } from "./membership-tiers";
import type { Database } from "@/integrations/supabase/types";

// Use database enum types
type RequestStatus = Database["public"]["Enums"]["request_status"];
type ServiceCategory = Database["public"]["Enums"]["service_category"];

// ============ Service Categories & Credit Costs ============

export const SERVICE_CREDIT_COSTS: Record<string, number> = {
  // Simple requests (1-2 credits)
  dining: 1,
  shopping: 1,
  travel: 2,
  events_access: 2,
  wellness: 2,
  
  // Complex bookings (5-10 credits)
  chauffeur: 5,
  security: 8,
  private_aviation: 10,
  yacht_charter: 10,
  
  // Bespoke experiences (15-25 credits)
  real_estate: 15,
  collectibles: 20,
};

export const SERVICE_PRIORITY_MULTIPLIERS: Record<string, number> = {
  standard: 1,
  priority: 1.5,
  urgent: 2,
  immediate: 3,
};

// ============ Service Request Status Flow ============
// Based on database enum: pending | accepted | in_progress | completed | cancelled

export const SERVICE_STATUS_FLOW: Record<RequestStatus, RequestStatus[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export type { RequestStatus, ServiceCategory };

// ============ Partner Booking Logic ============

export interface PartnerBookingRequest {
  serviceRequestId: string;
  partnerId: string;
  estimatedCost?: number;
  notes?: string;
}

export async function assignPartnerToRequest(request: PartnerBookingRequest) {
  const { serviceRequestId, partnerId, estimatedCost, notes } = request;

  // Verify partner exists and is approved
  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("id, company_name, status")
    .eq("id", partnerId)
    .single();

  if (partnerError || !partner) {
    throw new Error("Partner not found");
  }

  if (partner.status !== "approved") {
    throw new Error("Partner is not approved for assignments");
  }

  // Update service request with partner
  const { error: updateError } = await supabase
    .from("service_requests")
    .update({
      partner_id: partnerId,
      status: "accepted" as RequestStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", serviceRequestId);

  if (updateError) throw updateError;

  // Create status update
  await supabase.from("service_request_updates").insert({
    service_request_id: serviceRequestId,
    update_type: "partner_assignment",
    previous_status: "pending",
    new_status: "accepted",
    title: "Partner Assigned",
    description: `${partner.company_name} has been assigned to fulfill your request.${notes ? ` Notes: ${notes}` : ""}`,
    updated_by_role: "concierge",
    is_visible_to_client: true,
    metadata: { partner_id: partnerId, estimated_cost: estimatedCost },
  });

  return { success: true, partner };
}

// ============ Credit Calculation Logic ============

export function calculateServiceCreditCost(
  category: string,
  priority: string = "standard",
  budgetMax?: number
): number {
  const baseCost = SERVICE_CREDIT_COSTS[category] || 5;
  const priorityMultiplier = SERVICE_PRIORITY_MULTIPLIERS[priority] || 1;
  
  // Additional cost for high-value requests
  let budgetMultiplier = 1;
  if (budgetMax) {
    if (budgetMax > 100000) budgetMultiplier = 1.5;
    else if (budgetMax > 50000) budgetMultiplier = 1.25;
    else if (budgetMax > 25000) budgetMultiplier = 1.1;
  }

  return Math.ceil(baseCost * priorityMultiplier * budgetMultiplier);
}

export async function validateCreditSufficiency(
  userId: string,
  requiredCredits: number
): Promise<{ sufficient: boolean; balance: number; isUnlimited: boolean }> {
  // Check subscription tier first
  const { data: subscriptionData } = await supabase.functions.invoke("check-subscription", {
    body: { userId },
  });

  if (subscriptionData?.tier) {
    const tier = getTierById(subscriptionData.tier);
    if (tier?.isUnlimited) {
      return { sufficient: true, balance: 999, isUnlimited: true };
    }
  }

  // Check actual credit balance
  const { data: credits } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  const balance = credits?.balance || 0;
  return {
    sufficient: balance >= requiredCredits,
    balance,
    isUnlimited: false,
  };
}

// ============ Service Pipeline Management ============

export async function advanceServiceStatus(
  serviceRequestId: string,
  newStatus: RequestStatus,
  updatedBy: string,
  updatedByRole: "client" | "concierge" | "partner" | "system",
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  // Get current status
  const { data: request, error: fetchError } = await supabase
    .from("service_requests")
    .select("status, client_id, title")
    .eq("id", serviceRequestId)
    .single();

  if (fetchError || !request) {
    return { success: false, error: "Service request not found" };
  }

  const currentStatus = request.status as RequestStatus;
  const allowedNextStatuses = SERVICE_STATUS_FLOW[currentStatus] || [];

  if (!allowedNextStatuses.includes(newStatus)) {
    return {
      success: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  // Update status
  const { error: updateError } = await supabase
    .from("service_requests")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", serviceRequestId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Create status update record
  const statusTitles: Record<RequestStatus, string> = {
    pending: "Request Pending",
    accepted: "Request Accepted",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  await supabase.from("service_request_updates").insert({
    service_request_id: serviceRequestId,
    update_type: "status_change",
    previous_status: currentStatus,
    new_status: newStatus,
    title: statusTitles[newStatus],
    description: notes || `Status updated to ${newStatus}`,
    updated_by: updatedBy,
    updated_by_role: updatedByRole,
    is_visible_to_client: true,
  });

  // Send notification if client-visible status change
  if (["accepted", "in_progress", "completed"].includes(newStatus)) {
    await supabase.from("notifications").insert({
      user_id: request.client_id,
      type: "service_update",
      title: `${request.title}: ${statusTitles[newStatus]}`,
      description: notes || `Your service request status has been updated to ${newStatus}`,
      action_url: `/dashboard/requests/${serviceRequestId}`,
    });
  }

  return { success: true };
}

// ============ Membership Tier Automation ============

export interface TierBenefits {
  responseTimeHours: number;
  dedicatedManager: boolean;
  priorityAccess: boolean;
  unlimitedRequests: boolean;
  vipEvents: boolean;
  privateAviation: boolean;
  yachtAccess: boolean;
  propertyAccess: boolean;
  familyOffice: boolean;
}

export function getTierBenefits(tierId: string): TierBenefits {
  const tierBenefitsMap: Record<string, TierBenefits> = {
    silver: {
      responseTimeHours: 24,
      dedicatedManager: false,
      priorityAccess: false,
      unlimitedRequests: false,
      vipEvents: false,
      privateAviation: false,
      yachtAccess: false,
      propertyAccess: false,
      familyOffice: false,
    },
    gold: {
      responseTimeHours: 4,
      dedicatedManager: true,
      priorityAccess: true,
      unlimitedRequests: false,
      vipEvents: true,
      privateAviation: true,
      yachtAccess: true,
      propertyAccess: false,
      familyOffice: false,
    },
    platinum: {
      responseTimeHours: 1,
      dedicatedManager: true,
      priorityAccess: true,
      unlimitedRequests: true,
      vipEvents: true,
      privateAviation: true,
      yachtAccess: true,
      propertyAccess: true,
      familyOffice: true,
    },
  };

  return tierBenefitsMap[tierId] || tierBenefitsMap.silver;
}

export function canAccessService(tierId: string, serviceCategory: string): boolean {
  const benefits = getTierBenefits(tierId);
  
  const tierRestrictedServices: Record<string, keyof TierBenefits> = {
    private_aviation: "privateAviation",
    yacht_charter: "yachtAccess",
    real_estate: "propertyAccess",
  };

  const requiredBenefit = tierRestrictedServices[serviceCategory];
  if (!requiredBenefit) return true; // Not restricted
  
  return benefits[requiredBenefit] as boolean;
}

export async function checkAndSuggestUpgrade(
  userId: string,
  requestedService: string
): Promise<{ needsUpgrade: boolean; suggestedTier?: string; reason?: string }> {
  // Get current subscription
  const { data: subscriptionData } = await supabase.functions.invoke("check-subscription");

  const currentTier = subscriptionData?.tier || null;
  
  if (!currentTier) {
    return {
      needsUpgrade: true,
      suggestedTier: "silver",
      reason: "Membership required to access concierge services",
    };
  }

  if (!canAccessService(currentTier, requestedService)) {
    const upgradePaths: Record<string, string> = {
      silver: "gold",
      gold: "platinum",
    };

    return {
      needsUpgrade: true,
      suggestedTier: upgradePaths[currentTier] || "platinum",
      reason: `${requestedService.replace("_", " ")} requires a higher membership tier`,
    };
  }

  return { needsUpgrade: false };
}

// ============ Commission Calculation ============

export function calculatePartnerCommission(
  bookingAmount: number,
  commissionRate: number = 15
): number {
  return Math.round(bookingAmount * (commissionRate / 100) * 100) / 100;
}

export async function getPartnerPerformanceMetrics(partnerId: string) {
  const { data: commissions } = await supabase
    .from("partner_commissions")
    .select("*")
    .eq("partner_id", partnerId);

  const { data: services } = await supabase
    .from("partner_services")
    .select("id")
    .eq("partner_id", partnerId)
    .eq("is_active", true);

  const totalEarnings = commissions?.reduce((sum, c) => sum + c.commission_amount, 0) || 0;
  const completedBookings = commissions?.filter(c => c.status === "paid").length || 0;
  const pendingEarnings = commissions?.filter(c => c.status === "pending").reduce((sum, c) => sum + c.commission_amount, 0) || 0;

  return {
    totalEarnings,
    completedBookings,
    pendingEarnings,
    activeServices: services?.length || 0,
  };
}

// ============ SLA Monitoring ============

export interface SLAMetrics {
  targetResponseHours: number;
  actualResponseHours: number | null;
  isWithinSLA: boolean;
  slaDeadline: Date;
}

export function calculateSLAMetrics(
  createdAt: string,
  tierId: string,
  firstResponseAt?: string
): SLAMetrics {
  const benefits = getTierBenefits(tierId);
  const targetHours = benefits.responseTimeHours;
  const created = new Date(createdAt);
  const slaDeadline = new Date(created.getTime() + targetHours * 60 * 60 * 1000);

  let actualResponseHours: number | null = null;
  let isWithinSLA = new Date() < slaDeadline;

  if (firstResponseAt) {
    const responded = new Date(firstResponseAt);
    actualResponseHours = (responded.getTime() - created.getTime()) / (1000 * 60 * 60);
    isWithinSLA = actualResponseHours <= targetHours;
  }

  return {
    targetResponseHours: targetHours,
    actualResponseHours,
    isWithinSLA,
    slaDeadline,
  };
}
