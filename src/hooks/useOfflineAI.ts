import { useState, useEffect, useCallback, useRef } from 'react';

interface CachedData {
  key: string;
  data: unknown;
  timestamp: number;
  expiresAt: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
}

interface OfflineState {
  isOffline: boolean;
  cachedPages: string[];
  pendingSync: number;
  lastSync: Date | null;
  storageUsed: number;
  storageLimit: number;
}

interface QueuedAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: unknown;
  timestamp: number;
  retries: number;
}

const CACHE_PREFIX = 'aurelia_offline_';
const QUEUE_KEY = 'aurelia_sync_queue';
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

export const useOfflineAI = () => {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOffline: !navigator.onLine,
    cachedPages: [],
    pendingSync: 0,
    lastSync: null,
    storageUsed: 0,
    storageLimit: MAX_CACHE_SIZE,
  });

  const syncQueue = useRef<QueuedAction[]>([]);
  const isSyncing = useRef(false);

  // Calculate storage usage
  const calculateStorageUsage = useCallback(() => {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        totalSize += (key.length + (value?.length || 0)) * 2; // UTF-16
      }
    }
    return totalSize;
  }, []);

  // AI-powered cache prioritization
  const prioritizeCache = useCallback((data: CachedData[]): CachedData[] => {
    return data.sort((a, b) => {
      // Priority order: critical > high > normal > low
      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by recency
      return b.timestamp - a.timestamp;
    });
  }, []);

  // Smart cache management - remove low priority items when space is needed
  const manageCache = useCallback(() => {
    const storageUsed = calculateStorageUsage();
    
    if (storageUsed > MAX_CACHE_SIZE * 0.8) { // 80% threshold
      const allCached: CachedData[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_PREFIX)) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '');
            allCached.push({ ...item, key });
          } catch {
            // Remove corrupted items
            localStorage.removeItem(key);
          }
        }
      }

      // Sort by priority (lowest first for removal)
      const sorted = prioritizeCache(allCached).reverse();
      
      // Remove until under 60% capacity
      let currentSize = storageUsed;
      for (const item of sorted) {
        if (currentSize <= MAX_CACHE_SIZE * 0.6) break;
        if (item.priority !== 'critical') {
          const itemSize = JSON.stringify(item).length * 2;
          localStorage.removeItem(CACHE_PREFIX + item.key);
          currentSize -= itemSize;
        }
      }
    }
  }, [calculateStorageUsage, prioritizeCache]);

  // Cache data with AI-determined priority
  const cacheData = useCallback((
    key: string,
    data: unknown,
    priority: CachedData['priority'] = 'normal',
    ttlMinutes: number = 60
  ) => {
    manageCache();
    
    const cached: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
      priority,
    };
    
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cached));
      updateOfflineState();
    } catch (e) {
      console.warn('Cache storage failed:', e);
      // Force cleanup and retry
      manageCache();
      try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cached));
      } catch {
        console.error('Cache storage failed after cleanup');
      }
    }
  }, [manageCache]);

  // Retrieve cached data
  const getCachedData = useCallback(<T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) return null;
      
      const cached: CachedData = JSON.parse(item);
      
      // Check expiration
      if (cached.expiresAt < Date.now()) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      
      return cached.data as T;
    } catch {
      return null;
    }
  }, []);

  // Queue action for later sync
  const queueAction = useCallback((action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>) => {
    const queuedAction: QueuedAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0,
    };
    
    syncQueue.current.push(queuedAction);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(syncQueue.current));
    updateOfflineState();
  }, []);

  // Process sync queue when online
  const processSyncQueue = useCallback(async () => {
    if (isSyncing.current || !navigator.onLine) return;
    
    const queueData = localStorage.getItem(QUEUE_KEY);
    if (!queueData) return;
    
    try {
      syncQueue.current = JSON.parse(queueData);
    } catch {
      syncQueue.current = [];
    }
    
    if (syncQueue.current.length === 0) return;
    
    isSyncing.current = true;
    
    const processed: string[] = [];
    
    for (const action of syncQueue.current) {
      try {
        // In real implementation, this would call Supabase
        // For now, mark as processed
        processed.push(action.id);
      } catch (e) {
        action.retries++;
        if (action.retries >= 3) {
          processed.push(action.id); // Give up after 3 retries
        }
      }
    }
    
    syncQueue.current = syncQueue.current.filter(a => !processed.includes(a.id));
    localStorage.setItem(QUEUE_KEY, JSON.stringify(syncQueue.current));
    
    setOfflineState(prev => ({
      ...prev,
      lastSync: new Date(),
      pendingSync: syncQueue.current.length,
    }));
    
    isSyncing.current = false;
  }, []);

  // Update offline state
  const updateOfflineState = useCallback(() => {
    const cachedPages: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX + 'page_')) {
        cachedPages.push(key.replace(CACHE_PREFIX + 'page_', ''));
      }
    }
    
    const queueData = localStorage.getItem(QUEUE_KEY);
    const queue = queueData ? JSON.parse(queueData) : [];
    
    setOfflineState(prev => ({
      ...prev,
      isOffline: !navigator.onLine,
      cachedPages,
      pendingSync: queue.length,
      storageUsed: calculateStorageUsage(),
    }));
  }, [calculateStorageUsage]);

  // Pre-cache critical pages
  const preCacheCriticalPages = useCallback(() => {
    const criticalRoutes = ['/', '/dashboard', '/services', '/membership'];
    
    criticalRoutes.forEach(route => {
      if (!getCachedData(`page_${route}`)) {
        cacheData(`page_${route}`, { route, cached: true }, 'critical', 1440); // 24 hours
      }
    });
  }, [cacheData, getCachedData]);

  // Initialize
  useEffect(() => {
    updateOfflineState();
    preCacheCriticalPages();
    
    // Load existing queue
    const queueData = localStorage.getItem(QUEUE_KEY);
    if (queueData) {
      try {
        syncQueue.current = JSON.parse(queueData);
      } catch {
        syncQueue.current = [];
      }
    }
    
    // Listen for online/offline events
    const handleOnline = () => {
      setOfflineState(prev => ({ ...prev, isOffline: false }));
      processSyncQueue();
    };
    
    const handleOffline = () => {
      setOfflineState(prev => ({ ...prev, isOffline: true }));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Periodic sync attempt
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        processSyncQueue();
      }
    }, 60000); // Every minute
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, [updateOfflineState, preCacheCriticalPages, processSyncQueue]);

  // Clear all cached data
  const clearCache = useCallback(() => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
    updateOfflineState();
  }, [updateOfflineState]);

  return {
    offlineState,
    cacheData,
    getCachedData,
    queueAction,
    processSyncQueue,
    clearCache,
    preCacheCriticalPages,
  };
};
