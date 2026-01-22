/**
 * React hook for currency conversion with caching
 * Uses the currency-service edge function with local caching
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CurrencyRates {
  base: string;
  amount: number;
  date: string;
  rates: Record<string, number>;
  conversions: Record<string, number>;
}

// Popular currencies for luxury markets
export const LUXURY_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
];

// Local cache for rates
let ratesCache: Map<string, { data: CurrencyRates; timestamp: number }> = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface UseCurrencyConverterReturn {
  // State
  isLoading: boolean;
  lastUpdated: Date | null;
  
  // Conversion functions
  convert: (from: string, to: string, amount: number) => Promise<number | null>;
  getMultipleRates: (from: string, amount?: number) => Promise<CurrencyRates | null>;
  
  // Utilities
  formatCurrency: (amount: number, currency: string) => string;
  getCurrencySymbol: (currency: string) => string;
  popularCurrencies: typeof LUXURY_CURRENCIES;
}

export const useCurrencyConverter = (): UseCurrencyConverterReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Get currency symbol
  const getCurrencySymbol = useCallback((currency: string): string => {
    const found = LUXURY_CURRENCIES.find((c) => c.code === currency);
    return found?.symbol || currency;
  }, []);

  // Format amount with currency
  const formatCurrency = useCallback(
    (amount: number, currency: string): string => {
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch {
        const symbol = getCurrencySymbol(currency);
        return `${symbol}${amount.toFixed(2)}`;
      }
    },
    [getCurrencySymbol]
  );

  // Fetch rates from edge function
  const fetchRates = useCallback(
    async (from: string, to?: string, amount: number = 1): Promise<CurrencyRates | null> => {
      const cacheKey = `${from}-${to || "all"}-${amount}`;
      const cached = ratesCache.get(cacheKey);

      // Return cached data if valid
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setLastUpdated(new Date(cached.timestamp));
        return cached.data;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("currency-service", {
          body: { from, to, amount },
        });

        if (error) throw error;

        // Cache the result
        ratesCache.set(cacheKey, { data, timestamp: Date.now() });
        setLastUpdated(new Date());

        // Also update database cache
        try {
          await supabase.from("currency_rates_cache").upsert(
            {
              base_currency: from,
              rates: data.rates,
              fetched_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + CACHE_TTL).toISOString(),
            },
            { onConflict: "base_currency" }
          );
        } catch (cacheError) {
          console.warn("Failed to update DB cache:", cacheError);
        }

        return data;
      } catch (error) {
        console.error("Currency conversion error:", error);
        toast.error("Failed to fetch exchange rates");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Convert single currency
  const convert = useCallback(
    async (from: string, to: string, amount: number): Promise<number | null> => {
      const data = await fetchRates(from, to, amount);
      if (!data?.conversions) return null;
      return data.conversions[to] || null;
    },
    [fetchRates]
  );

  // Get multiple currency rates
  const getMultipleRates = useCallback(
    async (from: string, amount: number = 1): Promise<CurrencyRates | null> => {
      return fetchRates(from, undefined, amount);
    },
    [fetchRates]
  );

  return {
    isLoading,
    lastUpdated,
    convert,
    getMultipleRates,
    formatCurrency,
    getCurrencySymbol,
    popularCurrencies: LUXURY_CURRENCIES,
  };
};

export default useCurrencyConverter;
