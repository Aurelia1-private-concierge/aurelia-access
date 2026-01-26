import { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, Cloud, CloudOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NetworkStatusProps {
  showToast?: boolean;
  className?: string;
}

export function NetworkStatus({ showToast = true, className = "" }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline && showToast) {
        toast({
          title: "Back Online",
          description: "Your connection has been restored. Syncing pending data...",
        });
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      if (showToast) {
        toast({
          title: "You're Offline",
          description: "Don't worry, your work will be saved and synced when you're back online.",
          variant: "destructive",
        });
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline, showToast, toast]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isOnline ? (
        <>
          <Cloud className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Connected</span>
        </>
      ) : (
        <>
          <CloudOff className="h-4 w-4 text-destructive animate-pulse" />
          <span className="text-xs text-destructive">Offline Mode</span>
        </>
      )}
    </div>
  );
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check connection type if available
    const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
    if (connection) {
      setConnectionType(connection.effectiveType || null);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
}

export default NetworkStatus;
