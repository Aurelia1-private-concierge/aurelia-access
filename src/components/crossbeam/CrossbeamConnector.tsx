import { forwardRef, ReactNode, RefObject, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";

interface CrossbeamNodeProps {
  className?: string;
  children?: ReactNode;
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
}

export const CrossbeamNode = forwardRef<HTMLDivElement, CrossbeamNodeProps>(
  ({ className, children, variant = "primary", size = "md" }, ref) => {
    const sizeClasses = {
      sm: "w-12 h-12",
      md: "w-16 h-16",
      lg: "w-20 h-20",
    };

    const variantClasses = {
      primary: "bg-gradient-to-br from-primary/20 to-primary/40 border-primary/40 shadow-[0_0_20px_rgba(212,175,55,0.2)]",
      secondary: "bg-gradient-to-br from-secondary/40 to-secondary/60 border-border/40",
      accent: "bg-gradient-to-br from-purple-500/20 to-purple-500/40 border-purple-500/40 shadow-[0_0_20px_rgba(147,51,234,0.2)]",
    };

    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.05 }}
        className={cn(
          "rounded-full border backdrop-blur-xl flex items-center justify-center transition-all duration-300",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      >
        {children}
      </motion.div>
    );
  }
);

CrossbeamNode.displayName = "CrossbeamNode";

interface CrossbeamContainerProps {
  className?: string;
  children: ReactNode;
}

export const CrossbeamContainer = forwardRef<HTMLDivElement, CrossbeamContainerProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative w-full h-full", className)}
      >
        {children}
      </div>
    );
  }
);

CrossbeamContainer.displayName = "CrossbeamContainer";

interface CrossbeamLayoutProps {
  className?: string;
  centerNode: ReactNode;
  outerNodes: ReactNode[];
  beamDuration?: number;
  beamDelay?: number;
}

export const CrossbeamLayout = ({
  className,
  centerNode,
  outerNodes,
  beamDuration = 3,
  beamDelay = 0.5,
}: CrossbeamLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calculate positions around center
  const getPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const radius = 40; // percentage from center
    return {
      left: `${50 + radius * Math.cos(angle)}%`,
      top: `${50 + radius * Math.sin(angle)}%`,
    };
  };

  return (
    <CrossbeamContainer ref={containerRef} className={cn("min-h-[400px]", className)}>
      {/* Center node */}
      <div
        ref={centerRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        {centerNode}
      </div>

      {/* Outer nodes */}
      {outerNodes.map((node, index) => {
        const pos = getPosition(index, outerNodes.length);
        return (
          <div
            key={index}
            ref={(el) => {
              nodeRefs.current[index] = el;
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: pos.left, top: pos.top }}
          >
            {node}
          </div>
        );
      })}

      {/* Animated beams */}
      {nodeRefs.current.map((nodeRef, index) => {
        if (!nodeRef || !centerRef.current) return null;
        return (
          <AnimatedBeam
            key={index}
            containerRef={containerRef as RefObject<HTMLDivElement>}
            fromRef={{ current: nodeRef } as RefObject<HTMLDivElement>}
            toRef={centerRef as RefObject<HTMLDivElement>}
            duration={beamDuration}
            delay={beamDelay * index}
            curvature={0}
            pathOpacity={0.15}
            gradientStartColor="hsl(var(--primary))"
            gradientStopColor="hsl(var(--primary) / 0.5)"
          />
        );
      })}
    </CrossbeamContainer>
  );
};

export default CrossbeamLayout;
