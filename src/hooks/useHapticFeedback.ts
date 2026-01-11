import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

interface HapticPattern {
  pattern: number[];
  amplitude?: number;
}

const HAPTIC_PATTERNS: Record<HapticType, HapticPattern> = {
  light: { pattern: [10] },
  medium: { pattern: [20] },
  heavy: { pattern: [30] },
  success: { pattern: [10, 50, 10, 50, 30] },
  warning: { pattern: [30, 100, 30] },
  error: { pattern: [50, 100, 50, 100, 50] },
  selection: { pattern: [5] },
};

export const useHapticFeedback = () => {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const trigger = useCallback((type: HapticType = 'light') => {
    if (!isSupported) return false;

    try {
      const { pattern } = HAPTIC_PATTERNS[type];
      navigator.vibrate(pattern);
      return true;
    } catch {
      return false;
    }
  }, [isSupported]);

  const triggerCustom = useCallback((pattern: number[]) => {
    if (!isSupported) return false;

    try {
      navigator.vibrate(pattern);
      return true;
    } catch {
      return false;
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    navigator.vibrate(0);
  }, [isSupported]);

  // Pre-defined haptic actions for common interactions
  const haptics = {
    tap: () => trigger('light'),
    press: () => trigger('medium'),
    longPress: () => trigger('heavy'),
    success: () => trigger('success'),
    warning: () => trigger('warning'),
    error: () => trigger('error'),
    selection: () => trigger('selection'),
  };

  return {
    isSupported,
    trigger,
    triggerCustom,
    stop,
    haptics,
  };
};

export default useHapticFeedback;
