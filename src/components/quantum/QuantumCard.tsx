import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface QuantumCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "highlighted" | "data";
  glow?: boolean;
  animated?: boolean;
}

export const QuantumCard = ({
  children,
  className,
  variant = "default",
  glow = true,
  animated = true,
}: QuantumCardProps) => {
  const variantStyles = {
    default: "bg-slate-900/80 border-cyan-500/20",
    highlighted: "bg-gradient-to-br from-slate-900 via-cyan-900/20 to-slate-900 border-cyan-400/30",
    data: "bg-slate-950/90 border-cyan-500/10",
  };

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      whileInView={animated ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true }}
      whileHover={animated ? { scale: 1.01, y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative rounded-lg border overflow-hidden",
        variantStyles[variant],
        className
      )}
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Glowing border effect */}
      {glow && (
        <>
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
          <div className="absolute left-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />
          <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />
        </>
      )}

      {/* Ambient glow */}
      {glow && (
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default QuantumCard;
