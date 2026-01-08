import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface CircularWaveformProps {
  getFrequencyData: () => Uint8Array | undefined;
  getVolume: () => number;
  isActive: boolean;
  size?: number;
  barCount?: number;
  type?: "output" | "input";
}

const CircularWaveform = ({
  getFrequencyData,
  getVolume,
  isActive,
  size = 280,
  barCount = 64,
  type = "output",
}: CircularWaveformProps) => {
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(0.1));
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isActive) {
      setBars(Array(barCount).fill(0.15));
      return;
    }

    const updateBars = () => {
      const frequencyData = getFrequencyData();
      const volume = getVolume();

      if (frequencyData && frequencyData.length > 0) {
        const step = Math.floor(frequencyData.length / barCount);
        const newBars = Array(barCount)
          .fill(0)
          .map((_, i) => {
            const index = Math.min(i * step, frequencyData.length - 1);
            const value = frequencyData[index] / 255;
            return Math.max(0.15, value * 0.85 + 0.15);
          });
        setBars(newBars);
      } else if (volume > 0) {
        const time = Date.now() / 1000;
        const newBars = Array(barCount)
          .fill(0)
          .map((_, i) => {
            const wave = Math.sin(time * 3 + i * 0.3) * 0.3 + 0.5;
            return Math.max(0.15, volume * wave * 0.8 + 0.15);
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
  const radius = size / 2;
  const innerRadius = radius - 40; // Space for bars
  const maxBarHeight = 35;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        {bars.map((height, index) => {
          const angle = (index / barCount) * 2 * Math.PI - Math.PI / 2;
          const barHeight = isActive ? height * maxBarHeight : 4;
          
          const x1 = radius + Math.cos(angle) * innerRadius;
          const y1 = radius + Math.sin(angle) * innerRadius;
          const x2 = radius + Math.cos(angle) * (innerRadius + barHeight);
          const y2 = radius + Math.sin(angle) * (innerRadius + barHeight);

          const opacity = isActive ? 0.4 + height * 0.6 : 0.2;

          return (
            <motion.line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isOutput ? "hsl(43, 74%, 49%)" : "hsl(142, 71%, 45%)"}
              strokeWidth={2}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity,
                x2,
                y2,
              }}
              transition={{ duration: 0.05, ease: "easeOut" }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default CircularWaveform;
