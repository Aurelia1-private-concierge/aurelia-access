import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ServiceRequestBid {
  id: string;
  service_request_id: string;
  partner_id: string;
  bid_amount: number;
  currency: string;
  proposed_timeline: string | null;
  estimated_duration: string | null;
  bid_message: string;
  attachments: string[] | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn" | "expired";
  is_recommended: boolean;
  response_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerRecommendation {
  id: string;
  service_request_id: string;
  partner_id: string;
  match_score: number;
  match_reasons: string[] | null;
  notified_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  status: "pending" | "viewed" | "bid_submitted" | "declined";
  created_at: string;
}

interface UsePartnerBiddingReturn {
  bids: ServiceRequestBid[];
  recommendations: PartnerRecommendation[];
  isLoading: boolean;
  partnerId: string | null;
  
  // Bid actions
  submitBid: (data: {
    serviceRequestId: string;
    bidAmount: number;
    proposedTimeline?: string;
    estimatedDuration?: string;
    bidMessage: string;
    attachments?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  
  updateBid: (bidId: string, data: {
    bidAmount?: number;
    proposedTimeline?: string;
    bidMessage?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  
  withdrawBid: (bidId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Recommendation actions
  markRecommendationViewed: (recommendationId: string) => Promise<void>;
  declineRecommendation: (recommendationId: string) => Promise<void>;
  
  // Stats
  stats: {
    totalBids: number;
    pendingBids: number;
    acceptedBids: number;
    winRate: number;
    averageBidAmount: number;
  };
  
  refreshData: () => Promise<void>;
}

export const usePartnerBidding = (): UsePartnerBiddingReturn => {
  const { user } = useAuth();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [bids, setBids] = useState<ServiceRequestBid[]>([]);
  const [recommendations, setRecommendations] = useState<PartnerRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPartnerData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get partner ID
      const { data: partnerData, error: partnerError } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (partnerError || !partnerData) {
        console.log("User is not a partner");
        setIsLoading(false);
        return;
      }

      setPartnerId(partnerData.id);

      // Fetch bids and recommendations in parallel
      const [bidsRes, recommendationsRes] = await Promise.all([
        supabase
          .from("service_request_bids")
          .select("*")
          .eq("partner_id", partnerData.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("partner_recommendations")
          .select("*")
          .eq("partner_id", partnerData.id)
          .order("created_at", { ascending: false }),
      ]);

      if (bidsRes.error) throw bidsRes.error;
      if (recommendationsRes.error) throw recommendationsRes.error;

      setBids((bidsRes.data || []) as ServiceRequestBid[]);
      setRecommendations((recommendationsRes.data || []) as PartnerRecommendation[]);
    } catch (error) {
      console.error("Error fetching partner bidding data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPartnerData();
  }, [fetchPartnerData]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!partnerId) return;

    const bidsChannel = supabase
      .channel(`partner-bids-${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_request_bids",
          filter: `partner_id=eq.${partnerId}`,
        },
        () => {
          fetchPartnerData();
        }
      )
      .subscribe();

    const recommendationsChannel = supabase
      .channel(`partner-recommendations-${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "partner_recommendations",
          filter: `partner_id=eq.${partnerId}`,
        },
        () => {
          fetchPartnerData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bidsChannel);
      supabase.removeChannel(recommendationsChannel);
    };
  }, [partnerId, fetchPartnerData]);

  const submitBid = async (data: {
    serviceRequestId: string;
    bidAmount: number;
    proposedTimeline?: string;
    estimatedDuration?: string;
    bidMessage: string;
    attachments?: string[];
  }) => {
    if (!partnerId) {
      return { success: false, error: "Not a partner" };
    }

    try {
      // Check if already bid on this request
      const existing = bids.find(b => b.service_request_id === data.serviceRequestId);
      if (existing) {
        return { success: false, error: "You have already submitted a bid for this request" };
      }

      // Check if recommended
      const recommendation = recommendations.find(
        r => r.service_request_id === data.serviceRequestId
      );

      const { error } = await supabase.from("service_request_bids").insert({
        service_request_id: data.serviceRequestId,
        partner_id: partnerId,
        bid_amount: data.bidAmount,
        proposed_timeline: data.proposedTimeline || null,
        estimated_duration: data.estimatedDuration || null,
        bid_message: data.bidMessage,
        attachments: data.attachments || null,
        is_recommended: !!recommendation,
      });

      if (error) throw error;

      // Update recommendation status if exists
      if (recommendation) {
        await supabase
          .from("partner_recommendations")
          .update({
            status: "bid_submitted",
            responded_at: new Date().toISOString(),
          })
          .eq("id", recommendation.id);
      }

      toast.success("Bid submitted successfully!");
      await fetchPartnerData();
      return { success: true };
    } catch (error: any) {
      console.error("Error submitting bid:", error);
      return { success: false, error: error.message };
    }
  };

  const updateBid = async (bidId: string, data: {
    bidAmount?: number;
    proposedTimeline?: string;
    bidMessage?: string;
  }) => {
    try {
      const bid = bids.find(b => b.id === bidId);
      if (!bid) {
        return { success: false, error: "Bid not found" };
      }

      if (bid.status !== "pending") {
        return { success: false, error: "Can only update pending bids" };
      }

      const { error } = await supabase
        .from("service_request_bids")
        .update({
          bid_amount: data.bidAmount ?? bid.bid_amount,
          proposed_timeline: data.proposedTimeline ?? bid.proposed_timeline,
          bid_message: data.bidMessage ?? bid.bid_message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bidId);

      if (error) throw error;

      toast.success("Bid updated");
      await fetchPartnerData();
      return { success: true };
    } catch (error: any) {
      console.error("Error updating bid:", error);
      return { success: false, error: error.message };
    }
  };

  const withdrawBid = async (bidId: string) => {
    try {
      const { error } = await supabase
        .from("service_request_bids")
        .update({ status: "withdrawn" })
        .eq("id", bidId);

      if (error) throw error;

      toast.success("Bid withdrawn");
      await fetchPartnerData();
      return { success: true };
    } catch (error: any) {
      console.error("Error withdrawing bid:", error);
      return { success: false, error: error.message };
    }
  };

  const markRecommendationViewed = async (recommendationId: string) => {
    try {
      await supabase
        .from("partner_recommendations")
        .update({
          status: "viewed",
          viewed_at: new Date().toISOString(),
        })
        .eq("id", recommendationId);

      await fetchPartnerData();
    } catch (error) {
      console.error("Error marking recommendation viewed:", error);
    }
  };

  const declineRecommendation = async (recommendationId: string) => {
    try {
      await supabase
        .from("partner_recommendations")
        .update({
          status: "declined",
          responded_at: new Date().toISOString(),
        })
        .eq("id", recommendationId);

      toast.info("Opportunity declined");
      await fetchPartnerData();
    } catch (error) {
      console.error("Error declining recommendation:", error);
    }
  };

  // Calculate stats
  const totalBids = bids.length;
  const pendingBids = bids.filter(b => b.status === "pending").length;
  const acceptedBids = bids.filter(b => b.status === "accepted").length;
  const completedBids = bids.filter(b => ["accepted", "rejected"].includes(b.status)).length;
  const winRate = completedBids > 0 ? (acceptedBids / completedBids) * 100 : 0;
  const averageBidAmount = bids.length > 0
    ? bids.reduce((sum, b) => sum + b.bid_amount, 0) / bids.length
    : 0;

  return {
    bids,
    recommendations,
    isLoading,
    partnerId,
    submitBid,
    updateBid,
    withdrawBid,
    markRecommendationViewed,
    declineRecommendation,
    stats: {
      totalBids,
      pendingBids,
      acceptedBids,
      winRate,
      averageBidAmount,
    },
    refreshData: fetchPartnerData,
  };
};

export default usePartnerBidding;
