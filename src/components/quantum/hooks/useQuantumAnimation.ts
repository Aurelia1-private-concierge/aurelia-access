import { useReducedMotion } from "framer-motion";
import { useMemo, useCallback } from "react";

export type AnimationPreset = 
  | "fadeIn" 
  | "fadeOut" 
  | "scaleIn" 
  | "scaleOut" 
  | "slideUp" 
  | "slideDown" 
  | "slideLeft" 
  | "slideRight"
  | "glitch"
  | "scan"
  | "pulse"
  | "hologram"
  | "boot"
  | "shutdown";

interface AnimationConfig {
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string | number[];
}

const presets: Record<AnimationPreset, { initial: object; animate: object; exit?: object }> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeOut: {
    initial: { opacity: 1 },
    animate: { opacity: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  scaleOut: {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 0, scale: 0.9 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  glitch: {
    initial: { opacity: 0, x: -5, filter: "blur(4px)" },
    animate: { 
      opacity: [0, 1, 0.8, 1], 
      x: [-5, 3, -2, 0], 
      filter: ["blur(4px)", "blur(0px)", "blur(2px)", "blur(0px)"]
    },
    exit: { opacity: 0, x: 5, filter: "blur(4px)" },
  },
  scan: {
    initial: { opacity: 0, scaleY: 0.8 },
    animate: { opacity: 1, scaleY: 1 },
    exit: { opacity: 0, scaleY: 0.8 },
  },
  pulse: {
    initial: { opacity: 0.5, scale: 0.98 },
    animate: { 
      opacity: [0.5, 1, 0.5], 
      scale: [0.98, 1.02, 0.98] 
    },
  },
  hologram: {
    initial: { opacity: 0, rotateX: -15, y: 10 },
    animate: { opacity: 1, rotateX: 0, y: 0 },
    exit: { opacity: 0, rotateX: 15, y: -10 },
  },
  boot: {
    initial: { 
      opacity: 0, 
      scale: 0.95, 
      filter: "brightness(2) blur(10px)" 
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      filter: "brightness(1) blur(0px)" 
    },
    exit: { 
      opacity: 0, 
      scale: 1.05, 
      filter: "brightness(0) blur(5px)" 
    },
  },
  shutdown: {
    initial: { opacity: 1, scaleY: 1 },
    animate: { 
      opacity: [1, 1, 0], 
      scaleY: [1, 0.5, 0.01] 
    },
  },
};

const reducedMotionPresets: Record<AnimationPreset, { initial: object; animate: object; exit?: object }> = {
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  fadeOut: { initial: { opacity: 1 }, animate: { opacity: 0 } },
  scaleIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  scaleOut: { initial: { opacity: 1 }, animate: { opacity: 0 } },
  slideUp: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slideDown: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slideLeft: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slideRight: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  glitch: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  scan: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  pulse: { initial: { opacity: 1 }, animate: { opacity: 1 } },
  hologram: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  boot: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  shutdown: { initial: { opacity: 1 }, animate: { opacity: 0 } },
};

export const useQuantumAnimation = () => {
  const shouldReduceMotion = useReducedMotion();

  const getPreset = useCallback((
    preset: AnimationPreset,
    config?: AnimationConfig
  ) => {
    const basePreset = shouldReduceMotion 
      ? reducedMotionPresets[preset] 
      : presets[preset];

    const transition = {
      duration: config?.duration ?? 0.3,
      delay: config?.delay ?? 0,
      ease: config?.ease ?? [0.4, 0, 0.2, 1],
    };

    return {
      ...basePreset,
      transition,
    };
  }, [shouldReduceMotion]);

  const getStaggerChildren = useCallback((
    count: number,
    baseDelay: number = 0.05
  ) => {
    if (shouldReduceMotion) return 0;
    return baseDelay;
  }, [shouldReduceMotion]);

  const getStaggerDelay = useCallback((
    index: number,
    baseDelay: number = 0.05
  ) => {
    if (shouldReduceMotion) return 0;
    return index * baseDelay;
  }, [shouldReduceMotion]);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.03,
        staggerDirection: -1,
      },
    },
  }), [shouldReduceMotion]);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : -10,
      transition: { duration: 0.2 },
    },
  }), [shouldReduceMotion]);

  return {
    getPreset,
    getStaggerChildren,
    getStaggerDelay,
    containerVariants,
    itemVariants,
    shouldReduceMotion,
    presets: shouldReduceMotion ? reducedMotionPresets : presets,
  };
};

export default useQuantumAnimation;
