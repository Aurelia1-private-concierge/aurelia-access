import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronRight, Clock, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface VoiceSession {
  id: string;
  title: string | null;
  started_at: string | null;
  ended_at: string | null;
  message_count: number | null;
}

interface SessionMessage {
  id: string;
  role: string;
  content: string;
  created_at: string | null;
}

interface VoiceSessionHistoryProps {
  userId: string;
  onClose?: () => void;
}

const VoiceSessionHistory = ({ userId, onClose }: VoiceSessionHistoryProps) => {
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch voice sessions
  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, started_at, ended_at, message_count")
        .eq("user_id", userId)
        .eq("channel", "voice")
        .order("started_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setSessions(data);
      }
      setIsLoading(false);
    };

    fetchSessions();
  }, [userId]);

  // Fetch messages for selected session
  useEffect(() => {
    if (!selectedSession) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("conversation_messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", selectedSession)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [selectedSession]);

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return "—";
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="font-serif text-lg">Voice Sessions</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sessions List */}
        <div className={`${selectedSession ? 'w-1/3 border-r border-border/30' : 'w-full'} transition-all`}>
          <ScrollArea className="h-full">
            {sessions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No voice sessions yet</p>
                <p className="text-xs mt-1">Start a conversation with Orla</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {sessions.map((session) => (
                  <motion.button
                    key={session.id}
                    onClick={() => setSelectedSession(
                      selectedSession === session.id ? null : session.id
                    )}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedSession === session.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-secondary/50 border border-transparent"
                    }`}
                    whileHover={{ x: 2 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate">
                        {session.title || "Voice Session"}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${
                        selectedSession === session.id ? "rotate-90" : ""
                      }`} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.started_at 
                          ? formatDistanceToNow(new Date(session.started_at), { addSuffix: true })
                          : "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {session.message_count || 0}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Messages Panel */}
        <AnimatePresence>
          {selectedSession && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "66.666667%" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-xl text-sm ${
                          message.role === "user"
                            ? "bg-primary/20 text-foreground"
                            : "bg-secondary/50 text-foreground"
                        }`}
                      >
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                          {message.role === "user" ? "You" : "Orla"}
                        </p>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VoiceSessionHistory;
