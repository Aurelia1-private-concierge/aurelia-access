import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface PublicationHealthLog {
  id: string;
  domain: string;
  overall_status: string;
  checks: Array<{
    id: string;
    name: string;
    status: 'pass' | 'warn' | 'fail';
    category: string;
    message: string;
  }>;
  recommendations: string[];
  triggered_by: string;
  created_at: string;
}

interface HealthEvent {
  id: string;
  event_type: string;
  component: string;
  status: string;
  details: Record<string, unknown>;
  duration_ms: number | null;
  user_id: string | null;
  created_at: string;
}

export const useInfrastructureAlerts = () => {
  const { addNotification, userId } = useNotifications();
  const { user } = useAuth();
  const lastAlertRef = useRef<string | null>(null);
  const isAdminRef = useRef(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) {
        isAdminRef.current = false;
        return;
      }

      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        isAdminRef.current = !!data;
      } catch (err) {
        logger.error('Error checking admin role', err);
        isAdminRef.current = false;
      }
    };

    checkAdmin();
  }, [user?.id]);

  // Handle new publication health log
  const handleNewHealthLog = useCallback((log: PublicationHealthLog) => {
    // Only alert admins
    if (!isAdminRef.current) return;

    // Prevent duplicate alerts for same issue
    const alertKey = `${log.overall_status}-${log.created_at}`;
    if (lastAlertRef.current === alertKey) return;
    lastAlertRef.current = alertKey;

    // Only alert on critical or warning status
    if (log.overall_status === 'critical') {
      const criticalChecks = log.checks.filter(c => c.status === 'fail');
      const failedComponents = criticalChecks.map(c => c.category).join(', ');

      addNotification({
        type: 'system',
        title: '🚨 Critical Infrastructure Issue',
        description: `${criticalChecks.length} check(s) failed: ${failedComponents}. Immediate attention required.`,
        actionUrl: '/admin?tab=publication',
      });

      logger.warn('Critical infrastructure alert', { log });
    } else if (log.overall_status === 'warning') {
      const warningChecks = log.checks.filter(c => c.status === 'warn');
      
      addNotification({
        type: 'system',
        title: '⚠️ Infrastructure Warning',
        description: `${warningChecks.length} warning(s) detected. Review in Publication dashboard.`,
        actionUrl: '/admin?tab=publication',
      });
    }
  }, [addNotification]);

  // Handle health events (self-healing activities)
  const handleHealthEvent = useCallback((event: HealthEvent) => {
    if (!isAdminRef.current) return;

    // Only notify on failures or outages
    if (event.event_type === 'outage' && event.status === 'failure') {
      addNotification({
        type: 'system',
        title: `⚡ ${event.component} Outage Detected`,
        description: `Auto-healing initiated. Check System Health for details.`,
        actionUrl: '/admin?tab=systemhealth',
      });
    }
  }, [addNotification]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('infrastructure-alerts')
      .on<PublicationHealthLog>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'publication_health_logs',
        },
        (payload: RealtimePostgresChangesPayload<PublicationHealthLog>) => {
          if (payload.new && 'id' in payload.new) {
            handleNewHealthLog(payload.new as PublicationHealthLog);
          }
        }
      )
      .on<HealthEvent>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_events',
        },
        (payload: RealtimePostgresChangesPayload<HealthEvent>) => {
          if (payload.new && 'id' in payload.new) {
            handleHealthEvent(payload.new as HealthEvent);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, handleNewHealthLog, handleHealthEvent]);

  // Log a health event
  const logHealthEvent = useCallback(async (
    eventType: 'self_heal' | 'manual_fix' | 'outage' | 'recovery' | 'alert',
    component: string,
    status: 'success' | 'failure' | 'pending',
    details?: Record<string, unknown>,
    durationMs?: number
  ) => {
    try {
      // Use type assertion to handle the strict typing
      const insertData = {
        event_type: eventType,
        component,
        status,
        details: (details || {}) as Record<string, unknown>,
        duration_ms: durationMs ?? null,
        user_id: user?.id || null,
      };

      const { error } = await supabase
        .from('health_events')
        .insert(insertData as never);

      if (error) {
        logger.error('Failed to log health event', error);
      }
    } catch (err) {
      logger.error('Error logging health event', err);
    }
  }, [user?.id]);

  return {
    logHealthEvent,
  };
};
