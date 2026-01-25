/**
 * Prismatic Secure API Gateway
 * 
 * Architecture: [Prismatic Connector] → [This Gateway] → [Sensitive Logic + Data Stores]
 * 
 * This edge function serves as the secure entry point for all Prismatic integrations.
 * It handles authentication, authorization, rate limiting, and routing to internal services.
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  authenticatePrismaticRequest,
  hasScope,
  checkRateLimit,
  logApiCall,
  extractClientInfo,
  PrismaticIntegration,
} from "../_shared/prismatic-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-prismatic-ref",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// deno-lint-ignore no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

// Endpoint definitions with required scopes
const ENDPOINTS: Record<string, { scope: string; handler: EndpointHandler }> = {
  // Member operations
  'GET /members': { scope: 'members:read', handler: handleGetMembers },
  'GET /members/:id': { scope: 'members:read', handler: handleGetMember },
  
  // Service request operations
  'GET /requests': { scope: 'requests:read', handler: handleGetRequests },
  'POST /requests': { scope: 'requests:write', handler: handleCreateRequest },
  'PUT /requests/:id': { scope: 'requests:write', handler: handleUpdateRequest },
  
  // Partner operations
  'GET /partners': { scope: 'partners:read', handler: handleGetPartners },
  'GET /partners/availability': { scope: 'partners:read', handler: handleGetPartnerAvailability },
  
  // Analytics & metrics
  'GET /metrics': { scope: 'analytics:read', handler: handleGetMetrics },
  
  // Calendar & events
  'GET /events': { scope: 'events:read', handler: handleGetEvents },
  'POST /events': { scope: 'events:write', handler: handleCreateEvent },
  
  // Notifications
  'POST /notifications': { scope: 'notifications:write', handler: handleSendNotification },
};

type EndpointHandler = (
  supabase: AnySupabaseClient,
  integration: PrismaticIntegration,
  req: Request,
  pathParams: Record<string, string>
) => Promise<Response>;

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const url = new URL(req.url);
  const clientInfo = extractClientInfo(req);
  
  // Extract path after /prismatic-gateway
  const pathMatch = url.pathname.match(/\/prismatic-gateway(\/.*)?/);
  const path = pathMatch?.[1] || '/';
  
  let integration: PrismaticIntegration | undefined;
  let responseStatus = 500;
  let errorMessage: string | undefined;
  
  try {
    // 1. Authenticate the request
    const authResult = await authenticatePrismaticRequest(supabase, req);
    
    if (!authResult.success) {
      responseStatus = 401;
      errorMessage = authResult.error;
      
      await logApiCall(supabase, {
        endpoint: path,
        method: req.method,
        responseStatus,
        responseTimeMs: Date.now() - startTime,
        ...clientInfo,
        errorMessage,
      });
      
      return new Response(
        JSON.stringify({ 
          error: authResult.error, 
          code: authResult.errorCode 
        }),
        { 
          status: 401, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    integration = authResult.integration!;
    
    // 2. Check rate limit
    const rateLimit = await checkRateLimit(
      supabase, 
      integration.id, 
      integration.rate_limit_per_minute
    );
    
    if (!rateLimit.allowed) {
      responseStatus = 429;
      errorMessage = 'Rate limit exceeded';
      
      await logApiCall(supabase, {
        integrationId: integration.id,
        endpoint: path,
        method: req.method,
        responseStatus,
        responseTimeMs: Date.now() - startTime,
        ...clientInfo,
        errorMessage,
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: 60,
        }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": "60",
            "X-RateLimit-Remaining": "0",
            ...corsHeaders 
          } 
        }
      );
    }
    
    // 3. Route to appropriate handler
    const { handler, scope, params } = matchEndpoint(req.method, path);
    
    if (!handler) {
      responseStatus = 404;
      errorMessage = 'Endpoint not found';
      
      await logApiCall(supabase, {
        integrationId: integration.id,
        endpoint: path,
        method: req.method,
        responseStatus,
        responseTimeMs: Date.now() - startTime,
        ...clientInfo,
        errorMessage,
      });
      
      return new Response(
        JSON.stringify({ error: 'Endpoint not found', code: 'NOT_FOUND' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // 4. Check scope authorization
    if (!hasScope(integration, scope)) {
      responseStatus = 403;
      errorMessage = `Missing required scope: ${scope}`;
      
      await logApiCall(supabase, {
        integrationId: integration.id,
        endpoint: path,
        method: req.method,
        responseStatus,
        responseTimeMs: Date.now() - startTime,
        ...clientInfo,
        errorMessage,
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient permissions', 
          code: 'FORBIDDEN',
          requiredScope: scope,
        }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // 5. Execute handler
    const response = await handler(supabase, integration, req, params);
    responseStatus = response.status;
    
    // Log successful call
    let requestPayload: Record<string, unknown> | undefined;
    if (req.method !== 'GET') {
      try {
        requestPayload = await req.clone().json();
      } catch {
        // No JSON body
      }
    }
    
    await logApiCall(supabase, {
      integrationId: integration.id,
      endpoint: path,
      method: req.method,
      requestPayload,
      responseStatus,
      responseTimeMs: Date.now() - startTime,
      ...clientInfo,
    });
    
    // Add rate limit headers to response
    const headers = new Headers(response.headers);
    headers.set('X-RateLimit-Remaining', String(rateLimit.remaining - 1));
    headers.set('X-RateLimit-Limit', String(integration.rate_limit_per_minute));
    
    for (const [key, value] of Object.entries(corsHeaders)) {
      headers.set(key, value);
    }
    
    return new Response(response.body, {
      status: response.status,
      headers,
    });
    
  } catch (error) {
    console.error('[Prismatic Gateway] Error:', error);
    responseStatus = 500;
    errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    await logApiCall(supabase, {
      integrationId: integration?.id,
      endpoint: path,
      method: req.method,
      responseStatus,
      responseTimeMs: Date.now() - startTime,
      ...clientInfo,
      errorMessage,
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        code: 'INTERNAL_ERROR' 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

/**
 * Match request to endpoint handler
 */
function matchEndpoint(method: string, path: string): { 
  handler?: EndpointHandler; 
  scope: string; 
  params: Record<string, string>;
} {
  const params: Record<string, string> = {};
  
  for (const [pattern, config] of Object.entries(ENDPOINTS)) {
    const [patternMethod, patternPath] = pattern.split(' ');
    
    if (patternMethod !== method) continue;
    
    // Convert pattern to regex
    const pathRegex = new RegExp(
      '^' + patternPath.replace(/:(\w+)/g, (_, name) => `(?<${name}>[^/]+)`) + '$'
    );
    
    const match = path.match(pathRegex);
    
    if (match) {
      if (match.groups) {
        Object.assign(params, match.groups);
      }
      return { handler: config.handler, scope: config.scope, params };
    }
  }
  
  return { scope: '', params };
}

// ==================== Endpoint Handlers ====================

async function handleGetMembers(
  supabase: AnySupabaseClient,
  integration: PrismaticIntegration,
  req: Request
): Promise<Response> {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const tier = url.searchParams.get('tier');
  
  let query = supabase
    .from('profiles')
    .select('id, display_name, membership_tier, credit_balance, created_at', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });
  
  if (tier) {
    query = query.eq('membership_tier', tier);
  }
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ 
      members: data, 
      total: count,
      limit,
      offset,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

async function handleGetMember(
  supabase: AnySupabaseClient,
  integration: PrismaticIntegration,
  req: Request,
  params: Record<string, string>
): Promise<Response> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, membership_tier, credit_balance, created_at, preferences')
    .eq('id', params.id)
    .maybeSingle();
  
  if (error) throw error;
  
  if (!data) {
    return new Response(
      JSON.stringify({ error: 'Member not found', code: 'NOT_FOUND' }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
  
  return new Response(
    JSON.stringify({ member: data }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

async function handleGetRequests(
  supabase: AnySupabaseClient,
  integration: PrismaticIntegration,
  req: Request
): Promise<Response> {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const status = url.searchParams.get('status');
  const category = url.searchParams.get('category');
  
  let query = supabase
    .from('service_requests')
    .select('id, title, category, status, priority, created_at, client_id', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });
  
  if (status) query = query.eq('status', status);
  if (category) query = query.eq('category', category);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ requests: data, total: count, limit, offset }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

async function handleCreateRequest(
  supabase: AnySupabaseClient,
  integration: PrismaticIntegration,
  req: Request
): Promise<Response> {
  const body = await req.json();
  
  // Validate required fields
  if (!body.title || !body.category || !body.client_id) {
    return new Response(
      JSON.stringify({ 
        error: 'Missing required fields: title, category, client_id', 
        code: 'VALIDATION_ERROR' 
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  
  const { data, error } = await supabase
    .from('service_requests')
    .insert({
      title: body.title,
      description: body.description || '',
      category: body.category,
      client_id: body.client_id,
      priority: body.priority || 'normal',
      status: 'pending',
      metadata: { source: 'prismatic', integration: integration.name },
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ request: data }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}

async function handleUpdateRequest(
  supabase: AnySupabaseClient,
  integration: PrismaticIntegration,
  req: Request,
  params: Record<string, string>
): Promise<Response> {
  const body = await req.json();
  
  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.priority) updateData.priority = body.priority;
  if (body.notes) updateData.notes = body.notes;
  
  const { data, error } = await supabase
    .from('service_requests')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ request: data }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

async function handleGetPartners(
  supabase: AnySupabaseClient,
  integration: PrismaticIntegration,
  req: Request
): Promise<Response> {
  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const status = url.searchParams.get('status') || 'approved';
  
  let query = supabase
    .from('partners')
    .select('id, company_name, categories, description, rating, status')
    .eq('status', status);
  
  if (category) {
    query = query.contains('categories', [category]);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ partners: data }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

async function handleGetPartnerAvailability(
  supabase: AnySupabaseClient,
  integration: PrismaticIntegration,
  req: Request
): Promise<Response> {
  const url = new URL(req.url);
  const partnerId = url.searchParams.get('partner_id');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  
  let query = supabase
    .from('hotel_availability')
    .select('*')
    .eq('availability_status', 'available');
  
  if (partnerId) query = query.eq('partner_id', partnerId);
  if (from) query = query.gte('available_from', from);
  if (to) query = query.lte('available_to', to);
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ availability: data }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

async function handleGetMetrics(
  supabase: AnySupabaseClient,
  integration: PrismaticIntegration,
  req: Request
): Promise<Response> {
  // Get various platform metrics
  const [
    { count: memberCount },
    { count: partnerCount },
    { count: requestCount },
    { count: pendingRequests },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('partners').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  
  return new Response(
    JSON.stringify({
      metrics: {
        totalMembers: memberCount || 0,
        totalPartners: partnerCount || 0,
        totalRequests: requestCount || 0,
        pendingRequests: pendingRequests || 0,
        timestamp: new Date().toISOString(),
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

async function handleGetEvents(
  supabase: AnySupabaseClient,
  integration: PrismaticIntegration,
  req: Request
): Promise<Response> {
  const url = new URL(req.url);
  const from = url.searchParams.get('from') || new Date().toISOString();
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  
  const { data, error } = await supabase
    .from('calendar_events')
    .select('id, title, start_date, end_date, event_type, location')
    .gte('start_date', from)
    .order('start_date', { ascending: true })
    .limit(limit);
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ events: data }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

async function handleCreateEvent(
  supabase: AnySupabaseClient,
  integration: PrismaticIntegration,
  req: Request
): Promise<Response> {
  const body = await req.json();
  
  if (!body.title || !body.start_date || !body.user_id) {
    return new Response(
      JSON.stringify({ 
        error: 'Missing required fields: title, start_date, user_id', 
        code: 'VALIDATION_ERROR' 
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  
  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      title: body.title,
      description: body.description || '',
      start_date: body.start_date,
      end_date: body.end_date || null,
      event_type: body.event_type || 'personal',
      location: body.location || null,
      user_id: body.user_id,
      metadata: { source: 'prismatic', integration: integration.name },
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ event: data }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}

async function handleSendNotification(
  supabase: AnySupabaseClient,
  integration: PrismaticIntegration,
  req: Request
): Promise<Response> {
  const body = await req.json();
  
  if (!body.user_id || !body.title || !body.message) {
    return new Response(
      JSON.stringify({ 
        error: 'Missing required fields: user_id, title, message', 
        code: 'VALIDATION_ERROR' 
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: body.user_id,
      title: body.title,
      message: body.message,
      type: body.type || 'info',
      metadata: { source: 'prismatic', integration: integration.name },
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return new Response(
    JSON.stringify({ notification: data, sent: true }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}
