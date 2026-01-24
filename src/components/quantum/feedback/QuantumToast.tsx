import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode, createContext, useContext, useState, useCallback, useMemo, forwardRef } from "react";
import { Check, X, AlertTriangle, Info, Bell } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info" | "notification";
type ToastPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useQuantumToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useQuantumToast must be used within a QuantumToastProvider");
  }
  return context;
};

interface QuantumToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export const QuantumToastProvider = forwardRef<HTMLDivElement, QuantumToastProviderProps>(
  ({ children, position = "top-right", maxToasts = 5 }, ref) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = { ...toast, id };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });

      // Auto-remove after duration
      if (toast.duration !== 0) {
        const duration = toast.duration ?? 5000;
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    }, [maxToasts]);

    const removeToast = useCallback((id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const clearToasts = useCallback(() => {
      setToasts([]);
    }, []);

    const value = useMemo(() => ({
      toasts,
      addToast,
      removeToast,
      clearToasts,
    }), [toasts, addToast, removeToast, clearToasts]);

    const positionStyles: Record<ToastPosition, string> = {
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "top-center": "top-4 left-1/2 -translate-x-1/2",
      "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    };

    return (
      <ToastContext.Provider value={value}>
        <div ref={ref}>
          {children}
        </div>
        
        {/* Toast container */}
        <div className={cn("fixed z-[100] flex flex-col gap-2 pointer-events-none", positionStyles[position])}>
          <AnimatePresence mode="popLayout">
            {toasts.map((toast) => (
              <QuantumToastItem
                key={toast.id}
                toast={toast}
                onDismiss={() => removeToast(toast.id)}
                position={position}
              />
            ))}
          </AnimatePresence>
        </div>
      </ToastContext.Provider>
    );
  }
);

QuantumToastProvider.displayName = "QuantumToastProvider";

interface QuantumToastItemProps {
  toast: Toast;
  onDismiss: () => void;
  position: ToastPosition;
}

const QuantumToastItem = ({ toast, onDismiss, position }: QuantumToastItemProps) => {
  const icons: Record<ToastType, ReactNode> = {
    success: <Check className="w-4 h-4" />,
    error: <X className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
    notification: <Bell className="w-4 h-4" />,
  };

  const colors: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
    success: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      icon: "text-emerald-400 bg-emerald-500/20",
      text: "text-emerald-400",
    },
    error: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      icon: "text-red-400 bg-red-500/20",
      text: "text-red-400",
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      icon: "text-amber-400 bg-amber-500/20",
      text: "text-amber-400",
    },
    info: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      icon: "text-cyan-400 bg-cyan-500/20",
      text: "text-cyan-400",
    },
    notification: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      icon: "text-purple-400 bg-purple-500/20",
      text: "text-purple-400",
    },
  };

  const colorStyle = colors[toast.type];

  // Animation direction based on position
  const getAnimationProps = () => {
    const isRight = position.includes("right");
    const isLeft = position.includes("left");
    const isTop = position.includes("top");
    
    return {
      initial: { 
        opacity: 0, 
        x: isRight ? 50 : isLeft ? -50 : 0,
        y: isTop ? -20 : 20,
        scale: 0.9,
      },
      animate: { 
        opacity: 1, 
        x: 0, 
        y: 0,
        scale: 1,
      },
      exit: { 
        opacity: 0, 
        x: isRight ? 50 : isLeft ? -50 : 0,
        scale: 0.9,
        filter: "blur(4px)",
      },
    };
  };

  return (
    <motion.div
      layout
      {...getAnimationProps()}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={cn(
        "relative w-80 rounded-lg border backdrop-blur-xl pointer-events-auto overflow-hidden",
        colorStyle.bg,
        colorStyle.border
      )}
    >
      {/* Holographic scan line */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
      />

      {/* Content */}
      <div className="relative flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={cn("flex-shrink-0 p-1.5 rounded", colorStyle.icon)}>
          {icons[toast.type]}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-white truncate">{toast.title}</p>
          {toast.description && (
            <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">{toast.description}</p>
          )}
          
          {/* Action button */}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={cn(
                "mt-2 text-xs font-medium transition-colors",
                colorStyle.text,
                "hover:underline"
              )}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      {toast.duration !== 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: (toast.duration ?? 5000) / 1000, ease: "linear" }}
          className={cn("h-0.5 origin-left", colorStyle.text.replace("text-", "bg-"))}
        />
      )}
    </motion.div>
  );
};

// Helper function to create toasts outside of React components
let toastHandler: ToastContextValue | null = null;

export const setToastHandler = (handler: ToastContextValue) => {
  toastHandler = handler;
};

export const toast = {
  success: (title: string, options?: Partial<Omit<Toast, "id" | "type" | "title">>) => 
    toastHandler?.addToast({ type: "success", title, ...options }),
  error: (title: string, options?: Partial<Omit<Toast, "id" | "type" | "title">>) => 
    toastHandler?.addToast({ type: "error", title, ...options }),
  warning: (title: string, options?: Partial<Omit<Toast, "id" | "type" | "title">>) => 
    toastHandler?.addToast({ type: "warning", title, ...options }),
  info: (title: string, options?: Partial<Omit<Toast, "id" | "type" | "title">>) => 
    toastHandler?.addToast({ type: "info", title, ...options }),
  notification: (title: string, options?: Partial<Omit<Toast, "id" | "type" | "title">>) => 
    toastHandler?.addToast({ type: "notification", title, ...options }),
};

export default QuantumToastProvider;
