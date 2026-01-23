import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight, Plus, Minus } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: LucideIcon;
  disabled?: boolean;
  badge?: string | number;
}

interface QuantumAccordionProps {
  items: AccordionItem[];
  defaultOpen?: string[];
  allowMultiple?: boolean;
  variant?: "default" | "separated" | "bordered";
  iconStyle?: "chevron" | "plus";
  className?: string;
  animated?: boolean;
  onChange?: (openItems: string[]) => void;
}

export const QuantumAccordion = ({
  items,
  defaultOpen = [],
  allowMultiple = false,
  variant = "default",
  iconStyle = "chevron",
  className,
  animated = true,
  onChange,
}: QuantumAccordionProps) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item?.disabled) return;

    const newOpenItems = new Set(openItems);

    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      if (!allowMultiple) {
        newOpenItems.clear();
      }
      newOpenItems.add(id);
    }

    setOpenItems(newOpenItems);
    onChange?.(Array.from(newOpenItems));
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "separated":
        return "space-y-2";
      case "bordered":
        return "border border-cyan-500/20 rounded-lg divide-y divide-cyan-500/20";
      default:
        return "divide-y divide-cyan-500/10";
    }
  };

  const getItemStyles = (isOpen: boolean, isDisabled: boolean) => {
    const base = cn(
      "relative overflow-hidden transition-colors",
      isDisabled && "opacity-50 cursor-not-allowed"
    );

    switch (variant) {
      case "separated":
        return cn(
          base,
          "rounded-lg border border-cyan-500/20 bg-slate-900/80",
          isOpen && "bg-slate-900"
        );
      case "bordered":
        return cn(base, "bg-slate-900/80", isOpen && "bg-slate-900");
      default:
        return cn(base, isOpen && "bg-slate-900/50");
    }
  };

  const ExpandIcon = iconStyle === "plus" ? (openItems.has("") ? Minus : Plus) : ChevronRight;

  return (
    <div className={cn(getVariantStyles(), className)}>
      {items.map((item, index) => {
        const isOpen = openItems.has(item.id);
        const Icon = item.icon;

        return (
          <div key={item.id} className={getItemStyles(isOpen, !!item.disabled)}>
            {/* Grid pattern background */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Header */}
            <button
              onClick={() => toggleItem(item.id)}
              disabled={item.disabled}
              className={cn(
                "relative z-10 w-full flex items-center gap-3 p-4 text-left",
                "transition-colors",
                !item.disabled && "hover:bg-cyan-500/5",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50"
              )}
            >
              {/* Expand icon */}
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-cyan-400"
              >
                {iconStyle === "plus" ? (
                  isOpen ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </motion.div>

              {/* Custom icon */}
              {Icon && (
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isOpen ? "text-cyan-400" : "text-slate-500"
                  )}
                />
              )}

              {/* Title */}
              <span
                className={cn(
                  "flex-1 font-mono text-sm transition-colors",
                  isOpen ? "text-cyan-400" : "text-slate-300"
                )}
              >
                {item.title}
              </span>

              {/* Badge */}
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono">
                  {item.badge}
                </span>
              )}

              {/* Scanning line on hover */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent origin-left"
              />
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={animated ? { height: 0, opacity: 0 } : undefined}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={animated ? { height: 0, opacity: 0 } : undefined}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={animated ? { y: -10 } : undefined}
                    animate={{ y: 0 }}
                    exit={animated ? { y: -10 } : undefined}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 px-4 pb-4 pl-11"
                  >
                    {/* Content with staggered reveal effect */}
                    <motion.div
                      initial={animated ? { opacity: 0 } : undefined}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-sm text-slate-400 leading-relaxed"
                    >
                      {item.content}
                    </motion.div>

                    {/* Scanning reveal effect */}
                    {animated && (
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none"
                      />
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active indicator */}
            {isOpen && (
              <motion.div
                layoutId={`accordion-indicator-${item.id}`}
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-400"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuantumAccordion;
