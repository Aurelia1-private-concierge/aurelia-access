import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TranscriptEntry {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

export const useVoiceSession = (userId: string | undefined) => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);

  const startSession = useCallback(async () => {
    if (!userId) {
      console.log("useVoiceSession: No userId provided, skipping session creation");
      return null;
    }

    console.log("useVoiceSession: Creating conversation for user", userId);
    
    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          channel: "voice",
          started_at: new Date().toISOString(),
          title: `Voice Session - ${new Date().toLocaleDateString()}`,
        })
        .select("id")
        .single();

      if (error) {
        console.error("useVoiceSession: Failed to create voice session:", error);
        // Don't throw - session tracking is optional, conversation can continue
        return null;
      }

      console.log("useVoiceSession: Session created successfully:", data.id);
      setCurrentSessionId(data.id);
      setMessageCount(0);
      return data.id;
    } catch (err) {
      console.error("useVoiceSession: Unexpected error:", err);
      return null;
    }
  }, [userId]);

  const addMessage = useCallback(async (entry: TranscriptEntry) => {
    if (!currentSessionId) return;

    const { error } = await supabase
      .from("conversation_messages")
      .insert({
        conversation_id: currentSessionId,
        role: entry.role,
        content: entry.text,
        created_at: entry.timestamp.toISOString(),
      });

    if (error) {
      console.error("Failed to save message:", error);
      return;
    }

    setMessageCount((prev) => prev + 1);

    // Update message count on conversation
    await supabase
      .from("conversations")
      .update({ 
        message_count: messageCount + 1,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", currentSessionId);
  }, [currentSessionId, messageCount]);

  const endSession = useCallback(async (generateTitle?: boolean) => {
    if (!currentSessionId) return;

    const updates: Record<string, unknown> = {
      ended_at: new Date().toISOString(),
      message_count: messageCount,
    };

    // Optionally generate a title from the first user message
    if (generateTitle) {
      const { data: messages } = await supabase
        .from("conversation_messages")
        .select("content")
        .eq("conversation_id", currentSessionId)
        .eq("role", "user")
        .order("created_at", { ascending: true })
        .limit(1);

      if (messages && messages.length > 0) {
        const firstMessage = messages[0].content;
        updates.title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
      }
    }

    await supabase
      .from("conversations")
      .update(updates)
      .eq("id", currentSessionId);

    setCurrentSessionId(null);
    setMessageCount(0);
  }, [currentSessionId, messageCount]);

  return {
    currentSessionId,
    startSession,
    addMessage,
    endSession,
  };
};
