import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RateLimitState {
  isLimited: boolean;
  attemptsRemaining: number;
  lockoutUntil: Date | null;
  cooldownSeconds: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const STORAGE_KEY = "login_attempts";

interface StoredAttempts {
  attempts: number;
  firstAttemptTime: number;
  lockoutUntil: number | null;
}

export const useLoginRateLimit = () => {
  const [state, setState] = useState<RateLimitState>({
    isLimited: false,
    attemptsRemaining: MAX_ATTEMPTS,
    lockoutUntil: null,
    cooldownSeconds: 0,
  });

  // Check stored attempts on mount
  useEffect(() => {
    checkRateLimit();
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (state.cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          cooldownSeconds: prev.cooldownSeconds - 1,
          isLimited: prev.cooldownSeconds > 1,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (state.lockoutUntil && new Date() >= state.lockoutUntil) {
      // Lockout expired, reset
      clearAttempts();
    }
  }, [state.cooldownSeconds, state.lockoutUntil]);

  const getStoredAttempts = (): StoredAttempts | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  };

  const saveAttempts = (data: StoredAttempts) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const clearAttempts = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isLimited: false,
      attemptsRemaining: MAX_ATTEMPTS,
      lockoutUntil: null,
      cooldownSeconds: 0,
    });
  };

  const checkRateLimit = useCallback(() => {
    const stored = getStoredAttempts();
    
    if (!stored) {
      setState({
        isLimited: false,
        attemptsRemaining: MAX_ATTEMPTS,
        lockoutUntil: null,
        cooldownSeconds: 0,
      });
      return;
    }

    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour window

    // Check if lockout is active
    if (stored.lockoutUntil && now < stored.lockoutUntil) {
      const cooldownSeconds = Math.ceil((stored.lockoutUntil - now) / 1000);
      setState({
        isLimited: true,
        attemptsRemaining: 0,
        lockoutUntil: new Date(stored.lockoutUntil),
        cooldownSeconds,
      });
      return;
    }

    // Check if window has expired
    if (now - stored.firstAttemptTime > windowMs) {
      clearAttempts();
      return;
    }

    // Calculate remaining attempts
    const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - stored.attempts);
    setState({
      isLimited: attemptsRemaining === 0,
      attemptsRemaining,
      lockoutUntil: null,
      cooldownSeconds: 0,
    });
  }, []);

  const recordFailedAttempt = useCallback(async (email: string) => {
    const now = Date.now();
    const stored = getStoredAttempts();

    let newAttempts: StoredAttempts;

    if (!stored || now - stored.firstAttemptTime > 60 * 60 * 1000) {
      // Start new window
      newAttempts = {
        attempts: 1,
        firstAttemptTime: now,
        lockoutUntil: null,
      };
    } else {
      newAttempts = {
        ...stored,
        attempts: stored.attempts + 1,
      };
    }

    // Check if we should lock out
    if (newAttempts.attempts >= MAX_ATTEMPTS) {
      newAttempts.lockoutUntil = now + LOCKOUT_MINUTES * 60 * 1000;
      
      // Also record in database for server-side tracking
      try {
        await supabase.rpc("check_rate_limit", {
          p_identifier: email.toLowerCase(),
          p_action_type: "login_attempt",
          p_max_requests: MAX_ATTEMPTS,
          p_window_minutes: 60,
        });
      } catch (err) {
        console.error("Failed to record rate limit:", err);
      }
    }

    saveAttempts(newAttempts);

    const cooldownSeconds = newAttempts.lockoutUntil 
      ? Math.ceil((newAttempts.lockoutUntil - now) / 1000)
      : 0;

    setState({
      isLimited: newAttempts.attempts >= MAX_ATTEMPTS,
      attemptsRemaining: Math.max(0, MAX_ATTEMPTS - newAttempts.attempts),
      lockoutUntil: newAttempts.lockoutUntil ? new Date(newAttempts.lockoutUntil) : null,
      cooldownSeconds,
    });
  }, []);

  const recordSuccessfulLogin = useCallback(() => {
    clearAttempts();
  }, []);

  const formatCooldown = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return {
    ...state,
    recordFailedAttempt,
    recordSuccessfulLogin,
    formatCooldown,
    checkRateLimit,
    clearAttempts, // Expose manual clear function
  };
};

export default useLoginRateLimit;
