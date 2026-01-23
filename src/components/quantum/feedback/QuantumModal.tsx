import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface QuantumModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  position?: "center" | "top" | "bottom";
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  footer?: ReactNode;
}

export const QuantumModal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = "md",
  position = "center",
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
  footer,
}: QuantumModalProps) => {
  const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-[90vw] max-h-[90vh]",
  };

  const positionStyles = {
    center: "items-center",
    top: "items-start pt-20",
    bottom: "items-end pb-10",
  };

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (closeOnEscape && e.key === "Escape") {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className={cn("fixed inset-0 z-50 flex justify-center", positionStyles[position])}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          >
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
          </motion.div>

          {/* Modal container */}
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.95, 
              y: position === "top" ? -20 : position === "bottom" ? 20 : 0,
              filter: "blur(10px) brightness(2)"
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              filter: "blur(0px) brightness(1)"
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95,
              filter: "blur(10px) brightness(0.5)"
            }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
            className={cn(
              "relative w-full m-4",
              sizeStyles[size],
              className
            )}
          >
            {/* Hexagonal corner accents */}
            <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

            {/* Main modal */}
            <div className="relative rounded-lg bg-slate-900/95 border border-cyan-500/20 overflow-hidden shadow-2xl shadow-cyan-500/10">
              {/* Top glow line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              
              {/* Boot-up scan effect */}
              <motion.div
                initial={{ top: 0 }}
                animate={{ top: "100%" }}
                transition={{ duration: 0.5, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-b from-cyan-400/50 to-transparent pointer-events-none"
              />

              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between px-6 py-4 border-b border-cyan-500/20">
                  <div>
                    {title && (
                      <motion.h2
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg font-semibold text-white font-mono"
                      >
                        {title}
                      </motion.h2>
                    )}
                    {description && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-1 text-sm text-slate-400"
                      >
                        {description}
                      </motion.p>
                    )}
                  </div>
                  
                  {showCloseButton && (
                    <motion.button
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="px-6 py-4 max-h-[60vh] overflow-y-auto"
              >
                {children}
              </motion.div>

              {/* Footer */}
              {footer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="px-6 py-4 border-t border-cyan-500/20 bg-slate-950/50"
                >
                  {footer}
                </motion.div>
              )}

              {/* Bottom glow line */}
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            </div>

            {/* Ambient glow */}
            <div className="absolute -inset-10 -z-10 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render in portal for proper stacking
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
};

export default QuantumModal;
