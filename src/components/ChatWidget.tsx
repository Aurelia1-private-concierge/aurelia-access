import { useState, useRef, useEffect, useCallback } from "react";
import { X, Minus, Lock, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import orlaAvatar from "@/assets/orla-avatar.png";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Good evening. Welcome to Aurelia. I'm Orla, your Private Liaison. I'm here to orchestrate the extraordinary—from private aviation to rare acquisitions. How may I be of service?"
};

const ChatWidget = () => {
  const { user, session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load recent conversation when user is authenticated and widget opens
  const loadConversationHistory = useCallback(async () => {
    if (!user || !isOpen) return;

    setIsLoadingHistory(true);
    try {
      // Find most recent active conversation
      const { data: recentConv } = await supabase
        .from("conversations")
        .select("id, title, summary")
        .eq("user_id", user.id)
        .eq("channel", "chat")
        .is("ended_at", null)
        .gte("last_message_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("last_message_at", { ascending: false })
        .limit(1)
        .single();

      if (recentConv) {
        setConversationId(recentConv.id);

        // Load recent messages
        const { data: recentMessages } = await supabase
          .from("conversation_messages")
          .select("role, content")
          .eq("conversation_id", recentConv.id)
          .order("created_at", { ascending: true })
          .limit(20);

        if (recentMessages && recentMessages.length > 0) {
          const typedMessages = recentMessages.map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content
          }));
          setMessages([INITIAL_MESSAGE, ...typedMessages]);
        }
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen && user && !conversationId) {
      loadConversationHistory();
    }
  }, [isOpen, user, conversationId, loadConversationHistory]);

  // Reset conversation state when user logs out
  useEffect(() => {
    if (!user) {
      setConversationId(null);
      setMessages([INITIAL_MESSAGE]);
    }
  }, [user]);

  const startNewConversation = async () => {
    setConversationId(null);
    setMessages([INITIAL_MESSAGE]);
    toast.success("Started a new conversation");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistantMessage = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2].role === "user") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      // Get auth token for authenticated requests
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
      }

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          messages: [...messages.slice(1), userMessage], // Skip initial greeting
          conversationId,
          channel: "chat"
        }),
      });

      // Capture conversation ID from response header
      const respConvId = resp.headers.get("X-Conversation-Id");
      if (respConvId && !conversationId) {
        setConversationId(respConvId);
      }

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to connect to concierge");
      }

      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistantMessage(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistantMessage(content);
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Connection error");
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "I apologize, but I'm momentarily unable to connect. Please try again, or call our private line for immediate assistance." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-28 right-6 md:right-8 z-50 w-80 sm:w-96 h-[520px] bg-card/95 backdrop-blur-xl border border-border/30 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden origin-bottom-right"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-primary/20 bg-gradient-to-r from-background via-secondary/20 to-background flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <motion.div 
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(212, 175, 55, 0.2)",
                        "0 0 35px rgba(212, 175, 55, 0.4)",
                        "0 0 20px rgba(212, 175, 55, 0.2)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50 overflow-hidden p-0.5"
                  >
                    <img 
                      src={orlaAvatar} 
                      alt="Orla" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background shadow-lg shadow-emerald-500/50" 
                  />
                </div>
                <div>
                  <h4 className="font-serif text-foreground text-base tracking-wide">Orla</h4>
                  <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-medium flex items-center gap-1.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    {isLoadingHistory ? "Loading history..." : isLoading ? "Composing..." : "Private Liaison"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {user && (
                  <button
                    onClick={startNewConversation}
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

            {/* Conversation indicator for authenticated users */}
            {user && conversationId && (
              <div className="px-4 py-2 bg-primary/5 border-b border-primary/10">
                <p className="text-[10px] text-primary/70 text-center">
                  Continuing your conversation • Memory enabled
                </p>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full"
                  />
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: message.role === "user" ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${message.role === "user" ? "justify-end" : "items-start space-x-3"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex-shrink-0 overflow-hidden mt-0.5 shadow-sm shadow-primary/20">
                          <img src={orlaAvatar} alt="Orla" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className={`${
                        message.role === "user" 
                          ? "bg-primary/15 border border-primary/25 rounded-2xl rounded-tr-none" 
                          : "bg-secondary/40 border border-border/20 rounded-2xl rounded-tl-none backdrop-blur-sm"
                      } p-4 max-w-[85%]`}>
                        <p className={`text-xs font-light leading-relaxed whitespace-pre-wrap ${
                          message.role === "user" ? "text-primary" : "text-foreground/90"
                        }`}>
                          {message.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex-shrink-0 overflow-hidden mt-0.5 shadow-sm shadow-primary/20">
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
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-border/30 bg-gradient-to-t from-background/80 to-transparent">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your request securely..."
                  className="w-full bg-secondary/40 border border-border/30 rounded-xl py-3.5 pl-4 pr-12 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-secondary/60 transition-all font-light"
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={isLoading || isLoadingHistory}
                />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={isLoading || !input.trim() || isLoadingHistory}
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
                <p className="text-[9px] text-primary/70 font-medium tracking-wide">Powered by Orla AI</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Trigger Button - Orla Avatar */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-6 md:right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-primary/90 to-primary overflow-hidden border-2 border-primary/60 shadow-[0_0_40px_rgba(212,175,55,0.4)] flex items-center justify-center transition-all duration-300 group"
      >
        {/* Animated glow ring */}
        <motion.span 
          animate={{ 
            scale: [1, 1.4, 1], 
            opacity: [0.4, 0, 0.4],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-primary/40"
        />
        <motion.span 
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.6, 0.2, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute inset-0 rounded-full bg-primary/30"
        />
        
        {/* Notification Dot */}
        {!isOpen && (
          <motion.span 
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-background rounded-full z-10 flex items-center justify-center shadow-lg shadow-emerald-500/40"
          >
            <span className="text-[9px] font-bold text-white">1</span>
          </motion.span>
        )}

        {/* Orla Avatar / Close icon */}
        <img 
          src={orlaAvatar} 
          alt="Orla"
          className={`w-full h-full object-cover absolute transition-all duration-300 ${
            isOpen ? "scale-0 opacity-0 rotate-45" : "scale-100 opacity-100 rotate-0"
          }`}
        />
        <X
          className={`w-7 h-7 text-primary-foreground absolute transition-all duration-300 ${
            isOpen ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"
          }`}
        />
      </motion.button>
    </>
  );
};

export default ChatWidget;
