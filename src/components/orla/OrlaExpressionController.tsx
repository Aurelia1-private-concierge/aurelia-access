import { useState, useEffect, useCallback, createContext, useContext } from "react";

export type OrlaEmotion = "neutral" | "happy" | "thinking" | "curious" | "warm" | "concerned" | "urgent";

interface OrlaExpressionState {
  emotion: OrlaEmotion;
  intensity: number;
  isSpeaking: boolean;
  isListening: boolean;
  isThinking: boolean;
}

interface OrlaExpressionContextValue {
  state: OrlaExpressionState;
  setEmotion: (emotion: OrlaEmotion, intensity?: number) => void;
  setSpeaking: (speaking: boolean) => void;
  setListening: (listening: boolean) => void;
  setThinking: (thinking: boolean) => void;
  reactToContent: (content: string) => void;
  transitionTo: (emotion: OrlaEmotion, duration?: number) => void;
}

const OrlaExpressionContext = createContext<OrlaExpressionContextValue | null>(null);

export const useOrlaExpression = () => {
  const context = useContext(OrlaExpressionContext);
  if (!context) {
    throw new Error("useOrlaExpression must be used within OrlaExpressionProvider");
  }
  return context;
};

// Enhanced sentiment analysis for content-based emotion reactions
const analyzeContentSentiment = (content: string): OrlaEmotion => {
  const lowerContent = content.toLowerCase();
  
  // Happy triggers - celebration, success, positivity
  const happyWords = [
    "wonderful", "excellent", "perfect", "delighted", "pleasure", "congratulations", 
    "welcome", "excited", "fantastic", "amazing", "brilliant", "superb", "thrilled",
    "celebration", "celebrate", "success", "accomplished", "achieved", "won", "victory",
    "love", "beautiful", "gorgeous", "stunning", "magnificent", "exceptional"
  ];
  if (happyWords.some(word => lowerContent.includes(word))) {
    return "happy";
  }
  
  // Thinking triggers - processing, analysis, consideration
  const thinkingWords = [
    "let me check", "considering", "analyzing", "looking into", "one moment", "processing",
    "let me see", "reviewing", "examining", "researching", "investigating", "evaluating",
    "calculating", "assessing", "verifying", "confirming", "cross-referencing",
    "searching", "finding", "locating", "checking availability", "moment please"
  ];
  if (thinkingWords.some(word => lowerContent.includes(word))) {
    return "thinking";
  }
  
  // Curious triggers - questions, exploration, interest
  const curiousWords = [
    "interesting", "tell me more", "how", "why", "what", "could you explain",
    "fascinating", "intriguing", "curious", "wondering", "exploring", "discover",
    "learn more", "elaborate", "details", "specifics", "preferences", "options",
    "would you like", "shall i", "may i suggest", "have you considered"
  ];
  if (curiousWords.some(word => lowerContent.includes(word))) {
    return "curious";
  }
  
  // Warm triggers - gratitude, care, service
  const warmWords = [
    "thank you", "appreciate", "grateful", "happy to help", "my pleasure", "of course",
    "certainly", "absolutely", "gladly", "honored", "privilege", "welcome",
    "take care", "enjoy", "wishing you", "hope you", "looking forward", "pleasure serving",
    "at your service", "here for you", "assist you", "support you", "anything else"
  ];
  if (warmWords.some(word => lowerContent.includes(word))) {
    return "warm";
  }
  
  // Concerned triggers - problems, issues, apologies
  const concernedWords = [
    "sorry", "apologize", "unfortunately", "regret", "unable to", "cannot", "issue",
    "problem", "concerned", "worry", "difficult", "challenge", "complication",
    "understand your frustration", "i see the issue", "let me fix", "troubleshoot",
    "inconvenience", "mistake", "error", "failed", "unsuccessful", "delayed"
  ];
  if (concernedWords.some(word => lowerContent.includes(word))) {
    return "concerned";
  }
  
  // Urgent triggers - time-sensitive, critical actions
  const urgentWords = [
    "immediately", "urgent", "right away", "asap", "emergency", "critical",
    "time-sensitive", "priority", "now", "quickly", "hurry", "rush",
    "deadline", "expires", "limited time", "last minute", "don't wait",
    "act fast", "important update", "breaking", "alert", "attention required"
  ];
  if (urgentWords.some(word => lowerContent.includes(word))) {
    return "urgent";
  }
  
  return "neutral";
};

interface OrlaExpressionProviderProps {
  children: React.ReactNode;
}

export const OrlaExpressionProvider = ({ children }: OrlaExpressionProviderProps) => {
  const [state, setState] = useState<OrlaExpressionState>({
    emotion: "neutral",
    intensity: 1,
    isSpeaking: false,
    isListening: false,
    isThinking: false,
  });

  const setEmotion = useCallback((emotion: OrlaEmotion, intensity = 1) => {
    setState(prev => ({
      ...prev,
      emotion,
      intensity: Math.min(1, Math.max(0, intensity)),
    }));
  }, []);

  const setSpeaking = useCallback((speaking: boolean) => {
    setState(prev => ({
      ...prev,
      isSpeaking: speaking,
      isListening: speaking ? false : prev.isListening,
    }));
  }, []);

  const setListening = useCallback((listening: boolean) => {
    setState(prev => ({
      ...prev,
      isListening: listening,
      isSpeaking: listening ? false : prev.isSpeaking,
    }));
  }, []);

  const setThinking = useCallback((thinking: boolean) => {
    setState(prev => ({
      ...prev,
      isThinking: thinking,
      emotion: thinking ? "thinking" : prev.emotion,
    }));
  }, []);

  const reactToContent = useCallback((content: string) => {
    const detectedEmotion = analyzeContentSentiment(content);
    setEmotion(detectedEmotion);
    
    // Auto-return to neutral after a delay
    setTimeout(() => {
      setState(prev => {
        if (prev.emotion === detectedEmotion && !prev.isSpeaking) {
          return { ...prev, emotion: "neutral" };
        }
        return prev;
      });
    }, 3000);
  }, [setEmotion]);

  const transitionTo = useCallback((emotion: OrlaEmotion, duration = 500) => {
    // Start transition
    setState(prev => ({
      ...prev,
      intensity: 0,
    }));

    // Mid-transition - change emotion
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        emotion,
        intensity: 0.5,
      }));
    }, duration / 2);

    // Complete transition
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        intensity: 1,
      }));
    }, duration);
  }, []);

  const value: OrlaExpressionContextValue = {
    state,
    setEmotion,
    setSpeaking,
    setListening,
    setThinking,
    reactToContent,
    transitionTo,
  };

  return (
    <OrlaExpressionContext.Provider value={value}>
      {children}
    </OrlaExpressionContext.Provider>
  );
};

// Hook for automatic emotion cycling (for demo/preview purposes)
export const useOrlaEmotionDemo = () => {
  const { setEmotion, transitionTo } = useOrlaExpression();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const emotions: OrlaEmotion[] = ["neutral", "happy", "thinking", "curious", "warm", "concerned", "urgent"];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % emotions.length;
      transitionTo(emotions[index], 400);
    }, 3000);

    return () => clearInterval(interval);
  }, [isRunning, transitionTo]);

  return {
    startDemo: () => setIsRunning(true),
    stopDemo: () => setIsRunning(false),
    isRunning,
  };
};
