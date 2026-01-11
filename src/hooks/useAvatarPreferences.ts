import { useState, useEffect, useCallback } from "react";

export type AvatarMode = "3d" | "static" | "auto";

interface AvatarPreferences {
  mode: AvatarMode;
  reducedMotion: boolean;
  transitionSoundEnabled: boolean;
  isLowEndDevice: boolean;
}

const STORAGE_KEY = "orla-avatar-preferences";

// Detect low-end device based on various signals
const detectLowEndDevice = (): boolean => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return true;
  
  // Check device memory (if available)
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory < 4) return true;
  
  // Check hardware concurrency (CPU cores)
  const hardwareConcurrency = navigator.hardwareConcurrency;
  if (hardwareConcurrency && hardwareConcurrency < 4) return true;
  
  // Check connection type
  const connection = (navigator as any).connection;
  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === "slow-2g" || effectiveType === "2g") return true;
    if (connection.saveData) return true;
  }
  
  // Mobile detection (basic)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isSmallScreen = window.innerWidth < 768;
  
  // Only flag as low-end if mobile with small screen
  // Most modern phones can handle 3D fine
  if (isMobile && isSmallScreen && deviceMemory && deviceMemory < 6) return true;
  
  return false;
};

// Check WebGL support
const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return !!gl;
  } catch {
    return false;
  }
};

export const useAvatarPreferences = () => {
  const [preferences, setPreferences] = useState<AvatarPreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const isLowEnd = detectLowEndDevice();
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          mode: parsed.mode || "auto",
          reducedMotion: parsed.reducedMotion ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          transitionSoundEnabled: parsed.transitionSoundEnabled ?? true,
          isLowEndDevice: isLowEnd,
        };
      } catch {
        // Fall through to default
      }
    }
    
    return {
      mode: "auto" as AvatarMode,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      transitionSoundEnabled: true,
      isLowEndDevice: isLowEnd,
    };
  });
  
  const [supportsWebGL, setSupportsWebGL] = useState(true);
  
  useEffect(() => {
    setSupportsWebGL(checkWebGLSupport());
  }, []);
  
  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      mode: preferences.mode,
      reducedMotion: preferences.reducedMotion,
      transitionSoundEnabled: preferences.transitionSoundEnabled,
    }));
  }, [preferences.mode, preferences.reducedMotion, preferences.transitionSoundEnabled]);
  
  // Listen for reduced motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({
        ...prev,
        reducedMotion: e.matches,
      }));
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  
  const setMode = useCallback((mode: AvatarMode) => {
    setPreferences(prev => ({ ...prev, mode }));
  }, []);
  
  const toggleReducedMotion = useCallback(() => {
    setPreferences(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  }, []);
  
  const toggleTransitionSound = useCallback(() => {
    setPreferences(prev => ({ ...prev, transitionSoundEnabled: !prev.transitionSoundEnabled }));
  }, []);
  
  const setTransitionSoundEnabled = useCallback((enabled: boolean) => {
    setPreferences(prev => ({ ...prev, transitionSoundEnabled: enabled }));
  }, []);
  
  // Determine if 3D should be used based on preferences and capabilities
  const shouldUse3D = useCallback((): boolean => {
    if (!supportsWebGL) return false;
    
    switch (preferences.mode) {
      case "3d":
        return true;
      case "static":
        return false;
      case "auto":
      default:
        // Auto mode: use 3D unless on low-end device or reduced motion preferred
        return !preferences.isLowEndDevice && !preferences.reducedMotion;
    }
  }, [preferences.mode, preferences.isLowEndDevice, preferences.reducedMotion, supportsWebGL]);
  
  return {
    ...preferences,
    supportsWebGL,
    setMode,
    toggleReducedMotion,
    toggleTransitionSound,
    setTransitionSoundEnabled,
    shouldUse3D,
  };
};

export default useAvatarPreferences;
