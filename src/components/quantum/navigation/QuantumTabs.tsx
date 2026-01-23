import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
  content: ReactNode;
}

interface QuantumTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "pills" | "underline";
  className?: string;
  contentClassName?: string;
  animated?: boolean;
  onChange?: (tabId: string) => void;
}

export const QuantumTabs = ({
  tabs,
  defaultTab,
  orientation = "horizontal",
  variant = "default",
  className,
  contentClassName,
  animated = true,
  onChange,
}: QuantumTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  const getTabStyles = (isActive: boolean, isDisabled: boolean) => {
    const base = cn(
      "relative px-4 py-2.5 font-mono text-sm transition-all duration-300",
      "flex items-center gap-2",
      isDisabled && "opacity-50 cursor-not-allowed"
    );

    switch (variant) {
      case "pills":
        return cn(
          base,
          "rounded-lg",
          isActive
            ? "bg-cyan-500/20 text-cyan-400"
            : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50"
        );
      case "underline":
        return cn(
          base,
          isActive ? "text-cyan-400" : "text-slate-400 hover:text-cyan-400"
        );
      default:
        return cn(
          base,
          "rounded-t-lg border-t border-l border-r",
          isActive
            ? "bg-slate-900/80 border-cyan-500/30 text-cyan-400"
            : "bg-slate-950/50 border-transparent text-slate-400 hover:text-cyan-400 hover:bg-slate-900/40"
        );
    }
  };

  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-row gap-4" : "flex-col",
        className
      )}
    >
      {/* Tab list */}
      <div
        className={cn(
          "relative flex",
          orientation === "vertical"
            ? "flex-col border-r border-cyan-500/20 pr-4"
            : "flex-row border-b border-cyan-500/20",
          variant === "pills" && "gap-2 border-none p-1 bg-slate-950/50 rounded-lg"
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={getTabStyles(isActive, !!tab.disabled)}
            >
              {/* Active indicator */}
              {isActive && variant !== "pills" && (
                <motion.div
                  layoutId="quantum-tab-indicator"
                  className={cn(
                    "absolute bg-cyan-400",
                    variant === "underline"
                      ? "bottom-0 left-0 right-0 h-0.5"
                      : orientation === "vertical"
                      ? "right-0 top-0 bottom-0 w-0.5 -mr-4"
                      : "bottom-0 left-0 right-0 h-0.5"
                  )}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Glow effect for active tab */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-cyan-500/5 rounded-lg pointer-events-none"
                />
              )}

              {/* Icon */}
              {Icon && (
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-cyan-400" : "text-slate-500"
                  )}
                />
              )}

              {/* Label */}
              <span>{tab.label}</span>

              {/* Badge */}
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.5 text-xs rounded-full font-mono",
                    isActive
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-slate-700 text-slate-400"
                  )}
                >
                  {tab.badge}
                </span>
              )}

              {/* Scanning line on hover */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent origin-left"
              />
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div
        className={cn(
          "relative flex-1 rounded-lg border border-cyan-500/20 bg-slate-900/80 overflow-hidden",
          orientation === "vertical" ? "rounded-lg" : "rounded-b-lg rounded-t-none border-t-0",
          variant === "pills" && "rounded-lg border-t mt-2",
          contentClassName
        )}
      >
        {/* Grid pattern */}
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

        {/* Content with transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={animated ? { opacity: 0, y: 10 } : undefined}
            animate={{ opacity: 1, y: 0 }}
            exit={animated ? { opacity: 0, y: -10 } : undefined}
            transition={{ duration: 0.2 }}
            className="relative z-10 p-4"
          >
            {activeContent}
          </motion.div>
        </AnimatePresence>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/30" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-400/30" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400/30" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/30" />
      </div>
    </div>
  );
};

export default QuantumTabs;
