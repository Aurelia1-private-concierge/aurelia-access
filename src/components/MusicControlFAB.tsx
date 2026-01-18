import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, VolumeX, Volume2, Loader2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface MusicControlFABProps {
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (value: number) => void;
  currentSection?: string;
  description?: string;
}

const MusicControlFAB = ({
  isPlaying,
  isLoading,
  volume,
  onToggle,
  onVolumeChange,
  currentSection,
  description,
}: MusicControlFABProps) => {
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2">
      {/* Expanded Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-2xl min-w-[200px]"
          >
            {/* Current track info */}
            {currentSection && (
              <div className="mb-3 pb-3 border-b border-border/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Now Playing</p>
                <p className="text-sm font-medium text-foreground capitalize">{currentSection}</p>
                {description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                )}
              </div>
            )}

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Volume</span>
                <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume * 100]}
                onValueChange={(vals) => onVolumeChange(vals[0] / 100)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={onToggle}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
          isPlaying
            ? "bg-primary text-primary-foreground"
            : "bg-card/90 backdrop-blur-sm border border-border/50 text-foreground hover:bg-card"
        )}
        aria-label={isPlaying ? "Pause ambient music" : "Play ambient music"}
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isPlaying ? (
          <div className="relative">
            <Volume2 className="w-6 h-6" />
            {/* Animated equalizer bars */}
            <div className="absolute -top-1 -right-1 flex items-end gap-0.5 h-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-primary-foreground rounded-full"
                  animate={{
                    height: ['40%', '100%', '60%', '80%', '40%'],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <Music className="w-6 h-6" />
        )}

        {/* Pulse ring when playing */}
        {isPlaying && !isLoading && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary"
            animate={{
              scale: [1, 1.3, 1.3],
              opacity: [0.5, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </motion.button>
    </div>
  );
};

export default MusicControlFAB;
