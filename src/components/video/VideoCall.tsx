import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Video,
  VideoOff,
  PhoneOff,
  Phone,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebRTC } from "@/hooks/useWebRTC";
import VideoCallInterface from "./VideoCallInterface";
import { toast } from "sonner";

interface VideoCallProps {
  recipientId: string;
  recipientName: string;
  onEndCall: () => void;
  isIncoming?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
  recipientId,
  recipientName,
  onEndCall,
  isIncoming = false,
  onAccept,
  onDecline,
}) => {
  const [callState, setCallState] = useState<"idle" | "calling" | "connected" | "incoming">(
    isIncoming ? "incoming" : "idle"
  );

  const {
    localStream,
    peers,
    isAudioEnabled,
    isVideoEnabled,
    getLocalStream,
    createOffer,
    toggleAudio,
    toggleVideo,
    cleanup,
  } = useWebRTC({
    onRemoteStream: (peerId, stream) => {
      console.log("Remote stream received from", peerId);
      setCallState("connected");
    },
    onPeerDisconnect: (peerId) => {
      toast.info(`${recipientName} has left the call`);
      handleEndCall();
    },
    onError: (error) => {
      toast.error("Call error: " + error.message);
    },
  });

  const startCall = useCallback(async () => {
    try {
      setCallState("calling");
      await getLocalStream(true, true);
      
      // In a real implementation, you would:
      // 1. Create an offer
      // 2. Send it via signaling server (WebSocket/Supabase Realtime)
      // 3. Wait for answer
      const offer = await createOffer(recipientId);
      console.log("Offer created:", offer);
      
      // Simulate connection for demo
      setTimeout(() => {
        toast.success(`Connected with ${recipientName}`);
        setCallState("connected");
      }, 2000);
    } catch (error) {
      console.error("Failed to start call:", error);
      toast.error("Failed to start video call");
      setCallState("idle");
    }
  }, [getLocalStream, createOffer, recipientId, recipientName]);

  const acceptCall = useCallback(async () => {
    try {
      await getLocalStream(true, true);
      setCallState("connected");
      onAccept?.();
    } catch (error) {
      console.error("Failed to accept call:", error);
      toast.error("Failed to accept call");
    }
  }, [getLocalStream, onAccept]);

  const declineCall = useCallback(() => {
    cleanup();
    onDecline?.();
    onEndCall();
  }, [cleanup, onDecline, onEndCall]);

  const handleEndCall = useCallback(() => {
    cleanup();
    onEndCall();
  }, [cleanup, onEndCall]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Incoming call UI
  if (callState === "incoming") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <div className="bg-card rounded-2xl p-8 text-center shadow-2xl">
          <motion.div
            className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Video className="w-12 h-12 text-primary" />
          </motion.div>
          
          <h2 className="text-2xl font-semibold mb-2">Incoming Video Call</h2>
          <p className="text-muted-foreground mb-8">{recipientName}</p>
          
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant="destructive"
              className="rounded-full w-16 h-16"
              onClick={declineCall}
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
            <Button
              size="lg"
              className="rounded-full w-16 h-16 bg-emerald-500 hover:bg-emerald-600"
              onClick={acceptCall}
            >
              <Phone className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Calling/connecting UI
  if (callState === "idle" || callState === "calling") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-card rounded-2xl p-8 text-center shadow-2xl">
          {callState === "idle" ? (
            <>
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Video className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Video Call</h2>
              <p className="text-muted-foreground mb-8">Call {recipientName}?</p>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" onClick={onEndCall}>
                  Cancel
                </Button>
                <Button onClick={startCall} className="gap-2">
                  <Phone className="w-4 h-4" />
                  Start Call
                </Button>
              </div>
            </>
          ) : (
            <>
              <motion.div
                className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </motion.div>
              <h2 className="text-2xl font-semibold mb-2">Calling...</h2>
              <p className="text-muted-foreground mb-8">{recipientName}</p>
              <Button variant="destructive" onClick={handleEndCall}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Connected - show video interface
  const participants = Array.from(peers.values()).map((peer) => ({
    id: peer.peerId,
    name: recipientName,
    stream: peer.stream,
    isMuted: false,
    isVideoOff: false,
  }));

  return (
    <div className="fixed inset-0 z-50">
      <VideoCallInterface
        localStream={localStream}
        participants={participants}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onEndCall={handleEndCall}
      />
    </div>
  );
};

export default VideoCall;
