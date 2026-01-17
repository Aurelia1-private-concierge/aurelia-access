import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  Settings,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  stream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
}

interface VideoCallInterfaceProps {
  localStream: MediaStream | null;
  participants: Participant[];
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  onSettings?: () => void;
  className?: string;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  localStream,
  participants,
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  onSettings,
  className,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeParticipant, setActiveParticipant] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const mainParticipant = activeParticipant
    ? participants.find((p) => p.id === activeParticipant)
    : participants[0];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-xl overflow-hidden",
        isFullscreen ? "fixed inset-0 z-50" : "aspect-video",
        className
      )}
    >
      {/* Main video area */}
      <div className="absolute inset-0">
        {mainParticipant?.stream ? (
          <VideoStream stream={mainParticipant.stream} muted={false} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-primary" />
              </div>
              <p className="text-muted-foreground">Waiting for participants...</p>
            </div>
          </div>
        )}
      </div>

      {/* Participant name overlay */}
      {mainParticipant && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="text-sm text-white font-medium">{mainParticipant.name}</span>
        </div>
      )}

      {/* Participant thumbnails */}
      {participants.length > 1 && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {participants.slice(0, 4).map((participant) => (
            <motion.button
              key={participant.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "w-32 h-24 rounded-lg overflow-hidden border-2 transition-colors",
                activeParticipant === participant.id
                  ? "border-primary"
                  : "border-white/20 hover:border-white/40"
              )}
              onClick={() => setActiveParticipant(participant.id)}
            >
              {participant.stream ? (
                <VideoStream stream={participant.stream} muted className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted/80 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">{participant.name}</span>
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Local video (self-view) */}
      <motion.div
        className="absolute bottom-20 right-4 w-40 h-30 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl"
        drag
        dragConstraints={containerRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {localStream && isVideoEnabled ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-1 left-1 bg-black/50 px-1.5 py-0.5 rounded text-xs text-white">
          You
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
      >
        <div className="flex items-center justify-center gap-3">
          <Button
            size="lg"
            variant={isAudioEnabled ? "secondary" : "destructive"}
            className="rounded-full w-14 h-14"
            onClick={onToggleAudio}
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>

          <Button
            size="lg"
            variant={isVideoEnabled ? "secondary" : "destructive"}
            className="rounded-full w-14 h-14"
            onClick={onToggleVideo}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          <Button
            size="lg"
            variant="destructive"
            className="rounded-full w-14 h-14"
            onClick={onEndCall}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="rounded-full w-14 h-14"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
          </Button>

          {onSettings && (
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full w-14 h-14"
              onClick={onSettings}
            >
              <Settings className="w-6 h-6" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Helper component for video streams
interface VideoStreamProps {
  stream: MediaStream;
  muted?: boolean;
  className?: string;
}

const VideoStream: React.FC<VideoStreamProps> = ({ stream, muted = false, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
};

export default VideoCallInterface;
