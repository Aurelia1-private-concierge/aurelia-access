import { motion } from "framer-motion";
import { Shield, Lock, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface SecurityTrustBadgeProps {
  variant?: "compact" | "full";
  className?: string;
}

const SecurityTrustBadge = ({ variant = "compact", className = "" }: SecurityTrustBadgeProps) => {
  if (variant === "compact") {
    return (
      <Link to="/security">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-card/50 border border-border/30 rounded-full hover:border-primary/30 transition-all duration-300 cursor-pointer ${className}`}
        >
          <div className="relative">
            <Shield className="w-4 h-4 text-primary" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            AAA+ Secured
          </span>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to="/security">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02 }}
        className={`inline-flex items-center gap-4 px-6 py-4 bg-card/30 border border-border/20 rounded-lg hover:border-primary/30 hover:bg-card/50 transition-all duration-300 cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Enterprise Security</span>
              <span className="text-[9px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full uppercase tracking-wider">
                Active
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              256-bit AES • SOC 2 • GDPR Compliant
            </span>
          </div>
        </div>
        <Lock className="w-4 h-4 text-muted-foreground" />
      </motion.div>
    </Link>
  );
};

export default SecurityTrustBadge;
