import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HealthStatus {
  database: 'healthy' | 'degraded' | 'offline';
  network: 'online' | 'offline';
  auth: 'authenticated' | 'expired' | 'none';
  lastCheck: Date;
  autoHealed: number;
}

interface HealingAction {
  type: string;
  timestamp: Date;
  success: boolean;
  details: string;
}

export const useSelfHealing = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    database: 'healthy',
    network: navigator.onLine ? 'online' : 'offline',
    auth: 'none',
    lastCheck: new Date(),
    autoHealed: 0,
  });
  
  const [healingLog, setHealingLog] = useState<HealingAction[]>([]);
  const [isHealing, setIsHealing] = useState(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Check database connectivity
  const checkDatabase = useCallback(async (): Promise<'healthy' | 'degraded' | 'offline'> => {
    try {
      const start = Date.now();
      const { error } = await supabase.from('app_settings').select('id').limit(1);
      const latency = Date.now() - start;
      
      if (error) return 'offline';
      if (latency > 2000) return 'degraded';
      return 'healthy';
    } catch {
      return 'offline';
    }
  }, []);

  // Check auth status
  const checkAuth = useCallback(async (): Promise<'authenticated' | 'expired' | 'none'> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return 'none';
      
      const expiresAt = session.expires_at;
      if (expiresAt && expiresAt * 1000 < Date.now()) return 'expired';
      
      return 'authenticated';
    } catch {
      return 'none';
    }
  }, []);

  // Auto-heal expired session
  const healExpiredSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) return false;
      
      logHealingAction('session_refresh', true, 'Successfully refreshed expired session');
      return true;
    } catch {
      logHealingAction('session_refresh', false, 'Failed to refresh session');
      return false;
    }
  }, []);

  // Auto-heal network issues with retry
  const healNetworkIssue = useCallback(async (): Promise<boolean> => {
    if (retryCount.current >= maxRetries) {
      retryCount.current = 0;
      return false;
    }

    retryCount.current++;
    
    // Wait before retry with exponential backoff
    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount.current));
    
    const dbStatus = await checkDatabase();
    if (dbStatus === 'healthy') {
      retryCount.current = 0;
      logHealingAction('network_recovery', true, `Recovered after ${retryCount.current} retries`);
      return true;
    }
    
    return false;
  }, [checkDatabase]);

  // Log healing actions
  const logHealingAction = useCallback((type: string, success: boolean, details: string) => {
    const action: HealingAction = {
      type,
      timestamp: new Date(),
      success,
      details,
    };
    
    setHealingLog(prev => [...prev.slice(-19), action]);
    
    if (success) {
      setHealthStatus(prev => ({
        ...prev,
        autoHealed: prev.autoHealed + 1,
      }));
    }
  }, []);

  // Main health check and healing routine
  const performHealthCheck = useCallback(async () => {
    const [dbStatus, authStatus] = await Promise.all([
      checkDatabase(),
      checkAuth(),
    ]);

    const networkStatus = navigator.onLine ? 'online' : 'offline';

    setHealthStatus({
      database: dbStatus,
      network: networkStatus,
      auth: authStatus,
      lastCheck: new Date(),
      autoHealed: healthStatus.autoHealed,
    });

    // Auto-heal if needed
    if (authStatus === 'expired') {
      setIsHealing(true);
      await healExpiredSession();
      setIsHealing(false);
    }

    if (dbStatus === 'offline' && networkStatus === 'online') {
      setIsHealing(true);
      await healNetworkIssue();
      setIsHealing(false);
    }
  }, [checkDatabase, checkAuth, healExpiredSession, healNetworkIssue, healthStatus.autoHealed]);

  // Set up periodic health checks
  useEffect(() => {
    performHealthCheck();
    
    const interval = setInterval(performHealthCheck, 30000); // Every 30 seconds
    
    // Listen for online/offline events
    const handleOnline = () => {
      logHealingAction('network_restored', true, 'Network connection restored');
      performHealthCheck();
    };
    
    const handleOffline = () => {
      setHealthStatus(prev => ({ ...prev, network: 'offline' }));
      logHealingAction('network_lost', false, 'Network connection lost');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [performHealthCheck, logHealingAction]);

  // Force heal all issues
  const forceHeal = useCallback(async () => {
    setIsHealing(true);
    
    if (healthStatus.auth === 'expired') {
      await healExpiredSession();
    }
    
    if (healthStatus.database === 'offline') {
      await healNetworkIssue();
    }
    
    await performHealthCheck();
    setIsHealing(false);
  }, [healthStatus, healExpiredSession, healNetworkIssue, performHealthCheck]);

  return {
    healthStatus,
    healingLog,
    isHealing,
    forceHeal,
    performHealthCheck,
  };
};
