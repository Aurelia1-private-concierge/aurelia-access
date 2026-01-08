import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon" | "wordmark";
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  linkTo?: string;
  className?: string;
}

const sizeClasses = {
  sm: { icon: "w-6 h-6", wordmark: "h-4", full: "h-5" },
  md: { icon: "w-8 h-8", wordmark: "h-5", full: "h-6" },
  lg: { icon: "w-10 h-10", wordmark: "h-6", full: "h-8" },
  xl: { icon: "w-12 h-12", wordmark: "h-8", full: "h-10" },
};

// SVG Icon - Abstract diamond/crown representing luxury and exclusivity
const LogoIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer diamond frame */}
    <path
      d="M24 4L44 24L24 44L4 24L24 4Z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      className="text-primary"
    />
    {/* Inner geometric pattern - crown abstraction */}
    <path
      d="M24 12L32 20L24 28L16 20L24 12Z"
      fill="currentColor"
      className="text-primary"
    />
    {/* Accent lines */}
    <path
      d="M12 24L24 36M36 24L24 36"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-primary/60"
    />
  </svg>
);

// SVG Wordmark - Elegant "AURELIA" typography
const LogoWordmark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 180 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <text
      x="0"
      y="24"
      fill="currentColor"
      className="text-foreground"
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "24px",
        fontWeight: 400,
        letterSpacing: "0.3em",
      }}
    >
      AURELIA
    </text>
  </svg>
);

// Full Logo - Icon + Wordmark
const LogoFull = ({ className, size }: { className?: string; size: keyof typeof sizeClasses }) => (
  <div className={cn("flex items-center gap-3", className)}>
    <LogoIcon className={sizeClasses[size].icon} />
    <span 
      className={cn(
        "font-serif tracking-[0.3em] text-foreground",
        size === "sm" && "text-base",
        size === "md" && "text-lg",
        size === "lg" && "text-xl",
        size === "xl" && "text-2xl"
      )}
    >
      AURELIA
    </span>
  </div>
);

const Logo = ({
  variant = "wordmark",
  size = "md",
  animated = true,
  linkTo,
  className,
}: LogoProps) => {
  const renderLogo = () => {
    switch (variant) {
      case "icon":
        return <LogoIcon className={cn(sizeClasses[size].icon, className)} />;
      case "wordmark":
        return (
          <span 
            className={cn(
              "font-serif tracking-widest text-foreground hover:text-primary transition-colors duration-300",
              size === "sm" && "text-lg",
              size === "md" && "text-xl",
              size === "lg" && "text-2xl",
              size === "xl" && "text-3xl",
              className
            )}
          >
            AURELIA
          </span>
        );
      case "full":
        return <LogoFull size={size} className={className} />;
      default:
        return null;
    }
  };

  const content = renderLogo();

  if (linkTo) {
    if (animated) {
      return (
        <motion.div whileHover={{ scale: 1.02 }}>
          <Link to={linkTo} className="inline-block">
            {content}
          </Link>
        </motion.div>
      );
    }
    return (
      <Link to={linkTo} className="inline-block">
        {content}
      </Link>
    );
  }

  if (animated) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} className="inline-block">
        {content}
      </motion.div>
    );
  }

  return content;
};

export { Logo, LogoIcon, LogoWordmark };
export default Logo;
