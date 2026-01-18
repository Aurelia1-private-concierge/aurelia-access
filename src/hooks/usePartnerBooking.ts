/**
 * Hook for managing partner booking workflows
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { calculateServiceCreditCost } from "@/lib/business-logic";
import { useCredits } from "./useCredits";

interface PartnerService {
  id: string;
  partner_id: string;
  title: string;
  description: string | null;
  category: string;
  min_price: number | null;
  max_price: number | null;
  currency: string | null;
  highlights: string[] | null;
  availability_notes: string | null;
  is_active: boolean;
}

interface BookingRequest {
  serviceId: string;
  partnerId: string;
  category: string;
  priority?: "standard" | "priority" | "urgent" | "immediate";
  preferredDate?: string;
  notes?: string;
  budgetMin?: number;
  budgetMax?: number;
}

interface BookingResult {
  success: boolean;
  requestId?: string;
  error?: string;
  creditsUsed?: number;
}

export const usePartnerBooking = () => {
  const { user, session } = useAuth();
  const { balance, isUnlimited, useCredit } = useCredits();
  const [isLoading, setIsLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState<PartnerService[]>([]);

  // Fetch available partner services
  const fetchServices = useCallback(async (category?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("partner_services")
        .select(`
          id,
          partner_id,
          title,
          description,
          category,
          min_price,
          max_price,
          currency,
          highlights,
          availability_notes,
          is_active
        `)
        .eq("is_active", true);

      if (category) {
        query = query.eq("category", category as "chauffeur" | "collectibles" | "dining" | "events_access" | "private_aviation" | "real_estate" | "security" | "shopping" | "travel" | "wellness" | "yacht_charter");
      }

      const { data, error } = await query.order("title");

      if (error) throw error;
      setAvailableServices(data || []);
      return data || [];
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load available services");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate booking cost
  const getBookingCost = useCallback(
    (category: string, priority: string = "standard", budgetMax?: number): number => {
      if (isUnlimited) return 0;
      return calculateServiceCreditCost(category, priority, budgetMax);
    },
    [isUnlimited]
  );

  // Check if user can afford booking
  const canAfford = useCallback(
    (category: string, priority: string = "standard", budgetMax?: number): boolean => {
      if (isUnlimited) return true;
      const cost = getBookingCost(category, priority, budgetMax);
      return balance >= cost;
    },
    [balance, isUnlimited, getBookingCost]
  );

  // Create a booking request
  const createBooking = useCallback(
    async (booking: BookingRequest): Promise<BookingResult> => {
      if (!user || !session) {
        return { success: false, error: "You must be logged in to book services" };
      }

      const creditsNeeded = getBookingCost(
        booking.category,
        booking.priority,
        booking.budgetMax
      );

      // Validate credits
      if (!isUnlimited && balance < creditsNeeded) {
        return {
          success: false,
          error: `Insufficient credits. You need ${creditsNeeded} credits but only have ${balance}.`,
        };
      }

      setIsLoading(true);
      try {
        // Create service request with validated category
        type ServiceCategory = "chauffeur" | "collectibles" | "dining" | "events_access" | "private_aviation" | "real_estate" | "security" | "shopping" | "travel" | "wellness" | "yacht_charter";
        const validCategory = (["chauffeur", "collectibles", "dining", "events_access", "private_aviation", "real_estate", "security", "shopping", "travel", "wellness", "yacht_charter"].includes(booking.category) 
          ? booking.category 
          : "travel") as ServiceCategory;

        const { data: request, error: requestError } = await supabase
          .from("service_requests")
          .insert({
            client_id: user.id,
            title: `Partner Service Booking`,
            description: booking.notes || "Service booking request",
            category: validCategory,
            status: "pending" as const,
            priority: booking.priority || "standard",
            budget_min: booking.budgetMin,
            budget_max: booking.budgetMax,
            deadline: booking.preferredDate,
            partner_id: booking.partnerId,
            requirements: {
              service_id: booking.serviceId,
              preferred_date: booking.preferredDate,
            },
          })
          .select()
          .single();

        if (requestError) throw requestError;

        // Deduct credits
        if (!isUnlimited && creditsNeeded > 0) {
          const creditResult = await useCredit(
            creditsNeeded,
            `Booking: ${booking.category}`,
            request.id
          );

          if (!creditResult.success) {
            // Rollback the request if credit deduction fails
            await supabase.from("service_requests").delete().eq("id", request.id);
            return { success: false, error: creditResult.error };
          }
        }

        // Create initial status update
        await supabase.from("service_request_updates").insert({
          service_request_id: request.id,
          update_type: "status_change",
          new_status: "pending",
          title: "Booking Request Submitted",
          description: `Your booking request has been submitted and is being processed.${
            creditsNeeded > 0 ? ` ${creditsNeeded} credits were used.` : ""
          }`,
          updated_by_role: "system",
          is_visible_to_client: true,
          metadata: {
            credits_used: creditsNeeded,
            service_id: booking.serviceId,
            partner_id: booking.partnerId,
          },
        });

        toast.success("Booking request created successfully!");

        return {
          success: true,
          requestId: request.id,
          creditsUsed: creditsNeeded,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create booking";
        console.error("Booking error:", error);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [user, session, balance, isUnlimited, getBookingCost, useCredit]
  );

  // Cancel a booking
  const cancelBooking = useCallback(
    async (requestId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      setIsLoading(true);
      try {
        // Get request details
        const { data: request, error: fetchError } = await supabase
          .from("service_requests")
          .select("status, client_id")
          .eq("id", requestId)
          .single();

        if (fetchError || !request) {
          return { success: false, error: "Request not found" };
        }

        if (request.client_id !== user.id) {
          return { success: false, error: "Not authorized to cancel this request" };
        }

        // Only allow cancellation for pending/in_review status
        if (!["pending", "in_review", "sourcing"].includes(request.status)) {
          return {
            success: false,
            error: "Cannot cancel a request that is already in progress",
          };
        }

        // Update status
        const { error: updateError } = await supabase
          .from("service_requests")
          .update({ status: "cancelled" })
          .eq("id", requestId);

        if (updateError) throw updateError;

        // Create cancellation update
        await supabase.from("service_request_updates").insert({
          service_request_id: requestId,
          update_type: "cancellation",
          previous_status: request.status,
          new_status: "cancelled",
          title: "Booking Cancelled",
          description: reason || "Booking cancelled by client",
          updated_by: user.id,
          updated_by_role: "client",
          is_visible_to_client: true,
        });

        toast.success("Booking cancelled successfully");
        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to cancel booking";
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return {
    availableServices,
    isLoading,
    fetchServices,
    getBookingCost,
    canAfford,
    createBooking,
    cancelBooking,
  };
};

export default usePartnerBooking;
