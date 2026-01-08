import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AudioWaveformProps {
  getFrequencyData: () => Uint8Array | undefined;
  getVolume: () => number;
  isActive: boolean;
  barCount?: number;
  type?: "output" | "input";
}

const AudioWaveform = ({ 
  getFrequencyData, 
  getVolume, 
  isActive, 
  barCount = 32,
  type = "output"
}: AudioWaveformProps) => {
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(0.1));
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isActive) {
      setBars(Array(barCount).fill(0.1));
      return;
    }

    const updateBars = () => {
      const frequencyData = getFrequencyData();
      const volume = getVolume();
      
      if (frequencyData && frequencyData.length > 0) {
        // Sample frequency data across the bar count
        const step = Math.floor(frequencyData.length / barCount);
        const newBars = Array(barCount).fill(0).map((_, i) => {
          const index = Math.min(i * step, frequencyData.length - 1);
          // Normalize to 0-1 range and apply some smoothing
          const value = frequencyData[index] / 255;
          // Add some minimum height and scale
          return Math.max(0.08, value * 0.9 + 0.1);
        });
        setBars(newBars);
      } else if (volume > 0) {
        // Fallback: use volume to create a simple wave pattern
        const newBars = Array(barCount).fill(0).map((_, i) => {
          const centerDistance = Math.abs(i - barCount / 2) / (barCount / 2);
          const waveValue = volume * (1 - centerDistance * 0.5);
          return Math.max(0.08, waveValue * 0.8 + 0.1);
        });
        setBars(newBars);
      }
      
      animationRef.current = requestAnimationFrame(updateBars);
    };

    animationRef.current = requestAnimationFrame(updateBars);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, getFrequencyData, getVolume, barCount]);

  const isOutput = type === "output";

  return (
    <div className="flex items-center justify-center gap-[2px] h-16 px-4">
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className={`w-1 rounded-full ${
            isOutput 
              ? "bg-gradient-to-t from-primary/60 to-primary" 
              : "bg-gradient-to-t from-emerald-500/60 to-emerald-400"
          }`}
          animate={{
            height: isActive ? `${height * 100}%` : "8%",
            opacity: isActive ? 0.6 + height * 0.4 : 0.3,
          }}
          transition={{
            duration: 0.05,
            ease: "easeOut",
          }}
          style={{
            minHeight: "4px",
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;
