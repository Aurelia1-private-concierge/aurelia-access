import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Smartphone,
  Monitor,
  Laptop,
  Tablet,
  Bell,
  CheckCircle,
  AlertTriangle,
  Trash2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Globe,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLoginDeviceTracking } from "@/hooks/useLoginDeviceTracking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const getDeviceIcon = (os: string | null) => {
  if (!os) return Monitor;
  const osLower = os.toLowerCase();
  if (osLower.includes("ios") || osLower.includes("iphone") || osLower.includes("ipad")) return Tablet;
  if (osLower.includes("android")) return Smartphone;
  if (osLower.includes("mac")) return Laptop;
  return Monitor;
};

const getAlertIcon = (type: string) => {
  switch (type) {
    case "new_device":
      return <Smartphone className="w-4 h-4 text-primary" />;
    case "new_location":
      return <MapPin className="w-4 h-4 text-amber-500" />;
    case "suspicious_activity":
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case "breach_detected":
      return <Shield className="w-4 h-4 text-destructive" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

export const LoginSecurityPanel = () => {
  const {
    devices,
    alerts,
    unreadAlertCount,
    isLoading,
    fetchDevices,
    fetchAlerts,
    markAlertAsRead,
    markAllAlertsAsRead,
    trustDevice,
    removeDevice,
  } = useLoginDeviceTracking();

  const [showDevices, setShowDevices] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [deviceToRemove, setDeviceToRemove] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
    fetchAlerts();
  }, [fetchDevices, fetchAlerts]);

  const handleTrustDevice = async (deviceId: string) => {
    await trustDevice(deviceId);
    toast({
      title: "Device Trusted",
      description: "This device has been marked as trusted.",
    });
  };

  const handleRemoveDevice = async () => {
    if (!deviceToRemove) return;
    await removeDevice(deviceToRemove);
    setDeviceToRemove(null);
    toast({
      title: "Device Removed",
      description: "The device has been removed from your account.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Devices Section */}
      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
        <button
          onClick={() => setShowDevices(!showDevices)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">Logged In Devices</h3>
              <p className="text-xs text-muted-foreground">
                {devices.length} device{devices.length !== 1 ? "s" : ""} connected
              </p>
            </div>
          </div>
          {showDevices ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {showDevices && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/50"
            >
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  Loading devices...
                </div>
              ) : devices.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No devices found
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {devices.map((device) => {
                    const DeviceIcon = getDeviceIcon(device.os);
                    const isCurrentDevice =
                      device.device_fingerprint ===
                      Math.abs(
                        [
                          navigator.userAgent,
                          navigator.language,
                          screen.width,
                          screen.height,
                          screen.colorDepth,
                          new Date().getTimezoneOffset(),
                          navigator.hardwareConcurrency || "unknown",
                          navigator.platform,
                        ]
                          .join("|")
                          .split("")
                          .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) & a, 0)
                      ).toString(36);

                    return (
                      <div
                        key={device.id}
                        className="p-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                              <DeviceIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-foreground">
                                  {device.device_name || "Unknown Device"}
                                </span>
                                {device.is_trusted && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                    Trusted
                                  </Badge>
                                )}
                                {isCurrentDevice && (
                                  <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(device.last_login_at), {
                                    addSuffix: true,
                                  })}
                                </span>
                                {device.ip_address && (
                                  <span className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {device.ip_address}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {device.login_count} login{device.login_count !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!device.is_trusted && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTrustDevice(device.id)}
                                className="text-xs"
                              >
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Trust
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeviceToRemove(device.id)}
                              className="text-xs text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Alerts Section */}
      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-primary" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center font-medium">
                  {unreadAlertCount > 9 ? "9+" : unreadAlertCount}
                </span>
              )}
            </div>
            <div className="text-left">
              <h3 className="font-medium text-foreground">Security Alerts</h3>
              <p className="text-xs text-muted-foreground">
                {unreadAlertCount > 0
                  ? `${unreadAlertCount} unread alert${unreadAlertCount !== 1 ? "s" : ""}`
                  : "No new alerts"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadAlertCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAlertsAsRead();
                }}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            {showAlerts ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {showAlerts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/50"
            >
              {alerts.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No security alerts
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/30 max-h-80 overflow-y-auto">
                  {alerts.map((alert) => (
                    <button
                      key={alert.id}
                      onClick={() => !alert.is_read && markAlertAsRead(alert.id)}
                      className={`w-full p-4 text-left hover:bg-muted/20 transition-colors ${
                        !alert.is_read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getAlertIcon(alert.alert_type)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm ${
                                !alert.is_read
                                  ? "font-medium text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {alert.title}
                            </span>
                            {!alert.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {alert.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(alert.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Remove Device Dialog */}
      <AlertDialog open={!!deviceToRemove} onOpenChange={() => setDeviceToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this device? If it's still logged in,
              the session will remain active until it expires or the user logs out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveDevice}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LoginSecurityPanel;
