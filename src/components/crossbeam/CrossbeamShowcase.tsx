import { useRef, forwardRef } from "react";
import { motion } from "framer-motion";
import { 
  Plane, Anchor, Building2, Gem, Crown, 
  Globe, Shield, Sparkles, Star, Zap 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { CrossbeamNode } from "./CrossbeamConnector";

interface CrossbeamShowcaseProps {
  className?: string;
  variant?: "services" | "network" | "flow";
}

const CrossbeamShowcase = forwardRef<HTMLDivElement, CrossbeamShowcaseProps>(
  ({ className, variant = "services" }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const centerRef = useRef<HTMLDivElement>(null);
    const node1Ref = useRef<HTMLDivElement>(null);
    const node2Ref = useRef<HTMLDivElement>(null);
    const node3Ref = useRef<HTMLDivElement>(null);
    const node4Ref = useRef<HTMLDivElement>(null);
    const node5Ref = useRef<HTMLDivElement>(null);
    const node6Ref = useRef<HTMLDivElement>(null);

    const serviceNodes = [
      { icon: Plane, label: "Aviation", ref: node1Ref },
      { icon: Anchor, label: "Yachts", ref: node2Ref },
      { icon: Building2, label: "Properties", ref: node3Ref },
      { icon: Gem, label: "Collectibles", ref: node4Ref },
      { icon: Globe, label: "Travel", ref: node5Ref },
      { icon: Shield, label: "Security", ref: node6Ref },
    ];

    return (
      <div ref={ref} className={cn("relative", className)}>
        <div ref={containerRef} className="relative w-full h-[500px]">
          {/* Center Hub */}
          <motion.div
            ref={centerRef}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 w-24 h-24 bg-primary/30 rounded-full blur-xl animate-pulse" />
              <CrossbeamNode variant="primary" size="lg" className="w-24 h-24">
                <Crown className="w-10 h-10 text-primary" />
              </CrossbeamNode>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <span className="text-xs font-medium text-primary tracking-widest uppercase">
                  Aurelia Hub
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Outer Service Nodes */}
          {serviceNodes.map((node, index) => {
            const angle = (index * 2 * Math.PI) / serviceNodes.length - Math.PI / 2;
            const radius = 38;
            const left = `${50 + radius * Math.cos(angle)}%`;
            const top = `${50 + radius * Math.sin(angle)}%`;

            return (
              <motion.div
                key={node.label}
                ref={node.ref}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left, top }}
              >
                <div className="group relative cursor-pointer">
                  <CrossbeamNode variant="secondary" size="md" className="group-hover:border-primary/50 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all duration-300">
                    <node.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CrossbeamNode>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + 0.1 * index }}
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
                  >
                    <span className="text-[10px] text-muted-foreground tracking-wide uppercase group-hover:text-foreground transition-colors">
                      {node.label}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}

          {/* Animated Beams */}
          {serviceNodes.map((node, index) => (
            <AnimatedBeam
              key={`beam-${index}`}
              containerRef={containerRef}
              fromRef={node.ref}
              toRef={centerRef}
              duration={3 + index * 0.3}
              delay={index * 0.2}
              curvature={15}
              pathOpacity={0.1}
              pathWidth={1.5}
              gradientStartColor="hsl(var(--primary))"
              gradientStopColor="hsl(var(--primary) / 0.3)"
            />
          ))}

          {/* Decorative particles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-primary/40"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    );
  }
);

CrossbeamShowcase.displayName = "CrossbeamShowcase";

export default CrossbeamShowcase;
