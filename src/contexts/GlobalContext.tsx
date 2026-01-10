import React, { createContext, useContext, ReactNode } from "react";
import { useGlobalFeatures } from "@/hooks/useGlobalFeatures";

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

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const globalFeatures = useGlobalFeatures();
  
  return (
    <GlobalContext.Provider value={globalFeatures}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
