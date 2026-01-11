import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isSubscribed: boolean;
  isLoading: boolean;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: { action: string; title: string; icon?: string }[];
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'unsupported',
    isSubscribed: false,
    isLoading: true,
  });

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      
      if (!isSupported) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          permission: 'unsupported',
          isLoading: false,
        }));
        return;
      }

      const permission = Notification.permission;
      
      // Check if already subscribed
      let isSubscribed = false;
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        isSubscribed = !!subscription;
      } catch {
        // Silent fail
      }

      setState({
        isSupported: true,
        permission,
        isSubscribed,
        isLoading: false,
      });
    };

    checkSupport();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch {
      return false;
    }
  }, [state.isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || state.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // For demo purposes, we'll create a subscription without a real VAPID key
      // In production, you'd get this from your server
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // This is a placeholder - in production, use your real VAPID public key
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        ),
      });

      // Store subscription in database if user is logged in
      if (user) {
        await supabase
          .from('notification_settings')
          .upsert({
            user_id: user.id,
            email_enabled: true,
            sms_enabled: false,
            daily_digest_enabled: false,
            digest_time: '09:00',
            alert_types: ['booking', 'message', 'promotion'],
          }, { onConflict: 'user_id' });
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false,
      }));

      // Show welcome notification
      showNotification({
        title: 'Notifications Enabled',
        body: 'You\'ll now receive updates about your bookings and exclusive offers.',
        icon: '/apple-touch-icon.png',
      });

      return true;
    } catch (error) {
      console.error('Push subscription failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.isSupported, state.permission, requestPermission, user]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || !state.isSubscribed) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [state.isSupported, state.isSubscribed]);

  // Show a local notification
  const showNotification = useCallback((payload: NotificationPayload) => {
    if (!state.isSupported || state.permission !== 'granted') return;

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/apple-touch-icon.png',
        badge: payload.badge || '/favicon.svg',
        tag: payload.tag,
        data: payload.data,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch {
      // Fallback to service worker notification
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/apple-touch-icon.png',
          badge: payload.badge || '/favicon.svg',
          tag: payload.tag,
          data: payload.data,
        });
      });
    }
  }, [state.isSupported, state.permission]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray.buffer as ArrayBuffer;
}

export default usePushNotifications;
