import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";

interface ElCapitanInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  icon?: LucideIcon;
  label?: string;
  error?: string;
}

export const ElCapitanInput = forwardRef<HTMLInputElement, ElCapitanInputProps>(
  ({ className, icon: Icon, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon className="w-4 h-4 text-foreground/40" />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl border bg-white/10 backdrop-blur-md",
              "border-white/20 hover:border-white/30 focus:border-white/40",
              "text-foreground placeholder:text-foreground/40",
              "px-4 py-3 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-0",
              "transition-all duration-200",
              Icon && "pl-11",
              error && "border-red-400/50 focus:ring-red-400/30",
              className
            )}
            {...props}
          />
          
          {/* Inner glow on focus */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity" />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

ElCapitanInput.displayName = "ElCapitanInput";

export default ElCapitanInput;
