import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// MCP Server Implementation for Aurelia Private Concierge
const SERVER_INFO = {
  name: "aurelia-concierge-mcp",
  version: "1.0.0",
  description: "AI-powered luxury lifestyle management MCP server",
};

// Tool definitions
const TOOLS = [
  {
    name: "get_member_profile",
    description: "Retrieve a member's complete profile including tier, preferences, and travel DNA",
    inputSchema: { type: "object", properties: { user_id: { type: "string", description: "Member's user ID" } }, required: ["user_id"] },
  },
  {
    name: "create_service_request",
    description: "Create a new luxury service request on behalf of a member",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { type: "string" }, category: { type: "string", enum: ["aviation", "yacht", "real_estate", "dining", "events", "travel", "wellness", "shopping", "security", "chauffeur"] },
        title: { type: "string" }, description: { type: "string" }, budget_min: { type: "number" }, budget_max: { type: "number" },
        preferred_date: { type: "string" }, location: { type: "string" }, priority: { type: "string", enum: ["standard", "priority", "urgent", "vip"] },
      },
      required: ["user_id", "category", "title", "description"],
    },
  },
  {
    name: "get_service_requests",
    description: "Retrieve service requests with optional filters",
    inputSchema: { type: "object", properties: { user_id: { type: "string" }, status: { type: "string" }, category: { type: "string" }, limit: { type: "number" } } },
  },
  {
    name: "update_service_status",
    description: "Update the status of a service request",
    inputSchema: { type: "object", properties: { request_id: { type: "string" }, status: { type: "string" }, notes: { type: "string" } }, required: ["request_id", "status"] },
  },
  {
    name: "find_partners",
    description: "Search for approved partners by category, region, or capabilities",
    inputSchema: { type: "object", properties: { category: { type: "string" }, region: { type: "string" }, min_rating: { type: "number" } } },
  },
  {
    name: "get_partner_bids",
    description: "Get all bids for a service request",
    inputSchema: { type: "object", properties: { request_id: { type: "string" } }, required: ["request_id"] },
  },
  {
    name: "get_credit_balance",
    description: "Check a member's current credit balance and tier benefits",
    inputSchema: { type: "object", properties: { user_id: { type: "string" } }, required: ["user_id"] },
  },
  {
    name: "deduct_credits",
    description: "Deduct credits from a member's balance for a service",
    inputSchema: { type: "object", properties: { user_id: { type: "string" }, amount: { type: "number" }, reason: { type: "string" }, service_request_id: { type: "string" } }, required: ["user_id", "amount", "reason"] },
  },
  {
    name: "create_calendar_event",
    description: "Create a calendar event for a member",
    inputSchema: { type: "object", properties: { user_id: { type: "string" }, title: { type: "string" }, start_date: { type: "string" }, end_date: { type: "string" }, location: { type: "string" }, event_type: { type: "string" } }, required: ["user_id", "title", "start_date"] },
  },
  {
    name: "get_upcoming_events",
    description: "Get a member's upcoming calendar events",
    inputSchema: { type: "object", properties: { user_id: { type: "string" }, days_ahead: { type: "number" } }, required: ["user_id"] },
  },
  {
    name: "send_notification",
    description: "Send a notification to a member",
    inputSchema: { type: "object", properties: { user_id: { type: "string" }, title: { type: "string" }, message: { type: "string" }, type: { type: "string" } }, required: ["user_id", "title", "message"] },
  },
  {
    name: "get_member_history",
    description: "Get member's complete service history for personalized recommendations",
    inputSchema: { type: "object", properties: { user_id: { type: "string" } }, required: ["user_id"] },
  },
  {
    name: "suggest_experiences",
    description: "Generate personalized experience suggestions based on member profile",
    inputSchema: { type: "object", properties: { user_id: { type: "string" }, category: { type: "string" } }, required: ["user_id"] },
  },
  {
    name: "get_platform_metrics",
    description: "Get platform-wide metrics and analytics",
    inputSchema: { type: "object", properties: { date_from: { type: "string" }, date_to: { type: "string" } } },
  },
  {
    name: "get_conversation_context",
    description: "Get recent conversation context for continuity",
    inputSchema: { type: "object", properties: { user_id: { type: "string" }, conversation_id: { type: "string" } }, required: ["user_id"] },
  },
];

// Tool handlers
const toolHandlers: Record<string, (params: Record<string, unknown>) => Promise<{ content: { type: string; text: string }[] }>> = {
  async get_member_profile(params) {
    const [profile, dna, credits] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", params.user_id).single(),
      supabase.from("travel_dna_profile").select("*").eq("user_id", params.user_id).single(),
      supabase.from("user_credits").select("*").eq("user_id", params.user_id).single(),
    ]);
    return { content: [{ type: "text", text: JSON.stringify({ ...profile.data, travel_dna: dna.data, credits: credits.data }, null, 2) }] };
  },

  async create_service_request(params) {
    const { data, error } = await supabase.from("service_requests").insert({
      user_id: params.user_id, category: params.category, title: params.title, description: params.description,
      budget_min: params.budget_min, budget_max: params.budget_max, preferred_date: params.preferred_date,
      location: params.location, priority: params.priority || "standard", status: "pending",
    }).select().single();
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `Service request created. ID: ${data.id}` }] };
  },

  async get_service_requests(params) {
    let query = supabase.from("service_requests").select("*").order("created_at", { ascending: false });
    if (params.user_id) query = query.eq("user_id", params.user_id);
    if (params.status) query = query.eq("status", params.status);
    if (params.category) query = query.eq("category", params.category);
    const { data, error } = await query.limit((params.limit as number) || 20);
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },

  async update_service_status(params) {
    const { error } = await supabase.from("service_requests").update({ status: params.status, updated_at: new Date().toISOString() }).eq("id", params.request_id);
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    if (params.notes) await supabase.from("service_request_updates").insert({ service_request_id: params.request_id, update_type: "status_change", message: params.notes, new_status: params.status });
    return { content: [{ type: "text", text: `Request ${params.request_id} updated to ${params.status}` }] };
  },

  async find_partners(params) {
    let query = supabase.from("partners").select("*").eq("status", "approved").order("rating", { ascending: false });
    if (params.category) query = query.contains("categories", [params.category]);
    if (params.region) query = query.contains("regions_served", [params.region]);
    if (params.min_rating) query = query.gte("rating", params.min_rating);
    const { data, error } = await query.limit(10);
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },

  async get_partner_bids(params) {
    const { data, error } = await supabase.from("service_request_bids").select("*, partners(company_name, rating)").eq("service_request_id", params.request_id).order("amount", { ascending: true });
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },

  async get_credit_balance(params) {
    const [credits, profile] = await Promise.all([
      supabase.from("user_credits").select("*").eq("user_id", params.user_id).single(),
      supabase.from("profiles").select("membership_tier").eq("id", params.user_id).single(),
    ]);
    const tier = profile.data?.membership_tier || "signature";
    const benefits = { signature: { credits: 10, response: "24h" }, prestige: { credits: 50, response: "4h" }, black_card: { credits: "unlimited", response: "15min" } };
    return { content: [{ type: "text", text: JSON.stringify({ balance: credits.data?.balance || 0, tier, benefits: benefits[tier as keyof typeof benefits] }, null, 2) }] };
  },

  async deduct_credits(params) {
    const { data: credits } = await supabase.from("user_credits").select("*").eq("user_id", params.user_id).single();
    if (!credits?.is_unlimited && (credits?.balance || 0) < (params.amount as number)) {
      return { content: [{ type: "text", text: "Insufficient credits" }] };
    }
    if (!credits?.is_unlimited) {
      await supabase.from("user_credits").update({ balance: credits.balance - (params.amount as number) }).eq("user_id", params.user_id);
    }
    await supabase.from("credit_transactions").insert({ user_id: params.user_id, amount: -(params.amount as number), type: "deduction", description: params.reason, service_request_id: params.service_request_id });
    return { content: [{ type: "text", text: `${params.amount} credits deducted. Reason: ${params.reason}` }] };
  },

  async create_calendar_event(params) {
    const { data, error } = await supabase.from("calendar_events").insert({ user_id: params.user_id, title: params.title, start_date: params.start_date, end_date: params.end_date, location: params.location, event_type: params.event_type || "other" }).select().single();
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: `Event created: ${data.id}` }] };
  },

  async get_upcoming_events(params) {
    const fromDate = new Date().toISOString();
    const toDate = new Date(Date.now() + ((params.days_ahead as number) || 30) * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase.from("calendar_events").select("*").eq("user_id", params.user_id).gte("start_date", fromDate).lte("start_date", toDate).order("start_date", { ascending: true });
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },

  async send_notification(params) {
    const { error } = await supabase.from("notifications").insert({ user_id: params.user_id, title: params.title, message: params.message, type: params.type || "info", is_read: false });
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: "Notification sent" }] };
  },

  async get_member_history(params) {
    const [requests, events, conversations] = await Promise.all([
      supabase.from("service_requests").select("category, status, budget_max, location, created_at").eq("user_id", params.user_id).eq("status", "completed").order("created_at", { ascending: false }).limit(20),
      supabase.from("calendar_events").select("event_type, location, start_date").eq("user_id", params.user_id).order("start_date", { ascending: false }).limit(20),
      supabase.from("conversations").select("title, channel, created_at").eq("user_id", params.user_id).order("created_at", { ascending: false }).limit(10),
    ]);
    const categoryPrefs: Record<string, number> = {};
    (requests.data || []).forEach((r: { category: string }) => { categoryPrefs[r.category] = (categoryPrefs[r.category] || 0) + 1; });
    return { content: [{ type: "text", text: JSON.stringify({ requests: requests.data, events: events.data, conversations: conversations.data, category_preferences: categoryPrefs }, null, 2) }] };
  },

  async suggest_experiences(params) {
    const { data: travelDna } = await supabase.from("travel_dna_profile").select("*").eq("user_id", params.user_id).single();
    const suggestions: { type: string; title: string; reason: string }[] = [];
    if (travelDna?.preferred_destinations?.length > 0) {
      suggestions.push({ type: "travel", title: `Curated journey to ${travelDna.preferred_destinations[0]}`, reason: "Based on your travel preferences" });
    }
    if (travelDna?.interests?.includes("wellness")) {
      suggestions.push({ type: "wellness", title: "Private wellness retreat", reason: "Aligned with your wellness interests" });
    }
    if (travelDna?.interests?.includes("gastronomy")) {
      suggestions.push({ type: "dining", title: "Exclusive chef's table experience", reason: "Tailored to your culinary interests" });
    }
    const month = new Date().getMonth();
    if (month >= 5 && month <= 8) suggestions.push({ type: "yacht", title: "Mediterranean yacht charter", reason: "Perfect season" });
    else if (month >= 11 || month <= 2) suggestions.push({ type: "travel", title: "Private ski chalet in the Alps", reason: "Peak ski season" });
    return { content: [{ type: "text", text: JSON.stringify({ suggestions }, null, 2) }] };
  },

  async get_platform_metrics(params) {
    const fromDate = (params.date_from as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = (params.date_to as string) || new Date().toISOString();
    const [requests, members, partners] = await Promise.all([
      supabase.from("service_requests").select("status, category").gte("created_at", fromDate).lte("created_at", toDate),
      supabase.from("profiles").select("id"),
      supabase.from("partners").select("id, rating").eq("status", "approved"),
    ]);
    const statusCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    (requests.data || []).forEach((r: { status: string; category: string }) => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });
    return { content: [{ type: "text", text: JSON.stringify({ period: { from: fromDate, to: toDate }, requests: { total: requests.data?.length || 0, by_status: statusCounts, by_category: categoryCounts }, members: members.data?.length || 0, partners: partners.data?.length || 0 }, null, 2) }] };
  },

  async get_conversation_context(params) {
    let query = supabase.from("conversations").select("*, conversation_messages(*)").eq("user_id", params.user_id).order("created_at", { ascending: false });
    if (params.conversation_id) query = query.eq("id", params.conversation_id);
    const { data, error } = await query.limit(5);
    if (error) return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  },
};

// MCP JSON-RPC handler
async function handleMCPRequest(request: { jsonrpc?: string; id?: string | number; method: string; params?: Record<string, unknown> }) {
  const { method, params = {}, id } = request;

  // Handle MCP protocol methods
  switch (method) {
    case "initialize":
      return { jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: SERVER_INFO } };

    case "tools/list":
      return { jsonrpc: "2.0", id, result: { tools: TOOLS } };

    case "tools/call": {
      const toolName = params.name as string;
      const toolParams = (params.arguments || {}) as Record<string, unknown>;
      const handler = toolHandlers[toolName];
      if (!handler) {
        return { jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown tool: ${toolName}` } };
      }
      try {
        const result = await handler(toolParams);
        return { jsonrpc: "2.0", id, result };
      } catch (error) {
        return { jsonrpc: "2.0", id, error: { code: -32000, message: error instanceof Error ? error.message : "Tool execution failed" } };
      }
    }

    case "notifications/initialized":
      return null; // No response for notifications

    default:
      return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("MCP Request:", JSON.stringify(body));

    const response = await handleMCPRequest(body);
    
    if (response === null) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    console.log("MCP Response:", JSON.stringify(response));
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("MCP Error:", error);
    return new Response(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" } }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
