import * as Sentry from "@sentry/react";

// Lazy toast import to avoid circular dependency during initialization
let toastFn: typeof import("@/hooks/use-toast").toast | null = null;
const getToast = async () => {
  if (!toastFn) {
    const { toast } = await import("@/hooks/use-toast");
    toastFn = toast;
  }
  return toastFn;
};

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

// Capture error and show user-facing notification with event ID
export const captureErrorWithNotification = async (
  error: Error,
  context?: Record<string, unknown>
): Promise<string | undefined> => {
  const eventId = Sentry.captureException(error, {
    extra: context,
  });

  if (eventId) {
    try {
      const toast = await getToast();
      toast({
        title: "An error occurred",
        description: `Reference ID: ${eventId}`,
        variant: "destructive",
      });
    } catch {
      // Toast not available, silently continue
    }
  }

  return eventId;
};

// Manual event sending (low-level API)
// Useful for edge cases where SDK isn't available
export const sendManualEvent = async (
  message: string,
  level: "error" | "warning" | "info" = "error",
  extra?: Record<string, unknown>
): Promise<string | null> => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return null;

  // Parse DSN: https://PUBLIC_KEY@HOST/PROJECT_ID
  const dsnMatch = dsn.match(/https:\/\/([^@]+)@([^/]+)\/(\d+)/);
  if (!dsnMatch) return null;

  const [, publicKey, host, projectId] = dsnMatch;
  const eventId = crypto.randomUUID().replace(/-/g, "");
  const timestamp = new Date().toISOString();

  const event = {
    event_id: eventId,
    timestamp,
    level,
    message: { formatted: message },
    extra,
    platform: "javascript",
    sdk: { name: "sentry.javascript.browser", version: "manual" },
  };

  // Method 1: X-Sentry-Auth header
  const authHeader = `Sentry sentry_version=7, sentry_client=manual/1.0, sentry_key=${publicKey}`;

  try {
    await fetch(`https://${host}/api/${projectId}/store/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": authHeader,
      },
      body: JSON.stringify(event),
    });
    return eventId;
  } catch {
    // Method 2: Query string auth (fallback)
    try {
      await fetch(
        `https://${host}/api/${projectId}/store/?sentry_version=7&sentry_key=${publicKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        }
      );
      return eventId;
    } catch {
      return null;
    }
  }
};

export default Sentry;
