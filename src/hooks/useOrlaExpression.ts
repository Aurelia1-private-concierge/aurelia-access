import { useState, useCallback, useEffect } from "react";

export type OrlaExpression = 
  | "neutral" 
  | "happy" 
  | "thinking" 
  | "listening" 
  | "speaking" 
  | "surprised" 
  | "sleepy";

interface ExpressionState {
  current: OrlaExpression;
  intensity: number; // 0-1
  blinkState: boolean;
}

export const useOrlaExpression = () => {
  const [state, setState] = useState<ExpressionState>({
    current: "neutral",
    intensity: 1,
    blinkState: false,
  });

  // Auto-blink effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setState(prev => ({ ...prev, blinkState: true }));
      setTimeout(() => {
        setState(prev => ({ ...prev, blinkState: false }));
      }, 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const setExpression = useCallback((expression: OrlaExpression, intensity = 1) => {
    setState(prev => ({
      ...prev,
      current: expression,
      intensity: Math.max(0, Math.min(1, intensity)),
    }));
  }, []);

  const transitionTo = useCallback((expression: OrlaExpression, duration = 300) => {
    // Smooth transition by fading intensity
    setState(prev => ({ ...prev, intensity: 0 }));
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        current: expression,
        intensity: 1,
      }));
    }, duration / 2);
  }, []);

  // Expression presets for common states
  const presets = {
    greet: () => transitionTo("happy"),
    think: () => transitionTo("thinking"),
    listen: () => setExpression("listening"),
    speak: () => setExpression("speaking"),
    surprise: () => {
      setExpression("surprised");
      setTimeout(() => transitionTo("neutral"), 1500);
    },
    sleep: () => transitionTo("sleepy"),
    reset: () => transitionTo("neutral"),
  };

  return {
    expression: state.current,
    intensity: state.intensity,
    isBlinking: state.blinkState,
    setExpression,
    transitionTo,
    presets,
  };
};

export default useOrlaExpression;
