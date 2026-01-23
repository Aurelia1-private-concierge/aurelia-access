import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type LoaderVariant = 
  | "orbit" 
  | "dna" 
  | "circuit" 
  | "cube" 
  | "ring" 
  | "superposition"
  | "scan"
  | "pulse";

interface QuantumLoaderProps {
  variant?: LoaderVariant;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "cyan" | "emerald" | "purple" | "amber";
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: { container: 24, particle: 4 },
  md: { container: 40, particle: 6 },
  lg: { container: 64, particle: 8 },
  xl: { container: 96, particle: 12 },
};

const colorMap = {
  cyan: { primary: "#22d3ee", secondary: "#06b6d4", glow: "rgba(34, 211, 238, 0.5)" },
  emerald: { primary: "#34d399", secondary: "#10b981", glow: "rgba(52, 211, 153, 0.5)" },
  purple: { primary: "#a855f7", secondary: "#9333ea", glow: "rgba(168, 85, 247, 0.5)" },
  amber: { primary: "#fbbf24", secondary: "#f59e0b", glow: "rgba(251, 191, 36, 0.5)" },
};

// Orbit loader - particles orbiting a center
const OrbitLoader = ({ size, colors }: { size: typeof sizeMap.md; colors: typeof colorMap.cyan }) => (
  <div className="relative" style={{ width: size.container, height: size.container }}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1.5 - i * 0.2,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          width: size.particle,
          height: size.particle,
          backgroundColor: colors.primary,
          boxShadow: `0 0 ${size.particle * 2}px ${colors.glow}`,
          transformOrigin: `${size.container / 2 - size.particle / 2}px 0px`,
        }}
      />
    ))}
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: size.particle * 1.5,
        height: size.particle * 1.5,
        backgroundColor: colors.secondary,
        boxShadow: `0 0 ${size.particle * 3}px ${colors.glow}`,
      }}
    />
  </div>
);

// DNA helix loader
const DNALoader = ({ size, colors }: { size: typeof sizeMap.md; colors: typeof colorMap.cyan }) => (
  <div className="relative flex items-center justify-center" style={{ width: size.container, height: size.container }}>
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: size.particle,
          height: size.particle,
          backgroundColor: i % 2 === 0 ? colors.primary : colors.secondary,
          boxShadow: `0 0 ${size.particle}px ${colors.glow}`,
        }}
        animate={{
          x: [
            Math.sin((i / 8) * Math.PI * 2) * (size.container / 3),
            Math.sin((i / 8 + 0.5) * Math.PI * 2) * (size.container / 3),
            Math.sin((i / 8 + 1) * Math.PI * 2) * (size.container / 3),
          ],
          y: [
            (i - 4) * (size.container / 10),
            (i - 4) * (size.container / 10),
            (i - 4) * (size.container / 10),
          ],
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.1,
        }}
      />
    ))}
  </div>
);

// Circuit loader - nodes connecting
const CircuitLoader = ({ size, colors }: { size: typeof sizeMap.md; colors: typeof colorMap.cyan }) => (
  <svg width={size.container} height={size.container} viewBox="0 0 40 40">
    {/* Connection lines */}
    {[
      { x1: 10, y1: 10, x2: 30, y2: 10 },
      { x1: 30, y1: 10, x2: 30, y2: 30 },
      { x1: 30, y1: 30, x2: 10, y2: 30 },
      { x1: 10, y1: 30, x2: 10, y2: 10 },
      { x1: 20, y1: 10, x2: 20, y2: 30 },
      { x1: 10, y1: 20, x2: 30, y2: 20 },
    ].map((line, i) => (
      <motion.line
        key={i}
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke={colors.primary}
        strokeWidth="1"
        strokeOpacity="0.3"
      />
    ))}
    
    {/* Animated pulse along path */}
    <motion.circle
      r="2"
      fill={colors.primary}
      filter={`drop-shadow(0 0 3px ${colors.glow})`}
      animate={{
        cx: [10, 30, 30, 10, 10],
        cy: [10, 10, 30, 30, 10],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      }}
    />
    
    {/* Corner nodes */}
    {[[10, 10], [30, 10], [30, 30], [10, 30], [20, 20]].map(([cx, cy], i) => (
      <motion.circle
        key={i}
        cx={cx}
        cy={cy}
        r="3"
        fill={colors.secondary}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      />
    ))}
  </svg>
);

// 3D Cube loader
const CubeLoader = ({ size, colors }: { size: typeof sizeMap.md; colors: typeof colorMap.cyan }) => (
  <motion.div
    className="relative"
    style={{ 
      width: size.container, 
      height: size.container,
      perspective: 200,
      transformStyle: "preserve-3d",
    }}
    animate={{ rotateX: 360, rotateY: 360 }}
    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
  >
    <div
      className="absolute inset-0 border-2 rounded"
      style={{
        borderColor: colors.primary,
        boxShadow: `0 0 ${size.particle}px ${colors.glow}, inset 0 0 ${size.particle}px ${colors.glow}`,
        transform: `translateZ(${size.container / 4}px)`,
      }}
    />
    <div
      className="absolute inset-0 border-2 rounded"
      style={{
        borderColor: colors.secondary,
        boxShadow: `0 0 ${size.particle}px ${colors.glow}`,
        transform: `translateZ(-${size.container / 4}px)`,
      }}
    />
  </motion.div>
);

// Progress ring loader
const RingLoader = ({ size, colors }: { size: typeof sizeMap.md; colors: typeof colorMap.cyan }) => {
  const circumference = Math.PI * (size.container - size.particle);
  
  return (
    <svg width={size.container} height={size.container} viewBox={`0 0 ${size.container} ${size.container}`}>
      {/* Background ring */}
      <circle
        cx={size.container / 2}
        cy={size.container / 2}
        r={(size.container - size.particle) / 2}
        fill="none"
        stroke={colors.secondary}
        strokeWidth={size.particle / 2}
        opacity={0.2}
      />
      
      {/* Animated ring */}
      <motion.circle
        cx={size.container / 2}
        cy={size.container / 2}
        r={(size.container - size.particle) / 2}
        fill="none"
        stroke={colors.primary}
        strokeWidth={size.particle / 2}
        strokeLinecap="round"
        strokeDasharray={circumference}
        filter={`drop-shadow(0 0 ${size.particle / 2}px ${colors.glow})`}
        animate={{
          strokeDashoffset: [circumference, 0, circumference],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "center" }}
      />
    </svg>
  );
};

// Superposition loader - quantum state visualization
const SuperpositionLoader = ({ size, colors }: { size: typeof sizeMap.md; colors: typeof colorMap.cyan }) => (
  <div className="relative" style={{ width: size.container, height: size.container }}>
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: size.container,
          height: size.container,
          border: `2px solid ${colors.primary}`,
          opacity: 0.3,
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.1, 0.3],
          rotate: [0, 90, 180],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: i * 0.3,
          ease: "easeInOut",
        }}
      />
    ))}
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: size.particle * 2,
        height: size.particle * 2,
        backgroundColor: colors.primary,
        boxShadow: `0 0 ${size.particle * 3}px ${colors.glow}`,
      }}
      animate={{
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </div>
);

// Scan loader - vertical scan line
const ScanLoader = ({ size, colors }: { size: typeof sizeMap.md; colors: typeof colorMap.cyan }) => (
  <div 
    className="relative overflow-hidden rounded"
    style={{ 
      width: size.container, 
      height: size.container,
      border: `1px solid ${colors.secondary}`,
      backgroundColor: `${colors.secondary}10`,
    }}
  >
    {/* Grid pattern */}
    <div
      className="absolute inset-0 opacity-20"
      style={{
        backgroundImage: `
          linear-gradient(${colors.primary}20 1px, transparent 1px),
          linear-gradient(90deg, ${colors.primary}20 1px, transparent 1px)
        `,
        backgroundSize: `${size.container / 4}px ${size.container / 4}px`,
      }}
    />
    
    {/* Scan line */}
    <motion.div
      className="absolute top-0 bottom-0 w-0.5"
      style={{
        background: `linear-gradient(to bottom, transparent, ${colors.primary}, transparent)`,
        boxShadow: `0 0 ${size.particle}px ${colors.glow}`,
      }}
      animate={{
        left: ["0%", "100%"],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  </div>
);

// Pulse loader - concentric circles
const PulseLoader = ({ size, colors }: { size: typeof sizeMap.md; colors: typeof colorMap.cyan }) => (
  <div className="relative flex items-center justify-center" style={{ width: size.container, height: size.container }}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: size.container * 0.4,
          height: size.container * 0.4,
          border: `2px solid ${colors.primary}`,
        }}
        animate={{
          scale: [1, 2.5],
          opacity: [0.6, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: i * 0.5,
          ease: "easeOut",
        }}
      />
    ))}
    <div
      className="rounded-full"
      style={{
        width: size.particle * 2,
        height: size.particle * 2,
        backgroundColor: colors.primary,
        boxShadow: `0 0 ${size.particle * 2}px ${colors.glow}`,
      }}
    />
  </div>
);

const loaderComponents: Record<LoaderVariant, React.FC<{ size: typeof sizeMap.md; colors: typeof colorMap.cyan }>> = {
  orbit: OrbitLoader,
  dna: DNALoader,
  circuit: CircuitLoader,
  cube: CubeLoader,
  ring: RingLoader,
  superposition: SuperpositionLoader,
  scan: ScanLoader,
  pulse: PulseLoader,
};

export const QuantumLoader = ({
  variant = "orbit",
  size = "md",
  color = "cyan",
  className,
  label,
}: QuantumLoaderProps) => {
  const LoaderComponent = loaderComponents[variant];
  const sizeConfig = sizeMap[size];
  const colorConfig = colorMap[color];

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <LoaderComponent size={sizeConfig} colors={colorConfig} />
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xs font-mono text-slate-400 uppercase tracking-wider"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
};

export default QuantumLoader;
