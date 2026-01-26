import { useState, useEffect, useCallback } from "react";

interface QueuedRequest {
  id: string;
  type: "message" | "request" | "update";
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

interface UseOfflineQueueOptions {
  storageKey?: string;
  maxRetries?: number;
  onSync?: (item: QueuedRequest) => Promise<void>;
}

export function useOfflineQueue(options: UseOfflineQueueOptions = {}) {
  const {
    storageKey = "aurelia-offline-queue",
    maxRetries = 3,
    onSync,
  } = options;

  const [queue, setQueue] = useState<QueuedRequest[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as QueuedRequest[];
        setQueue(parsed);
      }
    } catch (error) {
      console.error("[OfflineQueue] Failed to load queue:", error);
    }
  }, [storageKey]);

  // Save queue to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(queue));
    } catch (error) {
      console.error("[OfflineQueue] Failed to save queue:", error);
    }
  }, [queue, storageKey]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log("[OfflineQueue] Back online, syncing queue...");
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log("[OfflineQueue] Went offline, queueing enabled");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing && onSync) {
      syncQueue();
    }
  }, [isOnline, queue.length, isSyncing]);

  const addToQueue = useCallback(
    (type: QueuedRequest["type"], data: Record<string, unknown>) => {
      const item: QueuedRequest = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
        retries: 0,
        maxRetries,
      };

      setQueue((prev) => [...prev, item]);
      console.log("[OfflineQueue] Added item to queue:", item.id);
      
      return item.id;
    },
    [maxRetries]
  );

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const syncQueue = useCallback(async () => {
    if (!onSync || isSyncing || queue.length === 0) return;

    setIsSyncing(true);
    console.log("[OfflineQueue] Starting sync, items:", queue.length);

    const itemsToSync = [...queue];
    const failedItems: QueuedRequest[] = [];

    for (const item of itemsToSync) {
      try {
        await onSync(item);
        removeFromQueue(item.id);
        console.log("[OfflineQueue] Synced item:", item.id);
      } catch (error) {
        console.error("[OfflineQueue] Failed to sync item:", item.id, error);
        
        if (item.retries < item.maxRetries) {
          failedItems.push({ ...item, retries: item.retries + 1 });
        } else {
          console.warn("[OfflineQueue] Max retries reached, discarding:", item.id);
        }
      }
    }

    // Update queue with failed items
    setQueue(failedItems);
    setIsSyncing(false);
    
    console.log("[OfflineQueue] Sync complete, failed items:", failedItems.length);
  }, [onSync, isSyncing, queue, removeFromQueue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    queue,
    isOnline,
    isSyncing,
    queueLength: queue.length,
    addToQueue,
    removeFromQueue,
    syncQueue,
    clearQueue,
  };
}
