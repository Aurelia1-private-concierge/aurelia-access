import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: "member" | "concierge" | "system";
  content: string;
  message_type: "text" | "image" | "file" | "service_request" | "notification";
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

interface Conversation {
  id: string;
  user_id: string;
  started_at: string;
  last_message_at: string;
  metadata: unknown;
}

export const useConciergeChat = () => {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Get or create conversation for current user
  const getOrCreateConversation = useCallback(async () => {
    if (!user) return null;

    try {
      // Check for existing conversation
      const { data: existing, error: fetchError } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false })
        .limit(1)
        .single();

      if (existing && !fetchError) {
        setConversation(existing);
        return existing;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          metadata: { type: "concierge_support" },
        })
        .select()
        .single();

      if (createError) throw createError;
      setConversation(newConv);
      return newConv;
    } catch (error) {
      console.error("Error getting/creating conversation:", error);
      return null;
    }
  }, [user]);

  // Fetch messages for current conversation
  const fetchMessages = useCallback(async () => {
    if (!conversation) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("concierge_messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      // Type assertion since we know the data structure
      const typedMessages = (data || []) as unknown as Message[];
      setMessages(typedMessages);
      setUnreadCount(typedMessages.filter((m) => !m.is_read && m.sender_role !== "member").length);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [conversation]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string, messageType: Message["message_type"] = "text", metadata: Record<string, unknown> = {}) => {
      if (!user || !conversation || !content.trim()) return null;

      setIsSending(true);
      try {
        const { data, error } = await supabase
          .from("concierge_messages")
          .insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            sender_role: "member",
            content: content.trim(),
            message_type: messageType,
            metadata: metadata as Record<string, string | number | boolean | null>,
          })
          .select()
          .single();

        if (error) throw error;

        // Update conversation last_message_at
        await supabase
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", conversation.id);

        return data as unknown as Message;
      } catch (error) {
        console.error("Error sending message:", error);
        return null;
      } finally {
        setIsSending(false);
      }
    },
    [user, conversation]
  );

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!conversation || !user) return;

    try {
      await supabase
        .from("concierge_messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("conversation_id", conversation.id)
        .neq("sender_id", user.id)
        .eq("is_read", false);

      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id !== user.id && !m.is_read
            ? { ...m, is_read: true, read_at: new Date().toISOString() }
            : m
        )
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [conversation, user]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!conversation) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`concierge-messages-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "concierge_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as unknown as Message;
          setMessages((prev) => [...prev, newMessage]);
          if (newMessage.sender_role !== "member") {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  // Initialize conversation and fetch messages
  useEffect(() => {
    const init = async () => {
      const conv = await getOrCreateConversation();
      if (conv) {
        setConversation(conv);
      }
    };

    if (user) {
      init();
    }
  }, [user, getOrCreateConversation]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversation) {
      fetchMessages();
    }
  }, [conversation, fetchMessages]);

  return {
    messages,
    conversation,
    isLoading,
    isSending,
    unreadCount,
    sendMessage,
    markAsRead,
    fetchMessages,
  };
};

export default useConciergeChat;
