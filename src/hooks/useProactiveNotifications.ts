import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProactiveNotification {
  id: string;
  user_id: string;
  notification_type: 'membership_expiry' | 'upcoming_event' | 'opportunity' | 'partner_update';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  trigger_at: string;
  sent_at: string | null;
  metadata: Record<string, unknown> | null;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  created_at: string;
}

export function useProactiveNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ProactiveNotification[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('proactive_notification_queue')
      .select('*')
      .eq('user_id', user.id)
      .order('trigger_at', { ascending: true });

    if (data) {
      setNotifications(data as ProactiveNotification[]);
      setPendingCount(data.filter(n => n.status === 'pending').length);
    }
  }, [user?.id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    };
    load();
  }, [fetchNotifications]);

  const scheduleNotification = useCallback(async (
    notificationType: ProactiveNotification['notification_type'],
    title: string,
    message: string,
    triggerAt: Date,
    options?: {
      priority?: ProactiveNotification['priority'];
      metadata?: Record<string, unknown>;
    }
  ) => {
    if (!user?.id) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('proactive_notification_queue')
      .insert({
        user_id: user.id,
        notification_type: notificationType,
        title,
        message,
        trigger_at: triggerAt.toISOString(),
        priority: options?.priority ?? 'normal',
        metadata: options?.metadata,
      })
      .select()
      .single();

    if (!error && data) {
      setNotifications(prev => [...prev, data as ProactiveNotification].sort(
        (a, b) => new Date(a.trigger_at).getTime() - new Date(b.trigger_at).getTime()
      ));
      setPendingCount(prev => prev + 1);
    }

    return { data, error };
  }, [user?.id]);

  const cancelNotification = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('proactive_notification_queue')
      .update({ status: 'cancelled' })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, status: 'cancelled' as const } : n
      ));
      setPendingCount(prev => Math.max(0, prev - 1));
    }

    return { error };
  }, []);

  // Check for membership expiry and schedule notifications
  const checkMembershipExpiry = useCallback(async () => {
    if (!user?.id) return;

    // Get user's subscription info
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_ends_at')
      .eq('user_id', user.id)
      .single();

    if (profile?.subscription_ends_at) {
      const expiryDate = new Date(profile.subscription_ends_at);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Schedule notifications at different intervals
      const intervals = [30, 14, 7, 3, 1];
      for (const days of intervals) {
        if (daysUntilExpiry === days) {
          await scheduleNotification(
            'membership_expiry',
            `Membership Expiring in ${days} Day${days > 1 ? 's' : ''}`,
            `Your ${profile.subscription_tier} membership expires on ${expiryDate.toLocaleDateString()}. Renew now to maintain your exclusive benefits.`,
            new Date(),
            { priority: days <= 3 ? 'urgent' : 'high', metadata: { daysRemaining: days } }
          );
        }
      }
    }
  }, [user?.id, scheduleNotification]);

  // Check for upcoming events and schedule reminders
  const checkUpcomingEvents = useCallback(async () => {
    if (!user?.id) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { data: events } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_date', tomorrow.toISOString())
      .lte('start_date', nextWeek.toISOString())
      .order('start_date', { ascending: true });

    if (events) {
      for (const event of events) {
        const eventDate = new Date(event.start_date);
        const reminderTime = new Date(eventDate.getTime() - (event.reminder_minutes || 60) * 60 * 1000);

        // Check if reminder already scheduled
        const existing = notifications.find(n => 
          n.metadata?.event_id === event.id && n.status === 'pending'
        );

        if (!existing && reminderTime > new Date()) {
          await scheduleNotification(
            'upcoming_event',
            `Upcoming: ${event.title}`,
            `Your ${event.event_type || 'event'} "${event.title}" starts at ${eventDate.toLocaleTimeString()}${event.location ? ` at ${event.location}` : ''}.`,
            reminderTime,
            { priority: 'high', metadata: { event_id: event.id } }
          );
        }
      }
    }
  }, [user?.id, notifications, scheduleNotification]);

  return {
    notifications,
    pendingCount,
    loading,
    scheduleNotification,
    cancelNotification,
    checkMembershipExpiry,
    checkUpcomingEvents,
    refresh: fetchNotifications,
  };
}
