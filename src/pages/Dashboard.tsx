import { useState } from "react";
import { motion } from "framer-motion";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import PortfolioOverview from "@/components/dashboard/PortfolioOverview";
import SecureMessaging from "@/components/dashboard/SecureMessaging";
import DocumentVault from "@/components/dashboard/DocumentVault";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { NotificationProvider } from "@/contexts/NotificationContext";

type ActiveView = "portfolio" | "messaging" | "documents";

const Dashboard = () => {
  const [activeView, setActiveView] = useState<ActiveView>("portfolio");

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
    <NotificationProvider>
      <div className="min-h-screen bg-background flex">
        <DashboardSidebar activeView={activeView} setActiveView={setActiveView} />
        
        <div className="flex-1 flex flex-col min-h-screen">
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
    </NotificationProvider>
  );
};

export default Dashboard;
