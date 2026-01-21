import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BidRevision {
  id: string;
  bid_id: string;
  revision_number: number;
  previous_amount: number;
  new_amount: number;
  previous_timeline: string | null;
  new_timeline: string | null;
  previous_message: string | null;
  new_message: string | null;
  revision_reason: string | null;
  created_at: string;
}

interface ReviseBidParams {
  bidId: string;
  currentAmount: number;
  currentTimeline: string | null;
  currentMessage: string;
  newAmount?: number;
  newTimeline?: string;
  newMessage?: string;
  revisionReason?: string;
}

interface UseBidRevisionsReturn {
  isRevising: boolean;
  reviseBid: (params: ReviseBidParams) => Promise<{ success: boolean; error?: string }>;
  canRevise: (
    requestAllowsRevisions: boolean,
    maxRevisions: number,
    currentRevisionCount: number,
    bidStatus: string
  ) => boolean;
  fetchRevisions: (bidId: string) => Promise<BidRevision[]>;
}

export const useBidRevisions = (): UseBidRevisionsReturn => {
  const [isRevising, setIsRevising] = useState(false);

  const canRevise = useCallback((
    requestAllowsRevisions: boolean,
    maxRevisions: number,
    currentRevisionCount: number,
    bidStatus: string
  ): boolean => {
    if (!requestAllowsRevisions) return false;
    if (bidStatus !== "pending") return false;
    if (currentRevisionCount >= maxRevisions) return false;
    return true;
  }, []);

  const reviseBid = useCallback(async (params: ReviseBidParams): Promise<{ success: boolean; error?: string }> => {
    const {
      bidId,
      currentAmount,
      currentTimeline,
      currentMessage,
      newAmount,
      newTimeline,
      newMessage,
      revisionReason,
    } = params;

    // Check if anything actually changed
    const amountChanged = newAmount !== undefined && newAmount !== currentAmount;
    const timelineChanged = newTimeline !== undefined && newTimeline !== currentTimeline;
    const messageChanged = newMessage !== undefined && newMessage !== currentMessage;

    if (!amountChanged && !timelineChanged && !messageChanged) {
      return { success: false, error: "No changes detected" };
    }

    setIsRevising(true);
    try {
      // Get current bid to get revision count
      const { data: bidData, error: bidError } = await supabase
        .from("service_request_bids")
        .select("revision_count, service_request_id")
        .eq("id", bidId)
        .single();

      if (bidError || !bidData) {
        throw new Error("Bid not found");
      }

      // Check if request allows revisions
      const { data: requestData, error: requestError } = await supabase
        .from("service_requests")
        .select("allow_revisions, max_revisions")
        .eq("id", bidData.service_request_id)
        .single();

      if (requestError || !requestData) {
        throw new Error("Service request not found");
      }

      if (!requestData.allow_revisions) {
        return { success: false, error: "This request does not allow bid revisions" };
      }

      if (bidData.revision_count >= requestData.max_revisions) {
        return { success: false, error: `Maximum revisions (${requestData.max_revisions}) reached` };
      }

      const newRevisionNumber = bidData.revision_count + 1;

      // Create revision record
      const { error: revisionError } = await supabase
        .from("bid_revisions")
        .insert({
          bid_id: bidId,
          revision_number: newRevisionNumber,
          previous_amount: currentAmount,
          new_amount: newAmount ?? currentAmount,
          previous_timeline: currentTimeline,
          new_timeline: newTimeline ?? currentTimeline,
          previous_message: currentMessage,
          new_message: newMessage ?? currentMessage,
          revision_reason: revisionReason || null,
        });

      if (revisionError) throw revisionError;

      // Update the bid with new values
      const updateData: Record<string, unknown> = {
        revision_count: newRevisionNumber,
        updated_at: new Date().toISOString(),
      };

      if (amountChanged) updateData.bid_amount = newAmount;
      if (timelineChanged) updateData.proposed_timeline = newTimeline;
      if (messageChanged) updateData.bid_message = newMessage;

      const { error: updateError } = await supabase
        .from("service_request_bids")
        .update(updateData)
        .eq("id", bidId);

      if (updateError) throw updateError;

      toast.success("Bid revised successfully");
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to revise bid";
      console.error("Error revising bid:", error);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsRevising(false);
    }
  }, []);

  const fetchRevisions = useCallback(async (bidId: string): Promise<BidRevision[]> => {
    try {
      const { data, error } = await supabase
        .from("bid_revisions")
        .select("*")
        .eq("bid_id", bidId)
        .order("revision_number", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching revisions:", error);
      return [];
    }
  }, []);

  return {
    isRevising,
    reviseBid,
    canRevise,
    fetchRevisions,
  };
};

export default useBidRevisions;
