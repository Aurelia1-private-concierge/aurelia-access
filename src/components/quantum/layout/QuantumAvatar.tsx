import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface QuantumAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "hex" | "square";
  status?: "online" | "offline" | "busy" | "away";
  showRing?: boolean;
  showHologram?: boolean;
  className?: string;
  onClick?: () => void;
}

export const QuantumAvatar = ({
  src,
  alt,
  name,
  size = "md",
  shape = "circle",
  status,
  showRing = true,
  showHologram = true,
  className,
  onClick,
}: QuantumAvatarProps) => {
  const sizeStyles = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
  };

  const statusColors = {
    online: "bg-emerald-400",
    offline: "bg-slate-500",
    busy: "bg-red-400",
    away: "bg-amber-400",
  };

  const statusSizes = {
    xs: "w-2 h-2",
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
    xl: "w-5 h-5",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const shapeStyles = {
    circle: "rounded-full",
    hex: "clip-path-hex",
    square: "rounded-lg",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center justify-center",
        sizeStyles[size],
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Outer ring animation */}
      {showRing && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className={cn(
            "absolute inset-0 rounded-full",
            shape === "circle" && "rounded-full",
            shape === "hex" && "clip-path-hex",
            shape === "square" && "rounded-lg"
          )}
          style={{
            background: `conic-gradient(from 0deg, transparent, rgba(34, 211, 238, 0.5), transparent, rgba(34, 211, 238, 0.3), transparent)`,
            padding: "2px",
          }}
        />
      )}

      {/* Holographic effect */}
      {showHologram && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn(
            "absolute inset-0 bg-cyan-500/20",
            shapeStyles[shape]
          )}
        />
      )}

      {/* Avatar container */}
      <div
        className={cn(
          "relative overflow-hidden bg-slate-800 border-2 border-cyan-500/30",
          "flex items-center justify-center",
          sizeStyles[size],
          shapeStyles[shape]
        )}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34, 211, 238, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 211, 238, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "8px 8px",
          }}
        />

        {/* Image or fallback */}
        {src ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover"
          />
        ) : name ? (
          <span className="font-mono font-bold text-cyan-400">
            {getInitials(name)}
          </span>
        ) : (
          <User className="w-1/2 h-1/2 text-cyan-400/50" />
        )}

        {/* Scan line effect */}
        <motion.div
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-1/4 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent pointer-events-none"
        />

        {/* Corner accents */}
        {shape === "square" && (
          <>
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/50" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/50" />
          </>
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute bottom-0 right-0 border-2 border-slate-900 rounded-full",
            statusColors[status],
            statusSizes[size]
          )}
        >
          {status === "online" && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-emerald-400"
            />
          )}
        </motion.div>
      )}

      {/* AR overlay info (visible on hover for larger sizes) */}
      {(size === "lg" || size === "xl") && name && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-400"
        >
          {name}
        </motion.div>
      )}

      {/* Custom clip path for hex shape */}
      <style>{`
        .clip-path-hex {
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
      `}</style>
    </motion.div>
  );
};

// Avatar group component
interface QuantumAvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    status?: "online" | "offline" | "busy" | "away";
  }>;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const QuantumAvatarGroup = ({
  avatars,
  max = 4,
  size = "md",
  className,
}: QuantumAvatarGroupProps) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const overlapStyles = {
    xs: "-ml-2",
    sm: "-ml-3",
    md: "-ml-4",
    lg: "-ml-5",
  };

  return (
    <div className={cn("flex items-center", className)}>
      {visibleAvatars.map((avatar, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(index > 0 && overlapStyles[size])}
          style={{ zIndex: visibleAvatars.length - index }}
        >
          <QuantumAvatar
            src={avatar.src}
            name={avatar.name}
            status={avatar.status}
            size={size}
            showHologram={false}
          />
        </motion.div>
      ))}

      {remainingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: max * 0.1 }}
          className={overlapStyles[size]}
        >
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-slate-800 border-2 border-cyan-500/30",
              size === "xs" && "w-8 h-8 text-xs",
              size === "sm" && "w-10 h-10 text-sm",
              size === "md" && "w-12 h-12 text-base",
              size === "lg" && "w-16 h-16 text-lg"
            )}
          >
            <span className="font-mono text-cyan-400">+{remainingCount}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuantumAvatar;
