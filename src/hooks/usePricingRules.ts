/**
 * React hook for managing pricing rules
 * Provides CRUD operations and real-time pricing calculations
 */

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import {
  PricingRule,
  PricingContext,
  PricingBreakdown,
  calculateDynamicCreditCost,
  getDynamicCreditCost,
  invalidatePricingCache,
} from "@/lib/dynamic-pricing";

interface PricingHistoryEntry {
  id: string;
  pricing_rule_id: string | null;
  changed_by: string | null;
  change_type: "create" | "update" | "delete";
  previous_values: Json | null;
  new_values: Json | null;
  created_at: string;
}

interface UsePricingRulesReturn {
  // Data
  rules: PricingRule[];
  history: PricingHistoryEntry[];
  isLoading: boolean;
  
  // CRUD operations
  fetchRules: () => Promise<void>;
  updateRule: (ruleId: string, updates: Partial<PricingRule>) => Promise<boolean>;
  createRule: (rule: Omit<PricingRule, "id">) => Promise<boolean>;
  deleteRule: (ruleId: string) => Promise<boolean>;
  
  // Pricing calculations
  calculateCost: (context: PricingContext) => Promise<PricingBreakdown>;
  getSimpleCost: (context: PricingContext) => Promise<number>;
  
  // History
  fetchHistory: (ruleId?: string) => Promise<void>;
}

export const usePricingRules = (): UsePricingRulesReturn => {
  const { user } = useAuth();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [history, setHistory] = useState<PricingHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all active pricing rules
  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("pricing_rules")
        .select("*")
        .order("category");

      if (error) throw error;

      const typedRules: PricingRule[] = (data || []).map((rule) => ({
        ...rule,
        partner_price_tiers: rule.partner_price_tiers as unknown as PricingRule["partner_price_tiers"],
        priority_multipliers: rule.priority_multipliers as unknown as PricingRule["priority_multipliers"],
        budget_multipliers: rule.budget_multipliers as unknown as PricingRule["budget_multipliers"],
        time_multipliers: rule.time_multipliers as unknown as PricingRule["time_multipliers"],
      }));

      setRules(typedRules);
    } catch (error) {
      console.error("Error fetching pricing rules:", error);
      toast.error("Failed to load pricing rules");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update a pricing rule
  const updateRule = useCallback(
    async (ruleId: string, updates: Partial<PricingRule>): Promise<boolean> => {
      if (!user) {
        toast.error("Authentication required");
        return false;
      }

      try {
        // Get current values for history
        const currentRule = rules.find((r) => r.id === ruleId);

        const { error } = await supabase
          .from("pricing_rules")
          .update({
            base_credits: updates.base_credits,
            is_active: updates.is_active,
            priority_multipliers: updates.priority_multipliers as Json,
            time_multipliers: updates.time_multipliers as Json,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ruleId);

        if (error) throw error;

        // Record history
        await supabase.from("pricing_history").insert([{
          pricing_rule_id: ruleId,
          changed_by: user.id,
          change_type: "update" as const,
          previous_values: currentRule as unknown as Json,
          new_values: updates as unknown as Json,
        }]);

        invalidatePricingCache();
        toast.success("Pricing rule updated");
        await fetchRules();
        return true;
      } catch (error) {
        console.error("Error updating pricing rule:", error);
        toast.error("Failed to update pricing rule");
        return false;
      }
    },
    [user, rules, fetchRules]
  );

  // Create a new pricing rule
  const createRule = useCallback(
    async (rule: Omit<PricingRule, "id">): Promise<boolean> => {
      if (!user) {
        toast.error("Authentication required");
        return false;
      }

      try {
        const insertData = {
          category: rule.category,
          base_credits: rule.base_credits,
          is_active: rule.is_active,
        };
        
        const { data, error } = await supabase
          .from("pricing_rules")
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;

        // Record history
        await supabase.from("pricing_history").insert([{
          pricing_rule_id: data.id,
          changed_by: user.id,
          change_type: "create" as const,
          previous_values: null,
          new_values: rule as unknown as Json,
        }]);

        invalidatePricingCache();
        toast.success("Pricing rule created");
        await fetchRules();
        return true;
      } catch (error) {
        console.error("Error creating pricing rule:", error);
        toast.error("Failed to create pricing rule");
        return false;
      }
    },
    [user, fetchRules]
  );

  // Delete a pricing rule
  const deleteRule = useCallback(
    async (ruleId: string): Promise<boolean> => {
      if (!user) {
        toast.error("Authentication required");
        return false;
      }

      try {
        const currentRule = rules.find((r) => r.id === ruleId);

        const { error } = await supabase
          .from("pricing_rules")
          .delete()
          .eq("id", ruleId);

        if (error) throw error;

        // Record history
        await supabase.from("pricing_history").insert([{
          pricing_rule_id: null,
          changed_by: user.id,
          change_type: "delete" as const,
          previous_values: currentRule as unknown as Json,
          new_values: null,
        }]);

        invalidatePricingCache();
        toast.success("Pricing rule deleted");
        await fetchRules();
        return true;
      } catch (error) {
        console.error("Error deleting pricing rule:", error);
        toast.error("Failed to delete pricing rule");
        return false;
      }
    },
    [user, rules, fetchRules]
  );

  // Fetch pricing history
  const fetchHistory = useCallback(async (ruleId?: string) => {
    try {
      let query = supabase
        .from("pricing_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (ruleId) {
        query = query.eq("pricing_rule_id", ruleId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setHistory((data || []) as PricingHistoryEntry[]);
    } catch (error) {
      console.error("Error fetching pricing history:", error);
    }
  }, []);

  // Calculate cost with breakdown
  const calculateCost = useCallback(
    async (context: PricingContext): Promise<PricingBreakdown> => {
      return calculateDynamicCreditCost(context);
    },
    []
  );

  // Get simple cost number
  const getSimpleCost = useCallback(
    async (context: PricingContext): Promise<number> => {
      return getDynamicCreditCost(context);
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return {
    rules,
    history,
    isLoading,
    fetchRules,
    updateRule,
    createRule,
    deleteRule,
    calculateCost,
    getSimpleCost,
    fetchHistory,
  };
};

export default usePricingRules;
