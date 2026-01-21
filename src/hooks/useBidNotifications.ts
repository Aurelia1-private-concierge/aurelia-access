import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "./usePushNotifications";
import { toast } from "sonner";

interface BidNotificationPayload {
  type: "new_opportunity" | "bid_received" | "bid_accepted" | "bid_rejected" | "bidding_deadline" | "recommendation";
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export const useBidNotifications = () => {
  const { user } = useAuth();
  const { showNotification, permission } = usePushNotifications();
  const partnerId = useRef<string | null>(null);
  const subscribedChannels = useRef<Set<string>>(new Set());

  // Get partner ID if user is a partner
  useEffect(() => {
    const fetchPartnerId = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("partners")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (data) {
        partnerId.current = data.id;
      }
    };

    fetchPartnerId();
  }, [user]);

  const notify = useCallback((payload: BidNotificationPayload) => {
    // Show toast notification
    const toastOptions: Record<string, () => void> = {
      new_opportunity: () => toast.info(payload.message, { description: payload.title }),
      bid_received: () => toast.success(payload.message, { description: payload.title }),
      bid_accepted: () => toast.success(payload.message, { description: payload.title }),
      bid_rejected: () => toast.error(payload.message, { description: payload.title }),
      bidding_deadline: () => toast.warning(payload.message, { description: payload.title }),
      recommendation: () => toast.info(payload.message, { description: payload.title }),
    };

    toastOptions[payload.type]?.();

    // Show browser notification if permitted
    if (permission === "granted") {
      showNotification({
        title: payload.title,
        body: payload.message,
        icon: "/apple-touch-icon.png",
        tag: `bid-${payload.type}-${Date.now()}`,
        data: payload.data,
      });
    }
  }, [permission, showNotification]);

  // Subscribe to partner-specific bid notifications
  const subscribeToPartnerNotifications = useCallback(() => {
    if (!partnerId.current) return;

    const channelName = `partner-bid-notifications-${partnerId.current}`;
    if (subscribedChannels.current.has(channelName)) return;

    // Listen for new recommendations
    const recommendationsChannel = supabase
      .channel(`partner-recs-${partnerId.current}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "partner_recommendations",
          filter: `partner_id=eq.${partnerId.current}`,
        },
        async (payload) => {
          const rec = payload.new as { service_request_id: string; match_score: number };
          
          // Fetch request details
          const { data: request } = await supabase
            .from("service_requests")
            .select("title, category")
            .eq("id", rec.service_request_id)
            .single();

          notify({
            type: "recommendation",
            title: "New Opportunity Recommended",
            message: request ? `${request.title} (${Math.round(rec.match_score)}% match)` : "A new opportunity matches your profile",
            data: { service_request_id: rec.service_request_id },
          });
        }
      )
      .subscribe();

    // Listen for bid status changes
    const bidsChannel = supabase
      .channel(`partner-bids-status-${partnerId.current}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "service_request_bids",
          filter: `partner_id=eq.${partnerId.current}`,
        },
        async (payload) => {
          const bid = payload.new as { status: string; service_request_id: string };
          const oldBid = payload.old as { status: string };

          if (bid.status === oldBid.status) return;

          const { data: request } = await supabase
            .from("service_requests")
            .select("title")
            .eq("id", bid.service_request_id)
            .single();

          if (bid.status === "accepted") {
            notify({
              type: "bid_accepted",
              title: "Bid Accepted! 🎉",
              message: request ? `Your bid for "${request.title}" has been accepted` : "Your bid has been accepted",
              data: { service_request_id: bid.service_request_id },
            });
          } else if (bid.status === "rejected") {
            notify({
              type: "bid_rejected",
              title: "Bid Not Selected",
              message: request ? `Your bid for "${request.title}" was not selected` : "Your bid was not selected",
              data: { service_request_id: bid.service_request_id },
            });
          }
        }
      )
      .subscribe();

    subscribedChannels.current.add(channelName);

    return () => {
      supabase.removeChannel(recommendationsChannel);
      supabase.removeChannel(bidsChannel);
      subscribedChannels.current.delete(channelName);
    };
  }, [notify]);

  // Subscribe to member bid notifications (when they receive bids)
  const subscribeToMemberNotifications = useCallback(() => {
    if (!user) return;

    const channelName = `member-bid-notifications-${user.id}`;
    if (subscribedChannels.current.has(channelName)) return;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_request_bids",
        },
        async (payload) => {
          const bid = payload.new as { service_request_id: string; bid_amount: number; partner_id: string };

          // Check if this bid is for user's request
          const { data: request } = await supabase
            .from("service_requests")
            .select("title, client_id")
            .eq("id", bid.service_request_id)
            .single();

          if (!request || request.client_id !== user.id) return;

          // Get partner name
          const { data: partner } = await supabase
            .from("partners")
            .select("company_name")
            .eq("id", bid.partner_id)
            .single();

          notify({
            type: "bid_received",
            title: "New Bid Received",
            message: partner 
              ? `${partner.company_name} submitted a bid of $${bid.bid_amount.toLocaleString()} for "${request.title}"`
              : `New bid of $${bid.bid_amount.toLocaleString()} received`,
            data: { service_request_id: bid.service_request_id },
          });
        }
      )
      .subscribe();

    subscribedChannels.current.add(channelName);

    return () => {
      supabase.removeChannel(channel);
      subscribedChannels.current.delete(channelName);
    };
  }, [user, notify]);

  // Auto-subscribe on mount
  useEffect(() => {
    const unsubPartner = subscribeToPartnerNotifications();
    const unsubMember = subscribeToMemberNotifications();

    return () => {
      unsubPartner?.();
      unsubMember?.();
    };
  }, [subscribeToPartnerNotifications, subscribeToMemberNotifications]);

  // Manual trigger for partner matching
  const triggerAIMatching = useCallback(async (serviceRequestId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("ai-partner-matching", {
        body: { service_request_id: serviceRequestId },
      });

      if (error) throw error;

      toast.success(`${data.recommendations_created} partners recommended`);
      return data;
    } catch (error) {
      console.error("AI matching error:", error);
      toast.error("Failed to find matching partners");
      return null;
    }
  }, []);

  return {
    notify,
    triggerAIMatching,
    subscribeToPartnerNotifications,
    subscribeToMemberNotifications,
  };
};

export default useBidNotifications;
