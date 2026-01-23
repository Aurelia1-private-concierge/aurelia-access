import { useCallback, useRef, useState, useEffect } from "react";

type SoundType = 
  | "click" 
  | "hover" 
  | "success" 
  | "error" 
  | "warning" 
  | "notification"
  | "boot"
  | "shutdown"
  | "scan"
  | "type"
  | "whoosh";

interface SoundConfig {
  volume?: number;
  playbackRate?: number;
  loop?: boolean;
}

// Sound generation using Web Audio API
const createOscillatorSound = (
  audioContext: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.1
): void => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

const soundGenerators: Record<SoundType, (ctx: AudioContext, volume: number) => void> = {
  click: (ctx, vol) => {
    createOscillatorSound(ctx, 800, 0.05, "square", vol * 0.3);
  },
  hover: (ctx, vol) => {
    createOscillatorSound(ctx, 1200, 0.03, "sine", vol * 0.15);
  },
  success: (ctx, vol) => {
    createOscillatorSound(ctx, 523.25, 0.1, "sine", vol * 0.2);
    setTimeout(() => createOscillatorSound(ctx, 659.25, 0.1, "sine", vol * 0.2), 100);
    setTimeout(() => createOscillatorSound(ctx, 783.99, 0.15, "sine", vol * 0.25), 200);
  },
  error: (ctx, vol) => {
    createOscillatorSound(ctx, 200, 0.15, "sawtooth", vol * 0.2);
    setTimeout(() => createOscillatorSound(ctx, 150, 0.2, "sawtooth", vol * 0.15), 150);
  },
  warning: (ctx, vol) => {
    createOscillatorSound(ctx, 440, 0.1, "triangle", vol * 0.2);
    setTimeout(() => createOscillatorSound(ctx, 440, 0.1, "triangle", vol * 0.2), 200);
  },
  notification: (ctx, vol) => {
    createOscillatorSound(ctx, 880, 0.08, "sine", vol * 0.15);
    setTimeout(() => createOscillatorSound(ctx, 1108.73, 0.1, "sine", vol * 0.2), 100);
  },
  boot: (ctx, vol) => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createOscillatorSound(ctx, 200 + i * 150, 0.1, "sine", vol * 0.1);
      }, i * 80);
    }
  },
  shutdown: (ctx, vol) => {
    for (let i = 4; i >= 0; i--) {
      setTimeout(() => {
        createOscillatorSound(ctx, 200 + i * 150, 0.15, "sine", vol * 0.1);
      }, (4 - i) * 100);
    }
  },
  scan: (ctx, vol) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(vol * 0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  },
  type: (ctx, vol) => {
    createOscillatorSound(ctx, 600 + Math.random() * 200, 0.02, "square", vol * 0.1);
  },
  whoosh: (ctx, vol) => {
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(vol * 0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(4000, ctx.currentTime + 0.2);
    
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    whiteNoise.start(ctx.currentTime);
  },
};

export const useQuantumSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("quantum-sound-muted") === "true";
    }
    return false;
  });
  const [volume, setVolume] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("quantum-sound-volume");
      return stored ? parseFloat(stored) : 0.5;
    }
    return 0.5;
  });

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const play = useCallback((sound: SoundType, config?: SoundConfig) => {
    if (isMuted) return;

    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const effectiveVolume = (config?.volume ?? 1) * volume;
      soundGenerators[sound](ctx, effectiveVolume);
    } catch (error) {
      console.warn("Failed to play quantum sound:", error);
    }
  }, [isMuted, volume, getAudioContext]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev;
      localStorage.setItem("quantum-sound-muted", String(newValue));
      return newValue;
    });
  }, []);

  const updateVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    localStorage.setItem("quantum-sound-volume", String(clampedVolume));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    play,
    isMuted,
    toggleMute,
    volume,
    setVolume: updateVolume,
  };
};

export type { SoundType, SoundConfig };
export default useQuantumSound;
