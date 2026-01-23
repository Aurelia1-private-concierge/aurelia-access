import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Brain,
  Sparkles,
  Wifi,
  WifiOff,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Watch,
  ArrowRightLeft,
  Search,
  MessageSquare,
  Lightbulb,
  Target,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useOrlaVision, EmotionData } from "@/hooks/useOrlaVision";
import { useOrlaIQ, IQMode, ThinkingStep } from "@/hooks/useOrlaIQ";
import { useOrlaEquipment, DeviceInfo } from "@/hooks/useOrlaEquipment";
import MotionTrackedAvatar from "./MotionTrackedAvatar";
import Orla3DAvatar from "./Orla3DAvatar";
import OrlaAnimatedAvatar from "./OrlaAnimatedAvatar";

export type AvatarMode = "3d" | "2d" | "abstract" | "minimal";

interface OrlaUltimateProps {
  onMessage?: (message: string) => void;
  onEmotionChange?: (emotion: EmotionData) => void;
  className?: string;
}

const OrlaUltimate: React.FC<OrlaUltimateProps> = ({
  onMessage,
  onEmotionChange,
  className,
}) => {
  // Core states
  const [avatarMode, setAvatarMode] = useState<AvatarMode>("3d");
  const [isVisionEnabled, setIsVisionEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [showDevices, setShowDevices] = useState(false);

  // Hooks
  const vision = useOrlaVision(isVisionEnabled);
  const iq = useOrlaIQ({ enableMemory: true, enableResearch: true });
  const equipment = useOrlaEquipment({ enableSync: true, enableAR: true });

  // Refs
  const audioLevelRef = useRef(0);

  // Map emotion to Orla expression
  const getOrlaEmotion = useCallback((): "neutral" | "happy" | "thinking" | "curious" | "warm" | "concerned" | "urgent" => {
    if (iq.isThinking) return "thinking";
    
    const emotion = vision.emotionData.primary;
    switch (emotion) {
      case "happy":
        return "happy";
      case "surprised":
        return "curious";
      case "sad":
        return "concerned";
      case "angry":
        return "urgent";
      default:
        return vision.presenceData.isLookingAtScreen ? "warm" : "neutral";
    }
  }, [iq.isThinking, vision.emotionData.primary, vision.presenceData.isLookingAtScreen]);

  // Notify emotion changes
  useEffect(() => {
    onEmotionChange?.(vision.emotionData);
  }, [vision.emotionData, onEmotionChange]);

  // Toggle vision
  const toggleVision = useCallback(() => {
    if (isVisionEnabled) {
      vision.disableVision();
    } else {
      vision.enableVision();
    }
    setIsVisionEnabled(!isVisionEnabled);
  }, [isVisionEnabled, vision]);

  // Get device icon
  const getDeviceIcon = (type: DeviceInfo["type"]) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Smartphone className="w-4 h-4" />;
      case "desktop":
        return <Monitor className="w-4 h-4" />;
      case "wearable":
        return <Watch className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  // IQ Mode selector
  const IQModeSelector = () => (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={iq.mode === "standard" ? "default" : "ghost"}
            onClick={() => iq.setMode("standard")}
            className="h-8 px-3"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Standard Mode</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={iq.mode === "research" ? "default" : "ghost"}
            onClick={() => iq.setMode("research")}
            className="h-8 px-3"
          >
            <Search className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Research Mode</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={iq.mode === "reasoning" ? "default" : "ghost"}
            onClick={() => iq.setMode("reasoning")}
            className="h-8 px-3"
          >
            <Brain className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reasoning Mode</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={iq.mode === "creative" ? "default" : "ghost"}
            onClick={() => iq.setMode("creative")}
            className="h-8 px-3"
          >
            <Lightbulb className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Creative Mode</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={iq.mode === "executive" ? "default" : "ghost"}
            onClick={() => iq.setMode("executive")}
            className="h-8 px-3"
          >
            <Target className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Executive Mode</TooltipContent>
      </Tooltip>
    </div>
  );

  // Thinking visualization
  const ThinkingPanel = () => (
    <AnimatePresence>
      {iq.isThinking && iq.thinkingSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-muted/50 backdrop-blur-sm rounded-lg p-4 mt-4 border border-border/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Orla is thinking...</span>
          </div>
          <div className="space-y-2">
            {iq.thinkingSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5",
                  step.type === "analyzing" && "bg-blue-500/20 text-blue-400",
                  step.type === "researching" && "bg-purple-500/20 text-purple-400",
                  step.type === "reasoning" && "bg-amber-500/20 text-amber-400",
                  step.type === "synthesizing" && "bg-green-500/20 text-green-400",
                  step.type === "verifying" && "bg-cyan-500/20 text-cyan-400",
                )}>
                  {index + 1}
                </span>
                <span className="text-muted-foreground">{step.content}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Device panel
  const DevicePanel = () => (
    <AnimatePresence>
      {showDevices && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg p-3 z-50"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Connected Devices</span>
            <Badge variant="outline" className="text-xs">
              {equipment.connectedDevices.length + 1}
            </Badge>
          </div>

          <div className="space-y-2">
            {/* Current device */}
            {equipment.currentDevice && (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
                {getDeviceIcon(equipment.currentDevice.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {equipment.currentDevice.name}
                  </p>
                  <p className="text-xs text-muted-foreground">This device</p>
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  equipment.connectionQuality === "excellent" && "bg-green-500",
                  equipment.connectionQuality === "good" && "bg-green-400",
                  equipment.connectionQuality === "fair" && "bg-yellow-500",
                  equipment.connectionQuality === "poor" && "bg-red-500",
                )} />
              </div>
            )}

            {/* Other devices */}
            {equipment.connectedDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => equipment.transferToDevice(device.id)}
              >
                {getDeviceIcon(device.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{device.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Active {Math.floor((Date.now() - device.lastActive.getTime()) / 60000)}m ago
                  </p>
                </div>
                <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>

          {/* AR toggle */}
          {equipment.arCapabilities.isSupported && (
            <div className="mt-3 pt-3 border-t border-border">
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2"
                onClick={() => equipment.startARSession()}
              >
                <Layers className="w-4 h-4" />
                {equipment.arCapabilities.isActive ? "Exit AR" : "Enter AR Mode"}
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Vision status indicator
  const VisionStatus = () => (
    <div className="flex items-center gap-2">
      {isVisionEnabled && vision.faceData.faceDetected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs"
        >
          <Eye className="w-3 h-3" />
          <span>Seeing you</span>
          {vision.presenceData.isLookingAtScreen && (
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          )}
        </motion.div>
      )}

      {isVisionEnabled && !vision.faceData.faceDetected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full text-xs"
        >
          <EyeOff className="w-3 h-3" />
          <span>Looking for you...</span>
        </motion.div>
      )}

      {isVisionEnabled && vision.emotionData.primary !== "neutral" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs"
        >
          <Sparkles className="w-3 h-3" />
          <span className="capitalize">{vision.emotionData.primary}</span>
        </motion.div>
      )}
    </div>
  );

  return (
    <div className={cn("relative", className)}>
      {/* Main avatar container */}
      <div className="relative flex flex-col items-center">
        {/* Avatar mode selector */}
        <Tabs
          value={avatarMode}
          onValueChange={(v) => setAvatarMode(v as AvatarMode)}
          className="mb-4"
        >
          <TabsList className="bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="3d" className="text-xs">3D Avatar</TabsTrigger>
            <TabsTrigger value="2d" className="text-xs">2D Avatar</TabsTrigger>
            <TabsTrigger value="abstract" className="text-xs">Abstract</TabsTrigger>
            <TabsTrigger value="minimal" className="text-xs">Minimal</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Avatar display */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {avatarMode === "3d" && isVisionEnabled && vision.faceData.faceDetected ? (
              <motion.div
                key="motion-tracked"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <MotionTrackedAvatar
                  faceData={vision.faceData}
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  audioLevel={audioLevelRef.current}
                  size={280}
                />
              </motion.div>
            ) : avatarMode === "3d" ? (
              <motion.div
                key="3d"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Orla3DAvatar
                  isSpeaking={isSpeaking}
                  isConnected={true}
                  isListening={isListening}
                  emotion={getOrlaEmotion()}
                  size={280}
                />
              </motion.div>
            ) : avatarMode === "2d" ? (
              <motion.div
                key="2d"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <OrlaAnimatedAvatar
                  isSpeaking={isSpeaking}
                  isConnected={true}
                  size={280}
                />
              </motion.div>
            ) : avatarMode === "abstract" ? (
              <motion.div
                key="abstract"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-[280px] h-[280px] relative"
              >
                {/* Abstract orb visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: isSpeaking ? [1, 1.1, 1] : [1, 1.02, 1],
                      opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={{
                      duration: isSpeaking ? 0.3 : 2,
                      repeat: Infinity,
                    }}
                    className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/40 via-primary/60 to-primary/40 blur-xl"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-40 h-40 rounded-full border-2 border-primary/30"
                    style={{
                      borderTopColor: "hsl(var(--primary))",
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: iq.isThinking ? [1, 1.15, 1] : 1,
                    }}
                    transition={{
                      duration: 1,
                      repeat: iq.isThinking ? Infinity : 0,
                    }}
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 shadow-lg shadow-primary/30"
                  />
                </div>
                {/* Eyes in abstract mode */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-32 h-32">
                    <motion.div
                      animate={{
                        opacity: vision.faceData.isBlinking ? 0.2 : 1,
                        scaleY: vision.faceData.isBlinking ? 0.1 : 1,
                      }}
                      className="absolute left-6 top-10 w-4 h-4 bg-white rounded-full"
                    />
                    <motion.div
                      animate={{
                        opacity: vision.faceData.isBlinking ? 0.2 : 1,
                        scaleY: vision.faceData.isBlinking ? 0.1 : 1,
                      }}
                      className="absolute right-6 top-10 w-4 h-4 bg-white rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="minimal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-[280px] h-[280px] flex items-center justify-center"
              >
                <motion.div
                  animate={{
                    boxShadow: isSpeaking
                      ? [
                          "0 0 20px hsl(var(--primary) / 0.3)",
                          "0 0 40px hsl(var(--primary) / 0.5)",
                          "0 0 20px hsl(var(--primary) / 0.3)",
                        ]
                      : "0 0 20px hsl(var(--primary) / 0.2)",
                  }}
                  transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
                  className="w-24 h-24 rounded-full bg-primary flex items-center justify-center"
                >
                  <span className="text-4xl font-serif text-primary-foreground">O</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vision status */}
        <div className="mt-4">
          <VisionStatus />
        </div>

        {/* IQ Mode selector */}
        <div className="mt-4">
          <IQModeSelector />
        </div>

        {/* Thinking panel */}
        <ThinkingPanel />
      </div>

      {/* Control bar */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {/* Vision toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={isVisionEnabled ? "default" : "outline"}
              onClick={toggleVision}
            >
              {isVisionEnabled ? (
                <Camera className="w-4 h-4" />
              ) : (
                <CameraOff className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isVisionEnabled ? "Disable Vision" : "Enable Vision (Camera)"}
          </TooltipContent>
        </Tooltip>

        {/* Microphone toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={isListening ? "default" : "outline"}
              onClick={() => setIsListening(!isListening)}
            >
              {isListening ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isListening ? "Mute" : "Unmute"}
          </TooltipContent>
        </Tooltip>

        {/* Devices */}
        <div className="relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={showDevices ? "default" : "outline"}
                onClick={() => setShowDevices(!showDevices)}
              >
                {equipment.isOnline ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Devices & Sync</TooltipContent>
          </Tooltip>
          <DevicePanel />
        </div>

        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline">
              <Settings className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>

      {/* IQ Mode indicator */}
      <div className="mt-4 flex items-center justify-center">
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5",
            iq.mode === "standard" && "border-muted-foreground/50",
            iq.mode === "research" && "border-purple-500/50 text-purple-400",
            iq.mode === "reasoning" && "border-amber-500/50 text-amber-400",
            iq.mode === "creative" && "border-pink-500/50 text-pink-400",
            iq.mode === "executive" && "border-emerald-500/50 text-emerald-400",
          )}
        >
          <Zap className="w-3 h-3" />
          <span className="capitalize">{iq.mode} Mode</span>
        </Badge>
      </div>

      {/* Attention indicator */}
      {isVisionEnabled && vision.presenceData.isPresent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <div className="text-xs text-muted-foreground">
            Attention level: {Math.round(vision.presenceData.attentionLevel * 100)}%
          </div>
          <div className="w-32 h-1 mx-auto mt-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${vision.presenceData.attentionLevel * 100}%` }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OrlaUltimate;
