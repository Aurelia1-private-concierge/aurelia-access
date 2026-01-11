import { useState, useCallback, useRef, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type AgentMode = "voice" | "chat" | "hybrid";

interface AgentMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  mode: AgentMode;
  isStreaming?: boolean;
  audioUrl?: string; // For hybrid mode - text with audio
}

interface MultiAgentState {
  mode: AgentMode;
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  messages: AgentMessage[];
  currentSessionId: string | null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const ELEVENLABS_AGENT_ID = "agent_01jx7t3mjgeqzsjh5qxbvdsxey";

export const useMultiAgent = (options?: {
  onMessage?: (message: AgentMessage) => void;
  onModeChange?: (mode: AgentMode) => void;
  onError?: (error: Error) => void;
}) => {
  const { user, session } = useAuth();
  const [state, setState] = useState<MultiAgentState>({
    mode: "chat",
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    messages: [],
    currentSessionId: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  // ElevenLabs voice conversation hook
  const voiceConversation = useConversation({
    onConnect: () => {
      setState(prev => ({ ...prev, isConnected: true }));
      toast.success("Voice agent connected");
    },
    onDisconnect: () => {
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isListening: false, 
        isSpeaking: false 
      }));
    },
    onMessage: (message) => {
      const agentMessage: AgentMessage = {
        id: `${Date.now()}-${Math.random()}`,
        role: message.role as "user" | "agent",
        content: message.message,
        timestamp: new Date(),
        mode: "voice",
      };
      setState(prev => ({ ...prev, messages: [...prev.messages, agentMessage] }));
      options?.onMessage?.(agentMessage);
    },
    onError: (error) => {
      console.error("Voice agent error:", error);
      options?.onError?.(new Error("Voice connection error"));
      toast.error("Voice connection error. Please try again.");
    },
  });

  // Update speaking/listening state from voice conversation
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isSpeaking: voiceConversation.isSpeaking,
      isListening: voiceConversation.status === "connected" && !voiceConversation.isSpeaking,
    }));
  }, [voiceConversation.isSpeaking, voiceConversation.status]);

  // Start voice session
  const startVoiceSession = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to use voice features");
      return false;
    }

    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token", {
        body: { agentId: ELEVENLABS_AGENT_ID },
      });

      if (error || !data?.signed_url) {
        throw new Error(error?.message || "Failed to get voice token");
      }

      await voiceConversation.startSession({
        signedUrl: data.signed_url,
      });

      setState(prev => ({ 
        ...prev, 
        mode: "voice", 
        isProcessing: false,
        currentSessionId: `voice-${Date.now()}`,
      }));
      
      options?.onModeChange?.("voice");
      return true;
    } catch (error) {
      console.error("Failed to start voice session:", error);
      setState(prev => ({ ...prev, isProcessing: false }));
      
      if ((error as Error).name === "NotAllowedError") {
        toast.error("Microphone access is required for voice features");
      } else {
        toast.error((error as Error).message || "Failed to connect");
      }
      return false;
    }
  }, [user, voiceConversation, options]);

  // End voice session
  const endVoiceSession = useCallback(async () => {
    await voiceConversation.endSession();
    setState(prev => ({ 
      ...prev, 
      mode: "chat", 
      isConnected: false,
      currentSessionId: null,
    }));
    options?.onModeChange?.("chat");
  }, [voiceConversation, options]);

  // Send chat message
  const sendChatMessage = useCallback(async (content: string): Promise<string | null> => {
    if (!content.trim()) return null;

    // Cancel any pending request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const userMessage: AgentMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
      mode: "chat",
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isProcessing: true,
    }));

    options?.onMessage?.(userMessage);

    let assistantContent = "";
    const assistantId = `${Date.now()}-agent`;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        headers.Authorization = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
      }

      const messagesForApi = state.messages
        .filter(m => m.mode === "chat")
        .map(m => ({
          role: m.role === "agent" ? "assistant" : m.role,
          content: m.content,
        }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [...messagesForApi, { role: "user", content: content.trim() }],
          conversationId: conversationIdRef.current,
          channel: "chat",
        }),
        signal: abortControllerRef.current.signal,
      });

      const respConvId = resp.headers.get("X-Conversation-Id");
      if (respConvId) {
        conversationIdRef.current = respConvId;
      }

      if (!resp.ok) {
        throw new Error("Failed to connect to agent");
      }

      if (!resp.body) throw new Error("No response stream");

      // Create streaming message
      const streamingMessage: AgentMessage = {
        id: assistantId,
        role: "agent",
        content: "",
        timestamp: new Date(),
        mode: "chat",
        isStreaming: true,
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, streamingMessage],
      }));

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const chunk = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (chunk) {
              assistantContent += chunk;
              setState(prev => ({
                ...prev,
                messages: prev.messages.map(m =>
                  m.id === assistantId
                    ? { ...m, content: assistantContent }
                    : m
                ),
              }));
            }
          } catch {
            // JSON parse error, continue
          }
        }
      }

      // Finalize streaming message
      const finalMessage: AgentMessage = {
        id: assistantId,
        role: "agent",
        content: assistantContent,
        timestamp: new Date(),
        mode: "chat",
        isStreaming: false,
      };

      setState(prev => ({
        ...prev,
        messages: prev.messages.map(m =>
          m.id === assistantId ? finalMessage : m
        ),
        isProcessing: false,
      }));

      options?.onMessage?.(finalMessage);
      return assistantContent;

    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return null;
      }
      
      console.error("Chat error:", error);
      setState(prev => ({ ...prev, isProcessing: false }));
      options?.onError?.(error as Error);
      toast.error("Connection error. Please try again.");
      return null;
    }
  }, [session, state.messages, options]);

  // Switch between modes
  const switchMode = useCallback(async (newMode: AgentMode) => {
    if (newMode === state.mode) return;

    if (state.mode === "voice" && state.isConnected) {
      await endVoiceSession();
    }

    if (newMode === "voice") {
      await startVoiceSession();
    } else {
      setState(prev => ({ ...prev, mode: newMode }));
      options?.onModeChange?.(newMode);
    }
  }, [state.mode, state.isConnected, endVoiceSession, startVoiceSession, options]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
    conversationIdRef.current = null;
  }, []);

  // Get volume for visualizations
  const getInputVolume = useCallback(() => {
    return voiceConversation.getInputVolume?.() ?? 0;
  }, [voiceConversation]);

  const getOutputVolume = useCallback(() => {
    return voiceConversation.getOutputVolume?.() ?? 0;
  }, [voiceConversation]);

  return {
    ...state,
    startVoiceSession,
    endVoiceSession,
    sendChatMessage,
    switchMode,
    clearMessages,
    getInputVolume,
    getOutputVolume,
    voiceStatus: voiceConversation.status,
  };
};

export type { AgentMode, AgentMessage, MultiAgentState };
