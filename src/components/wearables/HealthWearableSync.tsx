import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Moon, Zap, Activity, ChevronRight, 
  Brain, Sparkles, Bluetooth, BluetoothOff,
  AlertCircle, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBluetooth, type HealthData } from "@/hooks/useBluetooth";

const HealthWearableSync = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    isSupported, 
    isScanning, 
    connectedDevice, 
    healthData, 
    error,
    scanAndConnect, 
    disconnect 
  } = useBluetooth();

  const [sessionData, setSessionData] = useState<{
    avgHeartRate: number;
    maxHeartRate: number;
    minHeartRate: number;
    avgHRV: number;
    readings: number;
  }>({
    avgHeartRate: 0,
    maxHeartRate: 0,
    minHeartRate: 999,
    avgHRV: 0,
    readings: 0,
  });

  // Track session statistics
  useEffect(() => {
    if (healthData?.heartRate) {
      setSessionData(prev => {
        const newReadings = prev.readings + 1;
        const newAvgHR = Math.round(
          (prev.avgHeartRate * prev.readings + healthData.heartRate!) / newReadings
        );
        const newAvgHRV = healthData.heartRateVariability 
          ? Math.round((prev.avgHRV * prev.readings + healthData.heartRateVariability) / newReadings)
          : prev.avgHRV;

        return {
          avgHeartRate: newAvgHR,
          maxHeartRate: Math.max(prev.maxHeartRate, healthData.heartRate!),
          minHeartRate: Math.min(prev.minHeartRate, healthData.heartRate!),
          avgHRV: newAvgHRV,
          readings: newReadings,
        };
      });
    }
  }, [healthData]);

  // Reset session when disconnected
  useEffect(() => {
    if (!connectedDevice) {
      setSessionData({
        avgHeartRate: 0,
        maxHeartRate: 0,
        minHeartRate: 999,
        avgHRV: 0,
        readings: 0,
      });
    }
  }, [connectedDevice]);

  const getRecommendation = () => {
    if (!healthData?.heartRate) {
      return {
        text: "Connect your heart rate monitor to receive personalized recommendations.",
        suggestions: ["Polar H10", "Garmin HRM", "Wahoo TICKR"],
        color: "text-muted-foreground",
      };
    }

    const hr = healthData.heartRate;
    const hrv = healthData.heartRateVariability || 0;

    if (hr < 60 && hrv > 50) {
      return {
        text: "Excellent recovery state. You're ready for peak performance activities.",
        suggestions: ["Adventure travel", "Water sports", "Active experiences"],
        color: "text-emerald-400",
      };
    } else if (hr < 75 && hrv > 30) {
      return {
        text: "Good baseline. Balance activity with mindful experiences.",
        suggestions: ["Fine dining", "Cultural tours", "Yacht cruises"],
        color: "text-primary",
      };
    } else {
      return {
        text: "Focus on recovery. Prioritize wellness and relaxation.",
        suggestions: ["Spa treatments", "Meditation retreats", "Private beaches"],
        color: "text-amber-400",
      };
    }
  };

  const recommendation = getRecommendation();

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 px-5 py-3 bg-secondary/50 border border-border/30 rounded-xl hover:border-primary/30 transition-all group"
      >
        <div className={`w-10 h-10 rounded-full ${
          connectedDevice ? "bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border-emerald-500/40" : "bg-gradient-to-br from-rose-500/30 to-rose-500/10 border-rose-500/40"
        } border flex items-center justify-center relative`}>
          {connectedDevice ? (
            <Bluetooth className="w-5 h-5 text-emerald-400" />
          ) : (
            <Heart className="w-5 h-5 text-rose-400" />
          )}
          {connectedDevice && healthData?.heartRate && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-[8px] text-white font-bold">{healthData.heartRate}</span>
            </motion.div>
          )}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">
            {connectedDevice ? connectedDevice.name : "Health Wearables"}
          </p>
          <p className="text-xs text-muted-foreground">
            {connectedDevice 
              ? `${healthData?.heartRate || "--"} BPM • Live` 
              : "Bluetooth Heart Rate"
            }
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card border border-border/30 rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-rose-500/10 to-transparent border-b border-border/30">
                <div className="flex items-center gap-3 mb-2">
                  {connectedDevice ? (
                    <Bluetooth className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Heart className="w-6 h-6 text-rose-400" />
                  )}
                  <h3 className="text-lg font-serif text-foreground">
                    {connectedDevice ? "Live Health Data" : "Bluetooth Heart Rate"}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {connectedDevice 
                    ? `Connected to ${connectedDevice.name}` 
                    : "Connect your Bluetooth heart rate monitor"
                  }
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {!isSupported ? (
                  <div className="text-center py-8">
                    <BluetoothOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-medium text-foreground mb-2">Bluetooth Not Supported</h4>
                    <p className="text-sm text-muted-foreground">
                      Your browser doesn't support Web Bluetooth. Try using Chrome, Edge, or Opera on desktop.
                    </p>
                  </div>
                ) : !connectedDevice ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect any Bluetooth heart rate monitor for real-time health tracking:
                    </p>
                    
                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {["Polar H10", "Garmin HRM", "Wahoo TICKR", "WHOOP Band"].map((device) => (
                        <div key={device} className="p-3 bg-secondary/30 rounded-lg text-center">
                          <Heart className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">{device}</p>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={scanAndConnect}
                      disabled={isScanning}
                      className="w-full bg-gradient-to-r from-primary to-primary/80"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Bluetooth className="w-4 h-4 mr-2" />
                          Scan for Devices
                        </>
                      )}
                    </Button>

                    <p className="text-[10px] text-muted-foreground text-center">
                      Make sure your heart rate monitor is in pairing mode
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Live Heart Rate Display */}
                    <div className="text-center">
                      <motion.div
                        animate={{ scale: healthData?.heartRate ? [1, 1.05, 1] : 1 }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="relative w-32 h-32 mx-auto mb-4"
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/30" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold text-foreground">
                            {healthData?.heartRate || "--"}
                          </span>
                          <span className="text-xs text-muted-foreground">BPM</span>
                        </div>
                        {!healthData?.contactDetected && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded-full">
                            <span className="text-[10px] text-amber-400">No contact</span>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-secondary/30 rounded-xl">
                        <Activity className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">
                          {healthData?.heartRateVariability || "--"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">HRV (ms)</p>
                      </div>
                      <div className="text-center p-3 bg-secondary/30 rounded-xl">
                        <Moon className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">
                          {sessionData.avgHeartRate || "--"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Avg HR</p>
                      </div>
                      <div className="text-center p-3 bg-secondary/30 rounded-xl">
                        <Brain className="w-4 h-4 text-primary mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">
                          {sessionData.readings}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Readings</p>
                      </div>
                    </div>

                    {/* Session Stats */}
                    {sessionData.readings > 0 && (
                      <div className="p-3 bg-secondary/20 rounded-lg">
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                          <span>Session Range</span>
                          <span>{sessionData.minHeartRate} - {sessionData.maxHeartRate} BPM</span>
                        </div>
                        <Progress 
                          value={((healthData?.heartRate || 0) - 40) / 1.6} 
                          className="h-1.5" 
                        />
                      </div>
                    )}

                    {/* Battery Level */}
                    {connectedDevice.batteryLevel !== null && (
                      <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                        <span className="text-xs text-muted-foreground">Device Battery</span>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-3 border border-muted-foreground/50 rounded-sm relative">
                            <div
                              className={`h-full rounded-sm ${
                                connectedDevice.batteryLevel > 20 ? "bg-emerald-500" : "bg-red-500"
                              }`}
                              style={{ width: `${connectedDevice.batteryLevel}%` }}
                            />
                          </div>
                          <span className="text-xs text-foreground">{connectedDevice.batteryLevel}%</span>
                        </div>
                      </div>
                    )}

                    {/* AI Recommendation */}
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-primary">Orla's Recommendation</span>
                      </div>
                      <p className={`text-sm ${recommendation.color} mb-3`}>
                        {recommendation.text}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recommendation.suggestions.map((sug, i) => (
                          <span key={i} className="px-2 py-1 bg-secondary/50 rounded-lg text-[10px] text-muted-foreground">
                            {sug}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/30 bg-secondary/20 flex gap-2">
                {connectedDevice && (
                  <Button
                    variant="destructive"
                    onClick={disconnect}
                    className="flex-1"
                  >
                    Disconnect
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className={connectedDevice ? "flex-1" : "w-full"}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HealthWearableSync;
