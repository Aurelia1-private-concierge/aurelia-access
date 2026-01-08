import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showWordmark?: boolean;
  showTagline?: boolean;
}

const sizeConfig = {
  sm: { icon: 48, wordmark: "text-2xl", tagline: "text-[8px]" },
  md: { icon: 64, wordmark: "text-3xl", tagline: "text-[10px]" },
  lg: { icon: 80, wordmark: "text-4xl", tagline: "text-xs" },
  xl: { icon: 120, wordmark: "text-5xl", tagline: "text-sm" },
};

const AnimatedLogo = ({
  size = "lg",
  className,
  showWordmark = true,
  showTagline = false,
}: AnimatedLogoProps) => {
  const config = sizeConfig[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Animated SVG Icon */}
      <motion.svg
        viewBox="0 0 100 100"
        width={config.icon}
        height={config.icon}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <defs>
          {/* Gold shimmer gradient - animated */}
          <linearGradient id="goldShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(43, 70%, 45%)">
              <animate
                attributeName="stop-color"
                values="hsl(43, 70%, 45%); hsl(43, 80%, 60%); hsl(43, 70%, 45%)"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="hsl(43, 80%, 65%)">
              <animate
                attributeName="stop-color"
                values="hsl(43, 80%, 65%); hsl(43, 90%, 75%); hsl(43, 80%, 65%)"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="hsl(43, 70%, 50%)">
              <animate
                attributeName="stop-color"
                values="hsl(43, 70%, 50%); hsl(43, 80%, 60%); hsl(43, 70%, 50%)"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          {/* Shimmer sweep effect */}
          <linearGradient id="shimmerSweep" x1="-100%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="transparent" />
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              from="-1 0"
              to="1 0"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </linearGradient>

          {/* Glow filter */}
          <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Clip path for shimmer */}
          <clipPath id="diamondClip">
            <path d="M50 10 L90 50 L50 90 L10 50 Z" />
          </clipPath>
        </defs>

        {/* Outer glow pulse */}
        <motion.path
          d="M50 10 L90 50 L50 90 L10 50 Z"
          fill="none"
          stroke="url(#goldShimmer)"
          strokeWidth="1"
          opacity="0.3"
          animate={{ 
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          style={{ transformOrigin: "center" }}
        />

        {/* Main diamond outline */}
        <motion.path
          d="M50 10 L90 50 L50 90 L10 50 Z"
          fill="none"
          stroke="url(#goldShimmer)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {/* Inner diamond - filled with shimmer */}
        <motion.path
          d="M50 25 L75 50 L50 75 L25 50 Z"
          fill="url(#goldShimmer)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
          style={{ transformOrigin: "center" }}
          filter="url(#goldGlow)"
        />

        {/* Shimmer sweep overlay */}
        <g clipPath="url(#diamondClip)">
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill="url(#shimmerSweep)"
          />
        </g>

        {/* Crown accent lines */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <line
            x1="25"
            y1="50"
            x2="50"
            y2="75"
            stroke="url(#goldShimmer)"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="75"
            y1="50"
            x2="50"
            y2="75"
            stroke="url(#goldShimmer)"
            strokeWidth="1"
            opacity="0.5"
          />
        </motion.g>

        {/* Center gem highlight */}
        <motion.circle
          cx="50"
          cy="50"
          r="4"
          fill="hsl(43, 90%, 80%)"
          initial={{ scale: 0 }}
          animate={{ 
            scale: [0, 1, 1],
            opacity: [0, 1, 0.7]
          }}
          transition={{ 
            delay: 0.8, 
            duration: 0.6,
            opacity: { delay: 0.8, duration: 2, repeat: Infinity, repeatType: "reverse" }
          }}
        />
      </motion.svg>

      {/* Wordmark with shimmer */}
      {showWordmark && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative mt-4"
        >
          <h1 
            className={cn(
              "font-serif tracking-[0.4em] text-foreground relative",
              config.wordmark
            )}
          >
            <span className="relative z-10">AURELIA</span>
            {/* Shimmer overlay on text */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 3,
                ease: "easeInOut" 
              }}
              style={{ 
                WebkitBackgroundClip: "text",
                mixBlendMode: "overlay"
              }}
            />
          </h1>
          
          {/* Underline with gradient */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent origin-center"
          />
        </motion.div>
      )}

      {/* Tagline */}
      {showTagline && (
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.25em" }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className={cn(
            "mt-4 text-muted-foreground uppercase font-light",
            config.tagline
          )}
        >
          Beyond Concierge
        </motion.p>
      )}
    </div>
  );
};

export default AnimatedLogo;
