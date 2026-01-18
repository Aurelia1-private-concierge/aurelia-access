import { useEffect, useRef, useState, RefObject, useCallback } from "react";
import { useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

interface ScrollAnimationResult {
  ref: RefObject<HTMLElement>;
  isInView: boolean;
  progress: MotionValue<number>;
  springProgress: MotionValue<number>;
}

export const useScrollAnimation = (
  options: UseScrollAnimationOptions = {}
): ScrollAnimationResult => {
  const { threshold = 0.2, rootMargin = "-50px", once = true } = options;
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const progress = useMotionValue(0);
  const springProgress = useSpring(progress, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        
        if (visible) {
          setIsInView(true);
          progress.set(1);
          if (once) observer.unobserve(element);
        } else if (!once) {
          setIsInView(false);
          progress.set(0);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, progress]);

  return { ref, isInView, progress, springProgress };
};

// Parallax scroll effect
export const useParallax = (
  scrollY: MotionValue<number>,
  distance: number = 100
): MotionValue<number> => {
  return useTransform(scrollY, [0, 1000], [0, distance]);
};

// Scroll-linked opacity
export const useScrollOpacity = (
  scrollY: MotionValue<number>,
  fadeStart: number = 0,
  fadeEnd: number = 300
): MotionValue<number> => {
  return useTransform(scrollY, [fadeStart, fadeEnd], [1, 0]);
};

// Scroll progress for a section
export const useSectionProgress = () => {
  const ref = useRef<HTMLElement>(null);
  const progress = useMotionValue(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress from when element enters view to when it leaves
      const start = windowHeight;
      const end = -rect.height;
      const current = rect.top;
      
      const progressValue = Math.max(0, Math.min(1, (start - current) / (start - end)));
      progress.set(progressValue);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, [progress]);

  return { ref, progress };
};

// Smooth scroll to element
export const useSmoothScroll = () => {
  const scrollTo = useCallback((elementId: string, offset: number = 80) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { scrollTo, scrollToTop };
};

export default useScrollAnimation;
