import React from "react";
import { createRoot } from "react-dom/client";

// Import styles first
import "./index.css";

// Initialize i18n
import "./i18n";

// Import app
import App from "./App.tsx";

// Initialize Sentry lazily (non-blocking)
import("./lib/sentry").then(({ initSentry }) => initSentry()).catch(() => {});

// Clean up old service workers immediately
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
}

// Mount React with error handling
const rootElement = document.getElementById("root");

if (rootElement) {
  // Clear any existing content first
  rootElement.innerHTML = "";
  
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
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
