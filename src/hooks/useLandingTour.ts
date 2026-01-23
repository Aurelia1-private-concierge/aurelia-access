import { useCallback, useEffect, useState } from "react";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_STORAGE_KEY = "aurelia_landing_tour_completed";

const tourSteps: DriveStep[] = [
  {
    element: '[data-tour="hero-section"]',
    popover: {
      title: "Welcome to Aurelia",
      description: "Your private concierge for extraordinary experiences. Let us show you around.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="navigation"]',
    popover: {
      title: "Navigate Aurelia",
      description: "Explore our services, learn about membership tiers, or sign in to your account.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="service-categories"]',
    popover: {
      title: "Curated Services",
      description: "From private aviation to yacht charters, fine dining to exclusive events — we handle it all.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="membership-tiers"]',
    popover: {
      title: "Membership Tiers",
      description: "Choose from Signature, Prestige, or Black Card membership for varying levels of access and priority.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="orla-fab"]',
    popover: {
      title: "Meet Orla",
      description: "Your AI concierge is available 24/7. Click here anytime to start a conversation.",
      side: "left",
      align: "center",
    },
  },
  {
    element: '[data-tour="get-started"]',
    popover: {
      title: "Ready to Begin?",
      description: "Create your account or apply for membership to unlock exclusive experiences.",
      side: "top",
      align: "center",
    },
  },
];

interface UseLandingTourOptions {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const useLandingTour = (options: UseLandingTourOptions = {}) => {
  const { onComplete, forceShow = false } = options;
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    setHasSeenTour(!!completed);
  }, []);

  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "rgba(0, 0, 0, 0.85)",
      stagePadding: 10,
      stageRadius: 12,
      popoverClass: "aurelia-tour-popover",
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Continue →",
      prevBtnText: "← Back",
      doneBtnText: "Start Exploring",
      steps: tourSteps,
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
        setHasSeenTour(true);
        driverObj.destroy();
        onComplete?.();
      },
    });

    driverObj.drive();
  }, [onComplete]);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setHasSeenTour(false);
  }, []);

  // Auto-start for first-time visitors - deferred to avoid forced reflows
  useEffect(() => {
    if (!hasSeenTour || forceShow) {
      let cancelled = false;
      
      // Use requestIdleCallback to defer tour until browser is idle
      const scheduleStart = (): number => {
        if ('requestIdleCallback' in window) {
          (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(() => {
            if (cancelled) return;
            const heroExists = document.querySelector('[data-tour="hero-section"]');
            if (heroExists) {
              // Additional frame delay to ensure layout is stable
              requestAnimationFrame(() => {
                if (!cancelled) startTour();
              });
            }
          }, { timeout: 4000 });
          return 0;
        } else {
          // Fallback for Safari
          return setTimeout(() => {
            if (cancelled) return;
            const heroExists = document.querySelector('[data-tour="hero-section"]');
            if (heroExists) startTour();
          }, 3000) as unknown as number;
        }
      };
      
      // Initial delay before scheduling
      const timer = setTimeout(() => {
        scheduleStart();
      }, 2500);
      
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
  }, [hasSeenTour, forceShow, startTour]);

  return { startTour, resetTour, hasSeenTour };
};
