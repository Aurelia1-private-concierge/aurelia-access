import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type DeviceType = "desktop" | "tablet" | "mobile" | "wearable" | "smart_display" | "unknown";
export type ConnectionQuality = "excellent" | "good" | "fair" | "poor" | "offline";

export interface DeviceInfo {
  id: string;
  type: DeviceType;
  name: string;
  isCurrentDevice: boolean;
  lastActive: Date;
  capabilities: {
    hasCamera: boolean;
    hasMicrophone: boolean;
    hasTouch: boolean;
    hasHaptics: boolean;
    supportsAR: boolean;
    supportsVR: boolean;
    supportsNotifications: boolean;
    screenSize: "small" | "medium" | "large" | "xlarge";
  };
  connectionQuality: ConnectionQuality;
}

export interface SyncState {
  conversationId: string | null;
  lastMessage: string | null;
  orlaState: {
    mode: string;
    emotion: string;
    isListening: boolean;
    isSpeaking: boolean;
  };
  timestamp: Date;
}

export interface ProfessionalTool {
  id: string;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
  isConnected: boolean;
  category: "calendar" | "travel" | "finance" | "communication" | "productivity";
}

export interface ARCapabilities {
  isSupported: boolean;
  isActive: boolean;
  features: {
    faceTracking: boolean;
    planeDetection: boolean;
    handTracking: boolean;
    worldTracking: boolean;
  };
}

interface UseOrlaEquipmentOptions {
  enableSync?: boolean;
  enableAR?: boolean;
  syncIntervalMs?: number;
}

export const useOrlaEquipment = (options: UseOrlaEquipmentOptions = {}) => {
  const { enableSync = true, enableAR = true, syncIntervalMs = 5000 } = options;
  const { user } = useAuth();

  const [currentDevice, setCurrentDevice] = useState<DeviceInfo | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<DeviceInfo[]>([]);
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [professionalTools, setProfessionalTools] = useState<ProfessionalTool[]>([]);
  const [arCapabilities, setARCapabilities] = useState<ARCapabilities>({
    isSupported: false,
    isActive: false,
    features: {
      faceTracking: false,
      planeDetection: false,
      handTracking: false,
      worldTracking: false,
    },
  });
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>("good");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const deviceIdRef = useRef<string>(generateDeviceId());
  const syncChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Generate unique device ID
  function generateDeviceId(): string {
    const stored = localStorage.getItem("orla_device_id");
    if (stored) return stored;
    
    const id = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("orla_device_id", id);
    return id;
  }

  // Detect current device capabilities
  const detectDeviceCapabilities = useCallback((): DeviceInfo => {
    const ua = navigator.userAgent.toLowerCase();
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const screenWidth = window.innerWidth;

    // Determine device type
    let type: DeviceType = "desktop";
    if (/mobile|android|iphone|ipod/.test(ua)) {
      type = "mobile";
    } else if (/tablet|ipad/.test(ua) || (hasTouch && screenWidth > 768)) {
      type = "tablet";
    } else if (/watch|wearable/.test(ua)) {
      type = "wearable";
    }

    // Determine screen size
    let screenSize: DeviceInfo["capabilities"]["screenSize"] = "medium";
    if (screenWidth < 640) screenSize = "small";
    else if (screenWidth < 1024) screenSize = "medium";
    else if (screenWidth < 1440) screenSize = "large";
    else screenSize = "xlarge";

    // Check AR/VR support
    const supportsAR = "xr" in navigator || "getVRDisplays" in navigator;
    const supportsVR = "xr" in navigator;

    // Check haptics
    const hasHaptics = "vibrate" in navigator;

    // Check media devices
    let hasCamera = false;
    let hasMicrophone = false;
    if (navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        hasCamera = devices.some(d => d.kind === "videoinput");
        hasMicrophone = devices.some(d => d.kind === "audioinput");
      });
    }

    return {
      id: deviceIdRef.current,
      type,
      name: getDeviceName(ua, type),
      isCurrentDevice: true,
      lastActive: new Date(),
      capabilities: {
        hasCamera,
        hasMicrophone,
        hasTouch,
        hasHaptics,
        supportsAR,
        supportsVR,
        supportsNotifications: "Notification" in window,
        screenSize,
      },
      connectionQuality: "good",
    };
  }, []);

  // Get friendly device name
  function getDeviceName(ua: string, type: DeviceType): string {
    if (/iphone/.test(ua)) return "iPhone";
    if (/ipad/.test(ua)) return "iPad";
    if (/mac/.test(ua)) return "Mac";
    if (/windows/.test(ua)) return "Windows PC";
    if (/android/.test(ua)) return type === "tablet" ? "Android Tablet" : "Android Phone";
    if (/linux/.test(ua)) return "Linux PC";
    return "Unknown Device";
  }

  // Initialize device info
  useEffect(() => {
    const device = detectDeviceCapabilities();
    setCurrentDevice(device);
  }, [detectDeviceCapabilities]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Monitor connection quality
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) {
      setConnectionQuality(isOnline ? "good" : "offline");
      return;
    }

    const updateQuality = () => {
      if (!isOnline) {
        setConnectionQuality("offline");
        return;
      }

      const effectiveType = connection.effectiveType;
      switch (effectiveType) {
        case "4g":
          setConnectionQuality("excellent");
          break;
        case "3g":
          setConnectionQuality("good");
          break;
        case "2g":
          setConnectionQuality("fair");
          break;
        default:
          setConnectionQuality("poor");
      }
    };

    updateQuality();
    connection.addEventListener("change", updateQuality);

    return () => {
      connection.removeEventListener("change", updateQuality);
    };
  }, [isOnline]);

  // Set up cross-device sync
  useEffect(() => {
    if (!enableSync || !user) return;

    const channelName = `orla_sync_${user.id}`;
    
    syncChannelRef.current = supabase
      .channel(channelName)
      .on("broadcast", { event: "sync_state" }, (payload) => {
        // Update from another device
        if (payload.payload.deviceId !== deviceIdRef.current) {
          setSyncState(payload.payload.state);
        }
      })
      .on("broadcast", { event: "device_presence" }, (payload) => {
        // Another device is active
        const deviceInfo = payload.payload as DeviceInfo;
        setConnectedDevices(prev => {
          const existing = prev.findIndex(d => d.id === deviceInfo.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = { ...deviceInfo, isCurrentDevice: false };
            return updated;
          }
          return [...prev, { ...deviceInfo, isCurrentDevice: false }];
        });
      })
      .subscribe();

    // Announce presence periodically
    const announcePresence = () => {
      if (currentDevice) {
        syncChannelRef.current?.send({
          type: "broadcast",
          event: "device_presence",
          payload: currentDevice,
        });
      }
    };

    announcePresence();
    const interval = setInterval(announcePresence, syncIntervalMs);

    return () => {
      clearInterval(interval);
      syncChannelRef.current?.unsubscribe();
    };
  }, [enableSync, user, currentDevice, syncIntervalMs]);

  // Broadcast state to other devices
  const broadcastState = useCallback((state: Partial<SyncState>) => {
    if (!syncChannelRef.current) return;

    syncChannelRef.current.send({
      type: "broadcast",
      event: "sync_state",
      payload: {
        deviceId: deviceIdRef.current,
        state: {
          ...syncState,
          ...state,
          timestamp: new Date(),
        },
      },
    });
  }, [syncState]);

  // Transfer conversation to another device
  const transferToDevice = useCallback(async (targetDeviceId: string) => {
    if (!syncState) return false;

    syncChannelRef.current?.send({
      type: "broadcast",
      event: "transfer_conversation",
      payload: {
        from: deviceIdRef.current,
        to: targetDeviceId,
        state: syncState,
      },
    });

    return true;
  }, [syncState]);

  // Check and enable AR
  const checkARSupport = useCallback(async (): Promise<boolean> => {
    if (!enableAR) return false;

    try {
      if ("xr" in navigator) {
        const xr = (navigator as any).xr;
        const arSupported = await xr.isSessionSupported("immersive-ar");
        
        setARCapabilities(prev => ({
          ...prev,
          isSupported: arSupported,
          features: {
            ...prev.features,
            worldTracking: arSupported,
          },
        }));

        return arSupported;
      }
    } catch {
      // AR not available
    }

    return false;
  }, [enableAR]);

  // Start AR session
  const startARSession = useCallback(async () => {
    if (!arCapabilities.isSupported) return false;

    try {
      const xr = (navigator as any).xr;
      // This would integrate with Three.js/WebXR for actual AR
      setARCapabilities(prev => ({ ...prev, isActive: true }));
      return true;
    } catch (error) {
      console.error("Failed to start AR session:", error);
      return false;
    }
  }, [arCapabilities.isSupported]);

  // Initialize professional tools
  useEffect(() => {
    setProfessionalTools([
      {
        id: "calendar",
        name: "Calendar Integration",
        icon: "📅",
        description: "Sync with your calendar for scheduling",
        isAvailable: true,
        isConnected: false,
        category: "calendar",
      },
      {
        id: "travel",
        name: "Travel Planning",
        icon: "✈️",
        description: "Access flight and hotel booking tools",
        isAvailable: true,
        isConnected: true,
        category: "travel",
      },
      {
        id: "finance",
        name: "Financial Services",
        icon: "💎",
        description: "Wealth management integration",
        isAvailable: true,
        isConnected: false,
        category: "finance",
      },
      {
        id: "concierge",
        name: "Concierge Network",
        icon: "🌟",
        description: "Access to global partner network",
        isAvailable: true,
        isConnected: true,
        category: "productivity",
      },
    ]);
  }, []);

  // Connect a professional tool
  const connectTool = useCallback(async (toolId: string) => {
    setProfessionalTools(prev =>
      prev.map(tool =>
        tool.id === toolId ? { ...tool, isConnected: true } : tool
      )
    );
    return true;
  }, []);

  // Disconnect a professional tool
  const disconnectTool = useCallback(async (toolId: string) => {
    setProfessionalTools(prev =>
      prev.map(tool =>
        tool.id === toolId ? { ...tool, isConnected: false } : tool
      )
    );
    return true;
  }, []);

  // Trigger haptic feedback
  const triggerHaptics = useCallback((pattern: "light" | "medium" | "heavy" | number[]) => {
    if (!currentDevice?.capabilities.hasHaptics) return false;

    try {
      let vibrationPattern: number | number[];
      switch (pattern) {
        case "light":
          vibrationPattern = 10;
          break;
        case "medium":
          vibrationPattern = 50;
          break;
        case "heavy":
          vibrationPattern = [50, 30, 100];
          break;
        default:
          vibrationPattern = pattern;
      }

      navigator.vibrate(vibrationPattern);
      return true;
    } catch {
      return false;
    }
  }, [currentDevice]);

  return {
    // Device info
    currentDevice,
    connectedDevices,
    deviceId: deviceIdRef.current,

    // Connection
    isOnline,
    connectionQuality,

    // Sync
    syncState,
    broadcastState,
    transferToDevice,

    // AR/VR
    arCapabilities,
    checkARSupport,
    startARSession,

    // Professional tools
    professionalTools,
    connectTool,
    disconnectTool,

    // Haptics
    triggerHaptics,

    // Helpers
    isDesktop: currentDevice?.type === "desktop",
    isMobile: currentDevice?.type === "mobile",
    isTablet: currentDevice?.type === "tablet",
    supportsVoice: currentDevice?.capabilities.hasMicrophone ?? false,
    supportsCamera: currentDevice?.capabilities.hasCamera ?? false,
  };
};

export default useOrlaEquipment;
