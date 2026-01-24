import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  trackPageForScoring,
  trackScrollDepth,
  trackTimeOnSite,
  trackFormInteraction,
  trackUTMParams,
  syncLeadScore,
  calculateLeadScore,
  getStoredSignals
} from "@/lib/lead-scoring";

export const useLeadScoring = () => {
  const location = useLocation();
  const startTimeRef = useRef(Date.now());
  const lastScrollRef = useRef(0);

  // Track page visits
  useEffect(() => {
    trackPageForScoring(location.pathname);
  }, [location.pathname]);

  // Track UTM params on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    trackUTMParams(
      params.get("utm_source"),
      params.get("utm_medium")
    );
  }, []);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      // Only update if significant change (every 10%)
      if (scrollPercent > lastScrollRef.current + 10) {
        lastScrollRef.current = scrollPercent;
        trackScrollDepth(scrollPercent);
      }
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, []);

  // Track time on site
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      trackTimeOnSite(30); // Add 30 seconds every interval
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Sync score before unload
  useEffect(() => {
    const handleUnload = () => {
      // Use sendBeacon for reliable delivery
      const signals = getStoredSignals();
      const score = calculateLeadScore(signals);
      
      navigator.sendBeacon(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visitor-tracking`,
        JSON.stringify({
          action: "lead_score_sync",
          signals,
          score: score.total
        })
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // Manual form interaction tracking
  const trackForm = useCallback(() => {
    trackFormInteraction();
  }, []);

  // Manual score sync with email
  const syncScore = useCallback(async (email?: string) => {
    await syncLeadScore(email);
  }, []);

  // Get current score
  const getScore = useCallback(() => {
    const signals = getStoredSignals();
    return calculateLeadScore(signals);
  }, []);

  return {
    trackForm,
    syncScore,
    getScore
  };
};

export default useLeadScoring;
