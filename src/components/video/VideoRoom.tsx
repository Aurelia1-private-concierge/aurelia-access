import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  Users,
  Copy,
  Check,
  Settings,
  ScreenShare,
  ScreenShareOff,
  Hand,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RoomParticipant {
  id: string;
  name: string;
  stream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

interface VideoRoomProps {
  roomId: string;
  roomName?: string;
  localStream: MediaStream | null;
  participants: RoomParticipant[];
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onLeaveRoom: () => void;
  onSendMessage?: (text: string) => void;
  messages?: ChatMessage[];
  onRaiseHand?: () => void;
  isHandRaised?: boolean;
  onShareScreen?: () => void;
  isScreenSharing?: boolean;
  className?: string;
}

const VideoRoom: React.FC<VideoRoomProps> = ({
  roomId,
  roomName = "Video Room",
  localStream,
  participants,
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onLeaveRoom,
  onSendMessage,
  messages = [],
  onRaiseHand,
  isHandRaised = false,
  onShareScreen,
  isScreenSharing = false,
  className,
}) => {
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [layout, setLayout] = useState<"grid" | "spotlight">("grid");
  const [spotlightId, setSpotlightId] = useState<string | null>(null);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    toast.success("Room link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = () => {
    if (chatInput.trim() && onSendMessage) {
      onSendMessage(chatInput.trim());
      setChatInput("");
    }
  };

  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 6) return "grid-cols-3";
    return "grid-cols-4";
  };

  const allParticipants: RoomParticipant[] = [
    {
      id: "local",
      name: "You",
      stream: localStream,
      isMuted: !isAudioEnabled,
      isVideoOff: !isVideoEnabled,
      isHandRaised: isHandRaised,
      isScreenSharing: isScreenSharing,
    },
    ...participants,
  ];

  return (
    <div className={cn("h-screen flex flex-col bg-background", className)}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg">{roomName}</h1>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={copyRoomLink}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="text-xs">{roomId}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowParticipants(!showParticipants)}
            className={showParticipants ? "bg-primary/10" : ""}
          >
            <Users className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChat(!showChat)}
            className={showChat ? "bg-primary/10" : ""}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4">
          {layout === "grid" ? (
            <div
              className={cn(
                "grid gap-4 h-full auto-rows-fr",
                getGridClass(allParticipants.length)
              )}
            >
              {allParticipants.map((participant) => (
                <ParticipantVideo
                  key={participant.id}
                  participant={participant}
                  isLocal={participant.id === "local"}
                  onClick={() => {
                    setSpotlightId(participant.id);
                    setLayout("spotlight");
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col gap-4">
              {/* Spotlight view */}
              <div className="flex-1">
                {spotlightId && (
                  <ParticipantVideo
                    participant={allParticipants.find((p) => p.id === spotlightId) || allParticipants[0]}
                    isLocal={spotlightId === "local"}
                    isSpotlight
                    onClick={() => setLayout("grid")}
                  />
                )}
              </div>
              
              {/* Thumbnail strip */}
              <div className="flex gap-2 overflow-x-auto py-2">
                {allParticipants
                  .filter((p) => p.id !== spotlightId)
                  .map((participant) => (
                    <div
                      key={participant.id}
                      className="w-32 h-24 flex-shrink-0 cursor-pointer"
                      onClick={() => setSpotlightId(participant.id)}
                    >
                      <ParticipantVideo
                        participant={participant}
                        isLocal={participant.id === "local"}
                        isThumbnail
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebars */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border bg-card overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Participants ({allParticipants.length})</h3>
              </div>
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="p-4 space-y-2">
                  {allParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {participant.name}
                          {participant.id === "local" && " (You)"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {participant.isMuted && <MicOff className="w-4 h-4 text-muted-foreground" />}
                        {participant.isVideoOff && <VideoOff className="w-4 h-4 text-muted-foreground" />}
                        {participant.isHandRaised && <Hand className="w-4 h-4 text-yellow-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}

          {showChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border bg-card overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Chat</h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{msg.senderName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Send a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>Send</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="p-4 bg-card border-t border-border">
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

          {onShareScreen && (
            <Button
              size="lg"
              variant={isScreenSharing ? "default" : "secondary"}
              className="rounded-full w-14 h-14"
              onClick={onShareScreen}
            >
              {isScreenSharing ? (
                <ScreenShareOff className="w-6 h-6" />
              ) : (
                <ScreenShare className="w-6 h-6" />
              )}
            </Button>
          )}

          {onRaiseHand && (
            <Button
              size="lg"
              variant={isHandRaised ? "default" : "secondary"}
              className="rounded-full w-14 h-14"
              onClick={onRaiseHand}
            >
              <Hand className={cn("w-6 h-6", isHandRaised && "text-yellow-500")} />
            </Button>
          )}

          <Button
            size="lg"
            variant="destructive"
            className="rounded-full w-14 h-14"
            onClick={onLeaveRoom}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Participant video component
interface ParticipantVideoProps {
  participant: RoomParticipant;
  isLocal?: boolean;
  isSpotlight?: boolean;
  isThumbnail?: boolean;
  onClick?: () => void;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  participant,
  isLocal = false,
  isSpotlight = false,
  isThumbnail = false,
  onClick,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div
      className={cn(
        "relative bg-muted rounded-xl overflow-hidden cursor-pointer group",
        isSpotlight ? "h-full" : isThumbnail ? "h-full" : "aspect-video",
        "border border-border hover:border-primary/50 transition-colors"
      )}
      onClick={onClick}
    >
      {participant.stream && !participant.isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            "w-full h-full object-cover",
            isLocal && "transform scale-x-[-1]"
          )}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-2xl font-medium">
              {participant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Overlay info */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white font-medium truncate">
            {participant.name}
            {isLocal && " (You)"}
          </span>
          <div className="flex items-center gap-1">
            {participant.isMuted && (
              <div className="w-6 h-6 rounded-full bg-destructive/80 flex items-center justify-center">
                <MicOff className="w-3 h-3 text-white" />
              </div>
            )}
            {participant.isHandRaised && (
              <div className="w-6 h-6 rounded-full bg-yellow-500/80 flex items-center justify-center">
                <Hand className="w-3 h-3 text-white" />
              </div>
            )}
            {participant.isScreenSharing && (
              <div className="w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center">
                <ScreenShare className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;
