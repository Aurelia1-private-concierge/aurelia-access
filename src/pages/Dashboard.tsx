import { useState } from "react";
import { motion } from "framer-motion";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import PortfolioOverview from "@/components/dashboard/PortfolioOverview";
import SecureMessaging from "@/components/dashboard/SecureMessaging";
import DocumentVault from "@/components/dashboard/DocumentVault";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TierThemeProvider, useTierTheme } from "@/contexts/TierThemeContext";
import { cn } from "@/lib/utils";

type ActiveView = "portfolio" | "messaging" | "documents";

const DashboardContent = () => {
  const [activeView, setActiveView] = useState<ActiveView>("portfolio");
  const { colors } = useTierTheme();

  const renderView = () => {
    switch (activeView) {
      case "portfolio":
        return <PortfolioOverview />;
      case "messaging":
        return <SecureMessaging />;
      case "documents":
        return <DocumentVault />;
      default:
        return <PortfolioOverview />;
    }
  };

  return (
    <div className={cn("min-h-screen bg-background flex relative", colors.accentGlow)}>
      {/* Subtle tier gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br pointer-events-none opacity-30",
        colors.gradientFrom,
        colors.gradientTo
      )} />
      
      <DashboardSidebar activeView={activeView} setActiveView={setActiveView} />
      
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        <DashboardHeader activeView={activeView} />
        
        <motion.main 
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-6 lg:p-8 overflow-auto"
        >
          {renderView()}
        </motion.main>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <NotificationProvider>
      <TierThemeProvider>
        <DashboardContent />
      </TierThemeProvider>
    </NotificationProvider>
  );
};

export default Dashboard;
