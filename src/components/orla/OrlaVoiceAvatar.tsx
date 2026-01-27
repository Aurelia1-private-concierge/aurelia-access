import { useState, useEffect, useRef, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import Orla3DAvatar from "./Orla3DAvatar";
import { OrlaExpressionProvider, useOrlaExpression } from "./OrlaExpressionController";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrlaConversation } from "@/hooks/useOrlaConversation";

interface OrlaVoiceAvatarProps {
  size?: number;
  showControls?: boolean;
  onTranscript?: (role: "user" | "agent", text: string) => void;
}

// Type for the message payload from ElevenLabs
interface ElevenLabsMessage {
  user_transcript?: string;
  agent_response?: string;
}

const OrlaVoiceAvatarInner = ({ 
  size = 300, 
  showControls = true,
  onTranscript 
}: OrlaVoiceAvatarProps) => {
  const { toast } = useToast();
  const { state, setSpeaking, setListening, setThinking, reactToContent, setEmotion } = useOrlaExpression();
  const [isMuted, setIsMuted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [useElevenLabs, setUseElevenLabs] = useState<boolean | null>(null);
  const volumeRef = useRef<() => number>(() => 0);

  // Web Speech fallback conversation
  const webConversation = useOrlaConversation({
    onTranscript: (role, text) => {
      setCurrentTranscript(text);
      onTranscript?.(role, text);
      if (role === "agent") {
        reactToContent(text);
      }
    },
    onStateChange: ({ isListening, isSpeaking, isThinking }) => {
      setListening(isListening);
      setSpeaking(isSpeaking);
      setThinking(isThinking);
    },
  });

  // Check ElevenLabs availability
  useEffect(() => {
    const checkElevenLabs = async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "elevenlabs-conversation-token"
        );
        // Check for signed_url which is what the edge function returns
        setUseElevenLabs(!error && !!data?.signed_url);
      } catch {
        setUseElevenLabs(false);
      }
    };
    checkElevenLabs();
  }, []);

  // ElevenLabs conversation (only used when available)
  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to Orla (ElevenLabs)");
      setEmotion("warm");
      toast({
        title: "Connected to Orla",
        description: "You can now speak with your AI concierge",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from Orla");
      setEmotion("neutral");
      setSpeaking(false);
      setListening(false);
    },
    onMessage: (message) => {
      console.log("Message from Orla:", message);
      
      const msg = message as unknown as Record<string, unknown>;
      
      // Handle user transcript
      if (msg.user_transcript) {
        const text = String(msg.user_transcript);
        setCurrentTranscript(text);
        onTranscript?.("user", text);
        setListening(false);
        setThinking(true);
      }
      
      // Handle agent response
      if (msg.agent_response) {
        const text = String(msg.agent_response);
        setCurrentTranscript(text);
        onTranscript?.("agent", text);
        setThinking(false);
        reactToContent(text);
      }
    },
    onError: (error) => {
      console.error("Orla error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to Orla. Please try again.",
      });
    },
  });

  // Track ElevenLabs speaking state
  useEffect(() => {
    if (useElevenLabs) {
      setSpeaking(conversation.isSpeaking);
      if (conversation.isSpeaking) {
        setThinking(false);
      }
    }
  }, [conversation.isSpeaking, setSpeaking, setThinking, useElevenLabs]);

  // Track ElevenLabs listening state
  useEffect(() => {
    if (useElevenLabs && conversation.status === "connected" && !conversation.isSpeaking) {
      setListening(true);
    }
  }, [conversation.status, conversation.isSpeaking, setListening, useElevenLabs]);

  // Volume getter for lip-sync
  useEffect(() => {
    volumeRef.current = () => {
      try {
        return conversation.getOutputVolume() || 0;
      } catch {
        return 0;
      }
    };
  }, [conversation]);

  const startConversation = useCallback(async () => {
    setEmotion("curious");
    
    if (useElevenLabs) {
      // Use ElevenLabs with signed URL for WebSocket connection
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token");

        if (error || !data?.signed_url) {
          throw new Error(error?.message || "Failed to get conversation token");
        }

        // Use signedUrl for WebSocket connection type
        await conversation.startSession({
          signedUrl: data.signed_url,
        });
      } catch (error) {
        console.error("Failed to start ElevenLabs conversation:", error);
        setEmotion("neutral");
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Please enable microphone access to speak with Orla.",
        });
      }
    } else {
      // Use Web Speech fallback
      await webConversation.startConversation();
      setEmotion("warm");
    }
  }, [conversation, toast, setEmotion, useElevenLabs, webConversation]);

  const endConversation = useCallback(async () => {
    if (useElevenLabs) {
      await conversation.endSession();
    } else {
      webConversation.endConversation();
    }
    setEmotion("neutral");
  }, [conversation, setEmotion, useElevenLabs, webConversation]);

  const toggleMute = useCallback(async () => {
    try {
      await conversation.setVolume({ volume: isMuted ? 1 : 0 });
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Failed to toggle mute:", error);
    }
  }, [conversation, isMuted]);

  // Determine connection status
  const isConnected = useElevenLabs 
    ? conversation.status === "connected" 
    : webConversation.isConnected;
  
  const isConnecting = webConversation.isConnecting;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 3D Avatar */}
      <div className="relative">
        <Orla3DAvatar
          isSpeaking={state.isSpeaking}
          isConnected={isConnected}
          isListening={state.isListening}
          getVolume={volumeRef.current}
          emotion={state.emotion}
          size={size}
        />

        {/* Status indicator */}
        <AnimatePresence>
          {state.isThinking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-card/90 rounded-full border border-gold/30"
            >
              <Sparkles className="w-3 h-3 text-gold animate-pulse" />
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Listening indicator */}
        <AnimatePresence>
          {state.isListening && !state.isSpeaking && isConnected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-card/90 rounded-full border border-accent/30"
            >
              <div className="flex gap-0.5">
                <span className="w-1 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-4 bg-accent rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-muted-foreground ml-1">Listening...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode indicator */}
        {useElevenLabs === false && isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-2 right-0 flex items-center gap-1 px-2 py-0.5 bg-accent/20 rounded-full"
          >
            <Wifi className="w-3 h-3 text-accent" />
            <span className="text-[10px] text-accent">Free Voice</span>
          </motion.div>
        )}
      </div>

      {/* Transcript display */}
      <AnimatePresence mode="wait">
        {currentTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-md text-center px-4"
          >
            <p className="text-sm text-muted-foreground italic">
              "{currentTranscript}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <Button
              onClick={startConversation}
              disabled={isConnecting}
              className="bg-gold hover:bg-gold/90 text-black gap-2"
              size="lg"
            >
              <Mic className="w-4 h-4" />
              {isConnecting ? "Connecting..." : "Speak with Orla"}
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMute}
                variant="outline"
                size="icon"
                className="border-muted"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={endConversation}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
              >
                <MicOff className="w-4 h-4" />
                End Conversation
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Wrapped component with provider
const OrlaVoiceAvatar = (props: OrlaVoiceAvatarProps) => {
  return (
    <OrlaExpressionProvider>
      <OrlaVoiceAvatarInner {...props} />
    </OrlaExpressionProvider>
  );
};

export default OrlaVoiceAvatar;
