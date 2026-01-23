import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  BarChart3, 
  Clock,
  ArrowUpRight,
  Diamond,
  Building2,
  Plane,
  Gem
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import OrlaCompanion from "./OrlaCompanion";
import TravelDNACard from "./TravelDNACard";
import SurpriseMeCard from "./SurpriseMeCard";
import RecommendationsFeed from "./RecommendationsFeed";
import SubscriptionCard from "./SubscriptionCard";
import ExclusivePerks from "./ExclusivePerks";
import ReferralProgram from "./ReferralProgram";
import UpgradeCelebration from "./UpgradeCelebration";
import WelcomeBanner from "./WelcomeBanner";
import CreditsCard from "./CreditsCard";
import TravelDNAOnboarding from "@/components/TravelDNAOnboarding";
import { useSubscription } from "@/hooks/useSubscription";
import { useDashboardTour } from "@/hooks/useDashboardTour";
import { useAuth } from "@/contexts/AuthContext";
import QuantumPortfolioStats from "./QuantumPortfolioStats";
import QuantumHoldingsChart from "./QuantumHoldingsChart";
import QuantumActivityFeed from "./QuantumActivityFeed";

const portfolioStats: Array<{ label: string; value: string; change: string; trending: "up" | "down" }> = [
  { label: "Total Assets", value: "$47.8M", change: "+12.4%", trending: "up" },
  { label: "Liquid Capital", value: "$8.2M", change: "+3.2%", trending: "up" },
  { label: "Active Investments", value: "14", change: "+2", trending: "up" },
  { label: "Pending Acquisitions", value: "3", change: "-1", trending: "down" },
];

const holdings = [
  { name: "Real Estate Portfolio", value: "$18.5M", numericValue: 18500000, allocation: "38.7%", icon: Building2, change: "+5.2%" },
  { name: "Private Equity", value: "$12.3M", numericValue: 12300000, allocation: "25.7%", icon: BarChart3, change: "+8.1%" },
  { name: "Art & Collectibles", value: "$8.4M", numericValue: 8400000, allocation: "17.6%", icon: Gem, change: "+15.3%" },
  { name: "Aviation Assets", value: "$5.2M", numericValue: 5200000, allocation: "10.9%", icon: Plane, change: "-2.1%" },
  { name: "Luxury Assets", value: "$3.4M", numericValue: 3400000, allocation: "7.1%", icon: Diamond, change: "+4.7%" },
];

const recentActivity = [
  { id: "1", action: "Acquisition Complete", item: "Patek Philippe Ref. 5711", date: "Today, 9:41 AM", value: "$285,000" },
  { id: "2", action: "Transfer Initiated", item: "Monaco Property Deposit", date: "Yesterday", value: "$2.5M" },
  { id: "3", action: "Valuation Updated", item: "Basquiat Collection", date: "Jan 5, 2026", value: "+$420,000" },
  { id: "4", action: "Dividend Received", item: "Private Equity Fund III", date: "Jan 3, 2026", value: "$156,000" },
];

const TOUR_COMPLETED_KEY = "aurelia_tour_completed";

const PortfolioOverview = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { tier, tierDetails } = useSubscription();
  const { user } = useAuth();
  const previousTierRef = useRef<string | null>(null);

  const handleTourComplete = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, "true");
    setShowWelcome(false);
  };

  const { startTour } = useDashboardTour({ onComplete: handleTourComplete });

  // Check if new user (show welcome banner)
  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
    if (!tourCompleted && user) {
      setShowWelcome(true);
    }
  }, [user]);

  // Check for successful checkout redirect
  useEffect(() => {
    const checkoutSuccess = searchParams.get("checkout_success");
    if (checkoutSuccess === "true") {
      setTimeout(() => {
        setShowCelebration(true);
      }, 500);
      searchParams.delete("checkout_success");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Detect tier upgrades
  useEffect(() => {
    if (tier && previousTierRef.current && tier !== previousTierRef.current) {
      setShowCelebration(true);
    }
    previousTierRef.current = tier;
  }, [tier]);

  const handleStartTour = () => {
    setShowWelcome(false);
    startTour();
  };

  return (
    <div className="space-y-6">
      {/* Upgrade Celebration Modal */}
      <UpgradeCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        tierName={tierDetails?.name || tier || ""}
        tierId={tier || "gold"}
      />

      {/* Travel DNA Onboarding Modal */}
      {showOnboarding && (
        <TravelDNAOnboarding
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {/* Welcome Banner for New Users */}
      <WelcomeBanner
        isVisible={showWelcome}
        onDismiss={handleTourComplete}
        onStartTour={handleStartTour}
        userName={user?.email}
      />

      {/* Subscription + Credits + Perks Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div data-tour="subscription-card">
          <SubscriptionCard />
        </div>
        <div data-tour="credits-card">
          <CreditsCard />
        </div>
        <div data-tour="exclusive-perks" className="sm:col-span-2 lg:col-span-1">
          <ExclusivePerks />
        </div>
      </div>

      {/* Travel DNA + Orla + Surprise Me Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div data-tour="travel-dna">
          <TravelDNACard onEditClick={() => setShowOnboarding(true)} />
        </div>
        <div data-tour="orla-companion">
          <OrlaCompanion />
        </div>
        <div data-tour="surprise-me" className="sm:col-span-2 lg:col-span-1">
          <SurpriseMeCard />
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div data-tour="recommendations">
        <RecommendationsFeed />
      </div>

      {/* Referral Program */}
      <ReferralProgram />
      
      {/* Quantum Stats Grid */}
      <QuantumPortfolioStats stats={portfolioStats} />

      {/* Quantum Holdings & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuantumHoldingsChart holdings={holdings} />
        </div>
        <QuantumActivityFeed activities={recentActivity} />
      </div>

      {/* Performance Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-lg text-foreground">Portfolio Performance</h3>
          </div>
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
            {["1M", "3M", "6M", "1Y", "ALL"].map((period) => (
              <button
                key={period}
                className={`px-2 sm:px-3 py-1 text-xs rounded whitespace-nowrap ${
                  period === "1Y" 
                    ? "bg-primary/20 text-primary border border-primary/30" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                } transition-colors`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Chart visualization placeholder */}
        <div className="h-48 sm:h-64 flex items-end justify-between gap-1 sm:gap-2 px-2 sm:px-4">
          {[40, 55, 45, 60, 75, 65, 80, 70, 85, 90, 78, 95].map((height, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: 0.7 + i * 0.05, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-primary/60 to-primary/20 rounded-t"
            />
          ))}
        </div>
        <div className="flex justify-between mt-4 px-2 sm:px-4 text-[10px] sm:text-xs text-muted-foreground overflow-x-auto">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (
            <span key={month} className="flex-shrink-0">{month}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PortfolioOverview;
