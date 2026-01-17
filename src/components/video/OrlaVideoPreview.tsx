import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  CameraOff,
  Minimize2,
  Maximize2,
  Settings,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrlaVideoPreviewProps {
  isConversationActive: boolean;
  isSpeaking?: boolean;
  className?: string;
}

const OrlaVideoPreview: React.FC<OrlaVideoPreviewProps> = ({
  isConversationActive,
  isSpeaking = false,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    // Check for multiple cameras
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameras = devices.filter((d) => d.kind === "videoinput");
      setHasMultipleCameras(cameras.length > 1);
    });
  }, []);

  useEffect(() => {
    if (isEnabled && isConversationActive) {
      startCamera();
    } else if (stream) {
      stopCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isEnabled, isConversationActive, facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: facingMode,
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Failed to start camera:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggleCamera = () => {
    setIsEnabled(!isEnabled);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  if (!isConversationActive) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={cn(
          "fixed z-40",
          isExpanded ? "bottom-24 right-4" : "bottom-24 right-4",
          className
        )}
      >
        {!isEnabled ? (
          // Collapsed state - just a button
          <Button
            size="sm"
            variant="secondary"
            className="gap-2 shadow-lg"
            onClick={toggleCamera}
          >
            <Camera className="w-4 h-4" />
            Enable Camera
          </Button>
        ) : (
          // Camera preview
          <motion.div
            layout
            className={cn(
              "bg-black/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-white/10",
              isExpanded ? "w-80" : "w-48"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-black/50">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  {stream && (
                    <motion.div
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
                <span className="text-xs text-white/80">Your Camera</span>
              </div>
              <div className="flex items-center gap-1">
                {hasMultipleCameras && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-white/60 hover:text-white"
                    onClick={switchCamera}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-white/60 hover:text-white"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <Minimize2 className="w-3 h-3" />
                  ) : (
                    <Maximize2 className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Video preview */}
            <div className={cn("relative", isExpanded ? "h-60" : "h-36")}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover",
                  facingMode === "user" && "transform scale-x-[-1]"
                )}
              />

              {/* Speaking indicator overlay */}
              <AnimatePresence>
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <div className="absolute inset-0 border-2 border-primary/50 rounded-lg animate-pulse" />
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary/80 px-2 py-1 rounded-full">
                      <Sparkles className="w-3 h-3 text-white" />
                      <span className="text-[10px] text-white font-medium">Orla is speaking</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No stream fallback */}
              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <CameraOff className="w-8 h-8 text-white/40" />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 p-2 bg-black/50">
              <Button
                size="sm"
                variant="destructive"
                className="text-xs h-8"
                onClick={toggleCamera}
              >
                <CameraOff className="w-3 h-3 mr-1" />
                Disable
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default OrlaVideoPreview;
