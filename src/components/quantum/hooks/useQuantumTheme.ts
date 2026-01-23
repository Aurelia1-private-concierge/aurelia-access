import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

export type QuantumColorScheme = "cyan" | "gold" | "emerald" | "purple" | "red" | "amber";

interface QuantumThemeColors {
  primary: string;
  primaryRgb: string;
  glow: string;
  accent: string;
  muted: string;
}

const colorSchemes: Record<QuantumColorScheme, QuantumThemeColors> = {
  cyan: {
    primary: "rgb(34, 211, 238)",
    primaryRgb: "34, 211, 238",
    glow: "rgba(34, 211, 238, 0.5)",
    accent: "rgb(103, 232, 249)",
    muted: "rgb(22, 78, 99)",
  },
  gold: {
    primary: "rgb(251, 191, 36)",
    primaryRgb: "251, 191, 36",
    glow: "rgba(251, 191, 36, 0.5)",
    accent: "rgb(253, 224, 71)",
    muted: "rgb(120, 53, 15)",
  },
  emerald: {
    primary: "rgb(52, 211, 153)",
    primaryRgb: "52, 211, 153",
    glow: "rgba(52, 211, 153, 0.5)",
    accent: "rgb(110, 231, 183)",
    muted: "rgb(6, 78, 59)",
  },
  purple: {
    primary: "rgb(168, 85, 247)",
    primaryRgb: "168, 85, 247",
    glow: "rgba(168, 85, 247, 0.5)",
    accent: "rgb(192, 132, 252)",
    muted: "rgb(88, 28, 135)",
  },
  red: {
    primary: "rgb(248, 113, 113)",
    primaryRgb: "248, 113, 113",
    glow: "rgba(248, 113, 113, 0.5)",
    accent: "rgb(252, 165, 165)",
    muted: "rgb(127, 29, 29)",
  },
  amber: {
    primary: "rgb(251, 146, 60)",
    primaryRgb: "251, 146, 60",
    glow: "rgba(251, 146, 60, 0.5)",
    accent: "rgb(253, 186, 116)",
    muted: "rgb(120, 53, 15)",
  },
};

interface QuantumThemeContextValue {
  colorScheme: QuantumColorScheme;
  setColorScheme: (scheme: QuantumColorScheme) => void;
  colors: QuantumThemeColors;
  isDark: boolean;
  toggleDarkMode: () => void;
  getCssVars: () => Record<string, string>;
  getColorClass: (type: "bg" | "text" | "border" | "shadow") => string;
}

const QuantumThemeContext = createContext<QuantumThemeContextValue | null>(null);

export const useQuantumTheme = () => {
  const context = useContext(QuantumThemeContext);
  
  // If not in provider, return default values
  if (!context) {
    const defaultScheme: QuantumColorScheme = "cyan";
    const defaultColors = colorSchemes[defaultScheme];
    
    return {
      colorScheme: defaultScheme,
      setColorScheme: () => {},
      colors: defaultColors,
      isDark: true,
      toggleDarkMode: () => {},
      getCssVars: () => ({
        "--quantum-primary": defaultColors.primary,
        "--quantum-primary-rgb": defaultColors.primaryRgb,
        "--quantum-glow": defaultColors.glow,
        "--quantum-accent": defaultColors.accent,
        "--quantum-muted": defaultColors.muted,
      }),
      getColorClass: (type: "bg" | "text" | "border" | "shadow") => {
        const classMap = {
          bg: "bg-cyan-500",
          text: "text-cyan-400",
          border: "border-cyan-500",
          shadow: "shadow-cyan-500/50",
        };
        return classMap[type];
      },
    };
  }
  
  return context;
};

interface QuantumThemeProviderProps {
  children: ReactNode;
  defaultScheme?: QuantumColorScheme;
  defaultDark?: boolean;
}

export const createQuantumThemeProvider = () => {
  const QuantumThemeProvider = ({
    children,
    defaultScheme = "cyan",
    defaultDark = true,
  }: QuantumThemeProviderProps) => {
    const [colorScheme, setColorScheme] = useState<QuantumColorScheme>(defaultScheme);
    const [isDark, setIsDark] = useState(defaultDark);

    const colors = useMemo(() => colorSchemes[colorScheme], [colorScheme]);

    const toggleDarkMode = useCallback(() => {
      setIsDark((prev) => !prev);
    }, []);

    const getCssVars = useCallback(() => ({
      "--quantum-primary": colors.primary,
      "--quantum-primary-rgb": colors.primaryRgb,
      "--quantum-glow": colors.glow,
      "--quantum-accent": colors.accent,
      "--quantum-muted": colors.muted,
    }), [colors]);

    const getColorClass = useCallback((type: "bg" | "text" | "border" | "shadow") => {
      const schemeClasses: Record<QuantumColorScheme, Record<string, string>> = {
        cyan: { bg: "bg-cyan-500", text: "text-cyan-400", border: "border-cyan-500", shadow: "shadow-cyan-500/50" },
        gold: { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500", shadow: "shadow-amber-500/50" },
        emerald: { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500", shadow: "shadow-emerald-500/50" },
        purple: { bg: "bg-purple-500", text: "text-purple-400", border: "border-purple-500", shadow: "shadow-purple-500/50" },
        red: { bg: "bg-red-500", text: "text-red-400", border: "border-red-500", shadow: "shadow-red-500/50" },
        amber: { bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500", shadow: "shadow-orange-500/50" },
      };
      return schemeClasses[colorScheme][type];
    }, [colorScheme]);

    const value = useMemo(() => ({
      colorScheme,
      setColorScheme,
      colors,
      isDark,
      toggleDarkMode,
      getCssVars,
      getColorClass,
    }), [colorScheme, colors, isDark, toggleDarkMode, getCssVars, getColorClass]);

    return {
      Provider: QuantumThemeContext.Provider,
      value,
      children,
    };
  };

  return QuantumThemeProvider;
};

export { colorSchemes, QuantumThemeContext };
export type { QuantumThemeColors, QuantumThemeContextValue };
