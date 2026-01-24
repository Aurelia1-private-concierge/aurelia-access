import { useEffect, useCallback, useRef, useState } from "react";
import { detectVIP, syncVIPStatus, markOrlaEngaged, VIPDetectionResult } from "@/lib/vip-detection";

interface UseVIPDetectionOptions {
  syncInterval?: number; // ms between syncs
  onVIPDetected?: (result: VIPDetectionResult) => void;
  autoSync?: boolean;
}

export const useVIPDetection = (options: UseVIPDetectionOptions = {}) => {
  const { 
    syncInterval = 30000, // 30 seconds
    onVIPDetected,
    autoSync = true,
  } = options;
  
  const [detection, setDetection] = useState<VIPDetectionResult | null>(null);
  const [isVIP, setIsVIP] = useState(false);
  const lastSyncRef = useRef(0);
  const hasNotifiedRef = useRef(false);
  
  // Check VIP status locally
  const checkVIPStatus = useCallback(() => {
    const result = detectVIP();
    setDetection(result);
    setIsVIP(result.isVIP);
    
    // Notify callback on first VIP detection
    if (result.isVIP && !hasNotifiedRef.current && onVIPDetected) {
      hasNotifiedRef.current = true;
      onVIPDetected(result);
    }
    
    return result;
  }, [onVIPDetected]);
  
  // Sync with server
  const sync = useCallback(async (email?: string) => {
    const now = Date.now();
    
    // Debounce syncs
    if (now - lastSyncRef.current < 5000) {
      return detection;
    }
    
    lastSyncRef.current = now;
    const result = await syncVIPStatus(email);
    setDetection(result);
    setIsVIP(result.isVIP);
    
    return result;
  }, [detection]);
  
  // Mark Orla engagement
  const markEngaged = useCallback(async () => {
    await markOrlaEngaged();
  }, []);
  
  // Initial check
  useEffect(() => {
    checkVIPStatus();
  }, [checkVIPStatus]);
  
  // Auto-sync interval
  useEffect(() => {
    if (!autoSync) return;
    
    const intervalId = setInterval(() => {
      sync();
    }, syncInterval);
    
    return () => clearInterval(intervalId);
  }, [autoSync, sync, syncInterval]);
  
  // Sync on visibility change (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkVIPStatus();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [checkVIPStatus]);
  
  return {
    detection,
    isVIP,
    checkVIPStatus,
    sync,
    markEngaged,
  };
};

export default useVIPDetection;