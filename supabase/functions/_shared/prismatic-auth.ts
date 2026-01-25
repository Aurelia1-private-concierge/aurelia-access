/**
 * Prismatic Integration Authentication Utilities
 * Handles API key validation, rate limiting, and audit logging
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface PrismaticIntegration {
  id: string;
  name: string;
  integration_id: string;
  scopes: string[];
  rate_limit_per_minute: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

export interface AuthResult {
  success: boolean;
  integration?: PrismaticIntegration;
  error?: string;
  errorCode?: string;
}

/**
 * Hash an API key for secure storage/comparison
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Authenticate a Prismatic API request
 * Expects Authorization header: Bearer <api-key>
 */
export async function authenticatePrismaticRequest(
  supabase: SupabaseClient,
  req: Request
): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'Missing or invalid Authorization header',
      errorCode: 'AUTH_MISSING',
    };
  }
  
  const apiKey = authHeader.replace('Bearer ', '').trim();
  
  if (!apiKey || apiKey.length < 32) {
    return {
      success: false,
      error: 'Invalid API key format',
      errorCode: 'AUTH_INVALID_FORMAT',
    };
  }
  
  // Hash the provided key
  const keyHash = await hashApiKey(apiKey);
  
  // Look up integration by hashed key
  const { data: integration, error } = await supabase
    .from('prismatic_integrations')
    .select('id, name, integration_id, scopes, rate_limit_per_minute, is_active, metadata')
    .eq('api_key_hash', keyHash)
    .eq('is_active', true)
    .maybeSingle();
  
  if (error) {
    console.error('[Prismatic Auth] Database error:', error.message);
    return {
      success: false,
      error: 'Authentication service unavailable',
      errorCode: 'AUTH_SERVICE_ERROR',
    };
  }
  
  if (!integration) {
    return {
      success: false,
      error: 'Invalid or inactive API key',
      errorCode: 'AUTH_INVALID_KEY',
    };
  }
  
  // Update last_used_at
  await supabase
    .from('prismatic_integrations')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', integration.id);
  
  return {
    success: true,
    integration: integration as PrismaticIntegration,
  };
}

/**
 * Check if integration has required scope
 */
export function hasScope(integration: PrismaticIntegration, requiredScope: string): boolean {
  return integration.scopes.includes('*') || integration.scopes.includes(requiredScope);
}

/**
 * Check rate limit for an integration
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  integrationId: string,
  limit: number
): Promise<{ allowed: boolean; remaining: number }> {
  const { data, error } = await supabase.rpc('check_prismatic_rate_limit', {
    p_integration_id: integrationId,
    p_limit: limit,
  });
  
  if (error) {
    console.error('[Prismatic Auth] Rate limit check error:', error.message);
    // Default to allowing if check fails (fail-open for availability)
    return { allowed: true, remaining: limit };
  }
  
  // Get current count
  const { count } = await supabase
    .from('prismatic_api_logs')
    .select('*', { count: 'exact', head: true })
    .eq('integration_id', integrationId)
    .gte('created_at', new Date(Date.now() - 60000).toISOString());
  
  return {
    allowed: data === true,
    remaining: Math.max(0, limit - (count || 0)),
  };
}

/**
 * Log an API call
 */
export async function logApiCall(
  supabase: SupabaseClient,
  params: {
    integrationId?: string;
    endpoint: string;
    method: string;
    requestPayload?: Record<string, unknown>;
    responseStatus: number;
    responseTimeMs: number;
    ipAddress?: string;
    userAgent?: string;
    errorMessage?: string;
  }
): Promise<void> {
  try {
    // Sanitize request payload - remove any PII
    const sanitizedPayload = params.requestPayload 
      ? sanitizePayload(params.requestPayload)
      : null;
    
    await supabase.from('prismatic_api_logs').insert({
      integration_id: params.integrationId || null,
      endpoint: params.endpoint,
      method: params.method,
      request_payload: sanitizedPayload,
      response_status: params.responseStatus,
      response_time_ms: params.responseTimeMs,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      error_message: params.errorMessage || null,
    });
  } catch (err) {
    console.error('[Prismatic Auth] Failed to log API call:', err);
  }
}

/**
 * Sanitize payload to remove PII
 */
function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = [
    'email', 'phone', 'password', 'credit_card', 'ssn', 'passport',
    'address', 'dob', 'date_of_birth', 'api_key', 'secret', 'token',
    'full_name', 'first_name', 'last_name', 'name'
  ];
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(payload)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizePayload(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Extract client info from request
 */
export function extractClientInfo(req: Request): { ipAddress?: string; userAgent?: string } {
  return {
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') ||
               undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  };
}
