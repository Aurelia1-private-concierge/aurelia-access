import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface ElCapitanNavbarProps {
  logo?: ReactNode;
  items: NavItem[];
  actions?: ReactNode;
  className?: string;
  onNavClick?: (href: string) => void;
}

export const ElCapitanNavbar = ({
  logo,
  items,
  actions,
  className,
  onNavClick,
}: ElCapitanNavbarProps) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "px-6 py-4",
        className
      )}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto rounded-2xl overflow-hidden",
          "bg-white/10 dark:bg-black/20 backdrop-blur-2xl",
          "border border-white/20 dark:border-white/10",
          "shadow-lg shadow-black/10"
        )}
      >
        {/* Top highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          {logo && <div className="flex-shrink-0">{logo}</div>}

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {items.map((item) => (
              <motion.button
                key={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavClick?.(item.href)}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  item.isActive
                    ? "text-foreground bg-white/15"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/10"
                )}
              >
                {item.label}
                {item.isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-white/10 -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Actions */}
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </motion.nav>
  );
};

export default ElCapitanNavbar;
