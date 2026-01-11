import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LoginDevice {
  id: string;
  device_fingerprint: string;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  location: string | null;
  is_trusted: boolean;
  last_login_at: string;
  first_seen_at: string;
  login_count: number;
}

interface LoginAlert {
  id: string;
  alert_type: string;
  title: string;
  message: string;
  device_id: string | null;
  metadata: unknown;
  is_read: boolean;
  created_at: string;
}

interface DeviceInfo {
  fingerprint: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string | null;
}

/**
 * Generate a device fingerprint based on browser characteristics.
 * This is a simple fingerprint - in production, consider using a library like FingerprintJS.
 */
const generateDeviceFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
    navigator.platform,
  ];
  
  // Simple hash function
  const str = components.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

/**
 * Parse user agent to extract browser and OS info
 */
const parseUserAgent = (): { browser: string; os: string; deviceName: string } => {
  const ua = navigator.userAgent;
  
  // Detect browser
  let browser = "Unknown Browser";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  
  // Detect OS
  let os = "Unknown OS";
  if (ua.includes("Windows NT 10")) os = "Windows 10/11";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  
  // Device name
  const deviceName = `${browser} on ${os}`;
  
  return { browser, os, deviceName };
};

/**
 * Fetch IP address
 */
const fetchIpAddress = async (): Promise<string | null> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      const data = await response.json();
      return data.ip;
    }
  } catch {
    // Ignore errors
  }
  return null;
};

export const useLoginDeviceTracking = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<LoginDevice[]>([]);
  const [alerts, setAlerts] = useState<LoginAlert[]>([]);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Get current device info
   */
  const getCurrentDeviceInfo = useCallback(async (): Promise<DeviceInfo> => {
    const fingerprint = generateDeviceFingerprint();
    const { browser, os, deviceName } = parseUserAgent();
    const ipAddress = await fetchIpAddress();
    
    return { fingerprint, deviceName, browser, os, ipAddress };
  }, []);

  /**
   * Record a login from the current device
   */
  const recordDeviceLogin = useCallback(async (): Promise<{ isNewDevice: boolean; device: LoginDevice | null }> => {
    if (!user) return { isNewDevice: false, device: null };

    try {
      const deviceInfo = await getCurrentDeviceInfo();
      
      // Check if device already exists
      const { data: existingDevice } = await supabase
        .from("login_devices")
        .select("*")
        .eq("user_id", user.id)
        .eq("device_fingerprint", deviceInfo.fingerprint)
        .single();

      if (existingDevice) {
        // Update existing device
        const { data: updatedDevice, error } = await supabase
          .from("login_devices")
          .update({
            last_login_at: new Date().toISOString(),
            login_count: (existingDevice.login_count || 0) + 1,
            ip_address: deviceInfo.ipAddress,
          })
          .eq("id", existingDevice.id)
          .select()
          .single();

        if (error) throw error;
        return { isNewDevice: false, device: updatedDevice };
      }

      // Insert new device
      const { data: newDevice, error: insertError } = await supabase
        .from("login_devices")
        .insert({
          user_id: user.id,
          device_fingerprint: deviceInfo.fingerprint,
          device_name: deviceInfo.deviceName,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ip_address: deviceInfo.ipAddress,
          is_trusted: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Create alert for new device
      await supabase.from("login_alerts").insert({
        user_id: user.id,
        alert_type: "new_device",
        title: "New Device Login",
        message: `A new device "${deviceInfo.deviceName}" logged into your account.`,
        device_id: newDevice?.id,
        metadata: {
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ip_address: deviceInfo.ipAddress,
        },
      });

      return { isNewDevice: true, device: newDevice };
    } catch (error) {
      console.error("Failed to record device login:", error);
      return { isNewDevice: false, device: null };
    }
  }, [user, getCurrentDeviceInfo]);

  /**
   * Fetch all devices for the current user
   */
  const fetchDevices = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("login_devices")
        .select("*")
        .eq("user_id", user.id)
        .order("last_login_at", { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Fetch all alerts for the current user
   */
  const fetchAlerts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("login_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlerts(data || []);
      setUnreadAlertCount(data?.filter((a) => !a.is_read).length || 0);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  }, [user]);

  /**
   * Mark an alert as read
   */
  const markAlertAsRead = useCallback(async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("login_alerts")
        .update({ is_read: true })
        .eq("id", alertId);

      if (error) throw error;
      
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
      );
      setUnreadAlertCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark alert as read:", error);
    }
  }, []);

  /**
   * Mark all alerts as read
   */
  const markAllAlertsAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("login_alerts")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      setUnreadAlertCount(0);
    } catch (error) {
      console.error("Failed to mark all alerts as read:", error);
    }
  }, [user]);

  /**
   * Trust a device
   */
  const trustDevice = useCallback(async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from("login_devices")
        .update({ is_trusted: true })
        .eq("id", deviceId);

      if (error) throw error;
      
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, is_trusted: true } : d))
      );
    } catch (error) {
      console.error("Failed to trust device:", error);
    }
  }, []);

  /**
   * Remove a device
   */
  const removeDevice = useCallback(async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from("login_devices")
        .delete()
        .eq("id", deviceId);

      if (error) throw error;
      
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    } catch (error) {
      console.error("Failed to remove device:", error);
    }
  }, []);

  /**
   * Create a breach detection alert
   */
  const createBreachAlert = useCallback(async (message: string) => {
    if (!user) return;

    try {
      await supabase.from("login_alerts").insert({
        user_id: user.id,
        alert_type: "breach_detected",
        title: "Password Security Alert",
        message,
        metadata: { detected_at: new Date().toISOString() },
      });
      
      // Refresh alerts
      await fetchAlerts();
    } catch (error) {
      console.error("Failed to create breach alert:", error);
    }
  }, [user, fetchAlerts]);

  // Auto-fetch on user change
  useEffect(() => {
    if (user) {
      fetchDevices();
      fetchAlerts();
    } else {
      setDevices([]);
      setAlerts([]);
      setUnreadAlertCount(0);
    }
  }, [user, fetchDevices, fetchAlerts]);

  return {
    devices,
    alerts,
    unreadAlertCount,
    isLoading,
    recordDeviceLogin,
    fetchDevices,
    fetchAlerts,
    markAlertAsRead,
    markAllAlertsAsRead,
    trustDevice,
    removeDevice,
    createBreachAlert,
    getCurrentDeviceInfo,
  };
};

export default useLoginDeviceTracking;
