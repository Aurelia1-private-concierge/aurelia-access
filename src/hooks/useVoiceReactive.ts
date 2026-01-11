import { useState, useEffect, useCallback, useRef } from "react";

interface VoiceReactiveState {
  inputLevel: number;
  outputLevel: number;
  isListening: boolean;
  isSpeaking: boolean;
  mouthOpenness: number; // 0-1 for avatar mouth animation
  frequencyData: Uint8Array | null;
}

export const useVoiceReactive = () => {
  const [state, setState] = useState<VoiceReactiveState>({
    inputLevel: 0,
    outputLevel: 0,
    isListening: false,
    isSpeaking: false,
    mouthOpenness: 0,
    frequencyData: null,
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedLevelRef = useRef(0);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateLevels = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length / 255;
        
        // Smooth the level for natural mouth movement
        smoothedLevelRef.current = smoothedLevelRef.current * 0.7 + average * 0.3;
        
        // Calculate mouth openness with more sensitivity
        const mouthOpenness = Math.min(1, smoothedLevelRef.current * 3);
        
        setState(prev => ({
          ...prev,
          inputLevel: average,
          mouthOpenness,
          frequencyData: new Uint8Array(dataArray),
          isListening: true,
        }));
        
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };
      
      updateLevels();
      
    } catch (error) {
      console.error("Failed to start voice reactive:", error);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    
    setState(prev => ({
      ...prev,
      inputLevel: 0,
      mouthOpenness: 0,
      isListening: false,
      frequencyData: null,
    }));
  }, []);

  // Simulate speaking with audio output
  const simulateSpeaking = useCallback((level: number) => {
    const mouthOpenness = Math.min(1, level * 2);
    setState(prev => ({
      ...prev,
      outputLevel: level,
      mouthOpenness,
      isSpeaking: level > 0.1,
    }));
  }, []);

  // Set speaking state directly
  const setSpeaking = useCallback((isSpeaking: boolean, intensity = 0.5) => {
    if (isSpeaking) {
      // Simulate mouth movement when speaking
      const animate = () => {
        const randomIntensity = intensity * (0.5 + Math.random() * 0.5);
        setState(prev => ({
          ...prev,
          isSpeaking: true,
          mouthOpenness: randomIntensity,
          outputLevel: randomIntensity,
        }));
      };
      
      const interval = setInterval(animate, 100);
      return () => clearInterval(interval);
    } else {
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        mouthOpenness: 0,
        outputLevel: 0,
      }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
    simulateSpeaking,
    setSpeaking,
  };
};

export default useVoiceReactive;
