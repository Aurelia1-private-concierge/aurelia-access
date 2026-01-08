import { createContext, useContext, ReactNode } from "react";
import { useSubscription } from "@/hooks/useSubscription";

export type TierTheme = "default" | "silver" | "gold" | "platinum";

interface TierThemeColors {
  accent: string;
  accentMuted: string;
  accentForeground: string;
  accentBg: string;
  accentBorder: string;
  accentGlow: string;
  gradientFrom: string;
  gradientTo: string;
  tierLabel: string;
}

const themeColors: Record<TierTheme, TierThemeColors> = {
  default: {
    accent: "text-primary",
    accentMuted: "text-primary/70",
    accentForeground: "text-primary-foreground",
    accentBg: "bg-primary/10",
    accentBorder: "border-primary/20",
    accentGlow: "shadow-[0_0_20px_hsl(43,70%,52%,0.15)]",
    gradientFrom: "from-primary/10",
    gradientTo: "to-transparent",
    tierLabel: "Member",
  },
  silver: {
    accent: "text-slate-400",
    accentMuted: "text-slate-400/70",
    accentForeground: "text-slate-900",
    accentBg: "bg-slate-400/10",
    accentBorder: "border-slate-400/20",
    accentGlow: "shadow-[0_0_20px_hsl(215,20%,65%,0.15)]",
    gradientFrom: "from-slate-400/10",
    gradientTo: "to-transparent",
    tierLabel: "Silver",
  },
  gold: {
    accent: "text-primary",
    accentMuted: "text-primary/70",
    accentForeground: "text-primary-foreground",
    accentBg: "bg-primary/10",
    accentBorder: "border-primary/20",
    accentGlow: "shadow-[0_0_20px_hsl(43,70%,52%,0.2)]",
    gradientFrom: "from-primary/10",
    gradientTo: "to-transparent",
    tierLabel: "Gold",
  },
  platinum: {
    accent: "text-purple-400",
    accentMuted: "text-purple-400/70",
    accentForeground: "text-purple-950",
    accentBg: "bg-purple-400/10",
    accentBorder: "border-purple-400/20",
    accentGlow: "shadow-[0_0_20px_hsl(270,70%,65%,0.2)]",
    gradientFrom: "from-purple-400/10",
    gradientTo: "to-transparent",
    tierLabel: "Platinum",
  },
};

interface TierThemeContextValue {
  tier: TierTheme;
  colors: TierThemeColors;
  subscribed: boolean;
}

const TierThemeContext = createContext<TierThemeContextValue>({
  tier: "default",
  colors: themeColors.default,
  subscribed: false,
});

export const useTierTheme = () => useContext(TierThemeContext);

interface TierThemeProviderProps {
  children: ReactNode;
}

export const TierThemeProvider = ({ children }: TierThemeProviderProps) => {
  const { tier, subscribed } = useSubscription();

  const currentTier = (subscribed && tier ? tier : "default") as TierTheme;
  const colors = themeColors[currentTier] || themeColors.default;

  return (
    <TierThemeContext.Provider value={{ tier: currentTier, colors, subscribed }}>
      {children}
    </TierThemeContext.Provider>
  );
};
