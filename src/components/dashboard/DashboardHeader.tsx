import { Shield, Search, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import NotificationPanel from "./NotificationPanel";
import { useTierTheme } from "@/contexts/TierThemeContext";
import { cn } from "@/lib/utils";

type ActiveView = "portfolio" | "messaging" | "documents" | "referrals" | "calendar" | "chat";

interface DashboardHeaderProps {
  activeView: ActiveView;
}

const viewTitles: Record<ActiveView, string> = {
  portfolio: "Portfolio Overview",
  messaging: "Secure Messaging",
  documents: "Document Vault",
  referrals: "Referral Program",
  calendar: "Lifestyle Calendar",
  chat: "Concierge Chat",
};

const tierIcons = {
  default: null,
  silver: Shield,
  gold: Crown,
  platinum: Sparkles,
};

const DashboardHeader = ({ activeView }: DashboardHeaderProps) => {
  const { tier, colors, subscribed } = useTierTheme();
  const TierIcon = tierIcons[tier];

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-20 border-b border-border/30 bg-card/30 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between"
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl text-foreground tracking-tight">
            {viewTitles[activeView]}
          </h1>
          {/* Tier Badge */}
          {subscribed && TierIcon && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
                colors.accentBg,
                colors.accentBorder
              )}
            >
              <TierIcon className={cn("w-3.5 h-3.5", colors.accent)} />
              <span className={cn("text-xs font-medium uppercase tracking-wider", colors.accent)}>
                {colors.tierLabel}
              </span>
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span className="text-xs text-emerald-500 tracking-wider uppercase font-medium">
            Encrypted Session Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className={cn(
          "hidden md:flex items-center gap-2 px-4 py-2 bg-muted/30 border rounded-lg",
          "border-border/50 focus-within:border-opacity-100",
          `focus-within:${colors.accentBorder}`
        )}>
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-40"
          />
        </div>

        {/* Notifications */}
        <NotificationPanel />

        {/* Time */}
        <div className="hidden lg:block text-right">
          <p className="text-xs text-muted-foreground">Local Time</p>
          <p className="text-sm text-foreground font-light tabular-nums">
            {new Date().toLocaleTimeString("en-US", { 
              hour: "2-digit", 
              minute: "2-digit",
              hour12: true 
            })}
          </p>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
