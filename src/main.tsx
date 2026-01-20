import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Initialize Sentry error monitoring (lazy to avoid blocking)
const initSentryAsync = async () => {
  try {
    const { initSentry } = await import("./lib/sentry");
    initSentry();
  } catch (e) {
    console.warn("Sentry init failed:", e);
  }
};
initSentryAsync();

// Initialize i18n after React is imported but before App
import "./i18n";

import App from "./App.tsx";

// Clear the loading fallback content before React mounts
const rootElement = document.getElementById("root");
if (rootElement) {
  // Clear all fallback content - React will populate it
  rootElement.innerHTML = '';
  
  // Mount React app with error boundary
  try {
    createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (e) {
    console.error("React mount failed:", e);
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #050810; color: #D4AF37; font-family: 'Inter', sans-serif; text-align: center; padding: 20px;">
        <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Something went wrong</h1>
        <p style="color: #888; margin-bottom: 1rem;">Please refresh the page or try again later.</p>
        <button onclick="location.reload()" style="background: #D4AF37; color: #050810; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-weight: 600;">Refresh Page</button>
      </div>
    `;
  }
}

// Unregister any existing service workers to prevent caching issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
    });
  });
}
