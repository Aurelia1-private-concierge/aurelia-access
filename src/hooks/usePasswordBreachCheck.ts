import { useState, useCallback } from "react";

interface BreachCheckResult {
  isBreached: boolean;
  occurrences: number;
  error?: string;
}

/**
 * Hook to check passwords against the HaveIBeenPwned database using k-Anonymity.
 * This method never sends the actual password to the API - only the first 5 characters
 * of the SHA-1 hash are sent, and the full hash is checked locally.
 */
export const usePasswordBreachCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<BreachCheckResult | null>(null);

  /**
   * Generate SHA-1 hash of a string
   */
  const sha1Hash = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  };

  /**
   * Check if a password has been exposed in known data breaches.
   * Uses the HaveIBeenPwned k-Anonymity API for privacy-preserving lookups.
   */
  const checkPassword = useCallback(async (password: string): Promise<BreachCheckResult> => {
    if (!password || password.length < 4) {
      return { isBreached: false, occurrences: 0 };
    }

    setIsChecking(true);

    try {
      // Generate SHA-1 hash of the password
      const hash = await sha1Hash(password);
      
      // Split into prefix (first 5 chars) and suffix (rest)
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);

      // Query the API with only the prefix (k-Anonymity model)
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: {
          "Add-Padding": "true", // Helps prevent timing attacks
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        throw new Error("Failed to check password breach status");
      }

      const text = await response.text();
      
      // Parse the response - each line is "SUFFIX:COUNT"
      const lines = text.split("\n");
      
      for (const line of lines) {
        const [hashSuffix, countStr] = line.split(":");
        if (hashSuffix?.trim() === suffix) {
          const occurrences = parseInt(countStr?.trim() || "0", 10);
          const result = { isBreached: true, occurrences };
          setLastResult(result);
          setIsChecking(false);
          return result;
        }
      }

      // Password not found in breached databases
      const result = { isBreached: false, occurrences: 0 };
      setLastResult(result);
      setIsChecking(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const result = { isBreached: false, occurrences: 0, error: errorMessage };
      setLastResult(result);
      setIsChecking(false);
      return result;
    }
  }, []);

  /**
   * Debounced check - useful for real-time validation
   */
  const checkPasswordDebounced = useCallback(
    (() => {
      let timeoutId: ReturnType<typeof setTimeout>;
      
      return (password: string, callback: (result: BreachCheckResult) => void) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          const result = await checkPassword(password);
          callback(result);
        }, 500);
      };
    })(),
    [checkPassword]
  );

  return {
    checkPassword,
    checkPasswordDebounced,
    isChecking,
    lastResult,
  };
};

export default usePasswordBreachCheck;
