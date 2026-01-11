import { motion, AnimatePresence } from "framer-motion";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionTimeoutWarningProps {
  isVisible: boolean;
  remainingSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
}

export const SessionTimeoutWarning = ({
  isVisible,
  remainingSeconds,
  onExtend,
  onLogout,
}: SessionTimeoutWarningProps) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={onExtend}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 mx-4">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
                >
                  <Clock className="w-8 h-8 text-amber-500" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl text-foreground mb-2">
                  Session Expiring Soon
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Your session will expire due to inactivity. Would you like to continue?
                </p>
                
                {/* Countdown */}
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-mono font-bold text-amber-500">
                    {formatTime(remainingSeconds)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="flex-1 gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
                <Button
                  onClick={onExtend}
                  className="flex-1 gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Stay Signed In
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SessionTimeoutWarning;
