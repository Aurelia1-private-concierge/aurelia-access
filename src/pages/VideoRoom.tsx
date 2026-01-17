import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Video, Copy, Check, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { useWebRTC } from "@/hooks/useWebRTC";
import { VideoRoom as VideoRoomComponent } from "@/components/video";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const VideoRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    localStream,
    peers,
    isAudioEnabled,
    isVideoEnabled,
    getLocalStream,
    toggleAudio,
    toggleVideo,
    cleanup,
  } = useWebRTC({
    onRemoteStream: (peerId, stream) => {
      console.log("Participant joined:", peerId);
      toast.success("A participant has joined");
    },
    onPeerDisconnect: (peerId) => {
      toast.info("A participant has left");
    },
    onError: (error) => {
      toast.error("Connection error: " + error.message);
    },
  });

  const joinRoom = useCallback(async () => {
    if (!displayName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsJoining(true);
    try {
      await getLocalStream(true, true);
      setHasJoined(true);
      toast.success("Joined the room");
    } catch (error) {
      console.error("Failed to join room:", error);
      toast.error("Failed to access camera/microphone");
    } finally {
      setIsJoining(false);
    }
  }, [displayName, getLocalStream]);

  const leaveRoom = useCallback(() => {
    cleanup();
    setHasJoined(false);
    navigate("/dashboard");
  }, [cleanup, navigate]);

  const copyRoomLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    toast.success("Room link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Set default display name if user is logged in
    if (user) {
      setDisplayName(user.email?.split("@")[0] || "Guest");
    }
  }, [user]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Pre-join lobby
  if (!hasJoined) {
    return (
      <>
        <SEOHead
          title="Join Video Room | Aurelia"
          description="Join a secure video consultation room"
        />
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Video Room</h1>
                  <p className="text-sm text-muted-foreground">Room: {roomId}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Your Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={joinRoom}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Join Room
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={copyRoomLink}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Room Link
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-6">
                Share this link to invite others to join
              </p>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // Video room interface
  const participants = Array.from(peers.values()).map((peer) => ({
    id: peer.peerId,
    name: `Participant`,
    stream: peer.stream,
    isMuted: false,
    isVideoOff: false,
    isHandRaised: false,
    isScreenSharing: false,
  }));

  return (
    <>
      <SEOHead
        title="Video Room | Aurelia"
        description="Secure video consultation"
      />
      <VideoRoomComponent
        roomId={roomId || ""}
        roomName="Consultation Room"
        localStream={localStream}
        participants={participants}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onLeaveRoom={leaveRoom}
      />
    </>
  );
};

export default VideoRoomPage;
