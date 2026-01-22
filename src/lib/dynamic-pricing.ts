/**
 * Dynamic Pricing Module
 * Calculates credit costs based on category, partner pricing, priority, and time factors
 */

import { supabase } from "@/integrations/supabase/client";

// Types
export interface PriceTier {
  min_price: number;
  max_price: number | null;
  credit_adjustment: number;
}

export interface BudgetThreshold {
  min: number;
  max: number | null;
  multiplier: number;
}

export interface PricingRule {
  id: string;
  category: string;
  base_credits: number;
  partner_price_tiers: { tiers: PriceTier[] };
  priority_multipliers: Record<string, number>;
  budget_multipliers: { thresholds: BudgetThreshold[] };
  time_multipliers: {
    peak_season: number;
    last_minute: number;
    advance_booking: number;
  };
  is_active: boolean;
  effective_from: string;
  effective_to: string | null;
}

export interface PricingContext {
  category: string;
  partnerServicePrice?: number;
  priority?: string;
  budgetMax?: number;
  requestDate?: Date;
  isLastMinute?: boolean; // < 48 hours notice
  isAdvanceBooking?: boolean; // > 30 days notice
  isPeakSeason?: boolean;
}

export interface PricingBreakdown {
  baseCost: number;
  tierAdjustment: number;
  priorityMultiplier: number;
  budgetMultiplier: number;
  timeMultiplier: number;
  finalCost: number;
  breakdown: string[];
}

// Default pricing rules (fallback if DB unavailable)
const DEFAULT_BASE_CREDITS: Record<string, number> = {
  private_aviation: 3,
  yacht_charter: 3,
  real_estate: 2,
  collectibles: 2,
  events_access: 2,
  security: 2,
  wellness: 1,
  travel: 1,
  dining: 1,
  chauffeur: 1,
  shopping: 1,
};

const DEFAULT_PRIORITY_MULTIPLIERS: Record<string, number> = {
  standard: 1,
  priority: 1.5,
  urgent: 2,
  immediate: 3,
};

const DEFAULT_PRICE_TIERS: PriceTier[] = [
  { min_price: 0, max_price: 10000, credit_adjustment: 0 },
  { min_price: 10001, max_price: 50000, credit_adjustment: 2 },
  { min_price: 50001, max_price: 100000, credit_adjustment: 5 },
  { min_price: 100001, max_price: null, credit_adjustment: 10 },
];

// Cache for pricing rules
let pricingRulesCache: Map<string, PricingRule> = new Map();
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch active pricing rules from database
 */
export async function fetchPricingRules(): Promise<Map<string, PricingRule>> {
  const now = Date.now();
  
  // Return cached rules if still valid
  if (pricingRulesCache.size > 0 && now - cacheTimestamp < CACHE_TTL) {
    return pricingRulesCache;
  }

  try {
    const { data, error } = await supabase
      .from("pricing_rules")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;

    const newCache = new Map<string, PricingRule>();
    (data || []).forEach((rule) => {
      // Type assertion for JSONB fields
      const typedRule: PricingRule = {
        ...rule,
        partner_price_tiers: rule.partner_price_tiers as unknown as PricingRule["partner_price_tiers"],
        priority_multipliers: rule.priority_multipliers as unknown as PricingRule["priority_multipliers"],
        budget_multipliers: rule.budget_multipliers as unknown as PricingRule["budget_multipliers"],
        time_multipliers: rule.time_multipliers as unknown as PricingRule["time_multipliers"],
      };
      newCache.set(rule.category, typedRule);
    });

    pricingRulesCache = newCache;
    cacheTimestamp = now;
    return newCache;
  } catch (error) {
    console.error("Failed to fetch pricing rules:", error);
    return pricingRulesCache;
  }
}

/**
 * Get pricing rule for a specific category
 */
export async function getPricingRule(category: string): Promise<PricingRule | null> {
  const rules = await fetchPricingRules();
  return rules.get(category) || null;
}

/**
 * Find the appropriate price tier adjustment
 */
function findPriceTierAdjustment(tiers: PriceTier[], price: number): number {
  for (const tier of tiers) {
    const maxPrice = tier.max_price ?? Infinity;
    if (price >= tier.min_price && price <= maxPrice) {
      return tier.credit_adjustment;
    }
  }
  return 0;
}

/**
 * Find the appropriate budget multiplier
 */
function findBudgetMultiplier(thresholds: BudgetThreshold[], budget: number): number {
  for (const threshold of thresholds) {
    const maxBudget = threshold.max ?? Infinity;
    if (budget >= threshold.min && budget <= maxBudget) {
      return threshold.multiplier;
    }
  }
  return 1;
}

/**
 * Calculate dynamic credit cost with full breakdown
 */
export async function calculateDynamicCreditCost(
  context: PricingContext
): Promise<PricingBreakdown> {
  const breakdown: string[] = [];
  const rule = await getPricingRule(context.category);

  // 1. Base credits
  const baseCost = rule?.base_credits ?? DEFAULT_BASE_CREDITS[context.category] ?? 1;
  breakdown.push(`Base cost (${context.category}): ${baseCost} credits`);

  // 2. Partner price tier adjustment
  let tierAdjustment = 0;
  if (context.partnerServicePrice && context.partnerServicePrice > 0) {
    const tiers = rule?.partner_price_tiers?.tiers ?? DEFAULT_PRICE_TIERS;
    tierAdjustment = findPriceTierAdjustment(tiers, context.partnerServicePrice);
    if (tierAdjustment > 0) {
      breakdown.push(
        `Service value tier ($${context.partnerServicePrice.toLocaleString()}): +${tierAdjustment} credits`
      );
    }
  }

  // 3. Priority multiplier
  const priorityMap = rule?.priority_multipliers ?? DEFAULT_PRIORITY_MULTIPLIERS;
  const priorityMultiplier = priorityMap[context.priority || "standard"] ?? 1;
  if (priorityMultiplier > 1) {
    breakdown.push(`Priority booking (${context.priority}): ×${priorityMultiplier}`);
  }

  // 4. Budget multiplier
  let budgetMultiplier = 1;
  if (context.budgetMax && context.budgetMax > 0 && rule?.budget_multipliers?.thresholds) {
    budgetMultiplier = findBudgetMultiplier(
      rule.budget_multipliers.thresholds,
      context.budgetMax
    );
    if (budgetMultiplier > 1) {
      breakdown.push(
        `High-value request ($${context.budgetMax.toLocaleString()}): ×${budgetMultiplier}`
      );
    }
  }

  // 5. Time-based multiplier
  let timeMultiplier = 1;
  if (rule?.time_multipliers) {
    if (context.isLastMinute) {
      timeMultiplier = rule.time_multipliers.last_minute;
      breakdown.push(`Last-minute booking: ×${timeMultiplier}`);
    } else if (context.isAdvanceBooking) {
      timeMultiplier = rule.time_multipliers.advance_booking;
      breakdown.push(`Advance booking discount: ×${timeMultiplier}`);
    } else if (context.isPeakSeason) {
      timeMultiplier = rule.time_multipliers.peak_season;
      breakdown.push(`Peak season: ×${timeMultiplier}`);
    }
  }

  // Calculate final cost
  const subtotal = baseCost + tierAdjustment;
  const multipliedCost = subtotal * priorityMultiplier * budgetMultiplier * timeMultiplier;
  const finalCost = Math.ceil(multipliedCost);

  breakdown.push(`────────────────────`);
  breakdown.push(`Total: ${finalCost} credits`);

  return {
    baseCost,
    tierAdjustment,
    priorityMultiplier,
    budgetMultiplier,
    timeMultiplier,
    finalCost,
    breakdown,
  };
}

/**
 * Simple credit cost calculation (returns just the number)
 */
export async function getDynamicCreditCost(context: PricingContext): Promise<number> {
  const breakdown = await calculateDynamicCreditCost(context);
  return breakdown.finalCost;
}

/**
 * Invalidate pricing rules cache
 */
export function invalidatePricingCache(): void {
  pricingRulesCache.clear();
  cacheTimestamp = 0;
}

/**
 * Check if a date is considered last-minute (< 48 hours)
 */
export function isLastMinuteBooking(requestDate: Date): boolean {
  const now = new Date();
  const hoursUntil = (requestDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntil < 48 && hoursUntil > 0;
}

/**
 * Check if a date is considered advance booking (> 30 days)
 */
export function isAdvanceBooking(requestDate: Date): boolean {
  const now = new Date();
  const daysUntil = (requestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return daysUntil > 30;
}

/**
 * Check if a date falls in peak season (simplified: Dec-Jan, Jul-Aug)
 */
export function isPeakSeason(date: Date): boolean {
  const month = date.getMonth();
  return month === 11 || month === 0 || month === 6 || month === 7; // Dec, Jan, Jul, Aug
}
