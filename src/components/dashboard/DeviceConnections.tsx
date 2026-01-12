import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Watch, Heart, Wifi, WifiOff, Check, X, Settings, 
  RefreshCw, Zap, Link2, Activity, Bluetooth
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useWearables, type WearableProvider } from "@/hooks/useWearables";
import { useBluetooth } from "@/hooks/useBluetooth";

interface Device {
  id: string;
  name: string;
  type: string;
  icon: any;
  color: string;
  connected: boolean;
  lastSync?: string;
  batteryLevel?: number;
  features: string[];
  provider?: WearableProvider;
  connectionType: "bluetooth" | "oauth";
}

const DeviceConnections = () => {
  const { 
    connections, 
    wellnessData, 
    loading, 
    syncing,
    connect, 
    disconnect, 
    syncData, 
  } = useWearables();

  const bluetooth = useBluetooth();

  const [devices, setDevices] = useState<Device[]>([
    {
      id: "heart-rate-monitor",
      name: "Heart Rate Monitor",
      type: "Bluetooth",
      icon: Heart,
      color: "rose",
      connected: false,
      features: ["Real-time HR", "HRV Tracking", "Session Stats", "Wellness Insights"],
      connectionType: "bluetooth",
    },
    {
      id: "oura-ring",
      name: "Oura Ring",
      type: "Gen 3",
      icon: Heart,
      color: "rose",
      connected: false,
      features: ["Sleep Tracking", "Readiness Score", "Activity Insights", "Wellness Recommendations"],
      provider: "oura",
      connectionType: "oauth",
    },
    {
      id: "whoop",
      name: "WHOOP Band",
      type: "4.0",
      icon: Activity,
      color: "emerald",
      connected: false,
      features: ["Strain Coach", "Recovery Score", "Sleep Performance", "HRV Monitoring"],
      provider: "whoop",
      connectionType: "oauth",
    },
  ]);

  // Update devices based on real connections (OAuth)
  useEffect(() => {
    setDevices((prev) =>
      prev.map((device) => {
        if (device.provider) {
          const conn = connections.find((c) => c.provider === device.provider);
          if (conn) {
            return {
              ...device,
              connected: true,
              lastSync: conn.last_sync_at || undefined,
            };
          } else {
            return { ...device, connected: false, lastSync: undefined };
          }
        }
        return device;
      })
    );
  }, [connections]);

  // Update Bluetooth device status
  const isBluetoothConnected = !!bluetooth.connectedDevice?.connected;
  
  useEffect(() => {
    setDevices((prev) =>
      prev.map((device) => {
        if (device.connectionType === "bluetooth") {
          return {
            ...device,
            connected: isBluetoothConnected,
            batteryLevel: bluetooth.connectedDevice?.batteryLevel ?? undefined,
            lastSync: isBluetoothConnected ? new Date().toISOString() : undefined,
            type: bluetooth.connectedDevice?.name || "Bluetooth",
          };
        }
        return device;
      })
    );
  }, [isBluetoothConnected, bluetooth.connectedDevice]);

  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);
  const [settingsDevice, setSettingsDevice] = useState<Device | null>(null);
  const [syncingDevice, setSyncingDevice] = useState<string | null>(null);

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    primary: { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
    rose: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
    violet: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-400" },
  };

  const handleConnect = async (device: Device) => {
    setConnectingDevice(device.id);
    
    try {
      if (device.connectionType === "bluetooth") {
        await bluetooth.scanAndConnect();
      } else if (device.provider) {
        await connect(device.provider);
      }
    } catch (error: any) {
      toast.error("Connection failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setConnectingDevice(null);
    }
  };

  const handleDisconnect = async (device: Device) => {
    try {
      if (device.connectionType === "bluetooth") {
        bluetooth.disconnect();
        toast.success("Bluetooth device disconnected");
      } else if (device.provider) {
        await disconnect(device.provider);
      }
    } catch (error: any) {
      toast.error("Disconnect failed", {
        description: error.message,
      });
    }
  };

  const handleSync = async (device: Device) => {
    if (device.connectionType === "bluetooth") {
      toast.info("Bluetooth data syncs automatically in real-time");
      return;
    }
    
    if (device.provider) {
      setSyncingDevice(device.id);
      try {
        await syncData(device.provider);
      } finally {
        setSyncingDevice(null);
      }
    }
  };

  const connectedCount = devices.filter((d) => d.connected).length;

  // Wellness data display for connected health devices
  const renderWellnessCard = () => {
    // Show Bluetooth health data if connected
    if (isBluetoothConnected && bluetooth.healthData) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 rounded-xl mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bluetooth className="w-5 h-5 text-rose-400" />
              <h3 className="font-medium text-foreground">Live Heart Rate</h3>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Real-time
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Heart Rate */}
            <div className="text-center">
              <motion.div 
                className="text-3xl font-semibold text-rose-400 mb-1"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {bluetooth.healthData.heartRate || "--"}
              </motion.div>
              <span className="text-xs text-muted-foreground">BPM</span>
            </div>

            {/* HRV */}
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground mb-1">
                {bluetooth.healthData.heartRateVariability?.toFixed(0) || "--"}
              </div>
              <span className="text-xs text-muted-foreground">HRV (ms)</span>
            </div>

            {/* Battery */}
            <div className="text-center">
              <div className="text-2xl font-semibold text-foreground mb-1">
                {bluetooth.connectedDevice?.batteryLevel || "--"}%
              </div>
              <span className="text-xs text-muted-foreground">Battery</span>
            </div>

            {/* Device */}
            <div className="text-center">
              <div className="text-sm font-medium text-foreground mb-1 truncate">
                {bluetooth.connectedDevice?.name || "Unknown"}
              </div>
              <span className="text-xs text-muted-foreground">Device</span>
            </div>
          </div>
        </motion.div>
      );
    }

    // Show OAuth wellness data
    if (!wellnessData) return null;

    const isOura = wellnessData.provider === "oura";
    const mainScore = isOura ? wellnessData.readiness_score : wellnessData.recovery_score;
    const mainLabel = isOura ? "Readiness" : "Recovery";
    const secondaryScore = isOura ? wellnessData.sleep_score : wellnessData.strain_score;
    const secondaryLabel = isOura ? "Sleep" : "Strain";

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-foreground">Today's Wellness</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {wellnessData.provider === "oura" ? "Oura Ring" : "WHOOP"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Main Score */}
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-secondary"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${(mainScore || 0) * 1.76} 176`}
                  className="text-primary"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-foreground">
                {mainScore || "--"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{mainLabel}</span>
          </div>

          {/* Secondary Score */}
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground mb-1">
              {isOura ? secondaryScore || "--" : secondaryScore?.toFixed(1) || "--"}
            </div>
            <span className="text-xs text-muted-foreground">{secondaryLabel}</span>
          </div>

          {/* HRV */}
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground mb-1">
              {wellnessData.hrv_avg || "--"}
            </div>
            <span className="text-xs text-muted-foreground">HRV (ms)</span>
          </div>

          {/* Sleep */}
          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground mb-1">
              {wellnessData.sleep_hours?.toFixed(1) || "--"}h
            </div>
            <span className="text-xs text-muted-foreground">Sleep</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Check if Bluetooth is supported
  const bluetoothSupported = bluetooth.isSupported;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Connected Devices</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {connectedCount} of {devices.length} devices connected
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-xs text-primary font-medium">LIVE SYNC</span>
        </div>
      </div>

      {/* Bluetooth Support Warning */}
      {!bluetoothSupported && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-400">
            Web Bluetooth is not supported in this browser. For Bluetooth device connections, 
            please use Chrome, Edge, or Opera on desktop, or Chrome on Android.
          </p>
        </div>
      )}

      {/* Connection Status Bar */}
      <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(connectedCount / devices.length) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
        />
      </div>

      {/* Wellness Data Card */}
      {renderWellnessCard()}

      {/* Devices Grid */}
      <div className="grid gap-4">
        {devices.map((device) => {
          const colors = colorClasses[device.color];
          const Icon = device.icon;
          const isConnecting = connectingDevice === device.id || 
            (device.connectionType === "bluetooth" && bluetooth.isScanning);
          const isSyncing = syncingDevice === device.id || syncing === device.provider;
          const isBluetoothDevice = device.connectionType === "bluetooth";
          const isDisabled = isBluetoothDevice && !bluetoothSupported;

          return (
            <motion.div
              key={device.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 bg-secondary/20 border rounded-xl transition-all ${
                device.connected ? "border-primary/30" : "border-border/30"
              } ${isDisabled ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Device Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center relative`}
                  >
                    {isBluetoothDevice ? (
                      <Bluetooth className={`w-7 h-7 ${colors.text}`} />
                    ) : (
                      <Icon className={`w-7 h-7 ${colors.text}`} />
                    )}
                    {device.connected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Device Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium text-foreground">{device.name}</h3>
                      <span className="text-xs text-muted-foreground">{device.type}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isBluetoothDevice 
                          ? "bg-blue-500/10 text-blue-400" 
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {isBluetoothDevice ? "Bluetooth" : "OAuth"}
                      </span>
                    </div>
                    
                    {device.connected ? (
                      <div className="flex items-center gap-4 mt-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Wifi className="w-3.5 h-3.5" />
                          <span className="text-xs">Connected</span>
                        </div>
                        {device.batteryLevel && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <div className="w-5 h-2.5 border border-muted-foreground/50 rounded-sm relative">
                              <div
                                className={`h-full rounded-sm ${
                                  device.batteryLevel > 20 ? "bg-emerald-500" : "bg-red-500"
                                }`}
                                style={{ width: `${device.batteryLevel}%` }}
                              />
                            </div>
                            <span className="text-xs">{device.batteryLevel}%</span>
                          </div>
                        )}
                        {device.lastSync && (
                          <span className="text-xs text-muted-foreground">
                            Synced: {new Date(device.lastSync).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-muted-foreground mt-1.5">
                        <WifiOff className="w-3.5 h-3.5" />
                        <span className="text-xs">Not connected</span>
                      </div>
                    )}

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {device.features.slice(0, 3).map((feature) => (
                        <span
                          key={feature}
                          className={`text-[10px] px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
                        >
                          {feature}
                        </span>
                      ))}
                      {device.features.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground">
                          +{device.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {device.connected ? (
                    <>
                      {!isBluetoothDevice && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSync(device)}
                          disabled={isSyncing}
                          className="h-9 w-9"
                        >
                          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSettingsDevice(device)}
                        className="h-9 w-9"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(device)}
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect(device)}
                      disabled={isConnecting || isDisabled}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {isBluetoothDevice ? "Scanning..." : "Connecting..."}
                        </>
                      ) : (
                        <>
                          {isBluetoothDevice ? (
                            <Bluetooth className="w-4 h-4 mr-2" />
                          ) : (
                            <Link2 className="w-4 h-4 mr-2" />
                          )}
                          Connect
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Settings Dialog */}
      <Dialog open={!!settingsDevice} onOpenChange={() => setSettingsDevice(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {settingsDevice?.connectionType === "bluetooth" ? (
                <Bluetooth className="w-5 h-5 text-primary" />
              ) : settingsDevice && (
                <settingsDevice.icon className="w-5 h-5 text-primary" />
              )}
              {settingsDevice?.name} Settings
            </DialogTitle>
            <DialogDescription>
              Configure how {settingsDevice?.name} interacts with Aurelia
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Receive alerts on your device</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Auto Sync</p>
                <p className="text-xs text-muted-foreground">Sync data every 15 minutes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Haptic Feedback</p>
                <p className="text-xs text-muted-foreground">Vibrate for important updates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Wellness Integration</p>
                <p className="text-xs text-muted-foreground">Share health data with Orla</p>
              </div>
              <Switch />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSettingsDevice(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success("Settings saved!");
                setSettingsDevice(null);
              }}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Notice */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <p className="text-xs text-center text-primary/80">
          🔗 Bluetooth heart rate monitors connect directly. Oura Ring and WHOOP require OAuth authentication with real API credentials.
        </p>
      </div>
    </div>
  );
};

export default DeviceConnections;
