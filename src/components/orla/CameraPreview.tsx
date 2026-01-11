import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, Minimize2, Maximize2, Eye, EyeOff } from "lucide-react";
import { FaceData } from "@/hooks/useFaceTracking";
import { Button } from "@/components/ui/button";

interface CameraPreviewProps {
  faceData: FaceData;
  isActive: boolean;
  onToggle: () => void;
  showDebug?: boolean;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({
  faceData,
  isActive,
  onToggle,
  showDebug = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMinimized, setIsMinimized] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isActive && !isMinimized) {
      const getCamera = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, facingMode: "user" },
          });
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error("Failed to get camera preview:", err);
        }
      };
      getCamera();
    } else if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, isMinimized]);

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <Button
              size="sm"
              variant={isActive ? "default" : "secondary"}
              onClick={onToggle}
              className="gap-2"
            >
              {isActive ? (
                <>
                  <Camera className="h-4 w-4" />
                  <span className="text-xs">Tracking On</span>
                </>
              ) : (
                <>
                  <CameraOff className="h-4 w-4" />
                  <span className="text-xs">Enable Tracking</span>
                </>
              )}
            </Button>
            {isActive && (
              <Button
                size="icon"
                variant="outline"
                onClick={() => setIsMinimized(false)}
                className="h-8 w-8"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-black/80 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-green-400" />
                <span className="text-xs text-white/80">Face Tracking</span>
                {faceData.faceDetected && (
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowOverlay(!showOverlay)}
                  className="h-6 w-6"
                >
                  {showOverlay ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsMinimized(true)}
                  className="h-6 w-6"
                >
                  <Minimize2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Video preview */}
            <div className="relative w-80 h-60">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />

              {showOverlay && faceData.faceDetected && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Face indicator */}
                  <div 
                    className="absolute border-2 border-green-400/50 rounded-full"
                    style={{
                      left: '30%',
                      top: '20%',
                      width: '40%',
                      height: '60%',
                      transform: `rotate(${faceData.headRotationZ}deg)`,
                    }}
                  />

                  {/* Eye indicators */}
                  <div 
                    className="absolute w-4 h-4 border border-blue-400/70 rounded-full"
                    style={{
                      left: `calc(40% + ${faceData.eyeGazeX * 20}px)`,
                      top: `calc(35% + ${faceData.eyeGazeY * 20}px)`,
                      transform: `scaleY(${faceData.leftEyeOpenness})`,
                    }}
                  />
                  <div 
                    className="absolute w-4 h-4 border border-blue-400/70 rounded-full"
                    style={{
                      left: `calc(55% + ${faceData.eyeGazeX * 20}px)`,
                      top: `calc(35% + ${faceData.eyeGazeY * 20}px)`,
                      transform: `scaleY(${faceData.rightEyeOpenness})`,
                    }}
                  />

                  {/* Mouth indicator */}
                  <div 
                    className="absolute border border-pink-400/70 rounded-full"
                    style={{
                      left: '43%',
                      top: '65%',
                      width: `${20 + faceData.mouthWidth * 20}px`,
                      height: `${5 + faceData.mouthOpenness * 20}px`,
                    }}
                  />
                </div>
              )}

              {!faceData.faceDetected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <p className="text-white/60 text-sm">Position your face in frame</p>
                </div>
              )}
            </div>

            {/* Debug info */}
            {showDebug && faceData.faceDetected && (
              <div className="px-3 py-2 border-t border-white/10 text-xs text-white/60 grid grid-cols-2 gap-1">
                <div>Head X: {faceData.headRotationX.toFixed(1)}°</div>
                <div>Head Y: {faceData.headRotationY.toFixed(1)}°</div>
                <div>Mouth: {(faceData.mouthOpenness * 100).toFixed(0)}%</div>
                <div>Eyes: {((faceData.leftEyeOpenness + faceData.rightEyeOpenness) / 2 * 100).toFixed(0)}%</div>
                <div>Smile: {faceData.isSmiling ? "Yes" : "No"}</div>
                <div>Talking: {faceData.isTalking ? "Yes" : "No"}</div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 border-t border-white/10">
              <Button
                size="sm"
                variant={isActive ? "destructive" : "default"}
                onClick={onToggle}
                className="text-xs"
              >
                {isActive ? "Stop Tracking" : "Start Tracking"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CameraPreview;
