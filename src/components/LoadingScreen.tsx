import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { AnimatedLogo } from "@/components/brand";

const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
          style={{ contain: 'layout' }}
        >
          {/* Animated background particles - using CSS percentages and transform to avoid layout shifts */}
          <div className="absolute inset-0 overflow-hidden" style={{ contain: 'strict' }}>
            {[...Array(20)].map((_, i) => {
              const leftPos = (i * 5) % 100;
              const topPos = (i * 7) % 100;
              const delay = (i * 0.1) % 2;
              const duration = 3 + (i % 3);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 0.3, 0],
                    y: -200,
                  }}
                  transition={{ 
                    duration, 
                    repeat: Infinity, 
                    delay,
                    ease: "easeOut"
                  }}
                  className="absolute w-1 h-1 bg-primary rounded-full will-change-transform"
                  style={{ left: `${leftPos}%`, top: `${topPos}%` }}
                />
              );
            })}
          </div>

          {/* Outer glow ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0.8, 1.2, 1], opacity: [0, 0.3, 0.15] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute w-64 h-64 rounded-full bg-gradient-radial from-primary/20 to-transparent blur-2xl will-change-transform"
          />

          {/* Fixed size container to prevent CLS - dimensions match AnimatedLogo xl size */}
          <div 
            className="relative flex flex-col items-center justify-center"
            style={{ 
              contain: 'strict',
              width: '280px',
              height: '280px'
            }}
          >
            {/* Animated Logo with gold shimmer */}
            <AnimatedLogo 
              size="xl" 
              showWordmark={true} 
              showTagline={true} 
            />

            {/* Loading progress - fixed width container to prevent layout shifts */}
            <div className="mt-10 w-40 h-px bg-border/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.min(progress, 100) / 100 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 origin-left will-change-transform"
              />
            </div>

            {/* Status text - fixed height to prevent CLS */}
            <div className="mt-4 h-4 flex items-center justify-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.2 }}
                className="text-[10px] text-muted-foreground/50 uppercase tracking-widest whitespace-nowrap"
              >
                Initializing secure connection
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
