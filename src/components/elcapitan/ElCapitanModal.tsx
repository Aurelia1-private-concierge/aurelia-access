import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { X } from "lucide-react";

interface ElCapitanModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const ElCapitanModal = ({
  isOpen,
  onClose,
  children,
  title,
  className,
  size = "md",
}: ElCapitanModalProps) => {
  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
              "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
              "w-[calc(100%-2rem)]",
              sizeStyles[size]
            )}
          >
            <div
              className={cn(
                "relative rounded-3xl overflow-hidden",
                "bg-white/10 dark:bg-black/30 backdrop-blur-2xl",
                "border border-white/20 dark:border-white/10",
                "shadow-2xl shadow-black/20",
                className
              )}
            >
              {/* Top frosted bar */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                  <h3 className="text-lg font-medium text-foreground">{title}</h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-foreground/70" />
                  </motion.button>
                </div>
              )}

              {/* Close button if no title */}
              {!title && (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-foreground/70" />
                </motion.button>
              )}

              {/* Content */}
              <div className="relative p-6">{children}</div>

              {/* Bottom glow */}
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ElCapitanModal;
