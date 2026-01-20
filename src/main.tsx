import React from "react";
import { createRoot } from "react-dom/client";

// Production debugging
const DEBUG = true;
const log = (msg: string) => DEBUG && console.log(`[Aurelia ${Date.now()}] ${msg}`);

log("main.tsx: Script starting");

// Import styles first
import "./index.css";
log("main.tsx: CSS loaded");

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

// Mount React with error handling
const rootElement = document.getElementById("root");
log("main.tsx: Root element found: " + !!rootElement);

if (rootElement) {
  // Clear any existing content first
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
  } catch (error) {
    console.error("Failed to mount React app:", error);
    // Show fallback error UI
    rootElement.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#050810;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:20px;">
        <h1 style="font-size:24px;margin-bottom:16px;color:#D4AF37;">Aurelia</h1>
        <p style="color:#999;margin-bottom:24px;">Something went wrong. Please refresh the page.</p>
        <button onclick="location.reload()" style="padding:12px 24px;background:#D4AF37;color:#000;border:none;border-radius:4px;cursor:pointer;font-weight:600;">
          Refresh Page
        </button>
      </div>
    `;
  }
} else {
  console.error("Root element not found");
}
