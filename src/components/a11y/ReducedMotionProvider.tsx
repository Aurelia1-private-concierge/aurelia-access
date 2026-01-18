import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ReducedMotionContextType {
  prefersReducedMotion: boolean;
  disableAnimations: boolean;
  setDisableAnimations: (value: boolean) => void;
}

const ReducedMotionContext = createContext<ReducedMotionContextType>({
  prefersReducedMotion: false,
  disableAnimations: false,
  setDisableAnimations: () => {},
});

export const useReducedMotion = () => useContext(ReducedMotionContext);

interface ReducedMotionProviderProps {
  children: ReactNode;
}

export const ReducedMotionProvider = ({ children }: ReducedMotionProviderProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [disableAnimations, setDisableAnimations] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ReducedMotionContext.Provider
      value={{
        prefersReducedMotion,
        disableAnimations: disableAnimations || prefersReducedMotion,
        setDisableAnimations,
      }}
    >
      {children}
    </ReducedMotionContext.Provider>
  );
};

export default ReducedMotionProvider;
