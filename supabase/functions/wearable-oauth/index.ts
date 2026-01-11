import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OAuthRequest {
  action: "get_auth_url" | "exchange_code" | "refresh_token" | "disconnect";
  provider: "oura" | "whoop";
  code?: string;
  redirect_uri?: string;
}

const OURA_CLIENT_ID = Deno.env.get("OURA_CLIENT_ID");
const OURA_CLIENT_SECRET = Deno.env.get("OURA_CLIENT_SECRET");
const WHOOP_CLIENT_ID = Deno.env.get("WHOOP_CLIENT_ID");
const WHOOP_CLIENT_SECRET = Deno.env.get("WHOOP_CLIENT_SECRET");

const getProviderConfig = (provider: string) => {
  if (provider === "oura") {
    return {
      authUrl: "https://cloud.ouraring.com/oauth/authorize",
      tokenUrl: "https://api.ouraring.com/oauth/token",
      clientId: OURA_CLIENT_ID,
      clientSecret: OURA_CLIENT_SECRET,
      scopes: "daily heartrate personal sleep readiness",
    };
  } else if (provider === "whoop") {
    return {
      authUrl: "https://api.prod.whoop.com/oauth/oauth2/auth",
      tokenUrl: "https://api.prod.whoop.com/oauth/oauth2/token",
      clientId: WHOOP_CLIENT_ID,
      clientSecret: WHOOP_CLIENT_SECRET,
      scopes: "read:recovery read:sleep read:workout read:profile read:cycles",
    };
  }
  throw new Error("Invalid provider");
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const { action, provider, code, redirect_uri }: OAuthRequest = await req.json();
    const config = getProviderConfig(provider);

    if (!config.clientId || !config.clientSecret) {
      return new Response(
        JSON.stringify({ 
          error: `${provider.toUpperCase()} API not configured`,
          demo_mode: true,
          message: `${provider === 'oura' ? 'Oura Ring' : 'WHOOP'} integration requires API credentials. Using demo mode.`
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    switch (action) {
      case "get_auth_url": {
        const params = new URLSearchParams({
          client_id: config.clientId,
          response_type: "code",
          scope: config.scopes,
          redirect_uri: redirect_uri || `${Deno.env.get("SUPABASE_URL")}/functions/v1/wearable-callback`,
          state: `${user.id}:${provider}`,
        });
        
        const authUrl = `${config.authUrl}?${params.toString()}`;
        
        return new Response(
          JSON.stringify({ auth_url: authUrl }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case "exchange_code": {
        if (!code) throw new Error("Missing authorization code");
        
        const tokenResponse = await fetch(config.tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: redirect_uri || `${Deno.env.get("SUPABASE_URL")}/functions/v1/wearable-callback`,
          }),
        });

        if (!tokenResponse.ok) {
          const error = await tokenResponse.text();
          console.error("Token exchange error:", error);
          throw new Error("Failed to exchange code for token");
        }

        const tokens = await tokenResponse.json();
        
        // Store tokens in database
        const expiresAt = tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null;

        const { error: dbError } = await supabase
          .from("wearable_connections")
          .upsert({
            user_id: user.id,
            provider,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: expiresAt,
            device_name: provider === "oura" ? "Oura Ring" : "WHOOP Band",
            last_sync_at: new Date().toISOString(),
          }, { onConflict: "user_id,provider" });

        if (dbError) {
          console.error("Database error:", dbError);
          throw new Error("Failed to save connection");
        }

        return new Response(
          JSON.stringify({ success: true, connected: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case "refresh_token": {
        const { data: connection, error: connError } = await supabase
          .from("wearable_connections")
          .select("refresh_token")
          .eq("user_id", user.id)
          .eq("provider", provider)
          .single();

        if (connError || !connection?.refresh_token) {
          throw new Error("No refresh token available");
        }

        const refreshResponse = await fetch(config.tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: connection.refresh_token,
            client_id: config.clientId,
            client_secret: config.clientSecret,
          }),
        });

        if (!refreshResponse.ok) {
          throw new Error("Failed to refresh token");
        }

        const tokens = await refreshResponse.json();
        
        const expiresAt = tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null;

        await supabase
          .from("wearable_connections")
          .update({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || connection.refresh_token,
            expires_at: expiresAt,
          })
          .eq("user_id", user.id)
          .eq("provider", provider);

        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      case "disconnect": {
        const { error: deleteError } = await supabase
          .from("wearable_connections")
          .delete()
          .eq("user_id", user.id)
          .eq("provider", provider);

        if (deleteError) throw deleteError;

        return new Response(
          JSON.stringify({ success: true, disconnected: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (error: any) {
    console.error("Wearable OAuth error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
