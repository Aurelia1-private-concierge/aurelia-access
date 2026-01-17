import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string | null;
  budget_min: number | null;
  budget_max: number | null;
  deadline: string | null;
  partner_id: string | null;
  client_id: string;
  created_at: string;
  updated_at: string;
}

interface ServiceUpdate {
  id: string;
  service_request_id: string;
  update_type: string;
  previous_status: string | null;
  new_status: string | null;
  title: string;
  description: string | null;
  updated_by: string | null;
  updated_by_role: string | null;
  metadata: unknown;
  is_visible_to_client: boolean;
  created_at: string;
}

export const useServiceWorkflow = (serviceRequestId?: string) => {
  const { user, session } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [updates, setUpdates] = useState<ServiceUpdate[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch user's service requests
  const fetchRequests = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests((data || []) as unknown as ServiceRequest[]);
    } catch (error) {
      console.error("Error fetching service requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch updates for a specific request
  const fetchUpdates = useCallback(async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from("service_request_updates")
        .select("*")
        .eq("service_request_id", requestId)
        .eq("is_visible_to_client", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUpdates((data || []) as unknown as ServiceUpdate[]);
    } catch (error) {
      console.error("Error fetching service updates:", error);
    }
  }, []);

  // Create a new service request
  const createRequest = useCallback(
    async (data: {
      title: string;
      description: string;
      category: string;
      priority?: string;
      budget_min?: number;
      budget_max?: number;
      deadline?: string;
      requirements?: Record<string, string | string[]>;
    }) => {
      if (!user) throw new Error("Must be logged in");

      setIsSubmitting(true);
      try {
        const insertData = {
          client_id: user.id,
          title: data.title,
          description: data.description,
          category: data.category as "chauffeur" | "collectibles" | "dining" | "events_access" | "private_aviation" | "real_estate" | "security" | "shopping" | "travel" | "wellness" | "yacht_charter",
          status: "pending" as const,
          requirements: data.requirements || null,
        };

        const { data: newRequest, error } = await supabase
          .from("service_requests")
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;

        // Create initial update
        await supabase.from("service_request_updates").insert({
          service_request_id: newRequest.id,
          update_type: "status_change",
          new_status: "pending",
          title: "Request Submitted",
          description: "Your request has been received and is being reviewed by our concierge team.",
          updated_by_role: "system",
          is_visible_to_client: true,
        });

        await fetchRequests();
        return newRequest as unknown as ServiceRequest;
      } catch (error) {
        console.error("Error creating service request:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, fetchRequests]
  );

  // Cancel a request
  const cancelRequest = useCallback(
    async (requestId: string, reason?: string) => {
      if (!user) throw new Error("Must be logged in");

      try {
        // Get current status
        const { data: request } = await supabase
          .from("service_requests")
          .select("status")
          .eq("id", requestId)
          .single();

        if (!request) throw new Error("Request not found");

        // Update status
        const { error } = await supabase
          .from("service_requests")
          .update({ status: "cancelled" })
          .eq("id", requestId)
          .eq("client_id", user.id);

        if (error) throw error;

        // Create cancellation update
        await supabase.from("service_request_updates").insert({
          service_request_id: requestId,
          update_type: "cancellation",
          previous_status: request.status,
          new_status: "cancelled",
          title: "Request Cancelled",
          description: reason || "This request has been cancelled by the client.",
          updated_by: user.id,
          updated_by_role: "client",
          is_visible_to_client: true,
        });

        await fetchRequests();
      } catch (error) {
        console.error("Error cancelling request:", error);
        throw error;
      }
    },
    [user, fetchRequests]
  );

  // Rate/review completed request
  const rateRequest = useCallback(
    async (requestId: string, rating: number, feedback?: string) => {
      if (!user) throw new Error("Must be logged in");

      try {
        // Create feedback update (ratings stored in updates table instead of service_requests)
        await supabase.from("service_request_updates").insert({
          service_request_id: requestId,
          update_type: "message",
          title: "Feedback Received",
          description: `Client rated this service ${rating}/5 stars${feedback ? `: "${feedback}"` : ""}`,
          updated_by: user.id,
          updated_by_role: "client",
          metadata: { rating, feedback },
          is_visible_to_client: true,
        });

        const error = null;

        if (error) throw error;

        // Create feedback update
        await supabase.from("service_request_updates").insert({
          service_request_id: requestId,
          update_type: "message",
          title: "Feedback Received",
          description: `Client rated this service ${rating}/5 stars${feedback ? `: "${feedback}"` : ""}`,
          updated_by: user.id,
          updated_by_role: "client",
          metadata: { rating, feedback },
          is_visible_to_client: true,
        });

        await fetchRequests();
      } catch (error) {
        console.error("Error rating request:", error);
        throw error;
      }
    },
    [user, fetchRequests]
  );

  // Subscribe to realtime updates for a specific request
  useEffect(() => {
    if (!serviceRequestId) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`service-updates-${serviceRequestId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_request_updates",
          filter: `service_request_id=eq.${serviceRequestId}`,
        },
        (payload) => {
          const newUpdate = payload.new as unknown as ServiceUpdate;
          if (newUpdate.is_visible_to_client) {
            setUpdates((prev) => [newUpdate, ...prev]);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [serviceRequestId]);

  // Load request if ID provided
  useEffect(() => {
    if (serviceRequestId && requests.length > 0) {
      const request = requests.find((r) => r.id === serviceRequestId);
      if (request) {
        setCurrentRequest(request);
        fetchUpdates(serviceRequestId);
      }
    }
  }, [serviceRequestId, requests, fetchUpdates]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, fetchRequests]);

  return {
    requests,
    updates,
    currentRequest,
    isLoading,
    isSubmitting,
    createRequest,
    cancelRequest,
    rateRequest,
    fetchRequests,
    fetchUpdates,
  };
};

export default useServiceWorkflow;
