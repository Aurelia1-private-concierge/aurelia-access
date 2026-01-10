import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "./useSubscription";
import { getCreditsByTier, isUnlimitedTier } from "@/lib/membership-tiers";

interface CreditState {
  balance: number;
  monthlyAllocation: number;
  isUnlimited: boolean;
  isLoading: boolean;
  error: string | null;
}

interface CreditTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  balance_after: number;
  created_at: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const { tier, subscribed } = useSubscription();
  const [state, setState] = useState<CreditState>({
    balance: 0,
    monthlyAllocation: 0,
    isUnlimited: false,
    isLoading: true,
    error: null,
  });
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // First check if user has credits record
      const { data: creditsData, error: creditsError } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (creditsError) throw creditsError;

      const monthlyCredits = tier ? getCreditsByTier(tier) : 0;
      const unlimited = tier ? isUnlimitedTier(tier) : false;

      if (!creditsData && subscribed && tier) {
        // Create initial credits record for new subscribers
        const { data: newCredits, error: insertError } = await supabase
          .from("user_credits")
          .insert({
            user_id: user.id,
            balance: monthlyCredits,
            monthly_allocation: monthlyCredits,
            last_allocation_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Record the initial allocation transaction
        await supabase.from("credit_transactions").insert({
          user_id: user.id,
          amount: monthlyCredits,
          transaction_type: "allocation",
          description: "Initial monthly credit allocation",
          balance_after: monthlyCredits,
        });

        setState({
          balance: newCredits.balance,
          monthlyAllocation: monthlyCredits,
          isUnlimited: unlimited,
          isLoading: false,
          error: null,
        });
      } else if (creditsData) {
        setState({
          balance: creditsData.balance,
          monthlyAllocation: monthlyCredits,
          isUnlimited: unlimited,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          balance: 0,
          monthlyAllocation: 0,
          isUnlimited: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load credits",
      }));
    }
  }, [user, tier, subscribed]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [user]);

  const useCredit = useCallback(async (amount: number, description: string, serviceRequestId?: string) => {
    if (!user) return { success: false, error: "Not authenticated" };
    
    if (state.isUnlimited) {
      // Unlimited tier - still record the transaction but don't deduct
      await supabase.from("credit_transactions").insert({
        user_id: user.id,
        amount: -amount,
        transaction_type: "usage",
        description,
        service_request_id: serviceRequestId,
        balance_after: state.balance, // Balance doesn't change for unlimited
      });
      return { success: true };
    }

    if (state.balance < amount) {
      return { success: false, error: "Insufficient credits" };
    }

    const newBalance = state.balance - amount;

    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ balance: newBalance })
      .eq("user_id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -amount,
      transaction_type: "usage",
      description,
      service_request_id: serviceRequestId,
      balance_after: newBalance,
    });

    setState(prev => ({ ...prev, balance: newBalance }));
    await fetchTransactions();

    return { success: true };
  }, [user, state.balance, state.isUnlimited, fetchTransactions]);

  const addCredits = useCallback(async (amount: number, type: "purchase" | "bonus" | "refund", description: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    const newBalance = state.balance + amount;

    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ balance: newBalance })
      .eq("user_id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount,
      transaction_type: type,
      description,
      balance_after: newBalance,
    });

    setState(prev => ({ ...prev, balance: newBalance }));
    await fetchTransactions();

    return { success: true };
  }, [user, state.balance, fetchTransactions]);

  useEffect(() => {
    fetchCredits();
    fetchTransactions();
  }, [fetchCredits, fetchTransactions]);

  return {
    ...state,
    transactions,
    useCredit,
    addCredits,
    refetch: fetchCredits,
  };
};