import * as Sentry from "@sentry/react";

// Initialize Sentry for error monitoring
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.log("Sentry DSN not configured - error monitoring disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.PROD ? "production" : "development",
    
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod, 100% in dev
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Filter out non-critical errors
    beforeSend(event, hint) {
      const error = hint.originalException as Error;
      
      // Ignore common non-critical errors
      if (error?.message) {
        const ignoredErrors = [
          "ResizeObserver loop",
          "Non-Error promise rejection",
          "Load failed",
          "Failed to fetch",
          "Network request failed",
          "Script error",
        ];
        
        if (ignoredErrors.some(msg => error.message.includes(msg))) {
          return null;
        }
      }
      
      return event;
    },
    
    // Additional integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
};

// Capture custom error with context and return event ID
export const captureError = (
  error: Error,
  context?: Record<string, unknown>
): string | undefined => {
  return Sentry.captureException(error, {
    extra: context,
  });
};

// Set user context for better error tracking
export const setUser = (user: { id: string; email?: string; tier?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    tier: user.tier,
  });
};

// Clear user context on logout
export const clearUser = () => {
  Sentry.setUser(null);
};

// Add breadcrumb for tracking user actions
export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, unknown>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
};

// Capture feedback from users
export const captureFeedback = (
  message: string,
  contact?: string
) => {
  Sentry.captureMessage(`User Feedback: ${message}`, {
    extra: { contact },
    level: "info",
  });
};

export default Sentry;
