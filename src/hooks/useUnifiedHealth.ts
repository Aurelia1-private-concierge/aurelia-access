import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelfHealing } from './useSelfHealing';
import { usePublicationDiagnostics } from './usePublicationDiagnostics';
import { SITE_CONFIG } from '@/lib/site-config';

export type OverallHealthStatus = 'healthy' | 'warning' | 'critical' | 'offline' | 'checking';

export interface UnifiedHealthState {
  overall: OverallHealthStatus;
  runtime: {
    network: 'online' | 'offline';
    database: 'healthy' | 'degraded' | 'offline';
    auth: 'authenticated' | 'expired' | 'none';
  };
  infrastructure: {
    dns: 'healthy' | 'warning' | 'critical' | 'unknown';
    ssl: 'healthy' | 'warning' | 'critical' | 'unknown';
    cdn: 'healthy' | 'warning' | 'critical' | 'unknown';
    seo: 'healthy' | 'warning' | 'critical' | 'unknown';
  };
  lastCheck: Date;
  consecutiveFailures: number;
  suggestPublicationWizard: boolean;
}

const FAILURE_THRESHOLD = 3;

export const useUnifiedHealth = () => {
  const selfHealing = useSelfHealing();
  const publication = usePublicationDiagnostics();
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [autoTriggeredDiagnostics, setAutoTriggeredDiagnostics] = useState(false);

  // Track consecutive network/database failures
  useEffect(() => {
    if (selfHealing.healthStatus.database === 'offline' || selfHealing.healthStatus.network === 'offline') {
      setConsecutiveFailures(prev => prev + 1);
    } else if (selfHealing.healthStatus.database === 'healthy' && selfHealing.healthStatus.network === 'online') {
      setConsecutiveFailures(0);
      setAutoTriggeredDiagnostics(false);
    }
  }, [selfHealing.healthStatus.database, selfHealing.healthStatus.network]);

  // Auto-trigger publication diagnostics when consecutive failures exceed threshold
  useEffect(() => {
    if (consecutiveFailures >= FAILURE_THRESHOLD && !autoTriggeredDiagnostics && !publication.isRunning) {
      console.log('[UnifiedHealth] Consecutive failures detected, auto-triggering infrastructure diagnostics');
      setAutoTriggeredDiagnostics(true);
      publication.runDiagnostics(SITE_CONFIG.productionDomain);
    }
  }, [consecutiveFailures, autoTriggeredDiagnostics, publication.isRunning]);

  // Compute infrastructure status from publication diagnostics
  const infrastructureStatus = useMemo(() => {
    if (!publication.result) {
      return {
        dns: 'unknown' as const,
        ssl: 'unknown' as const,
        cdn: 'unknown' as const,
        seo: 'unknown' as const,
      };
    }

    const getStatusForCategory = (category: string): 'healthy' | 'warning' | 'critical' | 'unknown' => {
      const checks = publication.result!.checks.filter(c => c.category === category);
      if (checks.length === 0) return 'unknown';
      
      if (checks.some(c => c.status === 'fail')) return 'critical';
      if (checks.some(c => c.status === 'warn')) return 'warning';
      if (checks.every(c => c.status === 'pass')) return 'healthy';
      return 'unknown';
    };

    return {
      dns: getStatusForCategory('dns'),
      ssl: getStatusForCategory('ssl'),
      cdn: getStatusForCategory('cdn'),
      seo: getStatusForCategory('seo'),
    };
  }, [publication.result]);

  // Compute overall health status
  const overallHealth = useMemo((): OverallHealthStatus => {
    // Offline takes precedence
    if (selfHealing.healthStatus.network === 'offline') return 'offline';
    
    // Critical if database is down
    if (selfHealing.healthStatus.database === 'offline') return 'critical';
    
    // Critical if infrastructure has failures
    const infraValues = Object.values(infrastructureStatus);
    if (infraValues.some(v => v === 'critical')) return 'critical';
    
    // Warning states
    if (selfHealing.healthStatus.database === 'degraded') return 'warning';
    if (selfHealing.healthStatus.auth === 'expired') return 'warning';
    if (infraValues.some(v => v === 'warning')) return 'warning';
    
    // If we're checking, show checking
    if (publication.isRunning) return 'checking';
    
    return 'healthy';
  }, [selfHealing.healthStatus, infrastructureStatus, publication.isRunning]);

  // Should we suggest opening the publication wizard?
  const suggestPublicationWizard = useMemo(() => {
    return consecutiveFailures >= FAILURE_THRESHOLD || 
           Object.values(infrastructureStatus).some(v => v === 'critical' || v === 'warning');
  }, [consecutiveFailures, infrastructureStatus]);

  // Combined state
  const unifiedState: UnifiedHealthState = useMemo(() => ({
    overall: overallHealth,
    runtime: {
      network: selfHealing.healthStatus.network,
      database: selfHealing.healthStatus.database,
      auth: selfHealing.healthStatus.auth,
    },
    infrastructure: infrastructureStatus,
    lastCheck: selfHealing.healthStatus.lastCheck,
    consecutiveFailures,
    suggestPublicationWizard,
  }), [overallHealth, selfHealing.healthStatus, infrastructureStatus, consecutiveFailures, suggestPublicationWizard]);

  // Manual refresh of all health checks
  const refreshAll = useCallback(async () => {
    await Promise.all([
      selfHealing.performHealthCheck(),
      publication.runDiagnostics(SITE_CONFIG.productionDomain),
    ]);
  }, [selfHealing.performHealthCheck, publication.runDiagnostics]);

  return {
    state: unifiedState,
    runtime: selfHealing,
    infrastructure: publication,
    refreshAll,
    isRefreshing: selfHealing.isHealing || publication.isRunning,
  };
};
