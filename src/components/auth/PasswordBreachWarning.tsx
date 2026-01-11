import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Shield, Loader2 } from "lucide-react";

interface PasswordBreachWarningProps {
  isChecking: boolean;
  isBreached: boolean;
  occurrences: number;
  error?: string;
}

export const PasswordBreachWarning = ({
  isChecking,
  isBreached,
  occurrences,
  error,
}: PasswordBreachWarningProps) => {
  if (error) {
    return null; // Don't show errors to avoid confusing users
  }

  return (
    <AnimatePresence>
      {isChecking && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2 text-xs text-muted-foreground mt-2"
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Checking password security...</span>
        </motion.div>
      )}

      {!isChecking && isBreached && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                Password Found in Data Breach
              </p>
              <p className="text-xs text-muted-foreground">
                This password has appeared in{" "}
                <strong className="text-foreground">
                  {occurrences.toLocaleString()}
                </strong>{" "}
                known data breaches. Using a compromised password puts your account
                at significant risk.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please choose a different password that hasn't been exposed.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {!isChecking && !isBreached && occurrences === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-emerald-500 mt-2"
        >
          <Shield className="w-3 h-3" />
          <span>Password not found in known data breaches</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordBreachWarning;
