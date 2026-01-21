import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UptimeCheck {
  id: string;
  endpoint_name: string;
  endpoint_url: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  response_time_ms: number | null;
  status_code: number | null;
  error_message: string | null;
  checked_at: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string | null;
  severity: 'critical' | 'major' | 'minor';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  affected_services: string[] | null;
  started_at: string;
  resolved_at: string | null;
  created_at: string;
}

export interface PerformanceMetric {
  id: string;
  metric_type: string;
  metric_name: string;
  value_ms: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  error_stack: string | null;
  component: string | null;
  function_name: string | null;
  resolved: boolean;
  created_at: string;
}

export interface MonitoringStats {
  uptime_percentage: number;
  avg_response_time: number;
  total_errors_24h: number;
  active_incidents: number;
}

export function useMonitoring() {
  const { user } = useAuth();
  const [uptimeChecks, setUptimeChecks] = useState<UptimeCheck[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState<MonitoringStats>({
    uptime_percentage: 100,
    avg_response_time: 0,
    total_errors_24h: 0,
    active_incidents: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUptimeChecks = useCallback(async () => {
    const { data } = await supabase
      .from('uptime_checks' as any)
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(100);
    
    if (data) {
      const typedData = data as unknown as UptimeCheck[];
      setUptimeChecks(typedData);
      
      const healthyCount = typedData.filter(c => c.status === 'healthy').length;
      const uptimePercentage = typedData.length > 0 ? (healthyCount / typedData.length) * 100 : 100;
      
      const responseTimes = typedData.filter(c => c.response_time_ms).map(c => c.response_time_ms!);
      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;

      setStats(prev => ({
        ...prev,
        uptime_percentage: Math.round(uptimePercentage * 100) / 100,
        avg_response_time: Math.round(avgResponseTime),
      }));
    }
  }, []);

  const fetchIncidents = useCallback(async () => {
    const { data } = await supabase
      .from('incidents' as any)
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50);
    
    if (data) {
      const typedData = data as unknown as Incident[];
      setIncidents(typedData);
      const activeCount = typedData.filter(i => i.status !== 'resolved').length;
      setStats(prev => ({ ...prev, active_incidents: activeCount }));
    }
  }, []);

  const fetchPerformanceMetrics = useCallback(async () => {
    const { data } = await supabase
      .from('performance_metrics' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    
    if (data) setPerformanceMetrics(data as unknown as PerformanceMetric[]);
  }, []);

  const fetchErrorLogs = useCallback(async () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, count } = await supabase
      .from('error_logs' as any)
      .select('*', { count: 'exact' })
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (data) {
      setErrorLogs(data as unknown as ErrorLog[]);
      setStats(prev => ({ ...prev, total_errors_24h: count || 0 }));
    }
  }, []);

  const logPerformanceMetric = useCallback(async (
    metricType: string,
    metricName: string,
    valueMs: number,
    metadata?: Record<string, unknown>
  ) => {
    await (supabase.from('performance_metrics' as any) as any).insert({
      metric_type: metricType,
      metric_name: metricName,
      value_ms: valueMs,
      metadata,
      user_id: user?.id,
      session_id: sessionStorage.getItem('session_id'),
    });
  }, [user?.id]);

  const logError = useCallback(async (
    errorType: string,
    errorMessage: string,
    options?: {
      errorStack?: string;
      component?: string;
      functionName?: string;
      metadata?: Record<string, unknown>;
    }
  ) => {
    await (supabase.from('error_logs' as any) as any).insert({
      error_type: errorType,
      error_message: errorMessage,
      error_stack: options?.errorStack,
      component: options?.component,
      function_name: options?.functionName,
      metadata: options?.metadata,
      user_id: user?.id,
      session_id: sessionStorage.getItem('session_id'),
    });
  }, [user?.id]);

  const createIncident = useCallback(async (
    title: string,
    severity: 'critical' | 'major' | 'minor',
    options?: {
      description?: string;
      affectedServices?: string[];
    }
  ) => {
    const { data, error } = await (supabase.from('incidents' as any) as any).insert({
      title,
      severity,
      description: options?.description,
      affected_services: options?.affectedServices,
      created_by: user?.id,
    }).select().single();
    
    if (!error && data) {
      setIncidents(prev => [data as Incident, ...prev]);
    }
    return { data, error };
  }, [user?.id]);

  const resolveIncident = useCallback(async (incidentId: string) => {
    const { error } = await (supabase.from('incidents' as any) as any)
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', incidentId);
    
    if (!error) {
      setIncidents(prev => prev.map(i => 
        i.id === incidentId 
          ? { ...i, status: 'resolved' as const, resolved_at: new Date().toISOString() }
          : i
      ));
    }
    return { error };
  }, []);

  const resolveError = useCallback(async (errorId: string) => {
    const { error } = await (supabase.from('error_logs' as any) as any)
      .update({ resolved: true, resolved_at: new Date().toISOString(), resolved_by: user?.id })
      .eq('id', errorId);
    
    if (!error) {
      setErrorLogs(prev => prev.map(e => 
        e.id === errorId ? { ...e, resolved: true } : e
      ));
    }
    return { error };
  }, [user?.id]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUptimeChecks(),
        fetchIncidents(),
        fetchPerformanceMetrics(),
        fetchErrorLogs(),
      ]);
      setLoading(false);
    };
    
    loadData();

    const channel = supabase
      .channel('monitoring-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'uptime_checks' }, 
        () => fetchUptimeChecks())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, 
        () => fetchIncidents())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'error_logs' }, 
        () => fetchErrorLogs())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUptimeChecks, fetchIncidents, fetchPerformanceMetrics, fetchErrorLogs]);

  return {
    uptimeChecks,
    incidents,
    performanceMetrics,
    errorLogs,
    stats,
    loading,
    logPerformanceMetric,
    logError,
    createIncident,
    resolveIncident,
    resolveError,
    refresh: () => Promise.all([
      fetchUptimeChecks(),
      fetchIncidents(),
      fetchPerformanceMetrics(),
      fetchErrorLogs(),
    ]),
  };
}
