import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CircleProfile } from './useCircle';

export interface CircleMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  memberId: string;
  member: CircleProfile | null;
  lastMessage: CircleMessage | null;
  unreadCount: number;
}

export const useCircleMessaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<CircleMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    // Get all messages involving current user
    const { data: allMessages, error } = await supabase
      .from('circle_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[CircleMessaging] Error fetching messages:', error);
      return;
    }

    // Group by conversation partner
    const convMap = new Map<string, { lastMessage: CircleMessage; unreadCount: number }>();
    
    for (const msg of (allMessages || []) as CircleMessage[]) {
      const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
      
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, {
          lastMessage: msg,
          unreadCount: 0,
        });
      }
      
      // Count unread messages from partner
      if (msg.sender_id === partnerId && !msg.is_read) {
        const conv = convMap.get(partnerId)!;
        conv.unreadCount++;
      }
    }

    // Fetch member profiles
    const partnerIds = Array.from(convMap.keys());
    let profiles: CircleProfile[] = [];
    
    if (partnerIds.length > 0) {
      const { data: profileData } = await supabase
        .from('circle_profiles')
        .select('*')
        .in('user_id', partnerIds);
      
      profiles = (profileData || []) as unknown as CircleProfile[];
    }

    // Build conversations list
    const convList: Conversation[] = [];
    for (const [memberId, data] of convMap) {
      convList.push({
        memberId,
        member: profiles.find(p => p.user_id === memberId) || null,
        lastMessage: data.lastMessage,
        unreadCount: data.unreadCount,
      });
    }

    // Sort by last message time
    convList.sort((a, b) => {
      const aTime = new Date(a.lastMessage?.created_at || 0).getTime();
      const bTime = new Date(b.lastMessage?.created_at || 0).getTime();
      return bTime - aTime;
    });

    setConversations(convList);
  }, [user]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (memberId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('circle_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${memberId}),and(sender_id.eq.${memberId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('[CircleMessaging] Error fetching messages:', error);
      return;
    }

    setMessages((data || []) as CircleMessage[]);

    // Mark messages as read
    await supabase
      .from('circle_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('sender_id', memberId)
      .eq('recipient_id', user.id)
      .eq('is_read', false);
  }, [user]);

  // Send message
  const sendMessage = useCallback(async (recipientId: string, content: string) => {
    if (!user || !content.trim()) return null;

    setIsSending(true);

    const { data, error } = await supabase
      .from('circle_messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: content.trim(),
        is_encrypted: false, // TODO: Implement E2E encryption
      })
      .select()
      .single();

    setIsSending(false);

    if (error) {
      console.error('[CircleMessaging] Error sending message:', error);
      return null;
    }

    return data as CircleMessage;
  }, [user]);

  // Open conversation with member
  const openConversation = useCallback((memberId: string) => {
    setActiveConversation(memberId);
    fetchMessages(memberId);
  }, [fetchMessages]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!user || !activeConversation) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`circle-dm-${user.id}-${activeConversation}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'circle_messages',
      }, (payload) => {
        const newMsg = payload.new as CircleMessage;
        // Check if message is part of current conversation
        const isRelevant = 
          (newMsg.sender_id === user.id && newMsg.recipient_id === activeConversation) ||
          (newMsg.sender_id === activeConversation && newMsg.recipient_id === user.id);
        
        if (isRelevant) {
          setMessages(prev => [...prev, newMsg]);
          // Mark as read if received
          if (newMsg.sender_id === activeConversation) {
            supabase
              .from('circle_messages')
              .update({ is_read: true, read_at: new Date().toISOString() })
              .eq('id', newMsg.id);
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeConversation]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      await fetchConversations();
      setIsLoading(false);
    };

    init();
  }, [user, fetchConversations]);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isSending,
    sendMessage,
    openConversation,
    fetchConversations,
    setActiveConversation,
  };
};

export default useCircleMessaging;
