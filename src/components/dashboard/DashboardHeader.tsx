import { Bell, Shield, Search } from "lucide-react";
import { motion } from "framer-motion";

type ActiveView = "portfolio" | "messaging" | "documents";

interface DashboardHeaderProps {
  activeView: ActiveView;
}

const viewTitles = {
  portfolio: "Portfolio Overview",
  messaging: "Secure Messaging",
  documents: "Document Vault",
};

const DashboardHeader = ({ activeView }: DashboardHeaderProps) => {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-20 border-b border-border/30 bg-card/30 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between"
    >
      <div>
        <h1 className="font-serif text-2xl text-foreground tracking-tight">
          {viewTitles[activeView]}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span className="text-xs text-emerald-500 tracking-wider uppercase font-medium">
            Encrypted Session Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border/50 rounded-lg">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-40"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

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
