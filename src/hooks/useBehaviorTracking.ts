import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface BehaviorEvent {
  event_type: string;
  page_path: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  scroll_depth?: number;
  time_on_page?: number;
  metadata?: Record<string, any>;
}

// Generate a session ID that persists for the browser session
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("aurelia_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem("aurelia_session_id", sessionId);
  }
  return sessionId;
};

export const useBehaviorTracking = () => {
  const location = useLocation();
  const sessionId = useRef(getSessionId());
  const pageStartTime = useRef(Date.now());
  const maxScrollDepth = useRef(0);
  const eventQueue = useRef<BehaviorEvent[]>([]);
  const flushTimeout = useRef<NodeJS.Timeout | null>(null);

  // Flush events to database (batched for performance)
  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return;

    const events = [...eventQueue.current];
    eventQueue.current = [];

    try {
      const eventsToInsert = events.map((event) => ({
        session_id: sessionId.current,
        event_type: event.event_type,
        page_path: event.page_path,
        element_id: event.element_id || null,
        element_class: event.element_class || null,
        element_text: event.element_text?.substring(0, 100) || null,
        scroll_depth: event.scroll_depth || null,
        time_on_page: event.time_on_page || null,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        metadata: event.metadata || {},
      }));

      await supabase.from("user_behavior_events").insert(eventsToInsert);
    } catch (error) {
      console.error("[Tracking] Failed to send events:", error);
    }
  }, []);

  // Queue an event (batches for performance)
  const trackEvent = useCallback(
    (event: Omit<BehaviorEvent, "page_path">) => {
      eventQueue.current.push({
        ...event,
        page_path: location.pathname,
      });

      // Debounce flush
      if (flushTimeout.current) clearTimeout(flushTimeout.current);
      flushTimeout.current = setTimeout(flushEvents, 2000);
    },
    [location.pathname, flushEvents]
  );

  // Track page views
  useEffect(() => {
    pageStartTime.current = Date.now();
    maxScrollDepth.current = 0;

    trackEvent({
      event_type: "page_view",
      metadata: {
        title: document.title,
        timestamp: new Date().toISOString(),
      },
    });

    // Track time on page when leaving
    return () => {
      const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
      eventQueue.current.push({
        event_type: "page_exit",
        page_path: location.pathname,
        time_on_page: timeOnPage,
        scroll_depth: maxScrollDepth.current,
      });
      flushEvents();
    };
  }, [location.pathname, trackEvent, flushEvents]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollHeight > 0 
        ? Math.round((window.scrollY / scrollHeight) * 100) 
        : 0;
      
      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent;
        
        // Track milestone scroll depths
        const milestones = [25, 50, 75, 100];
        if (milestones.includes(scrollPercent)) {
          trackEvent({
            event_type: "scroll_milestone",
            scroll_depth: scrollPercent,
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [trackEvent]);

  // Track clicks on important elements
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Only track clicks on interactive elements
      const isInteractive = 
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.hasAttribute("role") ||
        target.dataset.trackClick;

      if (!isInteractive) return;

      const element = target.closest("button, a, [role='button'], [data-track-click]") || target;
      
      trackEvent({
        event_type: "click",
        element_id: element.id || undefined,
        element_class: element.className?.toString().substring(0, 200) || undefined,
        element_text: element.textContent?.trim().substring(0, 100) || undefined,
        metadata: {
          tag: element.tagName.toLowerCase(),
          href: (element as HTMLAnchorElement).href || undefined,
        },
      });
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [trackEvent]);

  // Track form interactions
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        trackEvent({
          event_type: "form_focus",
          element_id: target.id || undefined,
          metadata: {
            type: (target as HTMLInputElement).type || target.tagName.toLowerCase(),
            name: (target as HTMLInputElement).name || undefined,
          },
        });
      }
    };

    document.addEventListener("focusin", handleFocus, { passive: true });
    return () => document.removeEventListener("focusin", handleFocus);
  }, [trackEvent]);

  // Flush on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable delivery
      const events = eventQueue.current;
      if (events.length > 0) {
        const payload = events.map((event) => ({
          session_id: sessionId.current,
          ...event,
          page_path: location.pathname,
        }));
        
        navigator.sendBeacon?.(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_behavior_events`,
          JSON.stringify(payload)
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [location.pathname]);

  return { trackEvent };
};

export default useBehaviorTracking;
