import { useEffect, useCallback } from "react";
import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

const tourSteps: DriveStep[] = [
  {
    element: '[data-tour="subscription-card"]',
    popover: {
      title: "Your Membership Status",
      description: "View your current membership tier, renewal date, and manage your subscription here.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="exclusive-perks"]',
    popover: {
      title: "Exclusive Member Perks",
      description: "Discover all the exclusive benefits available at your tier. Click locked perks to see what you'll unlock with an upgrade.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="travel-dna"]',
    popover: {
      title: "Your Travel DNA",
      description: "We learn your preferences to provide personalized recommendations. Complete your profile for tailored experiences.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="orla-companion"]',
    popover: {
      title: "Meet Orla, Your AI Concierge",
      description: "Orla is available 24/7 to help with reservations, recommendations, and requests. Just ask!",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="surprise-me"]',
    popover: {
      title: "Surprise Me Feature",
      description: "Feeling adventurous? Let us curate a unique experience based on your preferences.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="recommendations"]',
    popover: {
      title: "Personalized Recommendations",
      description: "Curated experiences and services tailored to your interests and travel style.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="sidebar-nav"]',
    popover: {
      title: "Navigate Your Dashboard",
      description: "Access your portfolio, secure messages, and document vault from here.",
      side: "right",
      align: "start",
    },
  },
];

interface UseDashboardTourOptions {
  onComplete?: () => void;
  autoStart?: boolean;
}

export const useDashboardTour = (options: UseDashboardTourOptions = {}) => {
  const { onComplete, autoStart = false } = options;

  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "rgba(0, 0, 0, 0.85)",
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: "aurelia-tour-popover",
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Next →",
      prevBtnText: "← Previous",
      doneBtnText: "Get Started",
      steps: tourSteps,
      onDestroyStarted: () => {
        driverObj.destroy();
        onComplete?.();
      },
    });

    driverObj.drive();
  }, [onComplete]);

  useEffect(() => {
    if (autoStart) {
      // Small delay to ensure elements are rendered
      const timer = setTimeout(startTour, 500);
      return () => clearTimeout(timer);
    }
  }, [autoStart, startTour]);

  return { startTour };
};
