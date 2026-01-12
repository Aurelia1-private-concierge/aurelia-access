import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ConversationSummary {
  id: string;
  title: string | null;
  started_at: string | null;
  ended_at: string | null;
  message_count: number | null;
}

interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  created_at: string | null;
}

export const useConversationHistory = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all voice conversations for the user
  const fetchConversations = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, started_at, ended_at, message_count")
      .eq("user_id", userId)
      .eq("channel", "voice")
      .order("started_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Failed to fetch conversations:", error);
    } else {
      setConversations(data || []);
    }
    setIsLoading(false);
  }, [userId]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("conversation_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch messages:", error);
    } else {
      setMessages(data || []);
    }
    setSelectedConversation(conversationId);
    setIsLoading(false);
  }, []);

  // Clear selected conversation
  const clearSelection = useCallback(() => {
    setSelectedConversation(null);
    setMessages([]);
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    // Delete messages first (foreign key constraint)
    await supabase
      .from("conversation_messages")
      .delete()
      .eq("conversation_id", conversationId);

    // Then delete the conversation
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      console.error("Failed to delete conversation:", error);
      return false;
    }

    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (selectedConversation === conversationId) {
      clearSelection();
    }
    return true;
  }, [selectedConversation, clearSelection]);

  // Fetch on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    selectedConversation,
    messages,
    isLoading,
    fetchConversations,
    fetchMessages,
    clearSelection,
    deleteConversation,
  };
};
