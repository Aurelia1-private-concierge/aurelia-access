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
  // Remove the initial HTML loader
  const initialLoader = document.getElementById('initial-loader');
  if (initialLoader) {
    initialLoader.remove();
  }
  
  // Clear any existing content
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
    // Signal successful mount to remove the HTML loader
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (window as any).__AURELIA_MOUNTED__ === 'function') {
      setTimeout(() => (window as any).__AURELIA_MOUNTED__(), 100);
    }
  } catch (error) {
    console.error("Failed to mount React app:", error);
    // Show fallback error UI with visible colors
    rootElement.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#080a0f;color:#e8e4dc;font-family:system-ui,sans-serif;text-align:center;padding:20px;">
        <h1 style="font-size:28px;margin-bottom:16px;color:#D4AF37;font-weight:300;letter-spacing:0.1em;">AURELIA</h1>
        <p style="color:#888;margin-bottom:24px;max-width:400px;">We encountered an issue loading the application. Please refresh the page or try again later.</p>
        <button onclick="location.reload()" style="padding:14px 32px;background:linear-gradient(135deg,#D4AF37,#B8962E);color:#080a0f;border:none;border-radius:4px;cursor:pointer;font-weight:600;font-size:14px;letter-spacing:0.05em;text-transform:uppercase;">
          Refresh Page
        </button>
      </div>
    `;
  }
} else {
  console.error("Root element not found");
  // Emergency fallback - create root element
  const body = document.body;
  body.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#080a0f;color:#e8e4dc;font-family:system-ui,sans-serif;text-align:center;padding:20px;">
      <h1 style="font-size:28px;margin-bottom:16px;color:#D4AF37;font-weight:300;">Aurelia</h1>
      <p style="color:#888;margin-bottom:24px;">Application failed to initialize. Please refresh.</p>
      <button onclick="location.reload()" style="padding:14px 32px;background:#D4AF37;color:#080a0f;border:none;border-radius:4px;cursor:pointer;font-weight:600;">
        Refresh
      </button>
    </div>
  `;
}
