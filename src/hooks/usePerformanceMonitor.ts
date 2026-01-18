import { useEffect, useCallback, useRef } from "react";

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

export const usePerformanceMonitor = (enabled = true) => {
  const metrics = useRef<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  const logMetric = useCallback((name: string, value: number) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      if (lastEntry) {
        metrics.current.lcp = lastEntry.startTime;
        logMetric("LCP", lastEntry.startTime);
      }
    });

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEventTiming;
        if (fidEntry.processingStart) {
          const fid = fidEntry.processingStart - fidEntry.startTime;
          metrics.current.fid = fid;
          logMetric("FID", fid);
        }
      });
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!layoutShift.hadRecentInput && layoutShift.value) {
          clsValue += layoutShift.value;
          metrics.current.cls = clsValue;
        }
      });
    });

    // Time to First Byte (TTFB)
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      metrics.current.ttfb = ttfb;
      logMetric("TTFB", ttfb);
    }

    try {
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      fidObserver.observe({ type: "first-input", buffered: true });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch (e) {
      // Observer types not supported in this browser
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, [enabled, logMetric]);

  return metrics.current;
};

export default usePerformanceMonitor;
