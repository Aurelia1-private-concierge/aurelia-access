import { supabase } from "@/integrations/supabase/client";

/**
 * Check rate limit before performing an action
 * @param identifier - Unique identifier (e.g., email, IP fingerprint)
 * @param actionType - Type of action (e.g., 'contact_form', 'signup')
 * @param maxRequests - Maximum requests allowed in the window (default: 5)
 * @param windowMinutes - Time window in minutes (default: 60)
 * @returns Promise<{ allowed: boolean; error?: string }>
 */
export async function checkRateLimit(
  identifier: string,
  actionType: string,
  maxRequests: number = 5,
  windowMinutes: number = 60
): Promise<{ allowed: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_action_type: actionType,
      p_max_requests: maxRequests,
      p_window_minutes: windowMinutes,
    });

    if (error) {
      console.error("Rate limit check failed:", error);
      // On error, allow the request (fail open) but log it
      return { allowed: true };
    }

    return { 
      allowed: data === true,
      error: data === false ? `Too many requests. Please try again in ${windowMinutes} minutes.` : undefined
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open on error
    return { allowed: true };
  }
}

/**
 * Generate a browser fingerprint for rate limiting
 * Combines multiple factors for a reasonably unique identifier
 */
export function generateFingerprint(): string {
  const factors = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
  ];
  
  // Simple hash function
  const str = factors.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}
