import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type AuthAction = 
  | "login_success"
  | "login_failed"
  | "logout"
  | "signup"
  | "password_reset_request"
  | "password_reset_complete"
  | "mfa_enroll"
  | "mfa_verify"
  | "mfa_unenroll"
  | "session_timeout"
  | "session_extended"
  | "oauth_login";

interface AuditLogDetails {
  email?: string;
  provider?: string;
  ip_address?: string;
  user_agent?: string;
  reason?: string;
  [key: string]: unknown;
}

export const useAuthAuditLog = () => {
  const { user } = useAuth();

  const logAuthEvent = useCallback(
    async (action: AuthAction, details?: AuditLogDetails) => {
      try {
        const userAgent = navigator.userAgent;
        
        // Get approximate IP via a simple service (optional, can be enhanced)
        let ipAddress: string | null = null;
        try {
          const response = await fetch("https://api.ipify.org?format=json", {
            signal: AbortSignal.timeout(2000),
          });
          if (response.ok) {
            const data = await response.json();
            ipAddress = data.ip;
          }
        } catch {
          // IP fetch failed, continue without it
        }

        const { error } = await supabase.from("audit_logs").insert({
          user_id: user?.id || null,
          action,
          resource_type: "authentication",
          resource_id: user?.id || details?.email || null,
          ip_address: ipAddress,
          user_agent: userAgent,
          details: {
            ...details,
            timestamp: new Date().toISOString(),
            session_id: crypto.randomUUID(),
          },
        });

        if (error) {
          console.error("Failed to log auth event:", error);
        }
      } catch (err) {
        console.error("Auth audit log error:", err);
      }
    },
    [user]
  );

  const logLogin = useCallback(
    (success: boolean, email: string, provider = "email") => {
      logAuthEvent(success ? "login_success" : "login_failed", {
        email,
        provider,
      });
    },
    [logAuthEvent]
  );

  const logLogout = useCallback(
    (reason?: string) => {
      logAuthEvent("logout", { reason });
    },
    [logAuthEvent]
  );

  const logSignup = useCallback(
    (email: string) => {
      logAuthEvent("signup", { email });
    },
    [logAuthEvent]
  );

  const logPasswordReset = useCallback(
    (type: "request" | "complete", email: string) => {
      logAuthEvent(
        type === "request" ? "password_reset_request" : "password_reset_complete",
        { email }
      );
    },
    [logAuthEvent]
  );

  const logMFAEvent = useCallback(
    (type: "enroll" | "verify" | "unenroll") => {
      const actionMap: Record<typeof type, AuthAction> = {
        enroll: "mfa_enroll",
        verify: "mfa_verify",
        unenroll: "mfa_unenroll",
      };
      logAuthEvent(actionMap[type]);
    },
    [logAuthEvent]
  );

  const logSessionTimeout = useCallback(() => {
    logAuthEvent("session_timeout");
  }, [logAuthEvent]);

  const logSessionExtended = useCallback(() => {
    logAuthEvent("session_extended");
  }, [logAuthEvent]);

  const logOAuthLogin = useCallback(
    (provider: string) => {
      logAuthEvent("oauth_login", { provider });
    },
    [logAuthEvent]
  );

  return {
    logAuthEvent,
    logLogin,
    logLogout,
    logSignup,
    logPasswordReset,
    logMFAEvent,
    logSessionTimeout,
    logSessionExtended,
    logOAuthLogin,
  };
};

export default useAuthAuditLog;
