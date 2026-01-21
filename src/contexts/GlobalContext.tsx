import React, { createContext, useContext, ReactNode, useState, useEffect, forwardRef } from "react";
import { useGlobalFeatures } from "@/hooks/useGlobalFeatures";

// Production debugging
const log = (msg: string) => console.log(`[Global ${Date.now()}] ${msg}`);

interface GlobalContextType {
  currency: string;
  currencySymbol: string;
  timezone: string;
  locale: string;
  isRTL: boolean;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  countryCode: string;
  phonePrefix: string;
}

// Default values for failsafe initialization
const defaultGlobalFeatures: GlobalContextType = {
  currency: "USD",
  currencySymbol: "$",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  locale: navigator.language || "en-US",
  isRTL: false,
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  formatDate: (date: Date | string) => new Date(date).toLocaleDateString(),
  formatTime: (date: Date | string) => new Date(date).toLocaleTimeString(),
  countryCode: "US",
  phonePrefix: "+1",
};

const GlobalContext = createContext<GlobalContextType>(defaultGlobalFeatures);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = forwardRef<HTMLDivElement, GlobalProviderProps>(
  ({ children }, ref) => {
    log("GlobalProvider rendering");
    const [isReady, setIsReady] = useState(false);
    
    // Use hook but with error handling
    let globalFeatures: GlobalContextType;
    try {
      globalFeatures = useGlobalFeatures();
    } catch (e) {
      log(`useGlobalFeatures error: ${e}`);
      globalFeatures = defaultGlobalFeatures;
    }
    
    // Ensure we don't block render
    useEffect(() => {
      log("GlobalProvider mounted, setting ready");
      const timeout = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timeout);
    }, []);
    
    log("GlobalProvider render complete");
    
    return (
      <GlobalContext.Provider value={globalFeatures}>
        {children}
      </GlobalContext.Provider>
    );
  }
);

GlobalProvider.displayName = "GlobalProvider";

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  // No longer throw - return default if no context
  return context || defaultGlobalFeatures;
};
