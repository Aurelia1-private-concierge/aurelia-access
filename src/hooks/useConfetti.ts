import { useCallback, useEffect } from "react";
import confetti from "canvas-confetti";

interface UseConfettiOptions {
  triggerOnMount?: boolean;
}

export const useConfetti = (options: UseConfettiOptions = {}) => {
  const { triggerOnMount = false } = options;

  const fireConfetti = useCallback(() => {
    // Gold/luxury themed confetti
    const colors = ["#D4AF37", "#FFD700", "#FFC107", "#F5F5DC", "#FFFFFF"];

    // First burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    // Second burst with delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
    }, 150);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 300);
  }, []);

  const firePremiumConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ["#D4AF37", "#FFD700", "#9333EA", "#A855F7", "#FFFFFF"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  useEffect(() => {
    if (triggerOnMount) {
      fireConfetti();
    }
  }, [triggerOnMount, fireConfetti]);

  return { fireConfetti, firePremiumConfetti };
};
