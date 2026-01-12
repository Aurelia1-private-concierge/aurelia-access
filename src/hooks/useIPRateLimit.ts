import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface IPRateLimitState {
  isLimited: boolean;
  attemptsRemaining: number;
  cooldownSeconds: number;
  lockoutUntil: Date | null;
  message?: string;
}

interface IPRateLimitResponse {
  isLimited: boolean;
  attemptsRemaining: number;
  cooldownSeconds: number;
  lockoutUntil: string | null;
  message?: string;
}

export const useIPRateLimit = () => {
  const [state, setState] = useState<IPRateLimitState>({
    isLimited: false,
    attemptsRemaining: 5,
    cooldownSeconds: 0,
    lockoutUntil: null,
  });
  const [isChecking, setIsChecking] = useState(false);

  const updateStateFromResponse = (response: IPRateLimitResponse) => {
    setState({
      isLimited: response.isLimited,
      attemptsRemaining: response.attemptsRemaining,
      cooldownSeconds: response.cooldownSeconds,
      lockoutUntil: response.lockoutUntil ? new Date(response.lockoutUntil) : null,
      message: response.message,
    });
  };

  const checkRateLimit = useCallback(async (): Promise<IPRateLimitState> => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-login-rate-limit", {
        body: { action: "check" },
      });

      if (error) {
        console.error("Error checking IP rate limit:", error);
        // On error, allow login attempt (fail open for availability)
        return state;
      }

      const response = data as IPRateLimitResponse;
      updateStateFromResponse(response);
      return {
        isLimited: response.isLimited,
        attemptsRemaining: response.attemptsRemaining,
        cooldownSeconds: response.cooldownSeconds,
        lockoutUntil: response.lockoutUntil ? new Date(response.lockoutUntil) : null,
        message: response.message,
      };
    } catch (err) {
      console.error("Failed to check IP rate limit:", err);
      return state;
    } finally {
      setIsChecking(false);
    }
  }, [state]);

  const recordFailedAttempt = useCallback(async (email: string): Promise<IPRateLimitState> => {
    try {
      const { data, error } = await supabase.functions.invoke("check-login-rate-limit", {
        body: { action: "record_failed", email },
      });

      if (error) {
        console.error("Error recording failed attempt:", error);
        return state;
      }

      const response = data as IPRateLimitResponse;
      updateStateFromResponse(response);
      return {
        isLimited: response.isLimited,
        attemptsRemaining: response.attemptsRemaining,
        cooldownSeconds: response.cooldownSeconds,
        lockoutUntil: response.lockoutUntil ? new Date(response.lockoutUntil) : null,
        message: response.message,
      };
    } catch (err) {
      console.error("Failed to record failed attempt:", err);
      return state;
    }
  }, [state]);

  const recordSuccessfulLogin = useCallback(async (email: string): Promise<void> => {
    try {
      await supabase.functions.invoke("check-login-rate-limit", {
        body: { action: "record_success", email },
      });

      // Reset state on successful login
      setState({
        isLimited: false,
        attemptsRemaining: 5,
        cooldownSeconds: 0,
        lockoutUntil: null,
      });
    } catch (err) {
      console.error("Failed to record successful login:", err);
    }
  }, []);

  const formatCooldown = (seconds: number): string => {
    if (seconds <= 0) return "";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return {
    ...state,
    isChecking,
    checkRateLimit,
    recordFailedAttempt,
    recordSuccessfulLogin,
    formatCooldown,
  };
};

export default useIPRateLimit;