import { useState, useEffect, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  Paperclip,
  User,
  Shield,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const RealTimeChat = forwardRef<HTMLDivElement>((_, ref) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversation();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch recent conversation
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .eq("channel", "chat")
        .is("ended_at", null)
        .order("last_message_at", { ascending: false })
        .limit(1)
        .single();

      if (conv) {
        setConversationId(conv.id);
        // Fetch messages for this conversation
        const { data: msgs } = await supabase
          .from("conversation_messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true });

        if (msgs) {
          setMessages(msgs.map(m => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            created_at: m.created_at || new Date().toISOString(),
          })));
        }
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim() || sending) return;

    const userMessage = newMessage.trim();
    setNewMessage("");
    setSending(true);
    setStreamingContent("");

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      // Call the chat edge function
      const response = await supabase.functions.invoke("chat", {
        body: {
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage }
          ],
          conversationId,
          channel: "chat",
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Get the conversation ID from response headers if new
      const newConvId = response.data?.conversationId;
      if (newConvId && !conversationId) {
        setConversationId(newConvId);
      }

      // Handle streaming response
      if (response.data) {
        // For non-streaming response, parse the content
        let assistantContent = "";
        
        if (typeof response.data === "string") {
          // Parse SSE stream
          const lines = response.data.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content || json.choices?.[0]?.message?.content;
                if (content) assistantContent += content;
              } catch { /* ignore parse errors */ }
            }
          }
        } else if (response.data.choices?.[0]?.message?.content) {
          assistantContent = response.data.choices[0].message.content;
        }

        if (assistantContent) {
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: assistantContent,
            created_at: new Date().toISOString(),
          };
          setMessages(prev => [...prev, assistantMsg]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I'm experiencing a momentary difficulty. Please try again.",
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
      setStreamingContent("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card ref={ref} className="bg-card/50 border-border/30 h-[500px] flex flex-col">
      <CardHeader className="pb-3 border-b border-border/30">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          Orla - Your Concierge
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Online 24/7
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Shield className="h-12 w-12 text-primary/30 mb-4" />
              <p className="text-muted-foreground">Welcome to Aurelia</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                How may I assist you today?
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false} mode="popLayout">
                {messages.map((message) => {
                  const isOwnMessage = message.role === "user";
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={isOwnMessage ? "bg-primary/20" : "bg-muted"}>
                            {isOwnMessage ? <User className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwnMessage
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-1 text-xs ${
                            isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>
                            <span>{format(new Date(message.created_at), "h:mm a")}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {/* Streaming indicator */}
              {sending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-muted">
                        <Shield className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl px-4 py-2 bg-muted rounded-bl-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Orla is typing...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-border/30">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Orla anything..."
              className="flex-1"
              disabled={sending}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="shrink-0"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-2 text-center">
            🔒 Your conversation is private and secure
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

RealTimeChat.displayName = "RealTimeChat";

export default RealTimeChat;
