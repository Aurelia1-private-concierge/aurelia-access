import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVideoPreloaderOptions {
  videos: string[];
  currentIndex: number;
  preloadAheadMs?: number;
  rotationInterval?: number;
}

interface UseVideoPreloaderReturn {
  preloadedUrls: Map<number, string>;
  isPreloading: boolean;
  getPreloadedUrl: (index: number) => string | undefined;
  error: Error | null;
}

/**
 * Intelligent video preloader hook for seamless hero transitions
 * - Preloads next video in rotation before transition
 * - Manages memory by revoking blob URLs after use
 * - Respects network save-data preferences
 * - Provides graceful fallback on failure
 */
export const useVideoPreloader = ({
  videos,
  currentIndex,
  preloadAheadMs = 5000,
  rotationInterval = 15000,
}: UseVideoPreloaderOptions): UseVideoPreloaderReturn => {
  const [preloadedUrls, setPreloadedUrls] = useState<Map<number, string>>(new Map());
  const [isPreloading, setIsPreloading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const preloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousIndexRef = useRef<number>(currentIndex);

  // Check if data saver mode is enabled
  const shouldPreload = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as Navigator & { 
        connection?: { saveData?: boolean; effectiveType?: string } 
      }).connection;
      
      // Respect save-data preference
      if (connection?.saveData) {
        console.log('[VideoPreloader] Data saver enabled, skipping preload');
        return false;
      }
      
      // Skip on slow connections
      if (connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
        console.log('[VideoPreloader] Slow connection detected, skipping preload');
        return false;
      }
    }
    return true;
  }, []);

  // Preload a video and store as blob URL
  const preloadVideo = useCallback(async (index: number) => {
    if (!videos[index] || preloadedUrls.has(index)) {
      return;
    }

    if (!shouldPreload()) {
      return;
    }

    setIsPreloading(true);
    setError(null);

    // Cancel any existing preload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      console.log(`[VideoPreloader] Preloading video ${index}: ${videos[index]}`);
      
      const response = await fetch(videos[index], {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      setPreloadedUrls(prev => {
        const newMap = new Map(prev);
        newMap.set(index, blobUrl);
        return newMap;
      });

      console.log(`[VideoPreloader] Successfully preloaded video ${index}`);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[VideoPreloader] Preload aborted');
        return;
      }
      
      console.warn('[VideoPreloader] Preload failed:', err);
      setError(err instanceof Error ? err : new Error('Unknown preload error'));
    } finally {
      setIsPreloading(false);
    }
  }, [videos, preloadedUrls, shouldPreload]);

  // Revoke blob URLs that are no longer needed
  const cleanupOldUrls = useCallback((keepIndex: number) => {
    setPreloadedUrls(prev => {
      const newMap = new Map(prev);
      
      for (const [index, url] of prev.entries()) {
        // Keep current and next video, clean up others
        const nextIndex = (keepIndex + 1) % videos.length;
        if (index !== keepIndex && index !== nextIndex) {
          URL.revokeObjectURL(url);
          newMap.delete(index);
          console.log(`[VideoPreloader] Cleaned up blob URL for video ${index}`);
        }
      }
      
      return newMap;
    });
  }, [videos.length]);

  // Schedule preload of next video
  useEffect(() => {
    if (videos.length <= 1) return;

    // Clean up previous preload timeout
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }

    const nextIndex = (currentIndex + 1) % videos.length;
    const preloadDelay = Math.max(0, rotationInterval - preloadAheadMs);

    // Schedule preload for next video
    preloadTimeoutRef.current = setTimeout(() => {
      preloadVideo(nextIndex);
    }, preloadDelay);

    // Clean up old blob URLs when video changes
    if (previousIndexRef.current !== currentIndex) {
      cleanupOldUrls(currentIndex);
      previousIndexRef.current = currentIndex;
    }

    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, [currentIndex, videos.length, rotationInterval, preloadAheadMs, preloadVideo, cleanupOldUrls]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Revoke all blob URLs
      preloadedUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      
      // Cancel any pending fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, []);

  // Get preloaded URL for a specific index
  const getPreloadedUrl = useCallback((index: number): string | undefined => {
    return preloadedUrls.get(index);
  }, [preloadedUrls]);

  return {
    preloadedUrls,
    isPreloading,
    getPreloadedUrl,
    error,
  };
};

export default useVideoPreloader;
