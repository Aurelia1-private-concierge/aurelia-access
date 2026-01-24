import { forwardRef, ReactNode } from "react";
import { QuantumProvider, QuantumToastProvider } from "@/components/quantum";

interface GlobalQuantumWrapperProps {
  children: ReactNode;
}

/**
 * GlobalQuantumWrapper provides Quantum UI infrastructure across the entire Aurelia platform.
 * Wrap your app root with this component to enable:
 * - Quantum theming (gold/cyan/emerald schemes)
 * - Global animation settings
 * - Sound effects (optional)
 * - Toast notifications
 */
export const GlobalQuantumWrapper = forwardRef<HTMLDivElement, GlobalQuantumWrapperProps>(
  ({ children }, ref) => {
    return (
      <QuantumProvider
        ref={ref}
        config={{
          colorScheme: "gold", // Matches Aurelia's ultra-premium gold theme
          animationsEnabled: true,
          soundEnabled: false, // Disabled by default for luxury experience
          isDarkMode: true,
          highContrast: false,
        }}
      >
        <QuantumToastProvider position="top-right" maxToasts={3}>
          {children}
        </QuantumToastProvider>
      </QuantumProvider>
    );
  }
);

GlobalQuantumWrapper.displayName = "GlobalQuantumWrapper";

export default GlobalQuantumWrapper;
