import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  MessageSquareLock, 
  FolderLock, 
  Crown,
  LogOut,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

type ActiveView = "portfolio" | "messaging" | "documents";

interface DashboardSidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const menuItems = [
  { id: "portfolio" as const, label: "Portfolio", icon: LayoutDashboard },
  { id: "messaging" as const, label: "Secure Messages", icon: MessageSquareLock },
  { id: "documents" as const, label: "Document Vault", icon: FolderLock },
];

const DashboardSidebar = ({ activeView, setActiveView }: DashboardSidebarProps) => {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-64 border-r border-border/30 bg-card/50 backdrop-blur-xl flex flex-col"
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-border/30">
        <Link to="/" className="font-serif text-xl tracking-widest text-foreground hover:text-primary transition-colors">
          AURELIA
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light tracking-wide transition-all duration-300 ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-light tracking-wide text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border/30">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">J. Anderson</p>
            <p className="text-xs text-primary tracking-wider">SOVEREIGN</p>
          </div>
        </div>
        <Link
          to="/"
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Dashboard</span>
        </Link>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
