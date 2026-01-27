import { useState, useCallback, useEffect, useRef } from "react";
import { useWebSpeech } from "./useWebSpeech";
import { useWebSpeechRecognition } from "./useWebSpeechRecognition";
import { supabase } from "@/integrations/supabase/client";

type ConversationMode = "elevenlabs" | "webspeech" | "none";

interface UseOrlaConversationOptions {
  onTranscript?: (role: "user" | "agent", text: string) => void;
  onStateChange?: (state: {
    isListening: boolean;
    isSpeaking: boolean;
    isThinking: boolean;
  }) => void;
}

interface UseOrlaConversationReturn {
  startConversation: () => Promise<void>;
  endConversation: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
  mode: ConversationMode;
  error: string | null;
}

/**
 * Unified conversation hook for Orla that uses Web Speech as fallback
 * when ElevenLabs is not configured
 */
export const useOrlaConversation = (
  options: UseOrlaConversationOptions = {}
): UseOrlaConversationReturn => {
  const { onTranscript, onStateChange } = options;

  const [mode, setMode] = useState<ConversationMode>("none");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Web Speech hooks
  const webSpeech = useWebSpeech({ rate: 0.95, pitch: 1, volume: 1 });
  const recognition = useWebSpeechRecognition({ continuous: false });

  // Track mounted state for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Check ElevenLabs availability on mount
  useEffect(() => {
    const checkElevenLabs = async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "elevenlabs-conversation-token"
        );

        if (!isMountedRef.current) return;

        // Check for signed_url which is what the edge function returns
        if (error || !data?.signed_url) {
          console.log("ElevenLabs not available, Web Speech mode ready");
          setMode(recognition.isSupported && webSpeech.isSupported ? "webspeech" : "none");
        } else {
          setMode("elevenlabs");
        }
      } catch {
        if (isMountedRef.current) {
          setMode(recognition.isSupported && webSpeech.isSupported ? "webspeech" : "none");
        }
      }
    };

    checkElevenLabs();
  }, [recognition.isSupported, webSpeech.isSupported]);

  // Notify state changes
  useEffect(() => {
    onStateChange?.({
      isListening: recognition.isListening,
      isSpeaking: webSpeech.isSpeaking,
      isThinking,
    });
  }, [recognition.isListening, webSpeech.isSpeaking, isThinking, onStateChange]);

  // Process transcript when user stops speaking
  useEffect(() => {
    const processUserSpeech = async () => {
      if (
        !recognition.isListening &&
        recognition.transcript &&
        isConnected &&
        !isProcessingRef.current &&
        isMountedRef.current
      ) {
        isProcessingRef.current = true;
        const userText = recognition.transcript.trim();

        if (userText) {
          onTranscript?.("user", userText);
          setIsThinking(true);

          try {
            // Call Lovable AI for response
            const { data, error } = await supabase.functions.invoke("lovable-ai", {
              body: {
                messages: [
                  {
                    role: "system",
                    content: `You are Orla, Aurelia's private AI concierge. Speak with warmth, discretion, and sophistication. 
Never use casual language like "hey" or "cool". Address members respectfully. 
Keep responses concise (2-3 sentences) for voice delivery. Be helpful and elegant.`,
                  },
                  { role: "user", content: userText },
                ],
                model: "google/gemini-2.5-flash",
              },
            });

            if (!isMountedRef.current) return;
            setIsThinking(false);

            if (error) {
              throw error;
            }

            const agentResponse =
              data?.choices?.[0]?.message?.content ||
              "I apologize, I couldn't process that request.";
            
            onTranscript?.("agent", agentResponse);

            // Speak the response
            webSpeech.speak(agentResponse);
          } catch (err) {
            console.error("AI response error:", err);
            if (isMountedRef.current) {
              setIsThinking(false);
              const fallbackResponse = "I apologize, I'm having trouble processing that request. Please try again.";
              onTranscript?.("agent", fallbackResponse);
              webSpeech.speak(fallbackResponse);
            }
          }
        }

        recognition.resetTranscript();
        isProcessingRef.current = false;

        // Start listening again after speaking
        const checkAndRestart = () => {
          if (!isMountedRef.current) return;
          if (!webSpeech.isSpeaking && isConnected) {
            recognition.startListening();
          } else if (isConnected && isMountedRef.current) {
            setTimeout(checkAndRestart, 500);
          }
        };
        setTimeout(checkAndRestart, 1000);
      }
    };

    processUserSpeech();
  }, [recognition.isListening, recognition.transcript, isConnected, onTranscript, webSpeech, recognition]);

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Request microphone permission with mobile-friendly constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };
      
      await navigator.mediaDevices.getUserMedia(constraints);

      if (!isMountedRef.current) return;

      if (mode === "webspeech") {
        setIsConnected(true);
        setIsConnecting(false);

        // Greet the user
        const greeting = "Good day. I'm Orla, your personal concierge. How may I assist you?";
        onTranscript?.("agent", greeting);
        webSpeech.speak(greeting);

        // Start listening after greeting
        setTimeout(() => {
          if (!webSpeech.isSpeaking && isMountedRef.current) {
            recognition.startListening();
          }
        }, 3000);
      } else if (mode === "elevenlabs") {
        // ElevenLabs mode - handled by OrlaVoiceAvatar directly
        setIsConnected(true);
        setIsConnecting(false);
      } else {
        throw new Error("No voice provider available");
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to start conversation");
        setIsConnecting(false);
      }
    }
  }, [mode, onTranscript, webSpeech, recognition]);

  const endConversation = useCallback(() => {
    recognition.stopListening();
    webSpeech.stop();
    setIsConnected(false);
    setIsThinking(false);
    recognition.resetTranscript();
  }, [recognition, webSpeech]);

  return {
    startConversation,
    endConversation,
    isConnected,
    isConnecting,
    isSpeaking: webSpeech.isSpeaking,
    isListening: recognition.isListening,
    isThinking,
    mode,
    error,
  };
};

export default useOrlaConversation;
