import { useEffect, useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "aurelia_visitor_session";

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const useVisitorTracking = () => {
  const location = useLocation();
  const [realtimeCount, setRealtimeCount] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);

  // Track a page visit
  const trackVisit = useCallback(async (path: string) => {
    try {
      const sessionId = getSessionId();
      const referrer = document.referrer || undefined;

      await supabase.functions.invoke('visitor-tracking', {
        body: { path, sessionId, referrer },
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Failed to track visit:', error);
    }
  }, []);

  // Get visitor count
  const getVisitorCount = useCallback(async (type: 'realtime' | 'today' = 'today'): Promise<number> => {
    try {
      const { data, error } = await supabase.functions.invoke('visitor-tracking', {
        body: {},
        method: 'GET',
      });

      // Since we can't easily do GET with query params via invoke, 
      // we'll use the direct URL approach
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visitor-tracking?action=count&type=${type}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch visitor count');
      }

      const result = await response.json();
      return result.count || 0;
    } catch (error) {
      console.error('Failed to get visitor count:', error);
      return 0;
    }
  }, []);

  // Refresh counts
  const refreshCounts = useCallback(async () => {
    const [realtime, today] = await Promise.all([
      getVisitorCount('realtime'),
      getVisitorCount('today'),
    ]);
    setRealtimeCount(realtime);
    setTodayCount(today);
  }, [getVisitorCount]);

  // Auto-track on route change
  useEffect(() => {
    trackVisit(location.pathname);
  }, [location.pathname, trackVisit]);

  return {
    trackVisit,
    getVisitorCount,
    refreshCounts,
    realtimeCount,
    todayCount,
  };
};

// Standalone function for tracking without the hook (useful in non-component contexts)
export const trackPageVisit = async (path: string) => {
  try {
    const sessionId = sessionStorage.getItem(SESSION_KEY) || 
      `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visitor-tracking?action=track`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path,
          sessionId,
          referrer: document.referrer || undefined,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to track page visit:', error);
    return false;
  }
};
