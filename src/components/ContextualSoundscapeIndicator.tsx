import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Waves } from 'lucide-react';

interface ContextualSoundscapeIndicatorProps {
  currentSection: string;
  description: string;
  isPlaying: boolean;
}

const ContextualSoundscapeIndicator: React.FC<ContextualSoundscapeIndicatorProps> = ({
  currentSection,
  description,
  isPlaying,
}) => {
  if (!isPlaying) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-40 bg-card/80 backdrop-blur-xl border border-primary/20 rounded-full px-4 py-2 shadow-lg"
      >
        <div className="flex items-center gap-3">
          {/* Animated waveform */}
          <div className="flex items-center gap-0.5 h-4">
            {[0.4, 0.7, 0.5, 0.8, 0.3, 0.6].map((height, i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-primary/60 rounded-full"
                animate={{ 
                  height: [`${height * 100}%`, `${(height + 0.3) * 100}%`, `${height * 100}%`] 
                }}
                transition={{ 
                  duration: 0.6 + i * 0.1, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Section indicator */}
          <div className="flex items-center gap-2">
            <Waves className="w-3 h-3 text-primary/60" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {currentSection}
            </span>
            <span className="text-[10px] text-primary/60">•</span>
            <span className="text-[10px] text-muted-foreground">
              {description}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContextualSoundscapeIndicator;
