import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

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
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * window.innerHeight 
                }}
                animate={{ 
                  opacity: [0, 0.3, 0],
                  y: [null, Math.random() * -200],
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2, 
                  repeat: Infinity, 
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
                className="absolute w-1 h-1 bg-primary rounded-full"
                style={{ left: `${Math.random() * 100}%` }}
              />
            ))}
          </div>

          {/* Outer glow ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0.8, 1.2, 1], opacity: [0, 0.3, 0.15] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute w-64 h-64 rounded-full bg-gradient-radial from-primary/20 to-transparent blur-2xl"
          />

          <div className="relative flex flex-col items-center">
            {/* Animated rings */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* Outer ring */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="absolute w-40 h-40 rounded-full border border-border/30"
              />
              
              {/* Spinning ring */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: 360 }}
                transition={{ 
                  scale: { duration: 0.6 },
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" }
                }}
                className="absolute w-36 h-36 rounded-full border-t-2 border-primary"
              />
              
              {/* Inner spinning ring (opposite direction) */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.5, rotate: -360 }}
                transition={{ 
                  scale: { duration: 0.6 },
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                }}
                className="absolute w-28 h-28 rounded-full border-b border-primary/50"
              />

              {/* Center diamond */}
              <motion.div
                initial={{ scale: 0, rotate: 45, opacity: 0 }}
                animate={{ scale: 1, rotate: 45, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                className="relative w-12 h-12"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rotate-0 transform" />
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary/30 blur-md"
                />
              </motion.div>
            </div>

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 relative"
            >
              <h1 className="font-serif text-4xl tracking-[0.4em] text-foreground">
                AURELIA
              </h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent origin-center"
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.25em" }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-6 text-xs text-muted-foreground uppercase font-light"
            >
              Beyond Concierge
            </motion.p>

            {/* Loading progress */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 160 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mt-10 h-px bg-border/30 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60"
              />
            </motion.div>

            {/* Status text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.2 }}
              className="mt-4 text-[10px] text-muted-foreground/50 uppercase tracking-widest"
            >
              Initializing secure connection
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
