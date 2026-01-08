import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getTierById, MembershipTier } from "@/lib/membership-tiers";

interface SubscriptionState {
  subscribed: boolean;
  tier: string | null;
  tierDetails: MembershipTier | null;
  productId: string | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  const { user, session } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    tier: null,
    tierDetails: null,
    productId: null,
    subscriptionEnd: null,
    isLoading: true,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      const tierDetails = data.tier ? getTierById(data.tier) : null;

      setState({
        subscribed: data.subscribed,
        tier: data.tier,
        tierDetails,
        productId: data.product_id,
        subscriptionEnd: data.subscription_end,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to check subscription",
      }));
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setState({
        subscribed: false,
        tier: null,
        tierDetails: null,
        productId: null,
        subscriptionEnd: null,
        isLoading: false,
        error: null,
      });
    }
  }, [user, checkSubscription]);

  // Auto-refresh every minute
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const createCheckout = async (priceId: string) => {
    if (!session?.access_token) {
      throw new Error("You must be logged in to subscribe");
    }

    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { priceId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error("No checkout URL returned");

    window.open(data.url, "_blank");
  };

  const openCustomerPortal = async () => {
    if (!session?.access_token) {
      throw new Error("You must be logged in to manage your subscription");
    }

    const { data, error } = await supabase.functions.invoke("customer-portal", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error("No portal URL returned");

    window.open(data.url, "_blank");
  };

  return {
    ...state,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
