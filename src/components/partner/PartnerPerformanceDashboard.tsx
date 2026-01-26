import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, Star, Award } from "lucide-react";
import { motion } from "framer-motion";

interface PerformanceMetric {
  label: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
}

interface CommissionData {
  month: string;
  amount: number;
  status: "pending" | "paid" | "processing";
}

interface PartnerPerformanceDashboardProps {
  partnerId?: string;
  partnerName?: string;
  metrics?: PerformanceMetric[];
  commissions?: CommissionData[];
  rating?: number;
  tier?: "bronze" | "silver" | "gold" | "platinum";
}

const defaultMetrics: PerformanceMetric[] = [
  {
    label: "Total Earnings",
    value: "$12,450",
    change: 12.5,
    trend: "up",
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    label: "Active Clients",
    value: 24,
    change: 8.3,
    trend: "up",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Average Rating",
    value: "4.9",
    change: 0.2,
    trend: "up",
    icon: <Star className="h-5 w-5" />,
  },
  {
    label: "Bookings This Month",
    value: 18,
    change: -2.1,
    trend: "down",
    icon: <Award className="h-5 w-5" />,
  },
];

const defaultCommissions: CommissionData[] = [
  { month: "January 2026", amount: 2450, status: "paid" },
  { month: "December 2025", amount: 3200, status: "paid" },
  { month: "November 2025", amount: 1890, status: "paid" },
];

const tierColors = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-400 to-gray-600",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-slate-300 to-slate-500",
};

const tierProgress = {
  bronze: 25,
  silver: 50,
  gold: 75,
  platinum: 100,
};

export function PartnerPerformanceDashboard({
  partnerId,
  partnerName = "Partner",
  metrics = defaultMetrics,
  commissions = defaultCommissions,
  rating = 4.9,
  tier = "gold",
}: PartnerPerformanceDashboardProps) {
  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    paid: "bg-green-500/20 text-green-400 border-green-500/30",
    processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return (
    <div className="space-y-6">
      {/* Header with Tier */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-foreground">{partnerName}'s Performance</h2>
          <p className="text-muted-foreground">Real-time metrics and earnings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${tierColors[tier]} text-white font-semibold uppercase text-sm tracking-wider`}>
            {tier} Partner
          </div>
        </div>
      </div>

      {/* Tier Progress */}
      <Card className="bg-card/50 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tier Progress</span>
            <span className="text-sm text-primary">{tierProgress[tier]}% to next tier</span>
          </div>
          <Progress value={tierProgress[tier]} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Bronze</span>
            <span>Silver</span>
            <span>Gold</span>
            <span>Platinum</span>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {metric.icon}
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.trend === "up" ? "text-green-400" :
                    metric.trend === "down" ? "text-red-400" : "text-muted-foreground"
                  }`}>
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : metric.trend === "down" ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : null}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Commission History */}
      <Card className="bg-card/50 border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Commission History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commissions.map((commission, index) => (
              <motion.div
                key={commission.month}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium text-foreground">{commission.month}</p>
                  <p className="text-sm text-muted-foreground">
                    ${commission.amount.toLocaleString()}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={statusColors[commission.status]}
                >
                  {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating Display */}
      <Card className="bg-card/50 border-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">{rating}</div>
            <div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.floor(rating)
                        ? "text-primary fill-primary"
                        : star - rating < 1
                        ? "text-primary fill-primary/50"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Based on client reviews
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PartnerPerformanceDashboard;
