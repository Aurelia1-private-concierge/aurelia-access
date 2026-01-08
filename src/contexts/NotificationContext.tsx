import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type NotificationType = "portfolio" | "message" | "document" | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  isLoading: boolean;
  userId: string | null;
}

interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Demo notifications for non-authenticated users
const demoNotifications: Notification[] = [
  {
    id: "demo-1",
    type: "portfolio",
    title: "Portfolio Value Update",
    description: "Your total assets increased by $1.2M today",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: "demo-2",
    type: "message",
    title: "New Message",
    description: "Victoria Laurent sent you a secure message",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: "demo-3",
    type: "document",
    title: "Document Uploaded",
    description: "Monaco Property Agreement has been added to your vault",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  },
];

const mapDbToNotification = (dbNotification: DbNotification): Notification => ({
  id: dbNotification.id,
  type: dbNotification.type as NotificationType,
  title: dbNotification.title,
  description: dbNotification.description,
  timestamp: new Date(dbNotification.created_at),
  read: dbNotification.read,
  actionUrl: dbNotification.action_url || undefined,
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications from database
  const fetchNotifications = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        logger.error("Error fetching notifications", error);
        return;
      }

      if (data) {
        setNotifications(data.map(mapDbToNotification));
      }
    } catch (err) {
      logger.error("Failed to fetch notifications", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to auth changes and set up realtime
  useEffect(() => {
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        await fetchNotifications(session.user.id);

        // Set up realtime subscription for this user
        realtimeChannel = supabase
          .channel('notifications-changes')
          .on<DbNotification>(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${session.user.id}`,
            },
            (payload: RealtimePostgresChangesPayload<DbNotification>) => {
              if (payload.new && 'id' in payload.new) {
                const newNotification = mapDbToNotification(payload.new as DbNotification);
                setNotifications((prev) => [newNotification, ...prev]);
                
                // Show toast for new notifications
                toast({
                  title: newNotification.title,
                  description: newNotification.description,
                });
              }
            }
          )
          .on<DbNotification>(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${session.user.id}`,
            },
            (payload: RealtimePostgresChangesPayload<DbNotification>) => {
              if (payload.new && 'id' in payload.new) {
                const updatedNotification = mapDbToNotification(payload.new as DbNotification);
                setNotifications((prev) =>
                  prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
                );
              }
            }
          )
          .on<DbNotification>(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${session.user.id}`,
            },
            (payload: RealtimePostgresChangesPayload<DbNotification>) => {
              if (payload.old && 'id' in payload.old) {
                setNotifications((prev) => prev.filter((n) => n.id !== (payload.old as DbNotification).id));
              }
            }
          )
          .subscribe();
      } else {
        setIsLoading(false);
        setNotifications(demoNotifications);
      }
    };

    setupRealtime();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        await fetchNotifications(session.user.id);
      } else {
        setUserId(null);
        setNotifications(demoNotifications);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [fetchNotifications]);

  const addNotification = useCallback(
    async (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      if (!userId) {
        // Demo mode - just add locally
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);
        toast({
          title: notification.title,
          description: notification.description,
        });
        return;
      }

      // Insert into database - realtime will handle the update
      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        description: notification.description,
        action_url: notification.actionUrl || null,
      });

      if (error) {
        logger.error("Error adding notification", error);
        toast({
          title: "Error",
          description: "Failed to save notification",
          variant: "destructive",
        });
      }
    },
    [userId]
  );

  const markAsRead = useCallback(
    async (id: string) => {
      if (!userId) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) {
        logger.error("Error marking notification as read", error);
      }
    },
    [userId]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);

    if (error) {
      logger.error("Error marking all notifications as read", error);
    }
  }, [userId]);

  const clearNotification = useCallback(
    async (id: string) => {
      if (!userId) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) {
        logger.error("Error deleting notification", error);
      }
    },
    [userId]
  );

  const clearAll = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    if (error) {
      logger.error("Error clearing all notifications", error);
    }
  }, [userId]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        isLoading,
        userId,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
