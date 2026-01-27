import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  MessageSquareLock, 
  FolderLock, 
  Crown,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  Gift,
  Calendar,
  MessageCircle,
  Watch,
  Headphones,
  ClipboardList,
  ShieldCheck,
  Globe,
  Users
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatedLogo } from "@/components/brand";
import { useTierTheme } from "@/contexts/TierThemeContext";
import { cn } from "@/lib/utils";

export type ActiveView = "portfolio" | "messaging" | "documents" | "referrals" | "calendar" | "chat" | "devices" | "concierge" | "requests" | "security" | "impact" | "family";

interface DashboardSidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const menuItems = [
  { id: "portfolio" as const, label: "Portfolio", icon: LayoutDashboard },
  { id: "concierge" as const, label: "Concierge", icon: Headphones },
  { id: "requests" as const, label: "Service Requests", icon: ClipboardList },
  { id: "impact" as const, label: "Global Impact", icon: Globe },
  { id: "family" as const, label: "Family/Team", icon: Users },
  { id: "calendar" as const, label: "Calendar", icon: Calendar },
  { id: "chat" as const, label: "Live Chat", icon: MessageCircle },
  { id: "messaging" as const, label: "Secure Messages", icon: MessageSquareLock },
  { id: "documents" as const, label: "Document Vault", icon: FolderLock },
  { id: "devices" as const, label: "Devices", icon: Watch },
  { id: "security" as const, label: "Security", icon: ShieldCheck },
  { id: "referrals" as const, label: "Referrals", icon: Gift },
];

const tierIcons = {
  default: Crown,
  silver: Shield,
  gold: Crown,
  platinum: Sparkles,
};

const DashboardSidebar = ({ activeView, setActiveView }: DashboardSidebarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { tier, colors, subscribed } = useTierTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Get user display info
  const userEmail = user?.email || "Guest";
  const userInitial = userEmail.charAt(0).toUpperCase();
  const TierIcon = tierIcons[tier] || Crown;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="hidden lg:flex w-64 border-r border-border/30 bg-card/50 backdrop-blur-xl flex-col"
    >
      {/* Logo */}
      <Link to="/" className="h-20 flex items-center gap-3 px-6 border-b border-border/30 hover:bg-muted/30 transition-colors">
        <AnimatedLogo size="sm" showWordmark={false} />
        <span className="font-serif text-xl tracking-widest text-foreground">
          AURELIA
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3" data-tour="sidebar-nav">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light tracking-wide transition-all duration-300",
                  isActive
                    ? cn(colors.accentBg, colors.accent, colors.accentBorder, "border")
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive && colors.accent)} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={cn("ml-auto w-1.5 h-1.5 rounded-full", colors.accent.replace("text-", "bg-"))}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-border/30" />

        {/* Secondary nav */}
        <div className="space-y-1">
          <Link
            to="/membership"
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light tracking-wide transition-all duration-300",
              "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <TierIcon className={cn("w-4 h-4", colors.accent)} />
            <span>Membership</span>
          </Link>
          <Link
            to="/profile"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border/30">
        <div className={cn("flex items-center gap-3 p-3 rounded-lg", colors.accentBg)}>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border",
            colors.accentBg,
            colors.accentBorder
          )}>
            {user ? (
              <span className={cn("text-sm font-medium", colors.accent)}>{userInitial}</span>
            ) : (
              <TierIcon className={cn("w-4 h-4", colors.accent)} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {userEmail}
            </p>
            <p className={cn("text-xs tracking-wider uppercase", colors.accent)}>
              {subscribed ? colors.tierLabel : "Guest"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
