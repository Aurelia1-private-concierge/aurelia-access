import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlatformCredentialStatus {
  platform: string;
  isConfigured: boolean;
  lastChecked: string;
  requiredKeys: string[];
}

const PLATFORM_CREDENTIALS: Record<string, string[]> = {
  twitter: ["TWITTER_CONSUMER_KEY", "TWITTER_CONSUMER_SECRET", "TWITTER_ACCESS_TOKEN", "TWITTER_ACCESS_TOKEN_SECRET"],
  linkedin: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"],
  instagram: ["META_APP_ID", "META_APP_SECRET"],
  facebook: ["META_APP_ID", "META_APP_SECRET"],
  reddit: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"],
  threads: ["THREADS_APP_ID", "THREADS_APP_SECRET"],
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[check-social-credentials] Checking platform credentials");
    
    const platforms: PlatformCredentialStatus[] = [];
    const now = new Date().toISOString();

    for (const [platform, keys] of Object.entries(PLATFORM_CREDENTIALS)) {
      // Check if ALL required keys for this platform are set
      const configuredKeys = keys.filter((key) => {
        const value = Deno.env.get(key);
        return value && value.length > 0;
      });

      const isFullyConfigured = configuredKeys.length === keys.length;
      const isPartiallyConfigured = configuredKeys.length > 0;

      platforms.push({
        platform,
        isConfigured: isFullyConfigured,
        lastChecked: now,
        requiredKeys: keys,
      });

      console.log(`[check-social-credentials] ${platform}: ${configuredKeys.length}/${keys.length} keys configured`);
    }

    const configuredCount = platforms.filter((p) => p.isConfigured).length;
    console.log(`[check-social-credentials] Total configured: ${configuredCount}/${platforms.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        platforms,
        summary: {
          total: platforms.length,
          configured: configuredCount,
          unconfigured: platforms.length - configuredCount,
        },
        checkedAt: now,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[check-social-credentials] Error:", errorMessage);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        platforms: [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
