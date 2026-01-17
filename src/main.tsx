import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Initialize Sentry error monitoring
import { initSentry } from "./lib/sentry";
initSentry();

// Initialize i18n after React is imported but before App
import "./i18n";

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
