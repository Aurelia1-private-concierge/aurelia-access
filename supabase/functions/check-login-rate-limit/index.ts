import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RateLimitRequest {
  email?: string;
  action: "check" | "record_failed" | "record_success" | "clear";
}

interface RateLimitResponse {
  isLimited: boolean;
  attemptsRemaining: number;
  cooldownSeconds: number;
  lockoutUntil: string | null;
  message?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfConnectingIp = req.headers.get("cf-connecting-ip");
    
    // Use first IP from forwarded chain, or fallback
    const clientIp = cfConnectingIp || 
                     (forwardedFor ? forwardedFor.split(",")[0].trim() : null) || 
                     realIp || 
                     "unknown";
    
    const userAgent = req.headers.get("user-agent") || "unknown";
    
    console.log(`[check-login-rate-limit] Request from IP: ${clientIp}`);

    // Parse request body
    const body: RateLimitRequest = await req.json();
    const { email, action } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing action parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const MAX_ATTEMPTS = 5;
    const WINDOW_MINUTES = 15;
    const LOCKOUT_MINUTES = 30;

    if (action === "check") {
      // Check current rate limit status for this IP
      const { data, error } = await supabase.rpc("check_ip_rate_limit", {
        p_ip_address: clientIp,
        p_max_attempts: MAX_ATTEMPTS,
        p_window_minutes: WINDOW_MINUTES,
        p_lockout_minutes: LOCKOUT_MINUTES,
      });

      if (error) {
        console.error("[check-login-rate-limit] Error checking rate limit:", error);
        throw error;
      }

      const result = data?.[0] || { is_limited: false, attempts_in_window: 0, lockout_until: null, cooldown_seconds: 0 };
      
      const response: RateLimitResponse = {
        isLimited: result.is_limited,
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - result.attempts_in_window),
        cooldownSeconds: result.cooldown_seconds,
        lockoutUntil: result.lockout_until,
        message: result.is_limited 
          ? `Too many login attempts. Please try again in ${Math.ceil(result.cooldown_seconds / 60)} minutes.`
          : undefined,
      };

      console.log(`[check-login-rate-limit] IP ${clientIp}: limited=${result.is_limited}, attempts=${result.attempts_in_window}`);

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "record_failed") {
      if (!email) {
        return new Response(
          JSON.stringify({ error: "Email required for recording failed attempt" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Record the failed attempt
      await supabase.rpc("record_ip_login_attempt", {
        p_ip_address: clientIp,
        p_email: email.toLowerCase(),
        p_attempt_type: "failed",
        p_user_agent: userAgent,
      });

      // Check updated rate limit status
      const { data } = await supabase.rpc("check_ip_rate_limit", {
        p_ip_address: clientIp,
        p_max_attempts: MAX_ATTEMPTS,
        p_window_minutes: WINDOW_MINUTES,
        p_lockout_minutes: LOCKOUT_MINUTES,
      });

      const result = data?.[0] || { is_limited: false, attempts_in_window: 1, lockout_until: null, cooldown_seconds: 0 };
      
      const response: RateLimitResponse = {
        isLimited: result.is_limited,
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - result.attempts_in_window),
        cooldownSeconds: result.cooldown_seconds,
        lockoutUntil: result.lockout_until,
        message: result.is_limited 
          ? `Account locked due to too many failed attempts. Please try again in ${Math.ceil(result.cooldown_seconds / 60)} minutes.`
          : `${Math.max(0, MAX_ATTEMPTS - result.attempts_in_window)} attempts remaining`,
      };

      console.log(`[check-login-rate-limit] Recorded failed attempt for ${email} from IP ${clientIp}`);

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "record_success") {
      // Record successful login (for audit trail)
      if (email) {
        await supabase.rpc("record_ip_login_attempt", {
          p_ip_address: clientIp,
          p_email: email.toLowerCase(),
          p_attempt_type: "success",
          p_user_agent: userAgent,
        });
      }

      console.log(`[check-login-rate-limit] Recorded successful login for ${email} from IP ${clientIp}`);

      const response: RateLimitResponse = {
        isLimited: false,
        attemptsRemaining: MAX_ATTEMPTS,
        cooldownSeconds: 0,
        lockoutUntil: null,
      };

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[check-login-rate-limit] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});