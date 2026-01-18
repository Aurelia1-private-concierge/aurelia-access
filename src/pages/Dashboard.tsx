import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import GlobalImpactPlatform from "@/components/dashboard/GlobalImpactPlatform";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TierThemeProvider, useTierTheme } from "@/contexts/TierThemeContext";
import { cn } from "@/lib/utils";

const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.98,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: "easeIn" as const,
    }
  }
};

const DashboardContent = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as ActiveView | null;
  const [activeView, setActiveView] = useState<ActiveView>(initialTab || "portfolio");
  const { colors } = useTierTheme();

  // Update view when URL params change
  useEffect(() => {
    const tab = searchParams.get("tab") as ActiveView | null;
    if (tab && ["portfolio", "messaging", "documents", "referrals", "calendar", "chat", "devices", "concierge", "requests", "security", "impact"].includes(tab)) {
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
      case "impact":
        return <GlobalImpactPlatform />;
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
    <div className={cn("min-h-screen bg-background flex relative overflow-hidden", colors.accentGlow)}>
      {/* Premium animated gradient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full blur-3xl",
            colors.gradientFrom
          )}
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.04, 0.02, 0.04],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className={cn(
            "absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full blur-3xl",
            colors.gradientTo
          )}
        />
      </div>
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      <DashboardSidebar activeView={activeView} setActiveView={setActiveView} />
      
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        <DashboardHeader activeView={activeView} />
        
        <AnimatePresence mode="wait">
          <motion.main 
            key={activeView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 p-6 lg:p-8 overflow-auto"
          >
            {renderView()}
          </motion.main>
        </AnimatePresence>
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
