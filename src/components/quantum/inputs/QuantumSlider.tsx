import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuantumSliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  className?: string;
  label?: string;
  showValue?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  disabled?: boolean;
  variant?: "default" | "range";
  rangeValue?: [number, number];
  onRangeChange?: (value: [number, number]) => void;
}

export const QuantumSlider = ({
  value: controlledValue,
  defaultValue = 50,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onChangeEnd,
  className,
  label,
  showValue = true,
  showTicks = false,
  tickCount = 5,
  disabled = false,
  variant = "default",
  rangeValue,
  onRangeChange,
}: QuantumSliderProps) => {
  const [internalValue, setInternalValue] = useState(controlledValue ?? defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const [activeThumb, setActiveThumb] = useState<"start" | "end" | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const value = controlledValue ?? internalValue;
  const percentage = ((value - min) / (max - min)) * 100;

  const particleX = useMotionValue(0);
  const particleOpacity = useTransform(particleX, [0, 100], [0.8, 0]);

  const updateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return;

      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percent * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      setInternalValue(clampedValue);
      onChange?.(clampedValue);

      // Trigger particle effect
      animate(particleX, [0, 50, 100], { duration: 0.5 });
    },
    [min, max, step, disabled, onChange, particleX]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onChangeEnd?.(value);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, updateValue, value, onChangeEnd]);

  const ticks = showTicks
    ? Array.from({ length: tickCount }, (_, i) => {
        const tickValue = min + (i / (tickCount - 1)) * (max - min);
        return {
          value: tickValue,
          percentage: ((tickValue - min) / (max - min)) * 100,
        };
      })
    : [];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label and value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-mono text-slate-400">{label}</span>
          )}
          {showValue && (
            <motion.span
              key={value}
              initial={{ scale: 1.2, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-sm font-mono text-cyan-400 tabular-nums"
            >
              {value}
            </motion.span>
          )}
        </div>
      )}

      {/* Slider track */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        className={cn(
          "relative h-8 cursor-pointer select-none",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Background track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 rounded-full bg-slate-800 border border-cyan-500/20 overflow-hidden">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(34, 211, 238, 0.2) 4px, rgba(34, 211, 238, 0.2) 5px)",
            }}
          />

          {/* Filled track */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-cyan-400"
            style={{ width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>

        {/* Tick marks */}
        {showTicks && (
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-2">
            {ticks.map((tick, i) => (
              <div
                key={i}
                className="absolute top-full mt-2 -translate-x-1/2"
                style={{ left: `${tick.percentage}%` }}
              >
                <div className="w-px h-2 bg-cyan-500/30" />
                <span className="block mt-1 text-xs font-mono text-slate-500 text-center">
                  {Math.round(tick.value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Thumb */}
        <motion.div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
            "w-5 h-5 rounded-full",
            "bg-slate-900 border-2 border-cyan-400",
            "shadow-lg shadow-cyan-500/30",
            "transition-shadow",
            isDragging && "shadow-cyan-500/50 border-cyan-300"
          )}
          style={{ left: `${percentage}%` }}
          animate={{ left: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Inner glow */}
          <div className="absolute inset-1 rounded-full bg-cyan-400/30" />

          {/* Pulse effect when dragging */}
          {isDragging && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-cyan-400"
            />
          )}
        </motion.div>

        {/* Particle trail effect */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400"
          style={{
            left: `${percentage}%`,
            x: particleX,
            opacity: particleOpacity,
          }}
        />

        {/* Floating value tooltip when dragging */}
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-8 -translate-x-1/2 px-2 py-1 rounded bg-cyan-500/90 text-slate-900 text-xs font-mono font-bold"
            style={{ left: `${percentage}%` }}
          >
            {value}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-cyan-500/90" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuantumSlider;
