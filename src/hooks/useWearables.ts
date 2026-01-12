import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type WearableProvider = "oura" | "whoop";

export interface WearableConnection {
  id: string;
  provider: WearableProvider;
  device_name: string | null;
  last_sync_at: string | null;
  sync_enabled: boolean;
  expires_at: string | null;
}

export interface WellnessData {
  date: string;
  readiness_score: number | null;
  sleep_score: number | null;
  recovery_score: number | null;
  strain_score: number | null;
  hrv_avg: number | null;
  resting_hr: number | null;
  sleep_hours: number | null;
  provider: string;
}

export function useWearables() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [wellnessData, setWellnessData] = useState<WellnessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<WearableProvider | null>(null);

  // Fetch connections
  const fetchConnections = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("wearable_connections")
        .select("id, provider, device_name, last_sync_at, sync_enabled, expires_at")
        .eq("user_id", user.id);

      if (error) throw error;
      setConnections((data as WearableConnection[]) || []);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch latest wellness data
  const fetchWellnessData = useCallback(async (provider?: WearableProvider) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      
      let query = supabase
        .from("wellness_data")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today);

      if (provider) {
        query = query.eq("provider", provider);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(1).single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setWellnessData(data as WellnessData);
      }
    } catch (error) {
      console.error("Failed to fetch wellness data:", error);
    }
  }, [user]);

  // Connect to provider
  const connect = useCallback(async (provider: WearableProvider) => {
    if (!user) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        toast.error("Please sign in to connect devices");
        return;
      }

      const { data, error } = await supabase.functions.invoke("wearable-oauth", {
        body: {
          action: "get_auth_url",
          provider,
          redirect_uri: `${window.location.origin}/dashboard?tab=devices&connect=${provider}`,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error, {
          description: "Please configure API credentials to connect this device.",
        });
        return;
      }

      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (error: any) {
      console.error("Connect error:", error);
      toast.error(`Failed to connect ${provider === "oura" ? "Oura Ring" : "WHOOP"}`);
    }
  }, [user]);

  // Disconnect provider
  const disconnect = useCallback(async (provider: WearableProvider) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("wearable_connections")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", provider);

      if (error) throw error;

      toast.success(`${provider === "oura" ? "Oura Ring" : "WHOOP"} disconnected`);
      fetchConnections();
    } catch (error: any) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect device");
    }
  }, [user, fetchConnections]);

  // Sync data from provider
  const syncData = useCallback(async (provider: WearableProvider) => {
    if (!user) return;

    setSyncing(provider);

    try {
      const { data, error } = await supabase.functions.invoke("wearable-sync", {
        body: { provider },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.data) {
        setWellnessData({
          ...data.data,
          date: new Date().toISOString().split("T")[0],
          provider,
        });
        toast.success("Data synced successfully!");
      }

      fetchConnections();
    } catch (error: any) {
      console.error("Sync error:", error);
      toast.error("Failed to sync data");
    } finally {
      setSyncing(null);
    }
  }, [user, fetchConnections]);

  // Check for OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectProvider = params.get("connect") as WearableProvider | null;
    const code = params.get("code");

    if (connectProvider && code && user) {
      // Exchange code for token
      const exchangeCode = async () => {
        try {
          const { data, error } = await supabase.functions.invoke("wearable-oauth", {
            body: {
              action: "exchange_code",
              provider: connectProvider,
              code,
              redirect_uri: `${window.location.origin}/dashboard?tab=devices&connect=${connectProvider}`,
            },
          });

          if (error) throw error;

          toast.success(`${connectProvider === "oura" ? "Oura Ring" : "WHOOP"} connected!`);
          
          // Clean URL
          window.history.replaceState({}, "", "/dashboard?tab=devices");
          
          fetchConnections();
          syncData(connectProvider);
        } catch (error) {
          console.error("Code exchange error:", error);
          toast.error("Failed to complete connection");
        }
      };

      exchangeCode();
    }
  }, [user]);

  useEffect(() => {
    fetchConnections();
    fetchWellnessData();
  }, [fetchConnections, fetchWellnessData]);

  const isConnected = useCallback((provider: WearableProvider) => {
    return connections.some((c) => c.provider === provider);
  }, [connections]);

  return {
    connections,
    wellnessData,
    loading,
    syncing,
    connect,
    disconnect,
    syncData,
    isConnected,
    fetchWellnessData,
  };
}
