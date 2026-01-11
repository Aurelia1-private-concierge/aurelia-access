import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
}

interface SessionTimeoutState {
  isWarningVisible: boolean;
  remainingSeconds: number;
  extendSession: () => void;
  resetTimer: () => void;
}

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
];

export const useSessionTimeout = ({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout,
  onWarning,
}: SessionTimeoutOptions = {}): SessionTimeoutState => {
  const { user, signOut } = useAuth();
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const handleTimeout = useCallback(async () => {
    clearAllTimers();
    setIsWarningVisible(false);
    
    if (onTimeout) {
      onTimeout();
    } else {
      await signOut();
    }
  }, [clearAllTimers, onTimeout, signOut]);

  const startCountdown = useCallback(() => {
    const warningDuration = warningMinutes * 60;
    setRemainingSeconds(warningDuration);
    setIsWarningVisible(true);
    
    if (onWarning) onWarning();
    
    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningMinutes, onWarning, handleTimeout]);

  const resetTimer = useCallback(() => {
    if (!user) return;
    
    clearAllTimers();
    setIsWarningVisible(false);
    setRemainingSeconds(0);
    lastActivityRef.current = Date.now();

    const timeBeforeWarning = (timeoutMinutes - warningMinutes) * 60 * 1000;
    
    warningRef.current = setTimeout(() => {
      startCountdown();
    }, timeBeforeWarning);
    
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, timeoutMinutes * 60 * 1000);
  }, [user, clearAllTimers, timeoutMinutes, warningMinutes, startCountdown, handleTimeout]);

  const extendSession = useCallback(() => {
    setIsWarningVisible(false);
    resetTimer();
  }, [resetTimer]);

  // Handle activity events
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      const now = Date.now();
      // Only reset if more than 1 second has passed (debounce)
      if (now - lastActivityRef.current > 1000) {
        lastActivityRef.current = now;
        // Only reset if warning is not visible
        if (!isWarningVisible) {
          resetTimer();
        }
      }
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Start initial timer
    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [user, isWarningVisible, resetTimer, clearAllTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return {
    isWarningVisible,
    remainingSeconds,
    extendSession,
    resetTimer,
  };
};

export default useSessionTimeout;
