import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const { strength, passedRequirements, strengthLabel, strengthColor } = useMemo(() => {
    const passed = requirements.filter((req) => req.test(password));
    const score = passed.length;
    
    let label = "Very Weak";
    let color = "bg-destructive";
    
    if (score === 5) {
      label = "Strong";
      color = "bg-emerald-500";
    } else if (score >= 4) {
      label = "Good";
      color = "bg-amber-500";
    } else if (score >= 3) {
      label = "Fair";
      color = "bg-amber-600";
    } else if (score >= 2) {
      label = "Weak";
      color = "bg-orange-500";
    }
    
    return {
      strength: score,
      passedRequirements: passed,
      strengthLabel: label,
      strengthColor: color,
    };
  }, [password]);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 space-y-3"
    >
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span className={`text-xs font-medium ${
            strength === 5 ? "text-emerald-500" : 
            strength >= 3 ? "text-amber-500" : "text-destructive"
          }`}>
            {strengthLabel}
          </span>
        </div>
        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: strength >= i ? 1 : 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className={`flex-1 rounded-full origin-left ${
                strength >= i ? strengthColor : "bg-muted/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-1.5">
        {requirements.map((req, i) => {
          const passed = req.test(password);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-1.5 text-[11px] ${
                passed ? "text-emerald-500" : "text-muted-foreground"
              }`}
            >
              {passed ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3 opacity-50" />
              )}
              <span>{req.label}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PasswordStrengthMeter;
