import { Hono } from "hono";
import { McpServer } from "mcp-lite";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const app = new Hono();

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const mcpServer = new McpServer({ name: "aurelia-concierge-mcp", version: "1.0.0" });

// Member profile
mcpServer.tool("get_member_profile", {
  description: "Retrieve a member's complete profile including tier and travel DNA",
  inputSchema: { type: "object" as const, properties: { user_id: { type: "string" } }, required: ["user_id"] },
  handler: async (params: { user_id: string }) => {
    const [profile, dna, credits] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", params.user_id).single(),
      supabase.from("travel_dna_profile").select("*").eq("user_id", params.user_id).single(),
      supabase.from("user_credits").select("*").eq("user_id", params.user_id).single(),
    ]);
    return { content: [{ type: "text" as const, text: JSON.stringify({ ...profile.data, travel_dna: dna.data, credits: credits.data }, null, 2) }] };
  },
});

// Service requests
mcpServer.tool("create_service_request", {
  description: "Create a luxury service request",
  inputSchema: {
    type: "object" as const,
    properties: {
      user_id: { type: "string" }, category: { type: "string" }, title: { type: "string" },
      description: { type: "string" }, budget_min: { type: "number" }, budget_max: { type: "number" },
      preferred_date: { type: "string" }, location: { type: "string" }, priority: { type: "string" },
    },
    required: ["user_id", "category", "title", "description"],
  },
  handler: async (params: Record<string, unknown>) => {
    const { data, error } = await supabase.from("service_requests").insert({
      user_id: params.user_id, category: params.category, title: params.title, description: params.description,
      budget_min: params.budget_min, budget_max: params.budget_max, preferred_date: params.preferred_date,
      location: params.location, priority: params.priority || "standard", status: "pending",
    }).select().single();
    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: `Service request created. ID: ${data.id}` }] };
  },
});

mcpServer.tool("get_service_requests", {
  description: "Retrieve service requests with filters",
  inputSchema: { type: "object" as const, properties: { user_id: { type: "string" }, status: { type: "string" }, category: { type: "string" }, limit: { type: "number" } } },
  handler: async (params: Record<string, unknown>) => {
    let query = supabase.from("service_requests").select("*").order("created_at", { ascending: false });
    if (params.user_id) query = query.eq("user_id", params.user_id);
    if (params.status) query = query.eq("status", params.status);
    if (params.category) query = query.eq("category", params.category);
    const { data, error } = await query.limit((params.limit as number) || 20);
    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  },
});

mcpServer.tool("update_service_status", {
  description: "Update service request status",
  inputSchema: { type: "object" as const, properties: { request_id: { type: "string" }, status: { type: "string" }, notes: { type: "string" } }, required: ["request_id", "status"] },
  handler: async (params: Record<string, unknown>) => {
    const { error } = await supabase.from("service_requests").update({ status: params.status, updated_at: new Date().toISOString() }).eq("id", params.request_id);
    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    if (params.notes) await supabase.from("service_request_updates").insert({ service_request_id: params.request_id, update_type: "status_change", message: params.notes, new_status: params.status });
    return { content: [{ type: "text" as const, text: `Request ${params.request_id} updated to ${params.status}` }] };
  },
});

// Partners
mcpServer.tool("find_partners", {
  description: "Search approved partners by category/region",
  inputSchema: { type: "object" as const, properties: { category: { type: "string" }, region: { type: "string" }, min_rating: { type: "number" } } },
  handler: async (params: Record<string, unknown>) => {
    let query = supabase.from("partners").select("*").eq("status", "approved").order("rating", { ascending: false });
    if (params.category) query = query.contains("categories", [params.category]);
    if (params.region) query = query.contains("regions_served", [params.region]);
    if (params.min_rating) query = query.gte("rating", params.min_rating);
    const { data, error } = await query.limit(10);
    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  },
});

// Credits
mcpServer.tool("get_credit_balance", {
  description: "Check member's credit balance and tier",
  inputSchema: { type: "object" as const, properties: { user_id: { type: "string" } }, required: ["user_id"] },
  handler: async (params: { user_id: string }) => {
    const [credits, profile] = await Promise.all([
      supabase.from("user_credits").select("*").eq("user_id", params.user_id).single(),
      supabase.from("profiles").select("membership_tier").eq("id", params.user_id).single(),
    ]);
    const tier = profile.data?.membership_tier || "signature";
    const benefits = { signature: { credits: 10, response: "24h" }, prestige: { credits: 50, response: "4h" }, black_card: { credits: "unlimited", response: "15min" } };
    return { content: [{ type: "text" as const, text: JSON.stringify({ balance: credits.data?.balance || 0, tier, benefits: benefits[tier as keyof typeof benefits] }, null, 2) }] };
  },
});

// Calendar
mcpServer.tool("create_calendar_event", {
  description: "Create a calendar event for a member",
  inputSchema: { type: "object" as const, properties: { user_id: { type: "string" }, title: { type: "string" }, start_date: { type: "string" }, end_date: { type: "string" }, location: { type: "string" }, event_type: { type: "string" } }, required: ["user_id", "title", "start_date"] },
  handler: async (params: Record<string, unknown>) => {
    const { data, error } = await supabase.from("calendar_events").insert({ user_id: params.user_id, title: params.title, start_date: params.start_date, end_date: params.end_date, location: params.location, event_type: params.event_type || "other" }).select().single();
    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: `Event created: ${data.id}` }] };
  },
});

// Notifications
mcpServer.tool("send_notification", {
  description: "Send a notification to a member",
  inputSchema: { type: "object" as const, properties: { user_id: { type: "string" }, title: { type: "string" }, message: { type: "string" }, type: { type: "string" } }, required: ["user_id", "title", "message"] },
  handler: async (params: Record<string, unknown>) => {
    const { error } = await supabase.from("notifications").insert({ user_id: params.user_id, title: params.title, message: params.message, type: params.type || "info", is_read: false });
    if (error) return { content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    return { content: [{ type: "text" as const, text: `Notification sent` }] };
  },
});

// Analytics
mcpServer.tool("get_platform_metrics", {
  description: "Get platform-wide metrics",
  inputSchema: { type: "object" as const, properties: { date_from: { type: "string" }, date_to: { type: "string" } } },
  handler: async (params: Record<string, unknown>) => {
    const fromDate = (params.date_from as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = (params.date_to as string) || new Date().toISOString();
    const [requests, members, partners] = await Promise.all([
      supabase.from("service_requests").select("status, category").gte("created_at", fromDate).lte("created_at", toDate),
      supabase.from("profiles").select("id"),
      supabase.from("partners").select("id, rating").eq("status", "approved"),
    ]);
    return { content: [{ type: "text" as const, text: JSON.stringify({ requests: requests.data?.length || 0, members: members.data?.length || 0, partners: partners.data?.length || 0 }, null, 2) }] };
  },
});

app.all("/*", async (c) => {
  const body = await c.req.text();
  const response = await mcpServer.handleRequest(JSON.parse(body || "{}"));
  return new Response(JSON.stringify(response), { headers: { "Content-Type": "application/json" } });
});

Deno.serve(app.fetch);
