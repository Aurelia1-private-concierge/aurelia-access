import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Delete, CornerDownLeft, Space, ChevronUp } from "lucide-react";

interface QuantumKeyboardProps {
  onKeyPress?: (key: string) => void;
  onEnter?: () => void;
  layout?: "qwerty" | "numeric" | "custom";
  customKeys?: string[][];
  className?: string;
  variant?: "default" | "compact" | "split";
  showSound?: boolean;
  disabled?: boolean;
}

const QWERTY_LAYOUT = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["SHIFT", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
  ["SPACE", "ENTER"],
];

const NUMERIC_LAYOUT = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "BACKSPACE"],
];

export const QuantumKeyboard = ({
  onKeyPress,
  onEnter,
  layout = "qwerty",
  customKeys,
  className,
  variant = "default",
  showSound = true,
  disabled = false,
}: QuantumKeyboardProps) => {
  const [isShift, setIsShift] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const keys = customKeys || (layout === "numeric" ? NUMERIC_LAYOUT : QWERTY_LAYOUT);

  const playKeySound = useCallback(() => {
    if (!showSound) return;
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context may not be available
    }
  }, [showSound]);

  const handleKeyPress = (key: string) => {
    if (disabled) return;

    playKeySound();
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 100);

    switch (key) {
      case "SHIFT":
        setIsShift(!isShift);
        break;
      case "BACKSPACE":
        onKeyPress?.("BACKSPACE");
        break;
      case "ENTER":
        onEnter?.();
        break;
      case "SPACE":
        onKeyPress?.(" ");
        break;
      default:
        const char = isShift ? key.toUpperCase() : key.toLowerCase();
        onKeyPress?.(char);
        if (isShift) setIsShift(false);
        break;
    }
  };

  const getKeyWidth = (key: string) => {
    switch (key) {
      case "SPACE":
        return "flex-[4]";
      case "ENTER":
        return "flex-[2]";
      case "SHIFT":
      case "BACKSPACE":
        return "flex-[1.5]";
      default:
        return "flex-1";
    }
  };

  const getKeyContent = (key: string) => {
    switch (key) {
      case "BACKSPACE":
        return <Delete className="w-4 h-4" />;
      case "ENTER":
        return <CornerDownLeft className="w-4 h-4" />;
      case "SPACE":
        return <Space className="w-4 h-4" />;
      case "SHIFT":
        return (
          <ChevronUp
            className={cn("w-4 h-4 transition-transform", isShift && "text-cyan-400")}
          />
        );
      default:
        return isShift ? key.toUpperCase() : key.toLowerCase();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative p-4 rounded-lg border border-cyan-500/20 bg-slate-900/90 backdrop-blur-sm",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none rounded-lg"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Keyboard rows */}
      <div className="relative z-10 space-y-2">
        {keys.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rowIndex * 0.05 }}
            className={cn(
              "flex gap-1.5",
              variant === "split" && rowIndex > 0 && rowIndex < keys.length - 1 && "justify-center gap-8"
            )}
          >
            {row.map((key, keyIndex) => {
              const isPressed = pressedKey === key;
              const isSpecial = ["SHIFT", "BACKSPACE", "ENTER", "SPACE"].includes(key);

              return (
                <motion.button
                  key={`${rowIndex}-${keyIndex}`}
                  onClick={() => handleKeyPress(key)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative min-w-10 h-12 rounded-lg font-mono text-sm",
                    "border transition-all duration-150",
                    "flex items-center justify-center",
                    getKeyWidth(key),
                    isPressed
                      ? "bg-cyan-500/30 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/30"
                      : isSpecial
                      ? "bg-slate-800/80 border-cyan-500/30 text-slate-300 hover:border-cyan-400/50"
                      : "bg-slate-800/50 border-cyan-500/20 text-slate-300 hover:border-cyan-400/40",
                    key === "SHIFT" && isShift && "bg-cyan-500/20 border-cyan-400/50"
                  )}
                >
                  {/* Key content */}
                  <span className="relative z-10">{getKeyContent(key)}</span>

                  {/* Holographic effect */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, transparent 50%, rgba(34, 211, 238, 0.05) 100%)",
                    }}
                  />

                  {/* Press ripple effect */}
                  {isPressed && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0.8 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 rounded-lg bg-cyan-400"
                    />
                  )}

                  {/* Top edge highlight */}
                  <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
                </motion.button>
              );
            })}
          </motion.div>
        ))}
      </div>

      {/* Ambient glow */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-8 bg-cyan-500/10 blur-2xl pointer-events-none" />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-400/30" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-400/30" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-400/30" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-400/30" />
    </motion.div>
  );
};

export default QuantumKeyboard;
