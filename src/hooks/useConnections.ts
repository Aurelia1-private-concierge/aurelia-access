import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  company: string | null;
  phone: string | null;
  timezone: string | null;
}

export interface Connection {
  id: string;
  follower_id: string;
  following_id: string;
  status: string;
  created_at: string;
  profile?: UserProfile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useConnections() {
  const { user } = useAuth();
  const [following, setFollowing] = useState<Connection[]>([]);
  const [followers, setFollowers] = useState<Connection[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFollowing = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .eq('follower_id', user.id)
        .eq('status', 'following');

      if (error) throw error;
      
      // Fetch profiles for each connection
      if (data && data.length > 0) {
        const userIds = data.map(c => c.following_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, user_id, display_name, avatar_url, company, phone, timezone')
          .in('user_id', userIds);

        const connectionsWithProfiles = data.map(c => ({
          ...c,
          profile: profiles?.find(p => p.user_id === c.following_id) as UserProfile | undefined,
        }));
        
        setFollowing(connectionsWithProfiles);
        return connectionsWithProfiles;
      }

      setFollowing([]);
      return [];
    } catch (err) {
      console.error('Error fetching following:', err);
      return [];
    }
  }, [user]);

  const fetchFollowers = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .eq('following_id', user.id)
        .eq('status', 'following');

      if (error) throw error;
      
      // Fetch profiles for each connection
      if (data && data.length > 0) {
        const userIds = data.map(c => c.follower_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, user_id, display_name, avatar_url, company, phone, timezone')
          .in('user_id', userIds);

        const connectionsWithProfiles = data.map(c => ({
          ...c,
          profile: profiles?.find(p => p.user_id === c.follower_id) as UserProfile | undefined,
        }));
        
        setFollowers(connectionsWithProfiles);
        return connectionsWithProfiles;
      }

      setFollowers([]);
      return [];
    } catch (err) {
      console.error('Error fetching followers:', err);
      return [];
    }
  }, [user]);

  const followUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!user) {
      toast({ title: 'Please sign in', variant: 'destructive' });
      return false;
    }

    if (userId === user.id) {
      toast({ title: 'You cannot follow yourself', variant: 'destructive' });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_connections')
        .insert({
          follower_id: user.id,
          following_id: userId,
          status: 'following',
        });

      if (error) {
        if (error.code === '23505') {
          // Already following, unfollow
          await supabase.from('user_connections').delete()
            .eq('follower_id', user.id)
            .eq('following_id', userId);
          toast({ title: 'Unfollowed' });
          await fetchFollowing();
          return false;
        }
        throw error;
      }

      toast({ title: 'Following' });
      await fetchFollowing();
      return true;
    } catch (err) {
      console.error('Error following user:', err);
      return false;
    }
  }, [user, fetchFollowing]);

  const unfollowUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;
      toast({ title: 'Unfollowed' });
      await fetchFollowing();
      return true;
    } catch (err) {
      console.error('Error unfollowing user:', err);
      return false;
    }
  }, [user, fetchFollowing]);

  const blockUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Remove any existing connection and create blocked status
      await supabase.from('user_connections').delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      await supabase.from('user_connections').insert({
        follower_id: user.id,
        following_id: userId,
        status: 'blocked',
      });

      toast({ title: 'User Blocked' });
      return true;
    } catch (err) {
      console.error('Error blocking user:', err);
      return false;
    }
  }, [user]);

  const isFollowing = useCallback((userId: string): boolean => {
    return following.some(f => f.following_id === userId);
  }, [following]);

  // Notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications((data || []) as Notification[]);
      setUnreadCount((data || []).filter(n => !n.is_read).length);
      return data as Notification[];
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return [];
    }
  }, [user]);

  const markNotificationRead = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Error marking notification read:', err);
      return false;
    }
  }, []);

  const markAllNotificationsRead = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Error marking all notifications read:', err);
      return false;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchFollowing(), fetchFollowers(), fetchNotifications()])
        .finally(() => setLoading(false));
    }
  }, [user, fetchFollowing, fetchFollowers, fetchNotifications]);

  // Realtime notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          const notif = payload.new as Notification;
          toast({ title: notif.title, description: notif.message || undefined });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    following,
    followers,
    notifications,
    unreadCount,
    loading,
    fetchFollowing,
    fetchFollowers,
    followUser,
    unfollowUser,
    blockUser,
    isFollowing,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  };
}
