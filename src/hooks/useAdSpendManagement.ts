/**
 * Hook for managing ad spend, budgets, and ROI metrics
 */
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdBudget {
  id: string;
  campaign_id: string | null;
  platform: string;
  budget_amount: number;
  spent_amount: number;
  currency: string;
  daily_limit: number | null;
  alert_threshold: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdTransaction {
  id: string;
  budget_id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  platform_transaction_id: string | null;
  metadata: unknown;
  created_at: string;
}

export interface AdMetrics {
  id: string;
  budget_id: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  cpm: number | null;
  cpc: number | null;
  cpa: number | null;
  roas: number | null;
  platform: string;
}

export interface AdAccount {
  id: string;
  user_id: string;
  platform: string;
  account_id: string;
  account_name: string | null;
  account_status: string;
  permissions: string[];
  created_at: string;
}

export interface BudgetAlert {
  alert: boolean;
  percentage: number;
  message: string;
  spent: number;
  budget: number;
  remaining: number;
}

export interface AggregatedMetrics {
  totalSpend: number;
  totalBudget: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  avgCTR: number;
  avgROAS: number;
  platformBreakdown: Record<string, {
    spend: number;
    budget: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
}

export const SUPPORTED_AD_PLATFORMS = [
  { id: "meta", name: "Meta (Facebook & Instagram)", icon: "📘", color: "bg-blue-500" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", color: "bg-blue-700" },
  { id: "twitter", name: "X / Twitter", icon: "🐦", color: "bg-sky-500" },
  { id: "reddit", name: "Reddit", icon: "🔴", color: "bg-orange-500" },
  { id: "google", name: "Google Ads", icon: "🔍", color: "bg-green-500" },
] as const;

export const useCurrencyFormat = (currency: string = "USD") => {
  return useCallback((amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }, [currency]);
};

export const useAdSpendManagement = () => {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<AdBudget[]>([]);
  const [transactions, setTransactions] = useState<AdTransaction[]>([]);
  const [metrics, setMetrics] = useState<AdMetrics[]>([]);
  const [accounts, setAccounts] = useState<AdAccount[]>([]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetsRes, transactionsRes, metricsRes, accountsRes] = await Promise.all([
        supabase.from("social_ad_budgets").select("*").order("created_at", { ascending: false }),
        supabase.from("social_ad_transactions").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("social_ad_metrics").select("*").order("date", { ascending: false }).limit(90),
        supabase.from("social_ad_accounts").select("*").order("created_at", { ascending: false }),
      ]);

      if (budgetsRes.data) setBudgets(budgetsRes.data);
      if (transactionsRes.data) setTransactions(transactionsRes.data);
      if (metricsRes.data) setMetrics(metricsRes.data);
      if (accountsRes.data) setAccounts(accountsRes.data as AdAccount[]);
    } catch (error) {
      console.error("Error fetching ad spend data:", error);
      toast.error("Failed to load ad spend data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create a new budget
  const createBudget = useCallback(async (data: {
    campaign_id?: string;
    platform: string;
    budget_amount: number;
    currency?: string;
    daily_limit?: number;
    alert_threshold?: number;
    start_date?: string;
    end_date?: string;
  }) => {
    try {
      const { data: budget, error } = await supabase
        .from("social_ad_budgets")
        .insert({
          campaign_id: data.campaign_id || null,
          platform: data.platform,
          budget_amount: data.budget_amount,
          currency: data.currency || "USD",
          daily_limit: data.daily_limit || null,
          alert_threshold: data.alert_threshold || 0.8,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      setBudgets((prev) => [budget, ...prev]);
      toast.success("Budget created successfully");
      return budget;
    } catch (error) {
      console.error("Error creating budget:", error);
      toast.error("Failed to create budget");
      return null;
    }
  }, []);

  // Update budget
  const updateBudget = useCallback(async (id: string, updates: Partial<AdBudget>) => {
    try {
      const { data, error } = await supabase
        .from("social_ad_budgets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setBudgets((prev) => prev.map((b) => (b.id === id ? data : b)));
      toast.success("Budget updated");
      return data;
    } catch (error) {
      console.error("Error updating budget:", error);
      toast.error("Failed to update budget");
      return null;
    }
  }, []);

  // Record a spend transaction
  const recordSpend = useCallback(async (budgetId: string, amount: number, description?: string) => {
    try {
      // Create transaction
      const { error: txError } = await supabase
        .from("social_ad_transactions")
        .insert({
          budget_id: budgetId,
          amount,
          transaction_type: "spend",
          description: description || "Ad spend",
        });

      if (txError) throw txError;

      // Update budget spent amount
      const budget = budgets.find((b) => b.id === budgetId);
      if (budget) {
        const newSpent = budget.spent_amount + amount;
        await updateBudget(budgetId, { spent_amount: newSpent });
      }

      await fetchData();
      toast.success("Spend recorded");
    } catch (error) {
      console.error("Error recording spend:", error);
      toast.error("Failed to record spend");
    }
  }, [budgets, updateBudget, fetchData]);

  // Check budget alert
  const checkBudgetAlert = useCallback(async (budgetId: string): Promise<BudgetAlert | null> => {
    try {
      const { data, error } = await supabase.rpc("check_budget_alert", { p_budget_id: budgetId });
      if (error) throw error;
      return data as unknown as BudgetAlert;
    } catch (error) {
      console.error("Error checking budget alert:", error);
      return null;
    }
  }, []);

  // Get aggregated metrics
  const getAggregatedMetrics = useCallback((): AggregatedMetrics => {
    const platformBreakdown: AggregatedMetrics["platformBreakdown"] = {};

    // Aggregate from budgets
    let totalSpend = 0;
    let totalBudget = 0;

    budgets.forEach((budget) => {
      totalSpend += budget.spent_amount;
      totalBudget += budget.budget_amount;

      if (!platformBreakdown[budget.platform]) {
        platformBreakdown[budget.platform] = {
          spend: 0,
          budget: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
        };
      }
      platformBreakdown[budget.platform].spend += budget.spent_amount;
      platformBreakdown[budget.platform].budget += budget.budget_amount;
    });

    // Aggregate from metrics
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    metrics.forEach((m) => {
      totalImpressions += m.impressions;
      totalClicks += m.clicks;
      totalConversions += m.conversions;
      totalRevenue += m.revenue;

      if (platformBreakdown[m.platform]) {
        platformBreakdown[m.platform].impressions += m.impressions;
        platformBreakdown[m.platform].clicks += m.clicks;
        platformBreakdown[m.platform].conversions += m.conversions;
      }
    });

    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    return {
      totalSpend,
      totalBudget,
      totalImpressions,
      totalClicks,
      totalConversions,
      totalRevenue,
      avgCTR,
      avgROAS,
      platformBreakdown,
    };
  }, [budgets, metrics]);

  return {
    loading,
    budgets,
    transactions,
    metrics,
    accounts,
    fetchData,
    createBudget,
    updateBudget,
    recordSpend,
    checkBudgetAlert,
    getAggregatedMetrics,
    supportedPlatforms: SUPPORTED_AD_PLATFORMS,
  };
};

export default useAdSpendManagement;
