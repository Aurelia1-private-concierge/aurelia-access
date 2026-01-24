import React, { createContext, useContext, useState, useMemo, ReactNode, forwardRef } from "react";
import { QuantumColorScheme, colorSchemes, QuantumThemeContext } from "./hooks/useQuantumTheme";

interface QuantumConfig {
  // Animation settings
  animationsEnabled: boolean;
  reducedMotion: boolean;
  
  // Sound settings
  soundEnabled: boolean;
  soundVolume: number;
  
  // Theme settings
  colorScheme: QuantumColorScheme;
  isDarkMode: boolean;
  
  // Accessibility
  highContrast: boolean;
  focusVisible: boolean;
}

interface QuantumContextValue extends QuantumConfig {
  // Setters
  setAnimationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setColorScheme: (scheme: QuantumColorScheme) => void;
  setDarkMode: (isDark: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  
  // Utilities
  colors: typeof colorSchemes.cyan;
  getCssVars: () => Record<string, string>;
}

const defaultConfig: QuantumConfig = {
  animationsEnabled: true,
  reducedMotion: false,
  soundEnabled: false,
  soundVolume: 0.5,
  colorScheme: "cyan",
  isDarkMode: true,
  highContrast: false,
  focusVisible: true,
};

const QuantumContext = createContext<QuantumContextValue | null>(null);

interface QuantumProviderProps {
  children: ReactNode;
  config?: Partial<QuantumConfig>;
}

export const QuantumProvider = forwardRef<HTMLDivElement, QuantumProviderProps>(
  ({ children, config }, ref) => {
    const [animationsEnabled, setAnimationsEnabled] = useState(
      config?.animationsEnabled ?? defaultConfig.animationsEnabled
    );
    const [soundEnabled, setSoundEnabled] = useState(
      config?.soundEnabled ?? defaultConfig.soundEnabled
    );
    const [soundVolume, setSoundVolume] = useState(
      config?.soundVolume ?? defaultConfig.soundVolume
    );
    const [colorScheme, setColorScheme] = useState<QuantumColorScheme>(
      config?.colorScheme ?? defaultConfig.colorScheme
    );
    const [isDarkMode, setDarkMode] = useState(
      config?.isDarkMode ?? defaultConfig.isDarkMode
    );
    const [highContrast, setHighContrast] = useState(
      config?.highContrast ?? defaultConfig.highContrast
    );

    const colors = useMemo(() => colorSchemes[colorScheme], [colorScheme]);

    const getCssVars = useMemo(() => () => ({
      "--quantum-primary": colors.primary,
      "--quantum-primary-rgb": colors.primaryRgb,
      "--quantum-glow": colors.glow,
      "--quantum-accent": colors.accent,
      "--quantum-muted": colors.muted,
    }), [colors]);

    // Check for reduced motion preference
    const reducedMotion = useMemo(() => {
      if (typeof window === "undefined") return false;
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);

    const value = useMemo<QuantumContextValue>(() => ({
      animationsEnabled: reducedMotion ? false : animationsEnabled,
      reducedMotion,
      soundEnabled,
      soundVolume,
      colorScheme,
      isDarkMode,
      highContrast,
      focusVisible: true,
      setAnimationsEnabled,
      setSoundEnabled,
      setSoundVolume,
      setColorScheme,
      setDarkMode,
      setHighContrast,
      colors,
      getCssVars,
    }), [
      animationsEnabled,
      reducedMotion,
      soundEnabled,
      soundVolume,
      colorScheme,
      isDarkMode,
      highContrast,
      colors,
      getCssVars,
    ]);

    // Also provide theme context for useQuantumTheme hook
    const themeValue = useMemo(() => ({
      colorScheme,
      setColorScheme,
      colors,
      isDark: isDarkMode,
      toggleDarkMode: () => setDarkMode(!isDarkMode),
      getCssVars,
      getColorClass: (type: "bg" | "text" | "border" | "shadow") => {
        const schemeClasses: Record<QuantumColorScheme, Record<string, string>> = {
          cyan: { bg: "bg-cyan-500", text: "text-cyan-400", border: "border-cyan-500", shadow: "shadow-cyan-500/50" },
          gold: { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500", shadow: "shadow-amber-500/50" },
          emerald: { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500", shadow: "shadow-emerald-500/50" },
          purple: { bg: "bg-purple-500", text: "text-purple-400", border: "border-purple-500", shadow: "shadow-purple-500/50" },
          red: { bg: "bg-red-500", text: "text-red-400", border: "border-red-500", shadow: "shadow-red-500/50" },
          amber: { bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500", shadow: "shadow-orange-500/50" },
        };
        return schemeClasses[colorScheme][type];
      },
    }), [colorScheme, colors, isDarkMode, getCssVars]);

    return (
      <QuantumContext.Provider value={value}>
        <QuantumThemeContext.Provider value={themeValue}>
          <div ref={ref} className="quantum-root">
            {children}
          </div>
        </QuantumThemeContext.Provider>
      </QuantumContext.Provider>
    );
  }
);

QuantumProvider.displayName = "QuantumProvider";

export const useQuantumConfig = () => {
  const context = useContext(QuantumContext);
  if (!context) {
    // Return defaults if not in provider
    return {
      ...defaultConfig,
      colors: colorSchemes.cyan,
      getCssVars: () => ({}),
      setAnimationsEnabled: () => {},
      setSoundEnabled: () => {},
      setSoundVolume: () => {},
      setColorScheme: () => {},
      setDarkMode: () => {},
      setHighContrast: () => {},
    } as QuantumContextValue;
  }
  return context;
};

export default QuantumProvider;
