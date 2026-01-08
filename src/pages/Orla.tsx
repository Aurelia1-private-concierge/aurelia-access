import { useState, useCallback, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Phone, PhoneOff, ArrowLeft, Sparkles, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CircularWaveform from "@/components/CircularWaveform";
import orlaAvatar from "@/assets/orla-avatar.png";
import { supabase } from "@/integrations/supabase/client";

const ELEVENLABS_AGENT_ID = "agent_01jx7t3mjgeqzsjh5qxbvdsxey";

const Orla = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt">("prompt");

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to Orla");
      toast.success("Connected to Orla");
    },
    onDisconnect: () => {
      console.log("Disconnected from Orla");
    },
    onMessage: (message) => {
      console.log("Message received:", message);
      setTranscript(prev => [...prev, { role: message.role, text: message.message }]);
    },
    onError: (message) => {
      console.error("Conversation error:", message);
      toast.error("Connection error. Please try again.");
      setIsConnecting(false);
    },
  });

  useEffect(() => {
    navigator.permissions?.query({ name: "microphone" as PermissionName }).then((result) => {
      setMicPermission(result.state as "granted" | "denied" | "prompt");
      result.onchange = () => setMicPermission(result.state as "granted" | "denied" | "prompt");
    }).catch(() => {
      // Permissions API not supported
    });
  }, []);

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");

      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token", {
        body: { agentId: ELEVENLABS_AGENT_ID },
      });

      if (error || !data?.signed_url) {
        throw new Error(error?.message || "Failed to get conversation token");
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
  }, [conversation]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
    setTranscript([]);
  }, [conversation]);

  const isConnected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-light">Back to Aurelia</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? "Connected" : "Offline"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-32">
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
            <img
              src={orlaAvatar}
              alt="Orla"
              className="w-full h-full object-cover"
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
                  <Mic className="w-3.5 h-3.5" />
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
            {isConnected
              ? isSpeaking
                ? "Orla is speaking..."
                : "Listening... speak naturally"
              : "Begin a voice conversation with your personal concierge"
            }
          </p>
        </motion.div>

        {/* Transcript */}
        <AnimatePresence>
          {transcript.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full max-w-lg mb-8 overflow-hidden"
            >
              <div className="bg-secondary/30 border border-border/30 rounded-2xl p-6 max-h-48 overflow-y-auto space-y-3">
                {transcript.slice(-5).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm ${item.role === "user" ? "text-primary" : "text-foreground/80"}`}
                  >
                    <span className="text-xs text-muted-foreground mr-2">
                      {item.role === "user" ? "You:" : "Orla:"}
                    </span>
                    {item.text}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
