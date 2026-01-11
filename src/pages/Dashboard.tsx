import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardSidebar, { type ActiveView } from "@/components/dashboard/DashboardSidebar";
import PortfolioOverview from "@/components/dashboard/PortfolioOverview";
import SecureMessaging from "@/components/dashboard/SecureMessaging";
import DocumentVault from "@/components/dashboard/DocumentVault";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ReferralDashboard from "@/components/referral/ReferralDashboard";
import LifestyleCalendar from "@/components/dashboard/LifestyleCalendar";
import RealTimeChat from "@/components/dashboard/RealTimeChat";
import DeviceConnections from "@/components/dashboard/DeviceConnections";
import ConciergeChat from "@/components/dashboard/ConciergeChat";
import ServiceRequestsView from "@/components/dashboard/ServiceRequestsView";
import LoginSecurityPanel from "@/components/dashboard/LoginSecurityPanel";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TierThemeProvider, useTierTheme } from "@/contexts/TierThemeContext";
import { cn } from "@/lib/utils";

const DashboardContent = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as ActiveView | null;
  const [activeView, setActiveView] = useState<ActiveView>(initialTab || "portfolio");
  const { colors } = useTierTheme();

  // Update view when URL params change
  useEffect(() => {
    const tab = searchParams.get("tab") as ActiveView | null;
    if (tab && ["portfolio", "messaging", "documents", "referrals", "calendar", "chat", "devices", "concierge", "requests", "security"].includes(tab)) {
      setActiveView(tab);
    }
  }, [searchParams]);

  const renderView = () => {
    switch (activeView) {
      case "portfolio":
        return <PortfolioOverview />;
      case "concierge":
        return <ConciergeChat />;
      case "requests":
        return <ServiceRequestsView />;
      case "messaging":
        return <SecureMessaging />;
      case "documents":
        return <DocumentVault />;
      case "referrals":
        return <ReferralDashboard />;
      case "calendar":
        return <LifestyleCalendar />;
      case "chat":
        return <RealTimeChat />;
      case "devices":
        return <DeviceConnections />;
      case "security":
        return <LoginSecurityPanel />;
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
