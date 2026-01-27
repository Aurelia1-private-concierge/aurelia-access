import { motion, AnimatePresence } from "framer-motion";
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
  X,
  Menu,
  Users
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatedLogo } from "@/components/brand";
import { useTierTheme } from "@/contexts/TierThemeContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ActiveView } from "./DashboardSidebar";

interface MobileSidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const menuItems = [
  { id: "portfolio" as const, label: "Portfolio", icon: LayoutDashboard },
  { id: "concierge" as const, label: "Concierge", icon: Headphones },
  { id: "requests" as const, label: "Requests", icon: ClipboardList },
  { id: "impact" as const, label: "Impact", icon: Globe },
  { id: "family" as const, label: "Family", icon: Users },
  { id: "calendar" as const, label: "Calendar", icon: Calendar },
  { id: "chat" as const, label: "Chat", icon: MessageCircle },
  { id: "messaging" as const, label: "Messages", icon: MessageSquareLock },
  { id: "documents" as const, label: "Vault", icon: FolderLock },
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

const MobileSidebar = ({ activeView, setActiveView }: MobileSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { tier, colors, subscribed } = useTierTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleNavClick = (id: ActiveView) => {
    setActiveView(id);
    setIsOpen(false);
  };

  const userEmail = user?.email || "Guest";
  const userInitial = userEmail.charAt(0).toUpperCase();
  const TierIcon = tierIcons[tier] || Crown;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur-xl border-b border-border/30 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <AnimatedLogo size="sm" showWordmark={false} />
          <span className="font-serif text-lg tracking-widest text-foreground">
            AURELIA
          </span>
        </Link>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex items-center justify-center text-foreground"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-background/95 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-0 right-0 bottom-0 overflow-y-auto pb-safe"
            >
              {/* Navigation Grid */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {menuItems.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all duration-200",
                          isActive
                            ? cn(colors.accentBg, colors.accent, colors.accentBorder, "border")
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                        )}
                      >
                        <item.icon className={cn("w-5 h-5", isActive && colors.accent)} />
                        <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-4 border-t border-border/30" />

              {/* Secondary nav */}
              <div className="p-4 space-y-2">
                <Link
                  to="/membership"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <TierIcon className={cn("w-4 h-4", colors.accent)} />
                  <span>Membership</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </div>

              {/* User section */}
              <div className="p-4 border-t border-border/30 mt-auto">
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
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileSidebar;
