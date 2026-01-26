import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type OrlaIntelligenceMode = "eq" | "iq";

interface OrlaIntelligenceContextValue {
  mode: OrlaIntelligenceMode;
  setMode: (mode: OrlaIntelligenceMode) => void;
  toggleMode: () => void;
  modeConfig: {
    label: string;
    description: string;
    icon: "Heart" | "Brain";
    systemPromptModifier: string;
  };
}

const modeConfigs: Record<OrlaIntelligenceMode, OrlaIntelligenceContextValue["modeConfig"]> = {
  eq: {
    label: "EQ Mode",
    description: "Empathetic & relationship-focused",
    icon: "Heart",
    systemPromptModifier: `
You are operating in EQ (Emotional Intelligence) mode. Prioritize:
- Warm, emotionally attuned communication
- Active listening and empathy in responses
- Understanding the member's emotional state and personal context
- Building and nurturing relationships
- Remembering personal preferences, occasions, and family details
- Proactively suggesting experiences that strengthen connections
- Gentle, supportive guidance rather than direct solutions
`,
  },
  iq: {
    label: "IQ Mode",
    description: "Analytical & solution-focused",
    icon: "Brain",
    systemPromptModifier: `
You are operating in IQ (Analytical Intelligence) mode. Prioritize:
- Data-driven recommendations and insights
- Logical problem-solving and optimization
- Comprehensive research and analysis
- Efficient, direct communication
- Strategic planning and risk assessment
- Market intelligence and trend analysis
- Actionable solutions with clear rationale
`,
  },
};

const OrlaIntelligenceContext = createContext<OrlaIntelligenceContextValue | undefined>(undefined);

export const useOrlaIntelligence = () => {
  const context = useContext(OrlaIntelligenceContext);
  if (!context) {
    throw new Error("useOrlaIntelligence must be used within OrlaIntelligenceProvider");
  }
  return context;
};

interface OrlaIntelligenceProviderProps {
  children: ReactNode;
  defaultMode?: OrlaIntelligenceMode;
}

export const OrlaIntelligenceProvider = ({ 
  children, 
  defaultMode = "eq" 
}: OrlaIntelligenceProviderProps) => {
  const [mode, setModeState] = useState<OrlaIntelligenceMode>(() => {
    // Check localStorage for persisted preference
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("orla-intelligence-mode");
      if (stored === "eq" || stored === "iq") {
        return stored;
      }
    }
    return defaultMode;
  });

  const setMode = useCallback((newMode: OrlaIntelligenceMode) => {
    setModeState(newMode);
    localStorage.setItem("orla-intelligence-mode", newMode);
  }, []);

  const toggleMode = useCallback(() => {
    const newMode = mode === "eq" ? "iq" : "eq";
    setMode(newMode);
  }, [mode, setMode]);

  const modeConfig = modeConfigs[mode];

  return (
    <OrlaIntelligenceContext.Provider value={{ mode, setMode, toggleMode, modeConfig }}>
      {children}
    </OrlaIntelligenceContext.Provider>
  );
};
