import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProxyRequest {
  webhookUrl: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { webhookUrl, method = "POST", body, headers = {} }: ProxyRequest = await req.json();

    // Validate webhook URL - only allow n8n domains for security
    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: "webhookUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Whitelist allowed domains for security
    const allowedDomains = [
      "n8n.cloud",
      "app.n8n.cloud",
      "hooks.n8n.cloud",
    ];

    const url = new URL(webhookUrl);
    const isAllowed = allowedDomains.some(domain => url.hostname.endsWith(domain));
    
    if (!isAllowed) {
      console.error(`Blocked proxy request to non-whitelisted domain: ${url.hostname}`);
      return new Response(
        JSON.stringify({ error: "Domain not allowed" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Proxying ${method} request to: ${webhookUrl}`);

    // Forward the request to n8n
    const response = await fetch(webhookUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await response.text();
    let responseData: unknown;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    console.log(`Proxy response status: ${response.status}`);

    return new Response(
      JSON.stringify({
        success: response.ok,
        status: response.status,
        data: responseData,
      }),
      {
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Proxy request failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
