import { useState, useCallback, useEffect } from "react";

export interface AvatarStyle {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  effects: {
    sparkles: boolean;
    particles: boolean;
    glow: boolean;
    pulse: boolean;
  };
}

const AVATAR_STYLES: AvatarStyle[] = [
  {
    id: "classic-gold",
    name: "Classic Gold",
    description: "Elegant golden tones with subtle warmth",
    preview: "🌟",
    colors: {
      primary: "#D4AF37",
      secondary: "#f5ebe0",
      accent: "#fff5e6",
      glow: "rgba(212, 175, 55, 0.4)",
    },
    effects: {
      sparkles: true,
      particles: false,
      glow: true,
      pulse: true,
    },
  },
  {
    id: "midnight-sapphire",
    name: "Midnight Sapphire",
    description: "Deep blue elegance with silver accents",
    preview: "💎",
    colors: {
      primary: "#1e40af",
      secondary: "#e0e7ff",
      accent: "#c7d2fe",
      glow: "rgba(30, 64, 175, 0.4)",
    },
    effects: {
      sparkles: true,
      particles: true,
      glow: true,
      pulse: false,
    },
  },
  {
    id: "rose-quartz",
    name: "Rose Quartz",
    description: "Soft pink hues with gentle radiance",
    preview: "🌸",
    colors: {
      primary: "#db2777",
      secondary: "#fce7f3",
      accent: "#fbcfe8",
      glow: "rgba(219, 39, 119, 0.3)",
    },
    effects: {
      sparkles: true,
      particles: false,
      glow: true,
      pulse: true,
    },
  },
  {
    id: "emerald-forest",
    name: "Emerald Forest",
    description: "Rich greens inspired by nature",
    preview: "🌿",
    colors: {
      primary: "#059669",
      secondary: "#d1fae5",
      accent: "#a7f3d0",
      glow: "rgba(5, 150, 105, 0.4)",
    },
    effects: {
      sparkles: false,
      particles: true,
      glow: true,
      pulse: false,
    },
  },
  {
    id: "arctic-frost",
    name: "Arctic Frost",
    description: "Cool whites and icy blues",
    preview: "❄️",
    colors: {
      primary: "#0ea5e9",
      secondary: "#f0f9ff",
      accent: "#e0f2fe",
      glow: "rgba(14, 165, 233, 0.4)",
    },
    effects: {
      sparkles: true,
      particles: true,
      glow: true,
      pulse: true,
    },
  },
  {
    id: "sunset-amber",
    name: "Sunset Amber",
    description: "Warm orange and red gradient",
    preview: "🌅",
    colors: {
      primary: "#ea580c",
      secondary: "#fff7ed",
      accent: "#fed7aa",
      glow: "rgba(234, 88, 12, 0.4)",
    },
    effects: {
      sparkles: true,
      particles: false,
      glow: true,
      pulse: true,
    },
  },
  {
    id: "cosmic-purple",
    name: "Cosmic Purple",
    description: "Deep space vibes with nebula colors",
    preview: "🔮",
    colors: {
      primary: "#7c3aed",
      secondary: "#ede9fe",
      accent: "#ddd6fe",
      glow: "rgba(124, 58, 237, 0.4)",
    },
    effects: {
      sparkles: true,
      particles: true,
      glow: true,
      pulse: true,
    },
  },
  {
    id: "minimal-monochrome",
    name: "Minimal Monochrome",
    description: "Clean black and white aesthetic",
    preview: "⚫",
    colors: {
      primary: "#374151",
      secondary: "#f9fafb",
      accent: "#e5e7eb",
      glow: "rgba(55, 65, 81, 0.3)",
    },
    effects: {
      sparkles: false,
      particles: false,
      glow: false,
      pulse: false,
    },
  },
  // New styles
  {
    id: "aurora-borealis",
    name: "Aurora Borealis",
    description: "Shifting northern lights colors",
    preview: "🌌",
    colors: {
      primary: "#06b6d4",
      secondary: "#ecfeff",
      accent: "#a5f3fc",
      glow: "rgba(6, 182, 212, 0.5)",
    },
    effects: {
      sparkles: true,
      particles: true,
      glow: true,
      pulse: true,
    },
  },
  {
    id: "crimson-velvet",
    name: "Crimson Velvet",
    description: "Luxurious deep red elegance",
    preview: "🍷",
    colors: {
      primary: "#be123c",
      secondary: "#fff1f2",
      accent: "#fecdd3",
      glow: "rgba(190, 18, 60, 0.4)",
    },
    effects: {
      sparkles: false,
      particles: true,
      glow: true,
      pulse: true,
    },
  },
  {
    id: "obsidian-night",
    name: "Obsidian Night",
    description: "Dark mystique with subtle shimmer",
    preview: "🌑",
    colors: {
      primary: "#1f2937",
      secondary: "#111827",
      accent: "#374151",
      glow: "rgba(31, 41, 55, 0.6)",
    },
    effects: {
      sparkles: true,
      particles: true,
      glow: true,
      pulse: false,
    },
  },
  {
    id: "champagne-dreams",
    name: "Champagne Dreams",
    description: "Effervescent bubbles and celebration",
    preview: "🥂",
    colors: {
      primary: "#fbbf24",
      secondary: "#fffbeb",
      accent: "#fde68a",
      glow: "rgba(251, 191, 36, 0.5)",
    },
    effects: {
      sparkles: true,
      particles: true,
      glow: true,
      pulse: true,
    },
  },
];

const STORAGE_KEY = "orla-avatar-style";

export const useAvatarStyle = () => {
  const [currentStyleId, setCurrentStyleId] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || "classic-gold";
  });

  const currentStyle = AVATAR_STYLES.find(s => s.id === currentStyleId) || AVATAR_STYLES[0];

  const setStyle = useCallback((styleId: string) => {
    const style = AVATAR_STYLES.find(s => s.id === styleId);
    if (style) {
      setCurrentStyleId(styleId);
      localStorage.setItem(STORAGE_KEY, styleId);
    }
  }, []);

  // Apply style as CSS variables when it changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--orla-primary", currentStyle.colors.primary);
    root.style.setProperty("--orla-secondary", currentStyle.colors.secondary);
    root.style.setProperty("--orla-accent", currentStyle.colors.accent);
    root.style.setProperty("--orla-glow", currentStyle.colors.glow);
  }, [currentStyle]);

  return {
    styles: AVATAR_STYLES,
    currentStyle,
    currentStyleId,
    setStyle,
  };
};

export default useAvatarStyle;
