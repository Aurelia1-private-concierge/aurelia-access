import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Moon, Zap, Activity, ChevronRight, 
  Brain, Thermometer, TrendingUp, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface HealthMetrics {
  sleepScore: number;
  recoveryScore: number;
  readinessScore: number;
  hrv: number;
  restingHR: number;
  bodyTemp: number;
}

const HealthWearableSync = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<"oura" | "whoop" | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Mock health data
  const [metrics] = useState<HealthMetrics>({
    sleepScore: 87,
    recoveryScore: 92,
    readinessScore: 85,
    hrv: 68,
    restingHR: 52,
    bodyTemp: 0.3,
  });

  const handleConnect = async (device: "oura" | "whoop") => {
    setSelectedDevice(device);
    setIsSyncing(true);
    
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSyncing(false);
    setIsConnected(true);
    toast.success(`Connected to ${device === "oura" ? "Oura Ring" : "WHOOP"}`);
  };

  const getRecommendation = () => {
    if (metrics.recoveryScore >= 90) {
      return {
        text: "You're at peak performance. Perfect for active experiences.",
        suggestions: ["Adventure travel", "Water sports", "Nightlife events"],
        color: "text-emerald-400",
      };
    } else if (metrics.recoveryScore >= 70) {
      return {
        text: "Good recovery. Balance activity with relaxation.",
        suggestions: ["Fine dining", "Art galleries", "Yacht cruises"],
        color: "text-primary",
      };
    } else {
      return {
        text: "Focus on recovery today. Prioritize wellness.",
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500/30 to-rose-500/10 border border-rose-500/40 flex items-center justify-center">
          <Heart className="w-5 h-5 text-rose-400" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">Health Wearables</p>
          <p className="text-xs text-muted-foreground">Oura Ring / WHOOP</p>
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
                  <Heart className="w-6 h-6 text-rose-400" />
                  <h3 className="text-lg font-serif text-foreground">Wellness Integration</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect your health wearable for personalized recommendations
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {!isConnected ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">Select your device:</p>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleConnect("oura")}
                      disabled={isSyncing}
                      className="w-full flex items-center gap-4 p-4 bg-secondary/50 border border-border/30 rounded-xl hover:border-primary/30 transition-all disabled:opacity-50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center">
                        <span className="text-lg">💍</span>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-foreground">Oura Ring</p>
                        <p className="text-xs text-muted-foreground">Sleep, Recovery, Activity</p>
                      </div>
                      {isSyncing && selectedDevice === "oura" && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Activity className="w-5 h-5 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleConnect("whoop")}
                      disabled={isSyncing}
                      className="w-full flex items-center gap-4 p-4 bg-secondary/50 border border-border/30 rounded-xl hover:border-primary/30 transition-all disabled:opacity-50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-800 to-teal-900 border border-teal-700 flex items-center justify-center">
                        <span className="text-lg">⌚</span>
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium text-foreground">WHOOP</p>
                        <p className="text-xs text-muted-foreground">Strain, Recovery, Sleep</p>
                      </div>
                      {isSyncing && selectedDevice === "whoop" && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Activity className="w-5 h-5 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-secondary/30 rounded-xl">
                        <Moon className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{metrics.sleepScore}</p>
                        <p className="text-[10px] text-muted-foreground">Sleep</p>
                      </div>
                      <div className="text-center p-3 bg-secondary/30 rounded-xl">
                        <Zap className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{metrics.recoveryScore}%</p>
                        <p className="text-[10px] text-muted-foreground">Recovery</p>
                      </div>
                      <div className="text-center p-3 bg-secondary/30 rounded-xl">
                        <Brain className="w-4 h-4 text-primary mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">{metrics.readinessScore}</p>
                        <p className="text-[10px] text-muted-foreground">Readiness</p>
                      </div>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-xs text-muted-foreground">HRV</span>
                        </div>
                        <span className="text-sm text-foreground">{metrics.hrv} ms</span>
                      </div>
                      <Progress value={metrics.hrv} className="h-1.5" />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-xs text-muted-foreground">Resting HR</span>
                        </div>
                        <span className="text-sm text-foreground">{metrics.restingHR} bpm</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs text-muted-foreground">Body Temp Deviation</span>
                        </div>
                        <span className="text-sm text-foreground">+{metrics.bodyTemp}°C</span>
                      </div>
                    </div>

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
              <div className="p-4 border-t border-border/30 bg-secondary/20">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  {isConnected ? "Close" : "Cancel"}
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