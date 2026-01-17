import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Users,
  Shield,
  Clock,
  Check,
  X,
  Crown,
  ArrowLeft,
  Loader2,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import SEOHead from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { useBoardroom, BoardroomSession as BoardroomSessionType } from "@/hooks/useBoardroom";
import { useWebRTC } from "@/hooks/useWebRTC";
import { VideoRoom } from "@/components/video";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface WaitingParticipant {
  id: string;
  display_name: string;
  email: string | null;
  requested_at: Date;
}

const BoardroomSessionPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSessionByCode, startSession, endSession } = useBoardroom();

  const [session, setSession] = useState<BoardroomSessionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isInWaitingRoom, setIsInWaitingRoom] = useState(false);
  const [waitingParticipants, setWaitingParticipants] = useState<WaitingParticipant[]>([]);

  const isHost = session?.host_id === user?.id;

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
      toast.success("A participant has joined");
    },
    onPeerDisconnect: (peerId) => {
      toast.info("A participant has left");
    },
    onError: (error) => {
      toast.error("Connection error: " + error.message);
    },
  });

  // Fetch session details
  useEffect(() => {
    const fetchSession = async () => {
      if (!roomCode) return;

      const sessionData = await getSessionByCode(roomCode);
      if (sessionData) {
        setSession(sessionData);

        // Auto-set display name if user is logged in
        if (user?.email) {
          setDisplayName(user.email.split("@")[0]);
        }
      } else {
        toast.error("Meeting not found");
        navigate("/boardroom");
      }
      setIsLoading(false);
    };

    fetchSession();
  }, [roomCode, getSessionByCode, navigate, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleJoinRequest = async () => {
    if (!displayName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setIsJoining(true);

    try {
      await getLocalStream(true, true);

      // Check if waiting room is enabled and user is not the host
      if (session?.is_waiting_room_enabled && !isHost) {
        setIsInWaitingRoom(true);
        toast.info("You're in the waiting room. The host will admit you shortly.");
        
        // In a real implementation, you'd add to boardroom_participants with status 'waiting'
        // and use realtime to listen for approval
      } else {
        // Direct join for host or no waiting room
        if (session?.status === "scheduled" && isHost) {
          await startSession(session.id);
        }
        setHasJoined(true);
        toast.success("Joined the meeting");
      }
    } catch (error) {
      console.error("Failed to join:", error);
      toast.error("Failed to access camera/microphone");
    } finally {
      setIsJoining(false);
    }
  };

  const handleAdmitParticipant = (participantId: string) => {
    // In a real implementation, update participant status in database
    setWaitingParticipants((prev) => prev.filter((p) => p.id !== participantId));
    toast.success("Participant admitted");
  };

  const handleDenyParticipant = (participantId: string) => {
    setWaitingParticipants((prev) => prev.filter((p) => p.id !== participantId));
    toast.info("Participant denied");
  };

  const handleLeaveRoom = async () => {
    cleanup();
    setHasJoined(false);

    if (isHost && session) {
      await endSession(session.id);
    }

    navigate("/boardroom");
  };

  // For demo: simulate waiting room admission after 3 seconds
  useEffect(() => {
    if (isInWaitingRoom) {
      const timer = setTimeout(() => {
        setIsInWaitingRoom(false);
        setHasJoined(true);
        toast.success("The host has admitted you to the meeting");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInWaitingRoom]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Waiting room view
  if (isInWaitingRoom) {
    return (
      <>
        <SEOHead title={`Waiting Room | ${session.title}`} description="Waiting to join the meeting" />
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
            <motion.div
              className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-12 h-12 text-primary" />
            </motion.div>
            <h1 className="font-serif text-2xl mb-2">Waiting Room</h1>
            <p className="text-muted-foreground mb-6">
              Please wait while the host admits you to the meeting.
            </p>
            <Card className="bg-muted/50 mb-6">
              <CardContent className="py-4">
                <h3 className="font-semibold mb-1">{session.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Hosted by {isHost ? "you" : "the organizer"}
                </p>
              </CardContent>
            </Card>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Waiting for host approval...</span>
            </div>
            <Button variant="outline" className="mt-6" onClick={() => navigate("/boardroom")}>
              Leave Waiting Room
            </Button>
          </motion.div>
        </div>
      </>
    );
  }

  // Pre-join lobby
  if (!hasJoined) {
    return (
      <>
        <SEOHead title={`Join: ${session.title}`} description="Join the boardroom meeting" />
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Link to="/boardroom" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Boardroom
            </Link>

            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Crown className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="font-serif text-xl">{session.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {format(new Date(session.scheduled_at), "MMM d, h:mm a")}
                    </div>
                  </div>
                </div>

                {session.description && (
                  <p className="text-sm text-muted-foreground mb-6 p-3 bg-muted/50 rounded-lg">{session.description}</p>
                )}

                <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {session.max_participants} max
                  </span>
                  {session.is_waiting_room_enabled && (
                    <Badge variant="outline" className="gap-1">
                      <Shield className="w-3 h-3" />
                      Waiting Room
                    </Badge>
                  )}
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

                  <Button className="w-full" size="lg" onClick={handleJoinRequest} disabled={isJoining}>
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2" />
                        {isHost ? "Start Meeting" : "Join Meeting"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  // Active meeting view
  const participants = Array.from(peers.values()).map((peer) => ({
    id: peer.peerId,
    name: "Participant",
    stream: peer.stream,
    isMuted: false,
    isVideoOff: false,
    isHandRaised: false,
    isScreenSharing: false,
  }));

  return (
    <>
      <SEOHead title={session.title} description="Boardroom meeting in progress" />
      
      {/* Waiting room panel for host */}
      <AnimatePresence>
        {isHost && waitingParticipants.length > 0 && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed right-4 top-20 w-72 bg-card border border-border rounded-xl shadow-xl z-50"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Waiting Room
              </h3>
              <Badge>{waitingParticipants.length}</Badge>
            </div>
            <ScrollArea className="max-h-64">
              <div className="p-2 space-y-2">
                {waitingParticipants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{participant.display_name}</p>
                      {participant.email && (
                        <p className="text-xs text-muted-foreground">{participant.email}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10"
                        onClick={() => handleAdmitParticipant(participant.id)}
                      >
                        <UserCheck className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDenyParticipant(participant.id)}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      <VideoRoom
        roomId={session.room_code}
        roomName={session.title}
        localStream={localStream}
        participants={participants}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onLeaveRoom={handleLeaveRoom}
      />
    </>
  );
};

export default BoardroomSessionPage;
