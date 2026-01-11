import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, X, Minus, Lock, ArrowRight, Sparkles, 
  RotateCcw, MessageSquare, Phone, PhoneOff, Volume2,
  Zap, Wand2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useMultiAgent, AgentMessage, AgentMode } from "@/hooks/useMultiAgent";
import OrlaMiniAvatar from "@/components/orla/OrlaMiniAvatar";
import orlaAvatar from "@/assets/orla-avatar.png";

const INITIAL_MESSAGE: AgentMessage = {
  id: "initial",
  role: "agent",
  content: "Good evening. Welcome to Aurelia. I'm Orla, your Private Liaison. I'm here to orchestrate the extraordinary—from private aviation to rare acquisitions. How may I be of service?",
  timestamp: new Date(),
  mode: "chat",
};

// Floating particles for the widget
const WidgetParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-primary/40"
        initial={{ 
          x: Math.random() * 100 + "%", 
          y: "100%",
          opacity: 0 
        }}
        animate={{ 
          y: "-20%",
          opacity: [0, 0.8, 0],
        }}
        transition={{ 
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: i * 0.5,
          ease: "easeOut",
        }}
      />
    ))}
  </div>
);

// Pulsing ring animation
const PulsingRings = ({ active }: { active: boolean }) => (
  <AnimatePresence>
    {active && (
      <>
        {[...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
            className="absolute inset-0 rounded-full border border-primary/40"
          />
        ))}
      </>
    )}
  </AnimatePresence>
);

const MultiAgentWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showModeHint, setShowModeHint] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agent = useMultiAgent({
    onMessage: () => scrollToBottom(),
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [agent.messages]);

  const handleSend = async () => {
    if (!input.trim() || agent.isProcessing) return;
    const message = input;
    setInput("");
    await agent.sendChatMessage(message);
  };

  const handleVoiceToggle = async () => {
    if (agent.mode === "voice" && agent.isConnected) {
      await agent.endVoiceSession();
    } else {
      if (!user) {
        toast.error("Please sign in to use voice features");
        return;
      }
      await agent.startVoiceSession();
    }
  };

  const handleNewConversation = () => {
    agent.clearMessages();
    toast.success("Started a new conversation");
  };

  const handleHybridMode = async () => {
    if (!user) {
      toast.error("Please sign in to use hybrid mode");
      return;
    }
    
    if (agent.mode === "hybrid") {
      await agent.endVoiceSession();
      agent.switchMode("chat");
    } else {
      await agent.startVoiceSession();
      agent.switchMode("hybrid" as AgentMode);
      toast.success("Hybrid mode active - speak or type!");
    }
  };

  const allMessages = agent.messages.length > 0 
    ? agent.messages 
    : [INITIAL_MESSAGE];

  // Hide mode hint after 5 seconds
  useEffect(() => {
    if (isOpen && showModeHint) {
      const timer = setTimeout(() => setShowModeHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showModeHint]);

  return (
    <>
      {/* Main Widget Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-2 bottom-20 sm:inset-auto sm:bottom-28 sm:right-4 md:right-8 z-50 w-auto sm:w-80 md:w-[420px] h-[70vh] sm:h-[600px] max-h-[600px] bg-card/95 backdrop-blur-xl border border-border/30 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.5),0_0_40px_rgba(212,175,55,0.15)] flex flex-col overflow-hidden origin-bottom-right"
          >
            {/* Ambient glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
            
            <WidgetParticles />

            {/* Header */}
            <div className="relative p-4 border-b border-primary/20 bg-gradient-to-r from-background via-secondary/30 to-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {(agent.mode === "voice" || agent.mode === "hybrid") && agent.isConnected ? (
                      <div className="w-14 h-14">
                        <Suspense fallback={
                          <img src={orlaAvatar} alt="Orla" className="w-full h-full object-cover rounded-full" />
                        }>
                          <OrlaMiniAvatar 
                            size={56}
                            isActive={agent.isSpeaking || agent.isListening}
                            showSparkles={agent.isSpeaking}
                          />
                        </Suspense>
                      </div>
                    ) : (
                      <motion.div 
                        animate={{ 
                          boxShadow: [
                            "0 0 20px rgba(212, 175, 55, 0.2)",
                            "0 0 40px rgba(212, 175, 55, 0.5)",
                            "0 0 20px rgba(212, 175, 55, 0.2)"
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50 overflow-hidden"
                      >
                        <img src={orlaAvatar} alt="Orla" className="w-full h-full object-cover" />
                      </motion.div>
                    )}
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background shadow-lg ${
                        agent.mode === "hybrid" && agent.isConnected
                          ? "bg-gradient-to-r from-emerald-500 to-primary shadow-primary/50"
                          : agent.isConnected 
                          ? "bg-emerald-500 shadow-emerald-500/50" 
                          : "bg-primary shadow-primary/50"
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-foreground text-lg tracking-wide flex items-center gap-2">
                      Orla
                      {agent.mode === "hybrid" && agent.isConnected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-[8px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-primary/30 to-emerald-500/30 text-primary border border-primary/30"
                        >
                          HYBRID
                        </motion.span>
                      )}
                    </h4>
                    <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-medium flex items-center gap-1.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      {agent.isProcessing 
                        ? "Composing..." 
                        : agent.isSpeaking 
                        ? "Speaking..." 
                        : agent.isListening 
                        ? "Listening..." 
                        : "Private Liaison"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {user && (
                    <button
                      onClick={handleNewConversation}
                      className="w-8 h-8 rounded-full hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                      title="Start new conversation"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Enhanced Mode Switcher */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => agent.switchMode("chat")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all ${
                    agent.mode === "chat"
                      ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Text
                </button>
                <button
                  onClick={handleVoiceToggle}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all ${
                    agent.mode === "voice" && agent.isConnected
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {agent.mode === "voice" && agent.isConnected ? (
                    <>
                      <PhoneOff className="w-3.5 h-3.5" />
                      End
                    </>
                  ) : (
                    <>
                      <Phone className="w-3.5 h-3.5" />
                      Voice
                    </>
                  )}
                </button>
                <button
                  onClick={handleHybridMode}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all relative overflow-hidden ${
                    agent.mode === "hybrid" && agent.isConnected
                      ? "bg-gradient-to-r from-primary/20 to-emerald-500/20 text-primary border border-primary/30"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {agent.mode === "hybrid" && agent.isConnected && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/10 to-emerald-500/10"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <Zap className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">Both</span>
                </button>
              </div>
            </div>

            {/* Voice Mode Active Indicator */}
            {agent.mode === "voice" && agent.isConnected && (
              <div className="px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                  />
                  <p className="text-xs text-emerald-400 font-medium">
                    Voice call active • {agent.isSpeaking ? "Orla is speaking" : "Listening..."}
                  </p>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
              {allMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.role === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "items-start space-x-3"}`}
                >
                  {message.role === "agent" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex-shrink-0 overflow-hidden mt-0.5">
                      <img src={orlaAvatar} alt="Orla" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className={`${
                    message.role === "user" 
                      ? "bg-primary/15 border border-primary/25 rounded-2xl rounded-tr-none" 
                      : "bg-secondary/40 border border-border/20 rounded-2xl rounded-tl-none"
                  } p-4 max-w-[85%]`}>
                    <p className={`text-xs font-light leading-relaxed whitespace-pre-wrap ${
                      message.role === "user" ? "text-primary" : "text-foreground/90"
                    }`}>
                      {message.content}
                      {message.isStreaming && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="inline-block w-1 h-3 bg-primary ml-1"
                        />
                      )}
                    </p>
                    {message.mode === "voice" && (
                      <p className="text-[9px] text-muted-foreground mt-2 flex items-center gap-1">
                        <Mic className="w-2.5 h-2.5" />
                        Voice message
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {agent.isProcessing && allMessages[allMessages.length - 1]?.role === "user" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex-shrink-0 overflow-hidden">
                      <img src={orlaAvatar} alt="Orla" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-secondary/40 border border-primary/20 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Show for chat mode OR hybrid mode */}
            {(agent.mode === "chat" || agent.mode === "hybrid") && (
              <div className="p-4 border-t border-border/30 bg-gradient-to-t from-background/80 to-transparent">
                {agent.mode === "hybrid" && agent.isConnected && (
                  <div className="flex items-center justify-center gap-2 mb-3 py-2 px-3 bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-lg border border-primary/20">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-emerald-500"
                    />
                    <p className="text-[10px] text-foreground/80 font-medium">
                      Hybrid active • Speak or type below
                    </p>
                    <Mic className="w-3 h-3 text-emerald-400" />
                  </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={agent.mode === "hybrid" ? "Type while voice is active..." : "Type your request..."}
                    className="w-full bg-secondary/40 border border-border/30 rounded-xl py-3.5 pl-4 pr-12 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-secondary/60 transition-all font-light"
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    disabled={agent.isProcessing}
                  />
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSend}
                    disabled={agent.isProcessing || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg transition-all disabled:opacity-50"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="flex justify-between items-center mt-3 px-1">
                  <p className="text-[9px] text-muted-foreground/60 flex items-center">
                    <Lock className="w-2.5 h-2.5 mr-1 text-emerald-500/70" />
                    {user ? "Memory enabled" : "End-to-End Encrypted"}
                  </p>
                  <p className="text-[9px] text-primary/70 font-medium">Powered by Orla AI</p>
                </div>
                {agent.mode === "hybrid" && agent.isConnected && (
                  <button
                    onClick={handleHybridMode}
                    className="w-full mt-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all"
                  >
                    <PhoneOff className="w-3 h-3" />
                    End Hybrid Session
                  </button>
                )}
              </div>
            )}

            {/* Voice Mode Footer */}
            {agent.mode === "voice" && agent.isConnected && (
              <div className="p-4 border-t border-border/30 bg-gradient-to-t from-background/80 to-transparent">
                <button
                  onClick={handleVoiceToggle}
                  className="w-full py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium flex items-center justify-center gap-2 hover:bg-red-500/30 transition-all"
                >
                  <PhoneOff className="w-4 h-4" />
                  End Voice Call
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:right-8 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary/90 to-primary overflow-hidden border-2 border-primary/60 shadow-[0_0_40px_rgba(212,175,55,0.4)] flex items-center justify-center transition-all duration-300 group"
      >
        <motion.span 
          animate={{ 
            scale: [1, 1.4, 1], 
            opacity: [0.4, 0, 0.4],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-primary/40"
        />
        
        <motion.span 
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-background rounded-full z-10 flex items-center justify-center shadow-lg shadow-emerald-500/40"
        >
          <span className="text-[9px] font-bold text-white">AI</span>
        </motion.span>

        <img 
          src={orlaAvatar} 
          alt="Speak with Orla"
          className="w-full h-full object-cover"
        />

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 bg-secondary/95 backdrop-blur-xl border border-border/30 rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <p className="text-xs text-foreground font-medium">Chat with Orla</p>
          <p className="text-[10px] text-muted-foreground">Text & Voice AI</p>
        </motion.div>
      </motion.button>
    </>
  );
};

export default MultiAgentWidget;
