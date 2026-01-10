import { useState, useEffect, useMemo } from "react";
import i18n from "@/i18n";

interface GlobalFeatures {
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

const currencyMap: Record<string, { code: string; symbol: string; prefix: string }> = {
  en: { code: "USD", symbol: "$", prefix: "+1" },
  fr: { code: "EUR", symbol: "€", prefix: "+33" },
  de: { code: "EUR", symbol: "€", prefix: "+49" },
  es: { code: "EUR", symbol: "€", prefix: "+34" },
  it: { code: "EUR", symbol: "€", prefix: "+39" },
  ru: { code: "RUB", symbol: "₽", prefix: "+7" },
  zh: { code: "CNY", symbol: "¥", prefix: "+86" },
  ar: { code: "AED", symbol: "د.إ", prefix: "+971" },
};

export const useGlobalFeatures = (): GlobalFeatures => {
  const [currentLang, setCurrentLang] = useState(i18n.language || "en");
  
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLang(lng);
    };
    
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);
  
  const currencyInfo = useMemo(() => {
    return currencyMap[currentLang] || currencyMap.en;
  }, [currentLang]);
  
  const timezone = useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);
  
  const isRTL = currentLang === "ar";
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(currentLang, {
      style: "currency",
      currency: currencyInfo.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(currentLang, {
      dateStyle: "long",
    }).format(d);
  };
  
  const formatTime = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(currentLang, {
      timeStyle: "short",
    }).format(d);
  };
  
  return {
    currency: currencyInfo.code,
    currencySymbol: currencyInfo.symbol,
    timezone,
    locale: currentLang,
    isRTL,
    formatCurrency,
    formatDate,
    formatTime,
    countryCode: currentLang.toUpperCase(),
    phonePrefix: currencyInfo.prefix,
  };
};

export default useGlobalFeatures;
