import { useEffect, forwardRef } from "react";

declare global {
  interface Window {
    trackingFunctions?: {
      onLoad: (config: { appId: string }) => void;
    };
  }
}

/**
 * Apollo.io visitor tracking component.
 * Loads the Apollo tracking script for lead enrichment and analytics.
 */
const ApolloTracker = forwardRef<HTMLDivElement>((_, ref) => {
  useEffect(() => {
    // Avoid duplicate initialization
    if (document.querySelector('script[src*="apollo.io"]')) {
      return;
    }

    const initApollo = () => {
      const n = Math.random().toString(36).substring(7);
      const script = document.createElement("script");
      
      script.src = `https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=${n}`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.trackingFunctions) {
          window.trackingFunctions.onLoad({ appId: "697032f9a52392001dfa5825" });
        }
      };
      
      document.head.appendChild(script);
    };

    // Defer loading to not block critical rendering
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(initApollo, { timeout: 3000 });
    } else {
      setTimeout(initApollo, 2000);
    }
  }, []);

  // Return an empty span that can receive the ref
  return <span ref={ref} style={{ display: 'none' }} />;
});

ApolloTracker.displayName = "ApolloTracker";

export default ApolloTracker;
