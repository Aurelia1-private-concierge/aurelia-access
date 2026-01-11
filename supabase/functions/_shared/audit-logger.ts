/**
 * Audit logging utility for tracking sensitive operations
 * Logs are immutable and only viewable by admins
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type AuditAction = 
  | 'user.login'
  | 'user.logout'
  | 'user.password_reset'
  | 'user.profile_update'
  | 'user.role_granted'
  | 'user.role_revoked'
  | 'partner.application_submitted'
  | 'partner.application_approved'
  | 'partner.application_rejected'
  | 'partner.service_created'
  | 'partner.service_updated'
  | 'service_request.created'
  | 'service_request.assigned'
  | 'service_request.status_changed'
  | 'payment.credits_purchased'
  | 'payment.credits_used'
  | 'admin.user_viewed'
  | 'admin.data_exported'
  | 'admin.settings_changed'
  | 'security.rate_limit_exceeded'
  | 'security.unauthorized_access'
  | 'security.suspicious_activity';

export type ResourceType = 
  | 'user'
  | 'profile'
  | 'partner'
  | 'partner_service'
  | 'service_request'
  | 'credit_transaction'
  | 'notification'
  | 'settings'
  | 'system';

interface AuditLogEntry {
  user_id?: string;
  action: AuditAction;
  resource_type: ResourceType;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Log an audit event to the database
 * Uses service role client to bypass RLS
 */
export async function logAuditEvent(
  supabaseAdmin: SupabaseClient,
  entry: AuditLogEntry
): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: entry.user_id || null,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id || null,
        details: entry.details || null,
        ip_address: entry.ip_address || null,
        user_agent: entry.user_agent || null,
      });

    if (error) {
      // Log to console but don't throw - audit logging should never break main flow
      console.error('[Audit] Failed to log event:', error.message);
    }
  } catch (err) {
    console.error('[Audit] Error logging event:', err);
  }
}

/**
 * Extract client info from request headers
 */
export function extractClientInfo(req: Request): { ip_address?: string; user_agent?: string } {
  return {
    ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                req.headers.get('x-real-ip') || 
                undefined,
    user_agent: req.headers.get('user-agent') || undefined,
  };
}

/**
 * Create a logging helper bound to a specific request context
 */
export function createAuditLogger(supabaseAdmin: SupabaseClient, req: Request) {
  const clientInfo = extractClientInfo(req);
  
  return {
    log: async (entry: Omit<AuditLogEntry, 'ip_address' | 'user_agent'>) => {
      await logAuditEvent(supabaseAdmin, {
        ...entry,
        ...clientInfo,
      });
    },
    
    // Convenience methods for common actions
    logLogin: async (userId: string) => {
      await logAuditEvent(supabaseAdmin, {
        user_id: userId,
        action: 'user.login',
        resource_type: 'user',
        resource_id: userId,
        ...clientInfo,
      });
    },
    
    logServiceRequest: async (userId: string, requestId: string, action: 'created' | 'assigned' | 'status_changed', details?: Record<string, unknown>) => {
      await logAuditEvent(supabaseAdmin, {
        user_id: userId,
        action: `service_request.${action}` as AuditAction,
        resource_type: 'service_request',
        resource_id: requestId,
        details,
        ...clientInfo,
      });
    },
    
    logSecurityEvent: async (action: 'rate_limit_exceeded' | 'unauthorized_access' | 'suspicious_activity', details: Record<string, unknown>, userId?: string) => {
      await logAuditEvent(supabaseAdmin, {
        user_id: userId,
        action: `security.${action}` as AuditAction,
        resource_type: 'system',
        details,
        ...clientInfo,
      });
    },
  };
}
