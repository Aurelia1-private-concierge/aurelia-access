import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  HandMetal,
  ThumbsUp,
  ThumbsDown,
  Hand,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmotionData, GestureData, PresenceData } from "@/hooks/useOrlaVision";

interface OrlaVisionOverlayProps {
  emotionData: EmotionData;
  gestureData: GestureData;
  presenceData: PresenceData;
  isEnabled: boolean;
  showDebug?: boolean;
  className?: string;
}

const OrlaVisionOverlay: React.FC<OrlaVisionOverlayProps> = ({
  emotionData,
  gestureData,
  presenceData,
  isEnabled,
  showDebug = false,
  className,
}) => {
  const [recentGestures, setRecentGestures] = useState<string[]>([]);

  // Track gesture history for visualization
  useEffect(() => {
    if (gestureData.gesture !== "none") {
      setRecentGestures((prev) => [...prev.slice(-4), gestureData.gesture]);
    }
  }, [gestureData.gesture]);

  // Get emotion icon
  const getEmotionIcon = () => {
    switch (emotionData.primary) {
      case "happy":
        return <Smile className="w-5 h-5 text-green-400" />;
      case "sad":
        return <Frown className="w-5 h-5 text-blue-400" />;
      case "surprised":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "angry":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Meh className="w-5 h-5 text-muted-foreground" />;
    }
  };

  // Get gesture icon
  const getGestureIcon = () => {
    switch (gestureData.gesture) {
      case "wave":
        return <Hand className="w-5 h-5" />;
      case "thumbs_up":
        return <ThumbsUp className="w-5 h-5 text-green-400" />;
      case "thumbs_down":
        return <ThumbsDown className="w-5 h-5 text-red-400" />;
      case "peace":
        return <HandMetal className="w-5 h-5 text-purple-400" />;
      default:
        return null;
    }
  };

  if (!isEnabled) return null;

  return (
    <div className={cn("relative pointer-events-none", className)}>
      {/* Main status indicators */}
      <AnimatePresence>
        {presenceData.isPresent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-4 flex items-center gap-3"
          >
            {/* Presence indicator */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
              <motion.div
                animate={{
                  scale: presenceData.isLookingAtScreen ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className={cn(
                  "w-2 h-2 rounded-full",
                  presenceData.isLookingAtScreen
                    ? "bg-green-400"
                    : "bg-yellow-400"
                )}
              />
              <span className="text-xs text-white/80">
                {presenceData.isLookingAtScreen ? "Engaged" : "Looking away"}
              </span>
            </div>

            {/* Emotion indicator */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
              {getEmotionIcon()}
              <span className="text-xs text-white/80 capitalize">
                {emotionData.primary}
              </span>
              {emotionData.confidence > 0.7 && (
                <Sparkles className="w-3 h-3 text-primary" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gesture feedback */}
      <AnimatePresence>
        {gestureData.gesture !== "none" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              {getGestureIcon()}
              <span className="text-sm text-white capitalize">
                {gestureData.gesture.replace("_", " ")}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attention visualization */}
      {presenceData.isPresent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-white/60" />
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${presenceData.attentionLevel * 100}%` }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "h-full rounded-full",
                  presenceData.attentionLevel > 0.7
                    ? "bg-green-400"
                    : presenceData.attentionLevel > 0.4
                    ? "bg-yellow-400"
                    : "bg-red-400"
                )}
              />
            </div>
            <span className="text-xs text-white/60">
              {Math.round(presenceData.attentionLevel * 100)}%
            </span>
          </div>
        </motion.div>
      )}

      {/* Valence/Arousal visualization */}
      {showDebug && presenceData.isPresent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-16 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3"
        >
          <div className="text-xs text-white/60 space-y-1">
            <div className="flex justify-between gap-4">
              <span>Valence:</span>
              <span
                className={cn(
                  emotionData.valence > 0 ? "text-green-400" : "text-red-400"
                )}
              >
                {emotionData.valence.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Arousal:</span>
              <span className="text-blue-400">
                {emotionData.arousal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Session:</span>
              <span className="text-white/80">
                {Math.floor(presenceData.sessionDuration / 60)}m{" "}
                {presenceData.sessionDuration % 60}s
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Secondary emotions */}
      {emotionData.secondaryEmotions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-16 left-4 flex flex-wrap gap-1"
        >
          {emotionData.secondaryEmotions.map((e, i) => (
            <span
              key={i}
              className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full"
            >
              {e.emotion} ({Math.round(e.confidence * 100)}%)
            </span>
          ))}
        </motion.div>
      )}

      {/* Recent gestures trail */}
      {recentGestures.length > 0 && (
        <div className="absolute top-16 right-4 flex gap-1">
          {recentGestures.map((gesture, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0.2 + i * 0.15, scale: 0.8 + i * 0.05 }}
              className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center"
            >
              <span className="text-[8px] text-white/60">
                {gesture.charAt(0).toUpperCase()}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Face not detected warning */}
      <AnimatePresence>
        {!presenceData.isPresent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-center">
              <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-white/80">Looking for you...</p>
              <p className="text-xs text-white/50 mt-1">
                Position yourself in front of the camera
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrlaVisionOverlay;
