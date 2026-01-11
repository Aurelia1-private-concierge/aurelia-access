import { memo, useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAvatarStyle } from "@/hooks/useAvatarStyle";

interface AudioVisualizerBackgroundProps {
  isActive?: boolean;
  audioLevel?: number;
  isSpeaking?: boolean;
  getFrequencyData?: () => Uint8Array | null;
}

const AudioVisualizerBackground = memo(({
  isActive = false,
  audioLevel = 0,
  isSpeaking = false,
  getFrequencyData,
}: AudioVisualizerBackgroundProps) => {
  const { currentStyle } = useAvatarStyle();
  const [frequencyBars, setFrequencyBars] = useState<number[]>(Array(32).fill(0));
  
  // Update frequency bars from audio data
  useEffect(() => {
    if (!isActive || !getFrequencyData) {
      setFrequencyBars(Array(32).fill(0));
      return;
    }
    
    const updateBars = () => {
      const data = getFrequencyData();
      if (data) {
        const bars: number[] = [];
        const step = Math.floor(data.length / 32);
        for (let i = 0; i < 32; i++) {
          const value = data[i * step] / 255;
          bars.push(value);
        }
        setFrequencyBars(bars);
      }
    };
    
    const interval = setInterval(updateBars, 50);
    return () => clearInterval(interval);
  }, [isActive, getFrequencyData]);
  
  // Generate wave points for the ambient wave visualization
  const wavePoints = useMemo(() => {
    const points: { x: number; y: number; delay: number }[] = [];
    for (let i = 0; i < 50; i++) {
      points.push({
        x: (i / 49) * 100,
        y: 50 + Math.sin(i * 0.3) * 20,
        delay: i * 0.02,
      });
    }
    return points;
  }, []);
  
  if (!isActive) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Radial gradient background pulse */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${currentStyle.colors.glow} 0%, transparent 50%)`,
        }}
        animate={{
          opacity: isSpeaking ? [0.3, 0.6, 0.3] : 0.2,
          scale: isSpeaking ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Bottom frequency bars */}
      <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 px-4">
        {frequencyBars.map((value, index) => (
          <motion.div
            key={index}
            className="flex-1 max-w-3 rounded-t-full"
            style={{
              backgroundColor: currentStyle.colors.primary,
              opacity: 0.3 + value * 0.5,
            }}
            animate={{
              height: 4 + value * 80 + audioLevel * 20,
            }}
            transition={{ duration: 0.05 }}
          />
        ))}
      </div>
      
      {/* Mirror bars at top */}
      <div className="absolute top-0 left-0 right-0 h-24 flex items-start justify-center gap-1 px-4 rotate-180">
        {frequencyBars.map((value, index) => (
          <motion.div
            key={index}
            className="flex-1 max-w-2 rounded-t-full"
            style={{
              backgroundColor: currentStyle.colors.primary,
              opacity: 0.15 + value * 0.3,
            }}
            animate={{
              height: 2 + value * 40 + audioLevel * 10,
            }}
            transition={{ duration: 0.05 }}
          />
        ))}
      </div>
      
      {/* Ambient wave lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {[0, 1, 2].map((waveIndex) => (
          <motion.path
            key={waveIndex}
            d={`M 0 ${50 + waveIndex * 5} ${wavePoints.map(p => 
              `L ${p.x} ${p.y + waveIndex * 5 + audioLevel * 10 * Math.sin(p.x * 0.1)}`
            ).join(' ')}`}
            fill="none"
            stroke={currentStyle.colors.primary}
            strokeWidth={0.2}
            strokeOpacity={0.2 - waveIndex * 0.05}
            animate={{
              d: isSpeaking 
                ? `M 0 ${50 + waveIndex * 5} ${wavePoints.map(p => 
                    `L ${p.x} ${p.y + waveIndex * 5 + (audioLevel + 0.3) * 15 * Math.sin(p.x * 0.2 + Date.now() / 500)}`
                  ).join(' ')}`
                : undefined,
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </svg>
      
      {/* Corner accent glows */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl"
        style={{ backgroundColor: currentStyle.colors.primary }}
        animate={{
          opacity: [0.05, 0.1, 0.05],
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl"
        style={{ backgroundColor: currentStyle.colors.primary }}
        animate={{
          opacity: [0.05, 0.1, 0.05],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* Audio level reactive center ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2, 3].map((ringIndex) => (
          <motion.div
            key={ringIndex}
            className="absolute rounded-full border"
            style={{
              borderColor: currentStyle.colors.primary,
              width: 200 + ringIndex * 80,
              height: 200 + ringIndex * 80,
              left: -(100 + ringIndex * 40),
              top: -(100 + ringIndex * 40),
            }}
            animate={{
              scale: 1 + audioLevel * 0.1,
              opacity: isSpeaking 
                ? [0.1 - ringIndex * 0.02, 0.2 - ringIndex * 0.03, 0.1 - ringIndex * 0.02]
                : 0.05 - ringIndex * 0.01,
              borderWidth: 1 + audioLevel * 2,
            }}
            transition={{
              duration: 1 + ringIndex * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Floating frequency dots */}
      {isActive && frequencyBars.slice(0, 12).map((value, index) => (
        <motion.div
          key={`dot-${index}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: currentStyle.colors.primary,
            left: `${10 + (index / 11) * 80}%`,
            bottom: "20%",
          }}
          animate={{
            y: -50 - value * 100 - audioLevel * 50,
            opacity: [0.2, 0.6 + value * 0.4, 0.2],
            scale: [0.5, 1 + value, 0.5],
          }}
          transition={{
            duration: 2,
            delay: index * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
});

AudioVisualizerBackground.displayName = "AudioVisualizerBackground";

export default AudioVisualizerBackground;
