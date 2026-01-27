/**
 * Hook for managing house partner bidding on service requests
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HousePartnerBid {
  id: string;
  service_request_id: string;
  house_partner_id: string;
  bid_amount: number;
  currency: string;
  estimated_timeline: string | null;
  notes: string | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  updated_at: string;
  house_partner?: {
    id: string;
    name: string;
    company_name: string | null;
    category: string;
    rating: number;
    is_preferred: boolean;
  };
}

interface ServiceRequestWithBids {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  bidding_enabled: boolean;
  bidding_deadline: string | null;
  selected_bid_id: string | null;
  bids: HousePartnerBid[];
}

export const useHousePartnerBids = (serviceRequestId?: string) => {
  const queryClient = useQueryClient();

  // Fetch bids for a specific request
  const { data: bids, isLoading: bidsLoading } = useQuery({
    queryKey: ["house-partner-bids", serviceRequestId],
    queryFn: async () => {
      if (!serviceRequestId) return [];
      
      const { data, error } = await supabase
        .from("house_partner_bids")
        .select(`
          *,
          house_partner:house_partners(id, name, company_name, category, rating, is_preferred)
        `)
        .eq("service_request_id", serviceRequestId)
        .order("bid_amount", { ascending: true });
      
      if (error) throw error;
      return data as HousePartnerBid[];
    },
    enabled: !!serviceRequestId,
  });

  // Fetch all requests with bidding enabled (for admin)
  const { data: biddingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["bidding-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select(`
          id,
          title,
          description,
          category,
          budget_min,
          budget_max,
          bidding_enabled,
          bidding_deadline,
          selected_bid_id
        `)
        .eq("bidding_enabled", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Create a bid
  const createBidMutation = useMutation({
    mutationFn: async (params: {
      serviceRequestId: string;
      housePartnerId: string;
      bidAmount: number;
      currency?: string;
      estimatedTimeline?: string;
      notes?: string;
    }) => {
      const { error } = await supabase.from("house_partner_bids").insert({
        service_request_id: params.serviceRequestId,
        house_partner_id: params.housePartnerId,
        bid_amount: params.bidAmount,
        currency: params.currency || "USD",
        estimated_timeline: params.estimatedTimeline,
        notes: params.notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-partner-bids"] });
      toast.success("Bid submitted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to submit bid: ${error.message}`);
    },
  });

  // Update bid status
  const updateBidStatusMutation = useMutation({
    mutationFn: async ({ bidId, status }: { bidId: string; status: string }) => {
      const { error } = await supabase
        .from("house_partner_bids")
        .update({ status })
        .eq("id", bidId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-partner-bids"] });
    },
  });

  // Accept a bid (selects it for the request)
  const acceptBidMutation = useMutation({
    mutationFn: async ({ bidId, requestId }: { bidId: string; requestId: string }) => {
      // Update the bid status
      const { error: bidError } = await supabase
        .from("house_partner_bids")
        .update({ status: "accepted" })
        .eq("id", bidId);
      if (bidError) throw bidError;

      // Reject other bids
      const { error: rejectError } = await supabase
        .from("house_partner_bids")
        .update({ status: "rejected" })
        .eq("service_request_id", requestId)
        .neq("id", bidId)
        .eq("status", "pending");
      if (rejectError) throw rejectError;

      // Update the service request
      const { error: requestError } = await supabase
        .from("service_requests")
        .update({ 
          selected_bid_id: bidId,
          bidding_enabled: false,
        })
        .eq("id", requestId);
      if (requestError) throw requestError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["house-partner-bids"] });
      queryClient.invalidateQueries({ queryKey: ["bidding-requests"] });
      toast.success("Bid accepted! Partner has been selected.");
    },
    onError: (error) => {
      toast.error(`Failed to accept bid: ${error.message}`);
    },
  });

  // Enable bidding on a request
  const enableBiddingMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      deadline 
    }: { 
      requestId: string; 
      deadline?: string;
    }) => {
      const { error } = await supabase
        .from("service_requests")
        .update({ 
          bidding_enabled: true,
          bidding_deadline: deadline,
        })
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bidding-requests"] });
      toast.success("Bidding enabled for this request");
    },
    onError: (error) => {
      toast.error(`Failed to enable bidding: ${error.message}`);
    },
  });

  // Disable bidding on a request
  const disableBiddingMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from("service_requests")
        .update({ bidding_enabled: false })
        .eq("id", requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bidding-requests"] });
      toast.success("Bidding disabled");
    },
  });

  return {
    bids,
    bidsLoading,
    biddingRequests,
    requestsLoading,
    createBid: createBidMutation.mutate,
    updateBidStatus: updateBidStatusMutation.mutate,
    acceptBid: acceptBidMutation.mutate,
    enableBidding: enableBiddingMutation.mutate,
    disableBidding: disableBiddingMutation.mutate,
    isCreating: createBidMutation.isPending,
    isAccepting: acceptBidMutation.isPending,
  };
};

export default useHousePartnerBids;
