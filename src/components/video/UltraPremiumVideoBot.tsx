import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  MessageSquare,
  Wand2,
  Crown,
  Zap,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMultiAgent } from "@/hooks/useMultiAgent";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface UltraPremiumVideoBotProps {
  className?: string;
  onClose?: () => void;
  initialMode?: "minimized" | "expanded" | "fullscreen";
}

const UltraPremiumVideoBot: React.FC<UltraPremiumVideoBotProps> = ({
  className,
  onClose,
  initialMode = "expanded",
}) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"minimized" | "expanded" | "fullscreen">(initialMode);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showTranscript, setShowTranscript] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const {
    mode,
    isConnected,
    isListening,
    isSpeaking,
    isProcessing,
    messages,
    startVoiceSession,
    endVoiceSession,
    sendChatMessage,
    switchMode,
    getInputVolume,
    getOutputVolume,
  } = useMultiAgent({
    onMessage: () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Audio visualization
  useEffect(() => {
    let animationId: number;
    
    const updateAudioLevel = () => {
      if (mode === "voice" && isConnected) {
        const inputVol = getInputVolume();
        const outputVol = getOutputVolume();
        setAudioLevel(Math.max(inputVol, outputVol));
      }
      animationId = requestAnimationFrame(updateAudioLevel);
    };
    
    if (mode === "voice" && isConnected) {
      updateAudioLevel();
    }
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [mode, isConnected, getInputVolume, getOutputVolume]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        },
      });
      setLocalStream(stream);
      if (videoRef.current) {
        // Set mobile-required attributes before assigning source
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.srcObject = stream;
        
        // Explicitly play the video
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error("Video playback failed:", playError);
          // Video will still show, just won't autoplay
        }
      }
      setIsVideoEnabled(true);
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Camera access required for video features");
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setIsVideoEnabled(false);
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (isVideoEnabled) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isVideoEnabled, startCamera, stopCamera]);

  // Handle voice toggle
  const handleVoiceToggle = useCallback(async () => {
    if (mode === "voice" && isConnected) {
      await endVoiceSession();
    } else {
      await switchMode("voice");
    }
  }, [mode, isConnected, endVoiceSession, switchMode]);

  // Handle text submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    
    const text = inputText;
    setInputText("");
    await sendChatMessage(text);
  }, [inputText, isProcessing, sendChatMessage]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (viewMode === "fullscreen") {
      await document.exitFullscreen?.();
      setViewMode("expanded");
    } else {
      await containerRef.current?.requestFullscreen?.();
      setViewMode("fullscreen");
    }
  }, [viewMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (mode === "voice" && isConnected) {
        endVoiceSession();
      }
    };
  }, []);

  const orbGlow = isSpeaking ? "from-primary via-primary/50 to-primary/20" : 
                  isListening ? "from-emerald-500 via-emerald-500/50 to-emerald-500/20" :
                  "from-muted-foreground/30 via-muted-foreground/20 to-transparent";

  if (viewMode === "minimized") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("fixed bottom-24 right-4 z-50", className)}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewMode("expanded")}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-background via-card to-background border border-primary/30 flex items-center justify-center overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <Crown className="w-7 h-7 text-primary relative z-10" />
            {isConnected && (
              <motion.div
                className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        "bg-gradient-to-br from-background via-card/95 to-background backdrop-blur-2xl border border-primary/20 shadow-2xl overflow-hidden",
        viewMode === "fullscreen" 
          ? "fixed inset-0 z-50 rounded-none" 
          : "fixed bottom-4 right-4 z-50 rounded-3xl w-[420px] max-h-[700px]",
        className
      )}
    >
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial", orbGlow)}
          animate={{
            scale: isSpeaking ? [1, 1.1, 1] : isListening ? [1, 1.05, 1] : 1,
            opacity: isConnected ? 0.3 : 0.1,
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-[url('/diamond-pattern.svg')] opacity-[0.02]" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 py-4 border-b border-primary/10 bg-gradient-to-r from-background/80 to-card/80">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            {isConnected && (
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Orla Video Concierge
              <Crown className="w-3.5 h-3.5 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground">
              {isSpeaking ? "Speaking..." : isListening ? "Listening..." : isConnected ? "Connected" : "Ready to assist"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setViewMode("minimized")}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={toggleFullscreen}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video/Avatar Area */}
      <div className="relative aspect-video bg-gradient-to-b from-muted/30 to-background/50 overflow-hidden">
        {isVideoEnabled && localStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
            onLoadedMetadata={() => {
              // Ensure video plays when metadata is loaded
              videoRef.current?.play().catch(() => {});
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* AI Avatar Visualization */}
            <div className="relative">
              {/* Outer rings */}
              <motion.div
                className="absolute inset-0 -m-16 rounded-full border border-primary/20"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 -m-12 rounded-full border border-primary/30"
                animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
              
              {/* Audio reactive ring */}
              <motion.div
                className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-primary/30 via-transparent to-primary/30"
                animate={{ 
                  scale: 1 + audioLevel * 0.3,
                  opacity: 0.2 + audioLevel * 0.4,
                }}
              />
              
              {/* Main orb */}
              <motion.div
                className="relative w-32 h-32 rounded-full overflow-hidden"
                animate={{ 
                  scale: isSpeaking ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 0.3, repeat: isSpeaking ? Infinity : 0 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                
                {/* Inner glow */}
                <motion.div
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-white/20 to-transparent"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 className="w-12 h-12 text-white/90" />
                </div>
                
                {/* Speaking waves */}
                <AnimatePresence>
                  {isSpeaking && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 rounded-full border-2 border-white/40"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Status indicator */}
              <motion.div
                className={cn(
                  "absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-medium",
                  isSpeaking ? "bg-primary text-primary-foreground" :
                  isListening ? "bg-emerald-500 text-primary-foreground" :
                  isConnected ? "bg-accent text-accent-foreground" :
                  "bg-muted text-muted-foreground"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {isSpeaking ? "Speaking" : isListening ? "Listening" : isConnected ? "Connected" : "Standby"}
              </motion.div>
            </div>
          </div>
        )}
        
        {/* Video overlay controls */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Button
            size="sm"
            variant={isVideoEnabled ? "default" : "secondary"}
            className="h-8 gap-1.5"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
            <span className="text-xs">{isVideoEnabled ? "On" : "Off"}</span>
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="h-48 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-transparent to-muted/10">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Your exclusive AI concierge awaits
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Speak or type to begin
              </p>
            </motion.div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/80 text-foreground rounded-bl-md border border-border"
                  )}
                >
                  {message.role === "agent" ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                  {message.isStreaming && (
                    <motion.span
                      className="inline-block w-1.5 h-4 bg-primary ml-1 rounded-full"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-primary/10 bg-gradient-to-b from-card/50 to-background/80">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your request..."
              disabled={isProcessing}
              className="w-full h-11 px-4 pr-12 bg-muted/50 border border-primary/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              disabled={!inputText.trim() || isProcessing}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
            >
              <Zap className="w-4 h-4" />
            </Button>
          </div>
        </form>
        
        {/* Control buttons */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <Button
            size="lg"
            variant={mode === "voice" && isConnected ? "default" : "secondary"}
            className={cn(
              "rounded-full w-12 h-12 transition-all",
              mode === "voice" && isConnected && "bg-primary shadow-lg shadow-primary/30"
            )}
            onClick={handleVoiceToggle}
            disabled={isProcessing && mode !== "voice"}
          >
            {mode === "voice" && isConnected ? (
              <PhoneOff className="w-5 h-5" />
            ) : (
              <Phone className="w-5 h-5" />
            )}
          </Button>
          
          <Button
            size="lg"
            variant={!isMuted ? "secondary" : "destructive"}
            className="rounded-full w-12 h-12"
            onClick={() => setIsMuted(!isMuted)}
            disabled={mode !== "voice" || !isConnected}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            className="rounded-full w-12 h-12"
            onClick={() => setShowTranscript(!showTranscript)}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          
          {onClose && (
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full w-12 h-12 text-destructive hover:bg-destructive/10"
              onClick={onClose}
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Premium badge */}
      <div className="absolute top-16 left-4 flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-border">
        <Crown className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-medium text-primary">ULTRA PREMIUM</span>
      </div>
    </motion.div>
  );
};

export default UltraPremiumVideoBot;
