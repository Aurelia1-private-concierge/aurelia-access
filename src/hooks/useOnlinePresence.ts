/**
 * Real-time online presence tracking using Supabase Realtime
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  user_id: string;
  email?: string;
  display_name?: string;
  online_at: string;
  page?: string;
}

interface UseOnlinePresenceOptions {
  channelName?: string;
  trackPage?: boolean;
}

export function useOnlinePresence(options: UseOnlinePresenceOptions = {}) {
  const { channelName = 'online-users', trackPage = true } = options;
  const { user } = useAuth();
  
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Update presence state
  const updatePresence = useCallback(async (presenceChannel: RealtimeChannel) => {
    if (!user) return;

    const presenceState: PresenceState = {
      user_id: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
      online_at: new Date().toISOString(),
      page: trackPage ? window.location.pathname : undefined,
    };

    await presenceChannel.track(presenceState);
  }, [user, trackPage]);

  useEffect(() => {
    if (!user) {
      setOnlineUsers([]);
      setOnlineCount(0);
      setIsConnected(false);
      return;
    }

    const presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: PresenceState[] = [];
        
        Object.values(state).forEach((presences) => {
          if (Array.isArray(presences)) {
            presences.forEach((presence) => {
              // Safely extract presence data
              const p = presence as Record<string, unknown>;
              if (p.user_id && p.online_at) {
                users.push({
                  user_id: String(p.user_id),
                  email: p.email ? String(p.email) : undefined,
                  display_name: p.display_name ? String(p.display_name) : undefined,
                  online_at: String(p.online_at),
                  page: p.page ? String(p.page) : undefined,
                });
              }
            });
          }
        });
        
        setOnlineUsers(users);
        setOnlineCount(users.length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('[Presence] User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('[Presence] User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await updatePresence(presenceChannel);
        } else {
          setIsConnected(false);
        }
      });

    setChannel(presenceChannel);

    // Update presence when page changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence(presenceChannel);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      presenceChannel.unsubscribe();
    };
  }, [user, channelName, updatePresence]);

  // Update presence when navigating
  useEffect(() => {
    if (channel && isConnected && trackPage) {
      updatePresence(channel);
    }
  }, [channel, isConnected, trackPage, updatePresence]);

  return {
    onlineUsers,
    onlineCount,
    isConnected,
  };
}

export default useOnlinePresence;
