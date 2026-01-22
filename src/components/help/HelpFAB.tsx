import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, Book, MessageCircle, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import HelpCenter from "./HelpCenter";
import { useLandingTour } from "@/hooks/useLandingTour";
import { useDashboardTour } from "@/hooks/useDashboardTour";
import { useLocation } from "react-router-dom";

export default function HelpFAB() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  const location = useLocation();
  
  const { startTour: startLandingTour } = useLandingTour();
  const { startTour: startDashboardTour } = useDashboardTour();

  const isDashboard = location.pathname.includes("/dashboard");

  const actions = [
    {
      id: "help",
      label: "Help Center",
      icon: Book,
      onClick: () => {
        setHelpCenterOpen(true);
        setIsExpanded(false);
      },
    },
    {
      id: "tour",
      label: "Start Tour",
      icon: Play,
      onClick: () => {
        setIsExpanded(false);
        if (isDashboard) {
          startDashboardTour();
        } else {
          startLandingTour();
        }
      },
    },
    {
      id: "guide",
      label: "User Guide",
      icon: Sparkles,
      onClick: () => {
        window.location.href = "/guide";
        setIsExpanded(false);
      },
    },
  ];

  return (
    <>
      {/* FAB Container */}
      <div className="fixed bottom-24 right-6 z-40">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-16 right-0 flex flex-col gap-2"
            >
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={action.onClick}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-card border border-border shadow-lg hover:bg-secondary/50 transition-colors whitespace-nowrap"
                >
                  <action.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
            isExpanded
              ? "bg-destructive/10 border-destructive/30"
              : "bg-primary/10 border-primary/30",
            "border backdrop-blur-sm"
          )}
          aria-label={isExpanded ? "Close help menu" : "Open help menu"}
        >
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-5 h-5 text-destructive" />
              </motion.div>
            ) : (
              <motion.div
                key="help"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <HelpCircle className="w-5 h-5 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Help Center Modal */}
      <HelpCenter isOpen={helpCenterOpen} onClose={() => setHelpCenterOpen(false)} />
    </>
  );
}
