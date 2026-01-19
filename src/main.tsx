import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Initialize Sentry error monitoring
import { initSentry } from "./lib/sentry";
initSentry();

// Initialize i18n after React is imported but before App
import "./i18n";

import App from "./App.tsx";

// Remove the loading fallback once React mounts
const loadingFallback = document.getElementById("loading-fallback");
if (loadingFallback) {
  loadingFallback.remove();
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker after page load to avoid render-blocking
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use requestIdleCallback to defer SW registration until browser is idle
    const registerSW = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .catch(() => {
          // Silent fail - SW is optional enhancement
        });
    };
    
    if ('requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(registerSW);
    } else {
      setTimeout(registerSW, 3000); // Fallback: wait 3s after load
    }
  });
}
