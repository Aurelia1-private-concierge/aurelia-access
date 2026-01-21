import { ReactNode, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useAuthAuditLog } from "@/hooks/useAuthAuditLog";
import { SessionTimeoutWarning } from "@/components/auth/SessionTimeoutWarning";
import { toast } from "@/hooks/use-toast";

interface SessionTimeoutProviderProps {
  children: ReactNode;
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export const SessionTimeoutProvider = forwardRef<HTMLDivElement, SessionTimeoutProviderProps>(
  ({ children, timeoutMinutes = 30, warningMinutes = 5 }, ref) => {
    const { user, signOut } = useAuth();
    const { logSessionTimeout, logSessionExtended } = useAuthAuditLog();
    const navigate = useNavigate();

    const handleTimeout = async () => {
      logSessionTimeout();
      await signOut();
      toast({
        title: "Session Expired",
        description: "You've been signed out due to inactivity.",
      });
      navigate("/auth");
    };

    const handleWarning = () => {
      // Optional: play a sound or vibrate
    };

    const { isWarningVisible, remainingSeconds, extendSession } = useSessionTimeout({
      timeoutMinutes,
      warningMinutes,
      onTimeout: handleTimeout,
      onWarning: handleWarning,
    });

    const handleExtend = () => {
      logSessionExtended();
      extendSession();
    };

    const handleLogout = async () => {
      logSessionTimeout();
      await signOut();
      navigate("/auth");
    };

    // Only show session timeout for authenticated users
    if (!user) {
      return <>{children}</>;
    }

    return (
      <>
        {children}
        <SessionTimeoutWarning
          isVisible={isWarningVisible}
          remainingSeconds={remainingSeconds}
          onExtend={handleExtend}
          onLogout={handleLogout}
        />
      </>
    );
  }
);

SessionTimeoutProvider.displayName = "SessionTimeoutProvider";

export default SessionTimeoutProvider;
