import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { AnimatedLogo } from "@/components/brand";

// Lazy load heavy visual components to reduce main thread blocking
const ParticleField = lazy(() => import("@/components/loading/ParticleField"));
const LoadingOrb = lazy(() => import("@/components/loading/LoadingOrb"));

const loadingPhrases = [
  "Initializing secure connection",
  "Preparing your experience",
  "Curating luxury services",
  "Almost ready",
];

const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [shouldRender, setShouldRender] = useState(true);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const handleAnimationComplete = useCallback(() => {
    if (!isLoading) {
      setShouldRender(false);
    }
  }, [isLoading]);

  useEffect(() => {
    // Schedule updates during idle time to reduce main thread blocking
    const scheduleIdleUpdate = (callback: () => void) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      if (typeof win.requestIdleCallback === 'function') {
        win.requestIdleCallback(callback, { timeout: 100 });
      } else {
        setTimeout(callback, 16);
      }
    };

    // Animate progress with smoother acceleration - use rAF for better scheduling
    let progressRafId: number;
    let lastProgressUpdate = 0;
    const updateProgress = (timestamp: number) => {
      if (timestamp - lastProgressUpdate >= 80) {
        lastProgressUpdate = timestamp;
        setProgress(prev => {
          if (prev >= 100) return 100;
          const remaining = 100 - prev;
          const increment = Math.max(remaining * 0.08, 1);
          return Math.min(prev + increment, 100);
        });
      }
      if (progress < 100) {
        progressRafId = requestAnimationFrame(updateProgress);
      }
    };
    progressRafId = requestAnimationFrame(updateProgress);

    // Rotate through phrases - use idle callback to avoid blocking
    const phraseInterval = setInterval(() => {
      scheduleIdleUpdate(() => {
        setPhraseIndex(prev => (prev + 1) % loadingPhrases.length);
      });
    }, 800);

    // Set loading to false - reduced to 1000ms for faster FID and LCP
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Fallback: force unmount after 1.5 seconds if animation doesn't complete
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
      setShouldRender(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
      clearInterval(phraseInterval);
      cancelAnimationFrame(progressRafId);
    };
  }, [progress]);

  if (!shouldRender) {
    return null;
  }

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.05,
          }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden fixed-optimize"
          style={{ contain: 'layout paint' }}
        >
          {/* Premium particle effects - lazy loaded */}
          <Suspense fallback={null}>
            <ParticleField />
          </Suspense>
          
          {/* Central orb effect - lazy loaded */}
          <Suspense fallback={null}>
            <LoadingOrb />
          </Suspense>

          {/* Noise texture overlay */}
          <div 
            className="absolute inset-0 opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay',
            }}
          />

          {/* Vignette effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 30%, hsl(var(--background) / 0.6) 100%)',
            }}
          />

          {/* Main content container */}
          <div 
            className="relative flex flex-col items-center justify-center overflow-visible z-10"
            style={{ 
              width: '360px',
              height: '320px'
            }}
          >
            {/* Logo entrance animation */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 1.2, 
                ease: [0.4, 0, 0.2, 1],
                delay: 0.2,
              }}
            >
              <AnimatedLogo 
                size="xl" 
                showWordmark={true} 
                showTagline={true} 
              />
            </motion.div>

            {/* Premium progress bar */}
            <motion.div 
              className="mt-12 w-48 relative"
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {/* Track */}
              <div className="h-[2px] bg-border/30 rounded-full overflow-hidden">
                {/* Progress fill */}
                <motion.div
                  className="h-full rounded-full relative"
                  style={{
                    background: 'linear-gradient(90deg, hsl(var(--gold) / 0.4), hsl(var(--gold)), hsl(var(--gold) / 0.4))',
                    width: `${Math.min(progress, 100)}%`,
                  }}
                  transition={{ duration: 0.1 }}
                >
                  {/* Shimmer effect on progress */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </div>
              
              {/* Progress percentage */}
              <motion.div 
                className="absolute -right-8 top-1/2 -translate-y-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1 }}
              >
                <span className="text-[10px] text-muted-foreground font-light tabular-nums">
                  {Math.round(progress)}%
                </span>
              </motion.div>
            </motion.div>

            {/* Animated status text */}
            <div className="mt-6 h-5 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] whitespace-nowrap"
                >
                  {loadingPhrases[phraseIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-1 h-1 rounded-full bg-primary/60" />
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </motion.div>
          </div>

          {/* Corner accents */}
          <motion.div
            className="absolute top-8 left-8 w-16 h-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <div className="absolute top-0 left-0 w-8 h-px bg-gradient-to-r from-primary/60 to-transparent" />
            <div className="absolute top-0 left-0 w-px h-8 bg-gradient-to-b from-primary/60 to-transparent" />
          </motion.div>

          <motion.div
            className="absolute bottom-8 right-8 w-16 h-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            <div className="absolute bottom-0 right-0 w-8 h-px bg-gradient-to-l from-primary/60 to-transparent" />
            <div className="absolute bottom-0 right-0 w-px h-8 bg-gradient-to-t from-primary/60 to-transparent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
