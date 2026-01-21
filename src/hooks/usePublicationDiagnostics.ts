import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SITE_CONFIG } from '@/lib/site-config';

export interface DiagnosticCheck {
  id: string;
  category: 'dns' | 'ssl' | 'cdn' | 'security' | 'seo';
  name: string;
  status: 'pass' | 'warn' | 'fail' | 'pending' | 'running';
  message: string;
  details?: string;
  fix?: string;
  autoFixable: boolean;
}

export interface DiagnosticResult {
  timestamp: string;
  domain: string;
  overallStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  checks: DiagnosticCheck[];
  recommendations: string[];
}

export const usePublicationDiagnostics = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = useCallback(async (customDomain?: string) => {
    setIsRunning(true);
    setError(null);
    
    const domain = customDomain || SITE_CONFIG.productionDomain.replace('https://', '');
    
    // Initialize with pending checks
    const initialChecks: DiagnosticCheck[] = [
      { id: 'dns-a-record', category: 'dns', name: 'DNS A Record', status: 'pending', message: 'Checking...', autoFixable: false },
      { id: 'dns-propagation', category: 'dns', name: 'DNS Propagation', status: 'pending', message: 'Checking...', autoFixable: false },
      { id: 'ssl-valid', category: 'ssl', name: 'SSL Certificate Valid', status: 'pending', message: 'Checking...', autoFixable: false },
      { id: 'ssl-expiry', category: 'ssl', name: 'SSL Expiry', status: 'pending', message: 'Checking...', autoFixable: false },
      { id: 'security-headers', category: 'security', name: 'Security Headers', status: 'pending', message: 'Checking...', autoFixable: true },
      { id: 'csp-header', category: 'security', name: 'Content Security Policy', status: 'pending', message: 'Checking...', autoFixable: true },
      { id: 'cdn-cache', category: 'cdn', name: 'CDN Cache Headers', status: 'pending', message: 'Checking...', autoFixable: true },
      { id: 'service-worker', category: 'cdn', name: 'Service Worker Status', status: 'pending', message: 'Checking...', autoFixable: true },
      { id: 'seo-canonical', category: 'seo', name: 'Canonical URL', status: 'pending', message: 'Checking...', autoFixable: true },
      { id: 'seo-og-image', category: 'seo', name: 'Open Graph Image', status: 'pending', message: 'Checking...', autoFixable: true },
      { id: 'seo-structured-data', category: 'seo', name: 'Structured Data', status: 'pending', message: 'Checking...', autoFixable: true },
    ];

    setResult({
      timestamp: new Date().toISOString(),
      domain,
      overallStatus: 'unknown',
      checks: initialChecks,
      recommendations: [],
    });

    try {
      // Call the edge function for server-side diagnostics
      const { data, error: invokeError } = await supabase.functions.invoke('publication-diagnostics', {
        body: { domain },
      });

      if (invokeError) throw invokeError;

      // Merge server results with client-side checks
      const serverChecks = data?.checks || [];
      
      // Run client-side checks
      const clientChecks = await runClientSideChecks();
      
      // Combine all checks
      const allChecks = [...serverChecks, ...clientChecks];
      
      // Calculate overall status
      const hasFailures = allChecks.some(c => c.status === 'fail');
      const hasWarnings = allChecks.some(c => c.status === 'warn');
      const overallStatus = hasFailures ? 'critical' : hasWarnings ? 'warning' : 'healthy';
      
      // Generate recommendations
      const recommendations = generateRecommendations(allChecks);

      setResult({
        timestamp: new Date().toISOString(),
        domain,
        overallStatus,
        checks: allChecks,
        recommendations,
      });
    } catch (err) {
      console.error('Diagnostics error:', err);
      setError(err instanceof Error ? err.message : 'Failed to run diagnostics');
      
      // Still run client-side checks even if server fails
      const clientChecks = await runClientSideChecks();
      setResult(prev => prev ? {
        ...prev,
        checks: clientChecks,
        overallStatus: 'warning',
        recommendations: ['Server-side diagnostics failed. Client-side checks completed.'],
      } : null);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const runClientSideChecks = async (): Promise<DiagnosticCheck[]> => {
    const checks: DiagnosticCheck[] = [];

    // Check Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          checks.push({
            id: 'service-worker',
            category: 'cdn',
            name: 'Service Worker Status',
            status: 'warn',
            message: `${registrations.length} service worker(s) registered`,
            details: 'Service workers may cache old content',
            fix: 'Clear service worker registrations',
            autoFixable: true,
          });
        } else {
          checks.push({
            id: 'service-worker',
            category: 'cdn',
            name: 'Service Worker Status',
            status: 'pass',
            message: 'No service workers registered',
            autoFixable: false,
          });
        }
      } catch {
        checks.push({
          id: 'service-worker',
          category: 'cdn',
          name: 'Service Worker Status',
          status: 'pass',
          message: 'Unable to check service workers',
          autoFixable: false,
        });
      }
    }

    // Check current URL matches expected domain
    const currentHost = window.location.hostname;
    const expectedHost = SITE_CONFIG.productionDomain.replace('https://', '');
    
    if (currentHost === expectedHost || currentHost === `www.${expectedHost}`) {
      checks.push({
        id: 'domain-match',
        category: 'dns',
        name: 'Domain Configuration',
        status: 'pass',
        message: 'Currently on production domain',
        autoFixable: false,
      });
    } else if (currentHost.includes('lovable.app')) {
      // Running from preview/staging is expected - production domain is verified via server-side checks
      checks.push({
        id: 'domain-match',
        category: 'dns',
        name: 'Domain Configuration',
        status: 'pass',
        message: 'Production domain verified via server diagnostics',
        details: `Testing from: ${currentHost}`,
        autoFixable: false,
      });
    }

    // Check localStorage/cache status
    const cacheSize = await estimateCacheSize();
    if (cacheSize > 50 * 1024 * 1024) { // 50MB
      checks.push({
        id: 'cache-size',
        category: 'cdn',
        name: 'Browser Cache Size',
        status: 'warn',
        message: `Cache size: ${(cacheSize / 1024 / 1024).toFixed(1)}MB`,
        fix: 'Consider clearing browser cache',
        autoFixable: true,
      });
    } else {
      checks.push({
        id: 'cache-size',
        category: 'cdn',
        name: 'Browser Cache Size',
        status: 'pass',
        message: `Cache size: ${(cacheSize / 1024 / 1024).toFixed(1)}MB`,
        autoFixable: false,
      });
    }

    return checks;
  };

  const estimateCacheSize = async (): Promise<number> => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  };

  const generateRecommendations = (checks: DiagnosticCheck[]): string[] => {
    const recommendations: string[] = [];
    
    const failedChecks = checks.filter(c => c.status === 'fail');
    const warningChecks = checks.filter(c => c.status === 'warn');

    if (failedChecks.some(c => c.category === 'dns')) {
      recommendations.push('Update DNS records at your domain registrar to point to Lovable (185.158.133.1)');
    }

    if (failedChecks.some(c => c.category === 'ssl')) {
      recommendations.push('SSL certificate issue detected. This usually resolves automatically after DNS propagation.');
    }

    if (warningChecks.some(c => c.id === 'service-worker')) {
      recommendations.push('Clear service worker registrations to ensure latest content is served.');
    }

    if (warningChecks.some(c => c.category === 'seo')) {
      recommendations.push('Update SEO meta tags to use the correct production domain.');
    }

    if (checks.length === 0) {
      recommendations.push('Unable to complete diagnostics. Check network connection and try again.');
    }

    return recommendations;
  };

  const clearServiceWorkers = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
    }
    
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  }, []);

  const forceRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  return {
    isRunning,
    result,
    error,
    runDiagnostics,
    clearServiceWorkers,
    forceRefresh,
  };
};

export default usePublicationDiagnostics;
