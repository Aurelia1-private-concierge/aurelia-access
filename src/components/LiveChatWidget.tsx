import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface LiveChatWidgetProps {
  proactiveDelay?: number; // ms before showing proactive prompt
  showOnPages?: string[];
}

export const LiveChatWidget = ({
  proactiveDelay = 30000,
  showOnPages = ["/", "/services", "/membership", "/waitlist"]
}: LiveChatWidgetProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showProactive, setShowProactive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [email, setEmail] = useState("");
  const [emailCollected, setEmailCollected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const shouldShowOnPage = showOnPages.some(page => 
    window.location.pathname === page || window.location.pathname.startsWith(page)
  );

  // Proactive engagement
  useEffect(() => {
    if (!shouldShowOnPage) return;
    
    const dismissed = sessionStorage.getItem("chat_proactive_dismissed");
    if (dismissed) return;

    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowProactive(true);
      }
    }, proactiveDelay);

    return () => clearTimeout(timer);
  }, [proactiveDelay, isOpen, shouldShowOnPage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if user is logged in for email
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      setEmailCollected(true);
    }
  }, [user]);

  const dismissProactive = () => {
    setShowProactive(false);
    sessionStorage.setItem("chat_proactive_dismissed", "true");
  };

  const openChat = () => {
    setIsOpen(true);
    setShowProactive(false);
    
    // Add welcome message if first time
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Welcome to Aurelia. I'm Orla, your private concierge. How may I assist you today?",
        timestamp: new Date()
      }]);
    }
  };

  const collectEmail = () => {
    if (!email || !email.includes("@")) return;
    setEmailCollected(true);
    
    // Track email collection
    supabase.from("funnel_events").insert({
      session_id: sessionStorage.getItem("funnel_session_id") || crypto.randomUUID(),
      stage: "chat_email_collected",
      metadata: { email }
    }).then(() => {});
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Call Orla AI endpoint
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          context: {
            email: emailCollected ? email : undefined,
            page: window.location.pathname,
            source: "live_chat_widget"
          }
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.content || "I apologize, but I'm unable to respond at the moment. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I apologize for the inconvenience. Please contact us directly at concierge@aurelia.com.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!shouldShowOnPage) return null;

  return (
    <>
      {/* Proactive Bubble */}
      <AnimatePresence>
        {showProactive && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-40 max-w-xs"
          >
            <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
              <button
                onClick={dismissProactive}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="font-medium text-sm">Need assistance?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    I'm Orla, your private concierge. Ask me anything about our services.
                  </p>
                  <Button
                    size="sm"
                    onClick={openChat}
                    className="mt-3 bg-gold hover:bg-gold/90 text-gold-foreground"
                  >
                    Start Chat
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        onClick={() => isOpen ? setIsOpen(false) : openChat()}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold/80 shadow-lg flex items-center justify-center text-gold-foreground hover:scale-105 transition-transform"
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gold/10 to-transparent px-4 py-3 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Orla</h3>
                <p className="text-xs text-muted-foreground">Your Private Concierge</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!emailCollected && !user && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <p className="text-sm">To assist you better, may I have your email?</p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-sm"
                    />
                    <Button size="sm" onClick={collectEmail}>
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-gold text-gold-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isTyping || (!emailCollected && !user)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  className="bg-gold hover:bg-gold/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChatWidget;
