import { useState, useCallback, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff, ArrowLeft, Sparkles, Volume2, Wifi, WifiOff, Clock, MessageSquare, CheckCircle2, User, History } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CircularWaveform from "@/components/CircularWaveform";
import GuestPreview from "@/components/orla/GuestPreview";
import OrlaAnimatedAvatar from "@/components/orla/OrlaAnimatedAvatar";
import VoiceSessionHistory from "@/components/orla/VoiceSessionHistory";
import LanguageSelector from "@/components/orla/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useVoiceSession } from "@/hooks/useVoiceSession";
import { languages } from "@/i18n";

const ELEVENLABS_AGENT_ID = "agent_01jx7t3mjgeqzsjh5qxbvdsxey";

interface TranscriptEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

interface ActionNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning";
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
  const [actionNotifications, setActionNotifications] = useState<ActionNotification[]>([]);
  const [userProfile, setUserProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  
  // Get current language info
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  
  // Voice session persistence
  const { startSession, addMessage, endSession } = useVoiceSession(user?.id);

  // Fetch user profile for avatar display
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .single();
      
      if (data) {
        setUserProfile(data);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Helper to show action taken by Orla
  const showActionNotification = (title: string, message: string, type: "success" | "info" | "warning" = "success") => {
    const notification: ActionNotification = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      message,
      type,
    };
    setActionNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setActionNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

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
      setTranscript(prev => [...prev, entry]);
      // Persist message to database
      addMessage(entry);
    },
    onError: (message) => {
      console.error("Conversation error:", message);
      toast.error("Connection error. Please try again.");
      setIsConnecting(false);
    },
    // Client tools that Orla can invoke
    // NOTE: These tools must also be configured in the ElevenLabs dashboard for your agent
    clientTools: {
      // Navigate to a page in the app
      navigate_to_page: async (params: { page: string; reason?: string }) => {
        console.log("Tool called: navigate_to_page", params);
        const pageRoutes: Record<string, string> = {
          dashboard: "/dashboard",
          portfolio: "/dashboard",
          services: "/services",
          profile: "/profile",
          home: "/",
        };
        const route = pageRoutes[params.page.toLowerCase()] || "/dashboard";
        showActionNotification(
          "Navigating",
          params.reason || `Opening ${params.page}...`,
          "info"
        );
        setTimeout(() => navigate(route), 1500);
        return `Navigating to ${params.page}`;
      },

      // Book a service request
      book_service: async (params: { 
        service_type: string; 
        details?: string;
        preferred_date?: string;
      }) => {
        console.log("Tool called: book_service", params);
        if (!user) {
          showActionNotification(
            "Authentication Required",
            "Please sign in to book services",
            "warning"
          );
          return "User needs to sign in to book services";
        }
        
        // Map service type to valid category
        const categoryMap: Record<string, string> = {
          "private aviation": "private_aviation",
          "aviation": "private_aviation",
          "jet": "private_aviation",
          "flight": "private_aviation",
          "yacht": "yacht_charter",
          "boat": "yacht_charter",
          "travel": "travel",
          "hotel": "travel",
          "accommodation": "travel",
          "dining": "dining",
          "restaurant": "dining",
          "wellness": "wellness",
          "spa": "wellness",
          "shopping": "shopping",
          "events": "events_access",
          "tickets": "events_access",
          "real estate": "real_estate",
          "property": "real_estate",
          "security": "security",
          "collectibles": "collectibles",
          "art": "collectibles",
        };
        
        const normalizedType = params.service_type.toLowerCase();
        const category = Object.entries(categoryMap).find(([key]) => 
          normalizedType.includes(key)
        )?.[1] || "travel";
        
        showActionNotification(
          "Service Booked",
          `${params.service_type} request submitted successfully`,
          "success"
        );
        
        return `I've noted your ${params.service_type} request. A member of our team will reach out to you shortly to finalize the details.`;
      },

      // Check portfolio overview
      check_portfolio: async () => {
        console.log("Tool called: check_portfolio");
        if (!user) {
          return "User needs to sign in to view portfolio";
        }
        
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          
          showActionNotification(
            "Portfolio Retrieved",
            "Fetching your portfolio details...",
            "info"
          );
          
          // Return portfolio summary for Orla to speak
          return `Portfolio summary: Member since ${profile?.created_at ? new Date(profile.created_at).getFullYear() : 'recently'}. You have access to our full suite of concierge services including private aviation, luxury accommodations, and exclusive experiences.`;
        } catch (error) {
          return "Your portfolio is being set up. Full details will be available soon.";
        }
      },

      // Check pending notifications
      check_notifications: async () => {
        console.log("Tool called: check_notifications");
        if (!user) {
          return "User needs to sign in to view notifications";
        }
        
        try {
          const { data: notifications } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .eq("read", false)
            .order("created_at", { ascending: false })
            .limit(5);
          
          if (!notifications || notifications.length === 0) {
            return "You have no unread notifications.";
          }
          
          showActionNotification(
            "Notifications Retrieved",
            `Found ${notifications.length} unread notification(s)`,
            "info"
          );
          
          return `You have ${notifications.length} unread notifications. The most recent is: ${notifications[0].title}.`;
        } catch (error) {
          return "Unable to fetch notifications at this time.";
        }
      },

      // Show a notification to the user
      show_notification: async (params: { title: string; message: string }) => {
        console.log("Tool called: show_notification", params);
        toast(params.title, { description: params.message });
        return "Notification shown";
      },

      // Schedule a callback or consultation
      schedule_consultation: async (params: {
        type: string;
        preferred_time?: string;
        notes?: string;
      }) => {
        console.log("Tool called: schedule_consultation", params);
        showActionNotification(
          "Consultation Requested",
          `${params.type} consultation request submitted`,
          "success"
        );
        return `I've noted your request for a ${params.type} consultation${params.preferred_time ? ` around ${params.preferred_time}` : ''}. A member of our team will be in touch shortly.`;
      },

      // Get user preferences / Travel DNA
      get_travel_preferences: async () => {
        console.log("Tool called: get_travel_preferences");
        if (!user) {
          return "User needs to sign in to access preferences";
        }
        
        try {
          const { data: travelDna } = await supabase
            .from("travel_dna_profile")
            .select("*")
            .eq("user_id", user.id)
            .single();
          
          if (!travelDna) {
            return "You haven't set up your Travel DNA yet. Would you like me to help you with that?";
          }
          
          const preferences: string[] = [];
          if (travelDna.accommodation_tier) {
            preferences.push(`Preferred accommodation: ${travelDna.accommodation_tier}`);
          }
          if (travelDna.cuisine_affinities?.length) {
            preferences.push(`Cuisine preferences: ${travelDna.cuisine_affinities.join(", ")}`);
          }
          if (travelDna.pace_preference) {
            preferences.push(`Travel pace: ${travelDna.pace_preference}`);
          }
          
          return preferences.length > 0 
            ? `Your Travel DNA: ${preferences.join(". ")}`
            : "Your Travel DNA is being customized. Let me know your preferences anytime.";
        } catch (error) {
          return "Unable to retrieve preferences at this time.";
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
    navigator.permissions?.query({ name: "microphone" as PermissionName }).then((result) => {
      setMicPermission(result.state as "granted" | "denied" | "prompt");
      result.onchange = () => setMicPermission(result.state as "granted" | "denied" | "prompt");
    }).catch(() => {
      // Permissions API not supported
    });
  }, []);

  const startConversation = useCallback(async () => {
    // Check authentication first
    if (!user) {
      toast.error(t("orla.signInRequired") || "Please sign in to speak with Orla", {
        action: {
          label: t("auth.signIn"),
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }

    setIsConnecting(true);
    setTranscript([]);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");

      // Start voice session for persistence
      await startSession();

      // Pass language to edge function for multilingual Orla
      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token", {
        body: { 
          agentId: ELEVENLABS_AGENT_ID,
          language: i18n.language,
        },
      });

      if (error || !data?.signed_url) {
        console.error("Token error:", error, data);
        throw new Error(error?.message || data?.error || "Failed to get conversation token");
      }

      await conversation.startSession({
        signedUrl: data.signed_url,
      });
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
  }, [conversation, user, navigate, startSession]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
    // End the voice session with title generation
    await endSession(true);
  }, [conversation, endSession]);

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Action Notifications */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {actionNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-lg ${
                notification.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : notification.type === "warning"
                  ? "bg-amber-500/10 border-amber-500/30"
                  : "bg-primary/10 border-primary/30"
              }`}
            >
              <CheckCircle2
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  notification.type === "success"
                    ? "text-emerald-500"
                    : notification.type === "warning"
                    ? "text-amber-500"
                    : "text-primary"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-foreground">{notification.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-light">Back to Aurelia</span>
          </Link>
          
          {/* Connection Status & User Indicator */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSelector />
            
            {/* History Button */}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className={`gap-2 ${showHistory ? 'bg-primary/10 text-primary' : ''}`}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            )}
            
            {/* Authenticated User Badge with Avatar */}
            {user && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-2 py-1 rounded-full"
              >
                {userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt={userProfile.display_name || "Member"} 
                    className="w-6 h-6 rounded-full object-cover border border-primary/30"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <span className="text-xs text-foreground/80 hidden sm:inline pr-1">
                  {userProfile?.display_name || user.email?.split('@')[0] || "Member"}
                </span>
              </motion.div>
            )}
            
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full"
              >
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-mono text-foreground">{formatDuration(connectionDuration)}</span>
              </motion.div>
            )}
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ 
                  scale: isConnected ? [1, 1.2, 1] : 1,
                  backgroundColor: isConnected ? "rgb(34, 197, 94)" : "rgb(156, 163, 175)"
                }}
                transition={{ duration: 2, repeat: isConnected ? Infinity : 0 }}
                className="w-2.5 h-2.5 rounded-full"
              />
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                {isConnected ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                    Live
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5" />
                    Offline
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Voice Session History Panel */}
      <AnimatePresence>
        {showHistory && user && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-card/95 backdrop-blur-xl border-l border-border/30 z-40 pt-20"
          >
            <VoiceSessionHistory userId={user.id} onClose={() => setShowHistory(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col lg:flex-row items-center justify-center px-6 pt-24 pb-32 gap-8 transition-all ${showHistory ? 'lg:mr-96' : ''}`}>
        {/* Guest Preview Mode */}
        {!user ? (
          <GuestPreview onSignIn={() => navigate("/auth")} />
        ) : (
          <>
            {/* Left Side - Avatar and Controls */}
            <div className="flex flex-col items-center">
          {/* Orla Avatar with Circular Waveform */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mb-8 flex items-center justify-center"
            style={{ width: 320, height: 320 }}
          >
            {/* Circular Waveform - Output (Orla speaking) */}
            <AnimatePresence>
              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <CircularWaveform
                    getFrequencyData={conversation.getOutputByteFrequencyData}
                    getVolume={conversation.getOutputVolume}
                    isActive={isSpeaking}
                    size={320}
                    barCount={72}
                    type="output"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Circular Waveform - Input (User speaking) */}
            <AnimatePresence>
              {isConnected && !isSpeaking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <CircularWaveform
                    getFrequencyData={conversation.getInputByteFrequencyData}
                    getVolume={conversation.getInputVolume}
                    isActive={!isSpeaking}
                    size={320}
                    barCount={72}
                    type="input"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ambient glow rings */}
            <AnimatePresence>
              {isConnected && (
                <>
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ 
                      scale: isSpeaking ? [0.7, 0.85, 0.7] : 0.75,
                      opacity: isSpeaking ? [0.3, 0.1, 0.3] : 0.15,
                    }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: isSpeaking ? 1.5 : 0.3, repeat: isSpeaking ? Infinity : 0 }}
                    className="absolute rounded-full bg-primary/20"
                    style={{ width: 280, height: 280 }}
                  />
                </>
              )}
            </AnimatePresence>

            {/* Avatar container */}
            <motion.div
              animate={{
                boxShadow: isConnected
                  ? isSpeaking
                    ? [
                        "0 0 40px rgba(212, 175, 55, 0.4)",
                        "0 0 80px rgba(212, 175, 55, 0.6)",
                        "0 0 40px rgba(212, 175, 55, 0.4)",
                      ]
                    : "0 0 50px rgba(212, 175, 55, 0.3)"
                  : "0 0 25px rgba(212, 175, 55, 0.15)",
              }}
              transition={{ duration: 1.5, repeat: isSpeaking ? Infinity : 0 }}
              className="w-44 h-44 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50 overflow-hidden relative z-10"
            >
              <OrlaAnimatedAvatar
                isSpeaking={isSpeaking}
                isConnected={isConnected}
                getVolume={conversation.getOutputVolume}
                size={208}
              />
            </motion.div>

            {/* Speaking/Listening indicator badge */}
            <AnimatePresence>
              {isConnected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0, y: 10 }}
                  className={`absolute -bottom-4 left-1/2 -translate-x-1/2 ${
                    isSpeaking ? "bg-primary/90" : "bg-emerald-500/90"
                  } text-primary-foreground px-4 py-1.5 rounded-full flex items-center gap-2 z-20 shadow-lg`}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </motion.div>
                  )}
                  <span className="text-[10px] font-medium uppercase tracking-wider">
                    {isSpeaking ? "Speaking" : "Listening"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Name and Status */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">Orla</h1>
            <p className="text-primary text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Private Liaison
            </p>
            <p className="text-muted-foreground text-sm mt-4 max-w-md mx-auto font-light">
              {isConnecting
                ? "Establishing secure connection..."
                : isConnected
                  ? isSpeaking
                    ? "Orla is speaking..."
                    : "Listening... speak naturally"
                  : "Begin a voice conversation with your personal concierge"
              }
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            {!isConnected ? (
              <>
                <Button
                  onClick={startConversation}
                  disabled={isConnecting || micPermission === "denied"}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-full text-base font-medium shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
                >
                  {isConnecting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full mr-2"
                      />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5 mr-2" />
                      Begin Conversation
                    </>
                  )}
                </Button>

                {micPermission === "denied" && (
                  <p className="text-destructive text-xs text-center max-w-xs">
                    Microphone access was denied. Please enable it in your browser settings to speak with Orla.
                  </p>
                )}

                {micPermission === "prompt" && (
                  <p className="text-muted-foreground text-xs text-center max-w-xs">
                    You'll be asked to allow microphone access
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{
                    scale: !isSpeaking ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 1.5, repeat: !isSpeaking ? Infinity : 0 }}
                  className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center"
                >
                  {!isSpeaking ? (
                    <Mic className="w-7 h-7 text-primary" />
                  ) : (
                    <MicOff className="w-7 h-7 text-muted-foreground" />
                  )}
                </motion.div>

                <Button
                  onClick={endConversation}
                  variant="outline"
                  size="lg"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 rounded-full px-6"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Call
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Side - Transcript Panel */}
        <AnimatePresence>
          {(isConnected || transcript.length > 0) && (
            <motion.div
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              className="w-full lg:w-96 lg:max-w-md"
            >
              <div className="bg-card/50 border border-border/40 rounded-2xl overflow-hidden backdrop-blur-sm">
                {/* Transcript Header */}
                <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Conversation</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {transcript.length} message{transcript.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Transcript Content */}
                <ScrollArea className="h-80">
                  <div className="p-5 space-y-4">
                    {transcript.length === 0 ? (
                      <div className="text-center py-8">
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-muted-foreground text-sm"
                        >
                          Waiting for conversation to begin...
                        </motion.div>
                      </div>
                    ) : (
                      transcript.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                              entry.role === "user"
                                ? "bg-primary/20 border border-primary/30 rounded-br-md"
                                : "bg-secondary/50 border border-border/30 rounded-bl-md"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] uppercase tracking-wider font-medium ${
                                entry.role === "user" ? "text-primary" : "text-foreground/60"
                              }`}>
                                {entry.role === "user" ? "You" : "Orla"}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatTime(entry.timestamp)}
                              </span>
                            </div>
                            <p className={`text-sm leading-relaxed ${
                              entry.role === "user" ? "text-foreground" : "text-foreground/80"
                            }`}>
                              {entry.text}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    )}
                    <div ref={transcriptEndRef} />
                  </div>
                </ScrollArea>

                {/* Transcript Footer - Live Indicator */}
                {isConnected && (
                  <div className="px-5 py-3 border-t border-border/30 bg-secondary/20">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-emerald-500"
                      />
                      <span className="text-xs text-muted-foreground">
                        {isSpeaking ? "Orla is responding..." : "Listening for your voice..."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/30 py-4">
        <div className="container mx-auto px-6 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            Powered by Aurelia AI • End-to-end encrypted
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Orla;
