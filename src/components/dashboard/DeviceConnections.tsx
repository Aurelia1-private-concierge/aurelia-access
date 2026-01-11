import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Watch, Heart, Fingerprint, Glasses, Smartphone, Wifi,
  WifiOff, Check, X, Settings, RefreshCw, Zap, Link2
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
}

const DeviceConnections = () => {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "apple-watch",
      name: "Apple Watch",
      type: "Series 9",
      icon: Watch,
      color: "primary",
      connected: false,
      features: ["Quick Requests", "Credit Balance", "Haptic Notifications", "Siri Shortcuts"],
    },
    {
      id: "vision-pro",
      name: "Vision Pro",
      type: "Spatial Computing",
      icon: Glasses,
      color: "cyan",
      connected: false,
      features: ["Property Tours", "Yacht Walkthroughs", "Gesture Control", "Eye Tracking"],
    },
    {
      id: "oura-ring",
      name: "Oura Ring",
      type: "Gen 3",
      icon: Heart,
      color: "rose",
      connected: false,
      features: ["Sleep Tracking", "Readiness Score", "Activity Insights", "Wellness Recommendations"],
    },
    {
      id: "whoop",
      name: "WHOOP Band",
      type: "4.0",
      icon: Heart,
      color: "emerald",
      connected: false,
      features: ["Strain Coach", "Recovery Score", "Sleep Performance", "HRV Monitoring"],
    },
    {
      id: "nfc-ring",
      name: "NFC Smart Ring",
      type: "Aurelia Edition",
      icon: Fingerprint,
      color: "violet",
      connected: false,
      features: ["Venue Access", "Member Verification", "Secure Payments", "Digital Keys"],
    },
  ]);

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

  const handleConnect = async (deviceId: string) => {
    setConnectingDevice(deviceId);
    
    // Simulate connection process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              connected: true,
              lastSync: new Date().toISOString(),
              batteryLevel: Math.floor(Math.random() * 40) + 60,
            }
          : d
      )
    );
    
    setConnectingDevice(null);
    toast.success("Device connected successfully!", {
      description: "Your device is now synced with Aurelia.",
    });
  };

  const handleDisconnect = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? { ...d, connected: false, lastSync: undefined, batteryLevel: undefined }
          : d
      )
    );
    toast.info("Device disconnected");
  };

  const handleSync = async (deviceId: string) => {
    setSyncingDevice(deviceId);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId ? { ...d, lastSync: new Date().toISOString() } : d
      )
    );
    
    setSyncingDevice(null);
    toast.success("Device synced!");
  };

  const connectedCount = devices.filter((d) => d.connected).length;

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
          <span className="text-xs text-primary font-medium">DEMO MODE</span>
        </div>
      </div>

      {/* Connection Status Bar */}
      <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(connectedCount / devices.length) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
        />
      </div>

      {/* Devices Grid */}
      <div className="grid gap-4">
        {devices.map((device) => {
          const colors = colorClasses[device.color];
          const Icon = device.icon;
          const isConnecting = connectingDevice === device.id;
          const isSyncing = syncingDevice === device.id;

          return (
            <motion.div
              key={device.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 bg-secondary/20 border rounded-xl transition-all ${
                device.connected ? "border-primary/30" : "border-border/30"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Device Icon */}
                  <div
                    className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center relative`}
                  >
                    <Icon className={`w-7 h-7 ${colors.text}`} />
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
                            Last sync: {new Date(device.lastSync).toLocaleTimeString()}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSync(device.id)}
                        disabled={isSyncing}
                        className="h-9 w-9"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                      </Button>
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
                        onClick={() => handleDisconnect(device.id)}
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect(device.id)}
                      disabled={isConnecting}
                      className="bg-gradient-to-r from-primary to-primary/80"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4 mr-2" />
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
              {settingsDevice && <settingsDevice.icon className="w-5 h-5 text-primary" />}
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

      {/* Demo Notice */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <p className="text-xs text-center text-primary/80">
          🔗 Device connections are simulated in demo mode. Real device pairing will be available with your membership.
        </p>
      </div>
    </div>
  );
};

export default DeviceConnections;
