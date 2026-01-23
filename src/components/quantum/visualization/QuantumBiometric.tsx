import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Fingerprint, Scan, Eye, Mic, Check, X, Loader2 } from "lucide-react";

type BiometricType = "fingerprint" | "face" | "iris" | "voice";
type BiometricStatus = "idle" | "scanning" | "success" | "error";

interface QuantumBiometricProps {
  type?: BiometricType;
  status?: BiometricStatus;
  progress?: number;
  onScanComplete?: () => void;
  onScanStart?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  autoStart?: boolean;
  scanDuration?: number;
  message?: string;
}

export const QuantumBiometric = ({
  type = "fingerprint",
  status: controlledStatus,
  progress: controlledProgress,
  onScanComplete,
  onScanStart,
  className,
  size = "md",
  autoStart = false,
  scanDuration = 3000,
  message,
}: QuantumBiometricProps) => {
  const [internalStatus, setInternalStatus] = useState<BiometricStatus>("idle");
  const [internalProgress, setInternalProgress] = useState(0);

  const status = controlledStatus ?? internalStatus;
  const progress = controlledProgress ?? internalProgress;

  const sizeStyles = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
  };

  const iconSizes = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const typeConfig = {
    fingerprint: {
      icon: Fingerprint,
      label: "Fingerprint",
      scanMessage: "Place finger on sensor",
    },
    face: {
      icon: Scan,
      label: "Face ID",
      scanMessage: "Look at the camera",
    },
    iris: {
      icon: Eye,
      label: "Iris Scan",
      scanMessage: "Focus on the center",
    },
    voice: {
      icon: Mic,
      label: "Voice Print",
      scanMessage: "Speak clearly",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (autoStart && status === "idle") {
      startScan();
    }
  }, [autoStart]);

  const startScan = () => {
    if (controlledStatus !== undefined) return;

    setInternalStatus("scanning");
    setInternalProgress(0);
    onScanStart?.();

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / scanDuration) * 100, 100);
      setInternalProgress(newProgress);

      if (newProgress < 100) {
        requestAnimationFrame(animate);
      } else {
        setInternalStatus("success");
        onScanComplete?.();
      }
    };
    requestAnimationFrame(animate);
  };

  const getStatusMessage = () => {
    if (message) return message;
    switch (status) {
      case "idle":
        return config.scanMessage;
      case "scanning":
        return "Scanning...";
      case "success":
        return "Verified";
      case "error":
        return "Failed - Try again";
      default:
        return config.scanMessage;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("flex flex-col items-center gap-4", className)}
    >
      {/* Main scanner container */}
      <motion.div
        onClick={status === "idle" ? startScan : undefined}
        whileHover={status === "idle" ? { scale: 1.02 } : undefined}
        whileTap={status === "idle" ? { scale: 0.98 } : undefined}
        className={cn(
          "relative rounded-full flex items-center justify-center",
          "cursor-pointer transition-all",
          sizeStyles[size],
          "bg-slate-900/80 border-2",
          status === "idle" && "border-cyan-500/30 hover:border-cyan-400/50",
          status === "scanning" && "border-cyan-400/50",
          status === "success" && "border-emerald-400/50",
          status === "error" && "border-red-400/50"
        )}
      >
        {/* Outer ring animation */}
        <motion.div
          animate={
            status === "scanning"
              ? { rotate: 360 }
              : { rotate: 0 }
          }
          transition={
            status === "scanning"
              ? { duration: 2, repeat: Infinity, ease: "linear" }
              : {}
          }
          className="absolute inset-0 rounded-full"
          style={{
            background:
              status === "scanning"
                ? "conic-gradient(from 0deg, transparent, rgba(34, 211, 238, 0.5), transparent)"
                : "none",
          }}
        />

        {/* Progress ring */}
        {status === "scanning" && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="rgba(34, 211, 238, 0.2)"
              strokeWidth="2"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="rgb(34, 211, 238)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 48}`}
              strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
              className="drop-shadow-lg"
              style={{ filter: "drop-shadow(0 0 4px rgb(34, 211, 238))" }}
            />
          </svg>
        )}

        {/* Grid pattern */}
        <div
          className="absolute inset-4 rounded-full opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(34, 211, 238, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "10px 10px",
          }}
        />

        {/* Scanning lines effect */}
        {status === "scanning" && (
          <>
            <motion.div
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-x-8 h-1/4 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent pointer-events-none"
            />
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
              className="absolute inset-y-8 w-1/4 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent pointer-events-none"
            />
          </>
        )}

        {/* Icon */}
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative z-10"
            >
              <Check className={cn(iconSizes[size], "text-emerald-400")} />
            </motion.div>
          ) : status === "error" ? (
            <motion.div
              key="error"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative z-10"
            >
              <X className={cn(iconSizes[size], "text-red-400")} />
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={cn(
                "relative z-10",
                status === "scanning" && "animate-pulse"
              )}
            >
              <Icon
                className={cn(
                  iconSizes[size],
                  status === "idle" && "text-cyan-400/50",
                  status === "scanning" && "text-cyan-400"
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success burst effect */}
        {status === "success" && (
          <motion.div
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full border-2 border-emerald-400"
          />
        )}

        {/* Fingerprint specific pattern */}
        {type === "fingerprint" && (
          <div className="absolute inset-8 rounded-full overflow-hidden opacity-20">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={
                  status === "scanning"
                    ? { opacity: [0.2, 0.5, 0.2] }
                    : { opacity: 0.2 }
                }
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                className="absolute inset-0 border-2 border-cyan-400 rounded-full"
                style={{
                  transform: `scale(${1 - i * 0.1})`,
                }}
              />
            ))}
          </div>
        )}

        {/* Iris specific pattern */}
        {type === "iris" && (
          <div className="absolute inset-8 rounded-full overflow-hidden">
            <motion.div
              animate={
                status === "scanning"
                  ? { scale: [1, 1.1, 1] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, transparent 30%, rgba(34, 211, 238, 0.2) 50%, transparent 70%)",
              }}
            />
          </div>
        )}

        {/* Voice waveform */}
        {type === "voice" && status === "scanning" && (
          <div className="absolute inset-x-8 bottom-12 flex items-end justify-center gap-1 h-8">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [4, Math.random() * 24 + 8, 4],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
                className="w-1 bg-cyan-400 rounded-full"
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Status message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-1"
      >
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          {config.label}
        </span>
        <span
          className={cn(
            "text-sm font-mono",
            status === "idle" && "text-slate-400",
            status === "scanning" && "text-cyan-400",
            status === "success" && "text-emerald-400",
            status === "error" && "text-red-400"
          )}
        >
          {getStatusMessage()}
        </span>

        {/* Progress percentage */}
        {status === "scanning" && (
          <span className="text-xs font-mono text-cyan-400/50 tabular-nums">
            {Math.round(progress)}%
          </span>
        )}
      </motion.div>
    </motion.div>
  );
};

export default QuantumBiometric;
