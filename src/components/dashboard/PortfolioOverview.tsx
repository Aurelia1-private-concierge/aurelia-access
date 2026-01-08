import { useState } from "react";
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
import OrlaCompanion from "./OrlaCompanion";
import TravelDNACard from "./TravelDNACard";
import SurpriseMeCard from "./SurpriseMeCard";
import TravelDNAOnboarding from "@/components/TravelDNAOnboarding";

const portfolioStats = [
  { label: "Total Assets", value: "$47.8M", change: "+12.4%", trending: "up" },
  { label: "Liquid Capital", value: "$8.2M", change: "+3.2%", trending: "up" },
  { label: "Active Investments", value: "14", change: "+2", trending: "up" },
  { label: "Pending Acquisitions", value: "3", change: "-1", trending: "down" },
];

const holdings = [
  { name: "Real Estate Portfolio", value: "$18.5M", allocation: "38.7%", icon: Building2, change: "+5.2%" },
  { name: "Private Equity", value: "$12.3M", allocation: "25.7%", icon: BarChart3, change: "+8.1%" },
  { name: "Art & Collectibles", value: "$8.4M", allocation: "17.6%", icon: Gem, change: "+15.3%" },
  { name: "Aviation Assets", value: "$5.2M", allocation: "10.9%", icon: Plane, change: "-2.1%" },
  { name: "Luxury Assets", value: "$3.4M", allocation: "7.1%", icon: Diamond, change: "+4.7%" },
];

const recentActivity = [
  { action: "Acquisition Complete", item: "Patek Philippe Ref. 5711", date: "Today, 9:41 AM", value: "$285,000" },
  { action: "Transfer Initiated", item: "Monaco Property Deposit", date: "Yesterday", value: "$2.5M" },
  { action: "Valuation Updated", item: "Basquiat Collection", date: "Jan 5, 2026", value: "+$420,000" },
  { action: "Dividend Received", item: "Private Equity Fund III", date: "Jan 3, 2026", value: "$156,000" },
];

const PortfolioOverview = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <div className="space-y-6">
      {/* Travel DNA Onboarding Modal */}
      {showOnboarding && (
        <TravelDNAOnboarding
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
        />
      )}

      {/* Travel DNA + Orla + Surprise Me Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TravelDNACard onEditClick={() => setShowOnboarding(true)} />
        <OrlaCompanion />
        <SurpriseMeCard />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {portfolioStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </span>
              {stat.trending === "up" ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-500" />
              )}
            </div>
            <p className="font-serif text-3xl text-foreground tracking-tight">{stat.value}</p>
            <p className={`text-sm mt-1 ${stat.trending === "up" ? "text-emerald-500" : "text-rose-500"}`}>
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 p-6 bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-lg text-foreground">Asset Holdings</h3>
            </div>
            <button className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              View Details <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {holdings.map((holding, index) => (
              <div
                key={holding.name}
                className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <holding.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{holding.name}</p>
                  <p className="text-xs text-muted-foreground">{holding.allocation} of portfolio</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{holding.value}</p>
                  <p className={`text-xs ${holding.change.startsWith("+") ? "text-emerald-500" : "text-rose-500"}`}>
                    {holding.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-lg text-foreground">Recent Activity</h3>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="pb-4 border-b border-border/30 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <span className="text-xs text-primary">{activity.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{activity.item}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{activity.date}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-lg text-foreground">Portfolio Performance</h3>
          </div>
          <div className="flex gap-2">
            {["1M", "3M", "6M", "1Y", "ALL"].map((period) => (
              <button
                key={period}
                className={`px-3 py-1 text-xs rounded ${
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
        <div className="h-64 flex items-end justify-between gap-2 px-4">
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
        <div className="flex justify-between mt-4 px-4 text-xs text-muted-foreground">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PortfolioOverview;
