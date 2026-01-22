import { useEffect, useRef, useState, RefObject, useCallback } from "react";
import { useMotionValue, useSpring, useTransform, MotionValue, useScroll } from "framer-motion";

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

// Scroll progress for a section - uses framer-motion's optimized scroll tracking
// to avoid forced reflows from getBoundingClientRect
export const useSectionProgress = () => {
  const ref = useRef<HTMLElement>(null);
  
  // Use framer-motion's useScroll which is optimized to avoid forced reflows
  // by using scroll position calculations instead of getBoundingClientRect in hot path
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  return { ref, progress: scrollYProgress };
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
