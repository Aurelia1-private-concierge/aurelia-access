import { useState, useCallback, useRef, useEffect } from "react";

interface UseWebSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface UseWebSpeechRecognitionReturn {
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: string | null;
  resetTranscript: () => void;
}

// Type definitions for Web Speech API
interface WebSpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface WebSpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

// Web Speech Recognition interface
interface WebSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: ((this: WebSpeechRecognition, ev: Event) => void) | null;
  onend: ((this: WebSpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: WebSpeechRecognition, ev: WebSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: WebSpeechRecognition, ev: WebSpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface WebSpeechRecognitionConstructor {
  new (): WebSpeechRecognition;
}

/**
 * Hook for browser-native speech recognition using Web Speech API
 * Free alternative to ElevenLabs STT - works without any API keys
 */
export const useWebSpeechRecognition = (
  options: UseWebSpeechRecognitionOptions = {}
): UseWebSpeechRecognitionReturn => {
  const { lang = "en-US", continuous = false, interimResults = true } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);

  // Check for browser support
  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // Initialize recognition
  useEffect(() => {
    if (!isSupported) return;

    // Get the SpeechRecognition constructor
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: WebSpeechRecognitionConstructor;
      webkitSpeechRecognition?: WebSpeechRecognitionConstructor;
    };
    
    const SpeechRecognitionConstructor =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) return;

    const recognition = new SpeechRecognitionConstructor();

    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: WebSpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setError(event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: WebSpeechRecognitionEvent) => {
      let finalTranscript = "";
      let currentInterim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          currentInterim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
        setInterimTranscript("");
      } else {
        setInterimTranscript(currentInterim);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported, lang, continuous, interimResults]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError("Speech recognition not supported");
      return;
    }

    setTranscript("");
    setInterimTranscript("");
    setError(null);

    try {
      recognitionRef.current.start();
    } catch (err) {
      // Already started
      console.warn("Recognition already started");
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    resetTranscript,
  };
};

export default useWebSpeechRecognition;
