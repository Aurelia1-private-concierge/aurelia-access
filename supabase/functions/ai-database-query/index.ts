import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface QueryRequest {
  query: string;
  queryType: 'database' | 'insights' | 'chat';
  specialistId?: string;
  context?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: QueryRequest = await req.json();
    const { query, queryType, specialistId, context } = body;

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get specialist config if provided
    let systemPrompt = "";
    let model = "google/gemini-3-flash-preview";
    
    if (specialistId) {
      const { data: specialist } = await supabase
        .from("ai_specialists")
        .select("*")
        .eq("id", specialistId)
        .single();
      
      if (specialist) {
        systemPrompt = specialist.system_prompt || "";
        model = specialist.model || model;
      }
    }

    // Build context-aware system prompt based on query type
    let fullSystemPrompt = "";
    
    if (queryType === "database") {
      // Fetch schema cache for context
      const { data: schemaData } = await supabase
        .from("db_schema_cache")
        .select("table_name, schema_json, row_count");
      
      const schemaContext = schemaData?.map(s => 
        `Table: ${s.table_name}, Columns: ${JSON.stringify(s.schema_json)}, Rows: ${s.row_count || 'unknown'}`
      ).join("\n") || "";

      fullSystemPrompt = `You are Orla's Database Intelligence Specialist for Aurelia Private Concierge.
You help administrators understand and query the database using natural language.

DATABASE SCHEMA:
${schemaContext || "Schema not cached yet. Please refresh the schema cache."}

INSTRUCTIONS:
- Translate natural language queries into insights about the data
- Provide SQL query suggestions when appropriate (READ-ONLY queries only)
- Never suggest DELETE, UPDATE, or INSERT operations
- Format responses with clear headings and bullet points
- Include estimated row counts when relevant

${systemPrompt}`;
    } else if (queryType === "insights") {
      fullSystemPrompt = `You are Orla's Data Insights Specialist for Aurelia Private Concierge.
You analyze data patterns and provide actionable business insights.

CONTEXT: ${JSON.stringify(context || {})}

INSTRUCTIONS:
- Identify trends, anomalies, and opportunities
- Provide specific, actionable recommendations
- Use the Aurelia brand voice (sophisticated, discreet, warm)
- Format insights with severity levels: info, warning, critical
- Focus on member experience, revenue, and operational efficiency

${systemPrompt}`;
    } else {
      fullSystemPrompt = `You are Orla, Aurelia's AI Database Concierge.
You help administrators manage and understand the platform data with warmth and sophistication.

INSTRUCTIONS:
- Answer questions about data, members, partners, and operations
- Maintain absolute discretion about sensitive member information
- Provide clear, actionable insights
- Use the Aurelia brand voice (never casual, always sophisticated)

${systemPrompt}`;
    }

    // Create query log entry
    const { data: logEntry } = await supabase
      .from("ai_query_logs")
      .insert({
        specialist_id: specialistId || null,
        user_id: authData.user.id,
        query_type: queryType,
        query_text: query,
        context: context || {},
        status: "pending"
      })
      .select()
      .single();

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: query }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorStatus = response.status;
      
      // Update log with error
      if (logEntry) {
        await supabase
          .from("ai_query_logs")
          .update({ 
            status: "failed",
            error_message: `API error: ${errorStatus}`,
            response_time_ms: Date.now() - startTime
          })
          .eq("id", logEntry.id);
      }

      if (errorStatus === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (errorStatus === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI service error: ${errorStatus}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "";
    const tokensUsed = data.usage?.total_tokens || 0;
    const responseTime = Date.now() - startTime;

    // Update log with success
    if (logEntry) {
      await supabase
        .from("ai_query_logs")
        .update({
          status: "completed",
          response_text: responseText,
          tokens_used: tokensUsed,
          response_time_ms: responseTime
        })
        .eq("id", logEntry.id);
    }

    return new Response(
      JSON.stringify({
        response: responseText,
        tokensUsed,
        responseTimeMs: responseTime,
        queryId: logEntry?.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("AI Database Query error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
