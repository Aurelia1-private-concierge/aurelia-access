import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  ref?: string;
}

const UTM_STORAGE_KEY = "aurelia_utm_params";
const UTM_EXPIRY_DAYS = 30;

export const useUTMTracking = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Extract UTM parameters from URL
    const utmParams: UTMParams = {
      utm_source: searchParams.get("utm_source") || undefined,
      utm_medium: searchParams.get("utm_medium") || undefined,
      utm_campaign: searchParams.get("utm_campaign") || undefined,
      utm_term: searchParams.get("utm_term") || undefined,
      utm_content: searchParams.get("utm_content") || undefined,
      ref: searchParams.get("ref") || undefined,
    };

    // Only store if we have at least one UTM param
    const hasUTM = Object.values(utmParams).some(Boolean);
    
    if (hasUTM) {
      const storedData = {
        params: utmParams,
        timestamp: Date.now(),
        landingPage: window.location.pathname,
      };
      
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(storedData));
    }
  }, [searchParams]);
};

export const getStoredUTMParams = (): UTMParams & { landingPage?: string } | null => {
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);
    const expiryTime = UTM_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    
    // Check if expired
    if (Date.now() - data.timestamp > expiryTime) {
      localStorage.removeItem(UTM_STORAGE_KEY);
      return null;
    }

    return { ...data.params, landingPage: data.landingPage };
  } catch {
    return null;
  }
};

export const clearUTMParams = () => {
  localStorage.removeItem(UTM_STORAGE_KEY);
};

export const getUTMQueryString = (): string => {
  const params = getStoredUTMParams();
  if (!params) return "";

  const queryParams = new URLSearchParams();
  
  if (params.utm_source) queryParams.set("utm_source", params.utm_source);
  if (params.utm_medium) queryParams.set("utm_medium", params.utm_medium);
  if (params.utm_campaign) queryParams.set("utm_campaign", params.utm_campaign);
  if (params.utm_term) queryParams.set("utm_term", params.utm_term);
  if (params.utm_content) queryParams.set("utm_content", params.utm_content);
  if (params.ref) queryParams.set("ref", params.ref);

  const str = queryParams.toString();
  return str ? `?${str}` : "";
};
