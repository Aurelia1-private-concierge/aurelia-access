import React from "react";
import { createRoot } from "react-dom/client";

// Production debugging - Force CDN refresh: 2026-01-21T16:10:00Z
const DEBUG = true;
const log = (msg: string) => DEBUG && console.log(`[Aurelia ${Date.now()}] ${msg}`);

log("main.tsx: Script starting");

// Import critical styles first
import "./index.css";
log("main.tsx: CSS loaded");

// Load non-critical CSS asynchronously (Driver.js, transitions)
const loadNonCriticalCSS = () => {
  import("./styles/non-critical.css").catch(() => {});
};
if (typeof requestIdleCallback !== 'undefined') {
  requestIdleCallback(loadNonCriticalCSS);
} else {
  setTimeout(loadNonCriticalCSS, 100);
}

// Initialize i18n with error handling
try {
  log("main.tsx: Loading i18n...");
  import("./i18n").then(() => log("main.tsx: i18n loaded")).catch(e => console.error("i18n failed:", e));
} catch (e) {
  console.error("i18n import error:", e);
}

// Import app
import App from "./App.tsx";
log("main.tsx: App component imported");

// Initialize Sentry lazily (non-blocking)
import("./lib/sentry").then(({ initSentry }) => initSentry()).catch(() => {});

// Clean up old service workers immediately
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
  // Also clear caches
  if ("caches" in window) {
    caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
  }
}

// Helper to remove loader gracefully
const removeLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.transition = 'opacity 0.5s ease';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
  }
};

// Helper to show error in loader
const showError = (error: unknown) => {
  console.error("Failed to mount React app:", error);
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.innerHTML = `
      <div style="text-align:center;padding:40px;">
        <h1 style="color:#D4AF37;font-size:28px;font-weight:300;margin-bottom:16px;">AURELIA</h1>
        <p style="color:#888;margin-bottom:24px;max-width:400px;">We encountered an issue loading the application. Please refresh.</p>
        <button onclick="localStorage.clear();sessionStorage.clear();location.reload()" style="padding:14px 32px;background:linear-gradient(135deg,#D4AF37,#B8962E);color:#080a0f;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;">
          Refresh Page
        </button>
        <p style="color:#555;font-size:11px;margin-top:16px;">${String(error).substring(0, 100)}</p>
      </div>
    `;
  }
};

// Mount React with error handling
const rootElement = document.getElementById("root");
log("main.tsx: Root element found: " + !!rootElement);

if (rootElement) {
  // DON'T remove loader yet - wait for successful mount
  // Clear any existing content in root (but keep loader visible)
  rootElement.innerHTML = "";
  
  try {
    log("main.tsx: Creating React root...");
    const root = createRoot(rootElement);
    log("main.tsx: Rendering App...");
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    log("main.tsx: React render called");
    
    // Signal successful mount - remove loader after a short delay
    // This gives React time to actually render content
    setTimeout(() => {
      removeLoader();
      // Also call the window function if it exists
      if (typeof (window as any).__AURELIA_MOUNTED__ === 'function') {
        (window as any).__AURELIA_MOUNTED__();
      }
    }, 100);
  } catch (error) {
    showError(error);
  }
} else {
  console.error("Root element not found");
  showError("Root element not found");
}
