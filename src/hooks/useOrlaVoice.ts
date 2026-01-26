import { useState, useCallback, useEffect } from "react";
import { useWebSpeech } from "./useWebSpeech";
import { supabase } from "@/integrations/supabase/client";

type VoiceProvider = "elevenlabs" | "webspeech" | "none";

interface UseOrlaVoiceOptions {
  preferredProvider?: VoiceProvider;
  webSpeechOptions?: {
    rate?: number;
    pitch?: number;
    volume?: number;
  };
}

interface UseOrlaVoiceReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
  activeProvider: VoiceProvider;
  isElevenLabsAvailable: boolean;
  error: string | null;
}

/**
 * Unified voice hook for Orla that automatically falls back to Web Speech
 * when ElevenLabs is not configured
 */
export const useOrlaVoice = (options: UseOrlaVoiceOptions = {}): UseOrlaVoiceReturn => {
  const { preferredProvider = "elevenlabs", webSpeechOptions = {} } = options;

  const [isElevenLabsAvailable, setIsElevenLabsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeakingEL, setIsSpeakingEL] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Web Speech fallback
  const webSpeech = useWebSpeech({
    rate: webSpeechOptions.rate ?? 0.95,
    pitch: webSpeechOptions.pitch ?? 1,
    volume: webSpeechOptions.volume ?? 1,
    lang: "en-US",
  });

  // Check if ElevenLabs is available on mount
  useEffect(() => {
    const checkElevenLabs = async () => {
      try {
        // Try to get a token - if it fails, ElevenLabs isn't configured
        const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token", {
          body: {},
        });

        if (error || !data?.token) {
          console.log("ElevenLabs not available, using Web Speech fallback");
          setIsElevenLabsAvailable(false);
        } else {
          setIsElevenLabsAvailable(true);
        }
      } catch {
        console.log("ElevenLabs check failed, using Web Speech fallback");
        setIsElevenLabsAvailable(false);
      }
    };

    checkElevenLabs();
  }, []);

  // Determine active provider
  const activeProvider: VoiceProvider =
    preferredProvider === "elevenlabs" && isElevenLabsAvailable
      ? "elevenlabs"
      : webSpeech.isSupported
      ? "webspeech"
      : "none";

  // ElevenLabs TTS speak function
  const speakWithElevenLabs = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text,
            voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah - warm, professional voice
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Stop any existing audio
      if (audioElement) {
        audioElement.pause();
        URL.revokeObjectURL(audioElement.src);
      }

      const audio = new Audio(audioUrl);
      setAudioElement(audio);

      audio.onplay = () => setIsSpeakingEL(true);
      audio.onended = () => {
        setIsSpeakingEL(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeakingEL(false);
        setError("Audio playback failed");
      };

      await audio.play();
    } catch (err) {
      console.error("ElevenLabs TTS error:", err);
      setError(err instanceof Error ? err.message : "TTS failed");
      // Fall back to Web Speech on error
      if (webSpeech.isSupported) {
        webSpeech.speak(text);
      }
    } finally {
      setIsLoading(false);
    }
  }, [audioElement, webSpeech]);

  // Unified speak function
  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setError(null);

      if (activeProvider === "elevenlabs") {
        await speakWithElevenLabs(text);
      } else if (activeProvider === "webspeech") {
        webSpeech.speak(text);
      } else {
        setError("No voice provider available");
      }
    },
    [activeProvider, speakWithElevenLabs, webSpeech]
  );

  // Unified stop function
  const stop = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsSpeakingEL(false);
    }
    webSpeech.stop();
  }, [audioElement, webSpeech]);

  const isSpeaking = isSpeakingEL || webSpeech.isSpeaking;

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    activeProvider,
    isElevenLabsAvailable: isElevenLabsAvailable ?? false,
    error,
  };
};

export default useOrlaVoice;
