import { useEffect, useRef, useState, RefObject } from "react";

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useLazyLoad = <T extends HTMLElement>(
  options: UseLazyLoadOptions = {}
): [RefObject<T>, boolean] => {
  const { threshold = 0.1, rootMargin = "100px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
};

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Preload critical resources
export const preloadResources = (resources: string[]): void => {
  resources.forEach((resource) => {
    const link = document.createElement("link");
    link.rel = "preload";
    
    if (resource.endsWith(".js")) {
      link.as = "script";
    } else if (resource.endsWith(".css")) {
      link.as = "style";
    } else if (/\.(jpg|jpeg|png|webp|avif|gif)$/i.test(resource)) {
      link.as = "image";
    } else if (/\.(woff|woff2|ttf|otf)$/i.test(resource)) {
      link.as = "font";
      link.crossOrigin = "anonymous";
    }
    
    link.href = resource;
    document.head.appendChild(link);
  });
};

export default useLazyLoad;
