import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface HealthEvent {
  id: string;
  event_type: 'self_heal' | 'manual_fix' | 'outage' | 'recovery' | 'alert';
  component: string;
  status: 'success' | 'failure' | 'pending';
  details: Record<string, unknown>;
  duration_ms: number | null;
  created_at: string;
}

interface PublicationHealthLog {
  id: string;
  domain: string;
  overall_status: 'healthy' | 'warning' | 'critical' | 'unknown';
  checks: unknown[];
  recommendations: string[];
  triggered_by: string;
  created_at: string;
}

interface HealthMetrics {
  uptimePercent: number;
  totalEvents: number;
  successfulHeals: number;
  failedHeals: number;
  averageHealTime: number; // in ms
  mttr: number; // Mean Time To Recovery in ms
  lastIncident: Date | null;
  componentBreakdown: Record<string, {
    events: number;
    successRate: number;
  }>;
}

type TimeRange = '24h' | '7d' | '30d';

export const useHealthHistory = () => {
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [publicationLogs, setPublicationLogs] = useState<PublicationHealthLog[]>([]);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  const getTimeRangeStart = (range: TimeRange): Date => {
    const now = new Date();
    switch (range) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  const calculateMetrics = useCallback((events: HealthEvent[]): HealthMetrics => {
    const totalEvents = events.length;
    const successfulHeals = events.filter(e => e.event_type === 'self_heal' && e.status === 'success').length;
    const failedHeals = events.filter(e => e.event_type === 'self_heal' && e.status === 'failure').length;
    
    // Calculate average heal time
    const healEvents = events.filter(e => e.event_type === 'self_heal' && e.duration_ms);
    const averageHealTime = healEvents.length > 0
      ? healEvents.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / healEvents.length
      : 0;

    // Calculate MTTR (time between outage and recovery)
    const outages = events.filter(e => e.event_type === 'outage');
    const recoveries = events.filter(e => e.event_type === 'recovery');
    let mttr = 0;
    
    if (outages.length > 0 && recoveries.length > 0) {
      // Simple MTTR: average time between outages and following recoveries
      let totalRecoveryTime = 0;
      let recoveryCount = 0;
      
      outages.forEach(outage => {
        const recovery = recoveries.find(r => 
          new Date(r.created_at) > new Date(outage.created_at) &&
          r.component === outage.component
        );
        if (recovery) {
          totalRecoveryTime += new Date(recovery.created_at).getTime() - new Date(outage.created_at).getTime();
          recoveryCount++;
        }
      });
      
      mttr = recoveryCount > 0 ? totalRecoveryTime / recoveryCount : 0;
    }

    // Calculate uptime (based on outage events)
    const timeRangeMs = getTimeRangeStart(timeRange).getTime();
    const now = Date.now();
    const totalTime = now - timeRangeMs;
    
    let downtimeMs = 0;
    outages.forEach(outage => {
      const outageStart = new Date(outage.created_at).getTime();
      const recovery = recoveries.find(r => 
        new Date(r.created_at) > new Date(outage.created_at) &&
        r.component === outage.component
      );
      const outageEnd = recovery ? new Date(recovery.created_at).getTime() : now;
      downtimeMs += outageEnd - outageStart;
    });
    
    const uptimePercent = totalTime > 0 ? ((totalTime - downtimeMs) / totalTime) * 100 : 100;

    // Component breakdown
    const componentBreakdown: Record<string, { events: number; successRate: number }> = {};
    const components = [...new Set(events.map(e => e.component))];
    
    components.forEach(component => {
      const componentEvents = events.filter(e => e.component === component);
      const successEvents = componentEvents.filter(e => e.status === 'success').length;
      componentBreakdown[component] = {
        events: componentEvents.length,
        successRate: componentEvents.length > 0 ? (successEvents / componentEvents.length) * 100 : 100,
      };
    });

    // Last incident
    const incidents = events.filter(e => e.event_type === 'outage' || e.status === 'failure');
    const lastIncident = incidents.length > 0 
      ? new Date(incidents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at)
      : null;

    return {
      uptimePercent: Math.min(100, Math.max(0, uptimePercent)),
      totalEvents,
      successfulHeals,
      failedHeals,
      averageHealTime,
      mttr,
      lastIncident,
      componentBreakdown,
    };
  }, [timeRange]);

  const fetchHealthData = useCallback(async () => {
    setIsLoading(true);
    const rangeStart = getTimeRangeStart(timeRange).toISOString();

    try {
      // Fetch health events
      const { data: eventsData, error: eventsError } = await supabase
        .from('health_events')
        .select('*')
        .gte('created_at', rangeStart)
        .order('created_at', { ascending: false })
        .limit(500);

      if (eventsError) {
        logger.error('Error fetching health events', eventsError);
      } else {
        setHealthEvents(eventsData as HealthEvent[] || []);
        setMetrics(calculateMetrics(eventsData as HealthEvent[] || []));
      }

      // Fetch publication health logs
      const { data: logsData, error: logsError } = await supabase
        .from('publication_health_logs')
        .select('*')
        .gte('created_at', rangeStart)
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) {
        logger.error('Error fetching publication health logs', logsError);
      } else {
        setPublicationLogs(logsData as PublicationHealthLog[] || []);
      }
    } catch (err) {
      logger.error('Error fetching health history', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, calculateMetrics]);

  // Initial fetch and when time range changes
  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Group events by hour for chart data
  const getHourlyData = useCallback(() => {
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const hourMs = 60 * 60 * 1000;
    const now = Date.now();
    const data: Array<{ hour: string; healthy: number; issues: number }> = [];

    for (let i = hours - 1; i >= 0; i--) {
      const hourStart = now - (i + 1) * hourMs;
      const hourEnd = now - i * hourMs;
      
      const hourEvents = healthEvents.filter(e => {
        const eventTime = new Date(e.created_at).getTime();
        return eventTime >= hourStart && eventTime < hourEnd;
      });

      const issues = hourEvents.filter(e => e.status === 'failure' || e.event_type === 'outage').length;
      const healthy = hourEvents.length - issues;

      data.push({
        hour: new Date(hourStart).toISOString(),
        healthy,
        issues,
      });
    }

    return data;
  }, [healthEvents, timeRange]);

  // Get recent events for timeline
  const getRecentEvents = useCallback((limit = 10): HealthEvent[] => {
    return healthEvents.slice(0, limit);
  }, [healthEvents]);

  // Get infrastructure status summary from latest publication log
  const getLatestInfrastructureStatus = useCallback(() => {
    if (publicationLogs.length === 0) return null;
    
    const latest = publicationLogs[0];
    return {
      status: latest.overall_status,
      domain: latest.domain,
      timestamp: new Date(latest.created_at),
      recommendations: latest.recommendations,
    };
  }, [publicationLogs]);

  return {
    healthEvents,
    publicationLogs,
    metrics,
    isLoading,
    timeRange,
    setTimeRange,
    refresh: fetchHealthData,
    getHourlyData,
    getRecentEvents,
    getLatestInfrastructureStatus,
  };
};
