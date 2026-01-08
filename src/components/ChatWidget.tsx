import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Minus, Crown, Lock, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type Message = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Good evening. Welcome to Aurelia. I'm your Private Liaison, here to assist with any request. How may I be of service today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

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
      // Remove the failed user message or add error response
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
            <div className="p-4 border-b border-border/30 bg-gradient-to-r from-background/80 to-secondary/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 overflow-hidden flex items-center justify-center"
                  >
                    <Crown className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" 
                  />
                </div>
                <div>
                  <h4 className="font-serif text-foreground text-sm tracking-wide">Private Liaison</h4>
                  <p className="text-[10px] text-primary uppercase tracking-widest font-medium flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {isLoading ? "Composing..." : "Concierge Active"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: message.role === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "items-start space-x-3"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-background border border-border/30 flex-shrink-0 flex items-center justify-center mt-1">
                      <Crown className="w-3 h-3 text-primary" strokeWidth={1.5} />
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
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-background border border-border/30 flex-shrink-0 flex items-center justify-center mt-1">
                      <Crown className="w-3 h-3 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="bg-secondary/40 border border-border/20 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                  disabled={isLoading}
                />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg transition-all disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="flex justify-between items-center mt-2.5 px-1">
                <p className="text-[9px] text-muted-foreground/50 flex items-center">
                  <Lock className="w-2.5 h-2.5 mr-1" />
                  End-to-End Encrypted
                </p>
                <p className="text-[9px] text-primary/60">Powered by Aurelia AI</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Trigger Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-6 md:right-8 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground gold-glow flex items-center justify-center transition-all duration-300 group"
      >
        {/* Pulsing ring */}
        <motion.span 
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-primary/30"
        />
        
        {/* Notification Dot */}
        {!isOpen && (
          <motion.span 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 border-2 border-background rounded-full z-10 flex items-center justify-center"
          >
            <span className="text-[8px] font-bold text-white">1</span>
          </motion.span>
        )}

        <MessageSquare
          className={`w-6 h-6 absolute transition-all duration-300 ${
            isOpen ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"
          }`}
        />
        <X
          className={`w-6 h-6 absolute transition-all duration-300 ${
            isOpen ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"
          }`}
        />
      </motion.button>
    </>
  );
};

export default ChatWidget;
