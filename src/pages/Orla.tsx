import { useState, useCallback, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff, ArrowLeft, Volume2, Clock, History } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import orlaAvatar from "@/assets/orla-avatar.png";

interface TranscriptEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

const Orla = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [connectionDuration, setConnectionDuration] = useState(0);
  const [connectionStartTime, setConnectionStartTime] = useState<Date | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Voice session persistence
  const { startSession, addMessage, endSession } = useVoiceSession(user?.id);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to Orla");
      toast.success("Connected to Orla");
      setConnectionStartTime(new Date());
    },
    onDisconnect: () => {
      console.log("Disconnected from Orla");
      setConnectionStartTime(null);
      setConnectionDuration(0);
    },
    onMessage: (message) => {
      console.log("Message received:", message);
      const entry: TranscriptEntry = {
        id: `${Date.now()}-${Math.random()}`,
        role: message.role,
        text: message.message,
        timestamp: new Date(),
      };
      setTranscript((prev) => [...prev, entry]);
      addMessage(entry);
    },
    onError: (message) => {
      console.error("Conversation error:", message);
      toast.error("Connection error. Please try again.");
      setIsConnecting(false);
    },
    clientTools: {
      navigate_to_page: async (params: { page: string; reason?: string }) => {
        const pageRoutes: Record<string, string> = {
          dashboard: "/dashboard",
          portfolio: "/dashboard",
          services: "/services",
          profile: "/profile",
          home: "/",
        };
        const route = pageRoutes[params.page.toLowerCase()] || "/dashboard";
        toast.info(params.reason || `Opening ${params.page}...`);
        setTimeout(() => navigate(route), 1500);
        return `Navigating to ${params.page}`;
      },
      book_service: async (params: { service_type: string; details?: string }) => {
        if (!user) {
          toast.warning("Please sign in to book services");
          return "User needs to sign in to book services";
        }
        toast.success(`${params.service_type} request submitted`);
        return `I've noted your ${params.service_type} request. A member of our team will reach out shortly.`;
      },
      check_notifications: async () => {
        if (!user) return "User needs to sign in to view notifications";
        try {
          const { data: notifications } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .eq("read", false)
            .limit(5);
          if (!notifications?.length) return "You have no unread notifications.";
          return `You have ${notifications.length} unread notifications. The most recent is: ${notifications[0].title}.`;
        } catch {
          return "Unable to fetch notifications at this time.";
        }
      },
    },
  });

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Connection duration timer
  useEffect(() => {
    if (!connectionStartTime) return;
    const interval = setInterval(() => {
      setConnectionDuration(Math.floor((Date.now() - connectionStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [connectionStartTime]);

  useEffect(() => {
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((result) => {
        setMicPermission(result.state as "granted" | "denied" | "prompt");
        result.onchange = () => setMicPermission(result.state as "granted" | "denied" | "prompt");
      })
      .catch(() => {});
  }, []);

  const startConversation = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to speak with Orla", {
        action: { label: "Sign In", onClick: () => navigate("/auth") },
      });
      return;
    }

    setIsConnecting(true);
    setTranscript([]);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");
      await startSession();

      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token", {
        body: { language: i18n.language },
      });

      if (error || !data?.signed_url) {
        throw new Error(error?.message || data?.error || "Failed to get conversation token");
      }

      await conversation.startSession({ signedUrl: data.signed_url });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      if ((error as Error).name === "NotAllowedError") {
        toast.error("Microphone access is required to speak with Orla");
        setMicPermission("denied");
      } else {
        toast.error((error as Error).message || "Failed to connect to Orla");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, user, navigate, startSession, i18n.language]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
    await endSession(true);
  }, [conversation, endSession]);

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Guest view
  if (!user) {
    return (
      <>
        <SEOHead title="Orla - Your Private Concierge" description="Speak with Orla, your AI-powered private concierge." />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <img src={orlaAvatar} alt="Orla" className="w-full h-full rounded-full object-cover border-4 border-primary/30" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            <h1 className="font-serif text-3xl mb-4">Meet Orla</h1>
            <p className="text-muted-foreground mb-8">Your AI-powered private concierge. Sign in to start a voice conversation.</p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Sign In to Continue
            </Button>
            <Link to="/dashboard" className="block mt-4 text-sm text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Orla - Your Private Concierge" description="Speak with Orla, your AI-powered private concierge." />

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border/50">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            {isConnected && (
              <div className="flex items-center gap-2 text-sm text-emerald-500">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(connectionDuration)}</span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)}>
              <History className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
          {/* Avatar */}
          <motion.div
            className="relative mb-8"
            animate={isSpeaking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
          >
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <img src={orlaAvatar} alt="Orla" className="w-full h-full rounded-full object-cover" />

              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: isConnected ? "0 0 40px rgba(212,175,55,0.4)" : "0 0 20px rgba(212,175,55,0.2)" }}
                animate={isConnected ? { boxShadow: ["0 0 30px rgba(212,175,55,0.3)", "0 0 50px rgba(212,175,55,0.5)", "0 0 30px rgba(212,175,55,0.3)"] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Status indicator */}
              <motion.div
                className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-background ${isConnected ? "bg-emerald-500" : "bg-muted"}`}
                animate={isConnected ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />

              {/* Speaking indicator */}
              <AnimatePresence>
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-primary/20 backdrop-blur-sm px-3 py-1 rounded-full"
                  >
                    <Volume2 className="w-4 h-4 text-primary" />
                    <span className="text-xs text-primary">Speaking...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
            <h1 className="font-serif text-3xl md:text-4xl mb-2">Orla</h1>
            <p className="text-muted-foreground text-sm">Your Private Concierge</p>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <Button
                size="lg"
                onClick={startConversation}
                disabled={isConnecting || micPermission === "denied"}
                className="gap-2 px-8 py-6 text-lg rounded-full bg-primary hover:bg-primary/90"
              >
                {isConnecting ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    Start Conversation
                  </>
                )}
              </Button>
            ) : (
              <Button size="lg" variant="destructive" onClick={endConversation} className="gap-2 px-8 py-6 text-lg rounded-full">
                <PhoneOff className="w-5 h-5" />
                End Call
              </Button>
            )}
          </div>

          {micPermission === "denied" && (
            <p className="mt-4 text-sm text-destructive">Microphone access denied. Please enable it in your browser settings.</p>
          )}
        </main>

        {/* Transcript Panel */}
        <AnimatePresence>
          {transcript.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="border-t border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <ScrollArea className="h-48 p-4">
                <div className="space-y-3 max-w-2xl mx-auto">
                  {transcript.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: entry.role === "user" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${entry.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {entry.text}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border shadow-xl z-50 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Conversation History</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                  ×
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Your past conversations with Orla will appear here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Orla;
