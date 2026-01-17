import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface BoardroomSession {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  room_code: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  max_participants: number;
  is_waiting_room_enabled: boolean;
  is_recording_enabled: boolean;
  participant_emails: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BoardroomParticipant {
  id: string;
  session_id: string;
  user_id: string | null;
  email: string | null;
  display_name: string;
  role: "host" | "co-host" | "participant" | "guest";
  status: "invited" | "waiting" | "joined" | "left";
  joined_at: string | null;
  left_at: string | null;
  created_at: string;
}

export interface CreateSessionInput {
  title: string;
  description?: string;
  scheduled_at: Date;
  duration_minutes?: number;
  max_participants?: number;
  is_waiting_room_enabled?: boolean;
  is_recording_enabled?: boolean;
  participant_emails?: string[];
}

export const useBoardroom = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<BoardroomSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("boardroom_sessions")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      setSessions((data as BoardroomSession[]) || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createSession = useCallback(
    async (input: CreateSessionInput): Promise<BoardroomSession | null> => {
      if (!user) {
        toast.error("Please sign in to create a session");
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("boardroom_sessions")
          .insert({
            host_id: user.id,
            title: input.title,
            description: input.description,
            scheduled_at: input.scheduled_at.toISOString(),
            duration_minutes: input.duration_minutes || 60,
            max_participants: input.max_participants || 10,
            is_waiting_room_enabled: input.is_waiting_room_enabled ?? true,
            is_recording_enabled: input.is_recording_enabled ?? false,
            participant_emails: input.participant_emails || [],
          })
          .select()
          .single();

        if (error) throw error;

        toast.success("Boardroom session scheduled");
        await fetchSessions();
        return data as BoardroomSession;
      } catch (error) {
        console.error("Failed to create session:", error);
        toast.error("Failed to schedule session");
        return null;
      }
    },
    [user, fetchSessions]
  );

  const updateSession = useCallback(
    async (id: string, updates: Partial<CreateSessionInput>): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("boardroom_sessions")
          .update({
            ...updates,
            scheduled_at: updates.scheduled_at?.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) throw error;

        toast.success("Session updated");
        await fetchSessions();
        return true;
      } catch (error) {
        console.error("Failed to update session:", error);
        toast.error("Failed to update session");
        return false;
      }
    },
    [fetchSessions]
  );

  const cancelSession = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("boardroom_sessions")
          .update({ status: "cancelled" })
          .eq("id", id);

        if (error) throw error;

        toast.success("Session cancelled");
        await fetchSessions();
        return true;
      } catch (error) {
        console.error("Failed to cancel session:", error);
        toast.error("Failed to cancel session");
        return false;
      }
    },
    [fetchSessions]
  );

  const startSession = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("boardroom_sessions")
          .update({ status: "active" })
          .eq("id", id);

        if (error) throw error;

        await fetchSessions();
        return true;
      } catch (error) {
        console.error("Failed to start session:", error);
        toast.error("Failed to start session");
        return false;
      }
    },
    [fetchSessions]
  );

  const endSession = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("boardroom_sessions")
          .update({ status: "completed" })
          .eq("id", id);

        if (error) throw error;

        toast.success("Session ended");
        await fetchSessions();
        return true;
      } catch (error) {
        console.error("Failed to end session:", error);
        toast.error("Failed to end session");
        return false;
      }
    },
    [fetchSessions]
  );

  const getSessionByCode = useCallback(
    async (roomCode: string): Promise<BoardroomSession | null> => {
      try {
        const { data, error } = await supabase
          .from("boardroom_sessions")
          .select("*")
          .eq("room_code", roomCode)
          .single();

        if (error) throw error;
        return data as BoardroomSession;
      } catch (error) {
        console.error("Failed to get session:", error);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const upcomingSessions = sessions.filter(
    (s) => s.status === "scheduled" && new Date(s.scheduled_at) > new Date()
  );

  const activeSessions = sessions.filter((s) => s.status === "active");

  const pastSessions = sessions.filter(
    (s) => s.status === "completed" || s.status === "cancelled"
  );

  return {
    sessions,
    upcomingSessions,
    activeSessions,
    pastSessions,
    isLoading,
    createSession,
    updateSession,
    cancelSession,
    startSession,
    endSession,
    getSessionByCode,
    refetch: fetchSessions,
  };
};
