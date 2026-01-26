import React, { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Target,
  AlertTriangle,
  Plus,
  RefreshCw,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdSpendManagement, useCurrencyFormat, SUPPORTED_AD_PLATFORMS } from "@/hooks/useAdSpendManagement";
import BudgetManager from "./BudgetManager";
import AdMetricsChart from "./AdMetricsChart";

const AdSpendDashboard = forwardRef<HTMLDivElement>((_, ref) => {
  const {
    loading,
    budgets,
    transactions,
    fetchData,
    getAggregatedMetrics,
  } = useAdSpendManagement();

  const [showBudgetManager, setShowBudgetManager] = useState(false);
  const formatCurrency = useCurrencyFormat("USD");

  const aggregated = getAggregatedMetrics();
  const budgetUtilization = aggregated.totalBudget > 0
    ? (aggregated.totalSpend / aggregated.totalBudget) * 100
    : 0;

  // Find budgets that are near or over limit
  const alertBudgets = budgets.filter((b) => {
    const percentage = b.budget_amount > 0 ? b.spent_amount / b.budget_amount : 0;
    return percentage >= b.alert_threshold;
  });

  if (loading) {
    return (
      <div ref={ref} className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading ad spend data...</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="font-serif text-2xl text-foreground mb-1 flex items-center gap-3">
            <DollarSign className="h-7 w-7 text-primary" />
            Ad Spend Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Track budgets, spending, and ROI across all advertising platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowBudgetManager(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Budget
          </Button>
        </div>
      </motion.div>

      {/* Alert Banner */}
      {alertBudgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">
              {alertBudgets.length} budget{alertBudgets.length > 1 ? "s" : ""} near or over limit
            </p>
            <p className="text-sm text-muted-foreground">
              {alertBudgets.map((b) => b.platform).join(", ")}
            </p>
          </div>
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(aggregated.totalSpend)}
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">of {formatCurrency(aggregated.totalBudget)}</span>
                <span className={budgetUtilization > 80 ? "text-destructive" : "text-primary"}>
                  {budgetUtilization.toFixed(1)}%
                </span>
              </div>
              <Progress value={budgetUtilization} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impressions</p>
                <p className="text-2xl font-bold text-foreground">
                  {aggregated.totalImpressions.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Eye className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              CPM: {formatCurrency(aggregated.totalImpressions > 0 ? (aggregated.totalSpend / aggregated.totalImpressions) * 1000 : 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clicks</p>
                <p className="text-2xl font-bold text-foreground">
                  {aggregated.totalClicks.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <MousePointerClick className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              CTR: {aggregated.avgCTR.toFixed(2)}% | CPC: {formatCurrency(aggregated.totalClicks > 0 ? aggregated.totalSpend / aggregated.totalClicks : 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROAS</p>
                <p className="text-2xl font-bold text-foreground">
                  {aggregated.avgROAS.toFixed(2)}x
                </p>
              </div>
              <div className={`p-3 rounded-full ${aggregated.avgROAS >= 1 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                {aggregated.avgROAS >= 1 ? (
                  <TrendingUp className="h-6 w-6 text-green-500" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Revenue: {formatCurrency(aggregated.totalRevenue)} | Conversions: {aggregated.totalConversions}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Platform Breakdown</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Spend by Platform
              </CardTitle>
              <CardDescription>
                Budget allocation and spend across connected platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SUPPORTED_AD_PLATFORMS.map((platform) => {
                  const data = aggregated.platformBreakdown[platform.id] || {
                    spend: 0,
                    budget: 0,
                    impressions: 0,
                    clicks: 0,
                    conversions: 0,
                  };
                  const utilization = data.budget > 0 ? (data.spend / data.budget) * 100 : 0;
                  const hasBudget = data.budget > 0;

                  return (
                    <div
                      key={platform.id}
                      className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                            {platform.icon}
                          </div>
                          <div>
                            <p className="font-medium">{platform.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {hasBudget ? `${formatCurrency(data.spend)} of ${formatCurrency(data.budget)}` : "No budget set"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {hasBudget ? (
                            <>
                              <Badge variant={utilization > 80 ? "destructive" : utilization > 50 ? "default" : "secondary"}>
                                {utilization.toFixed(0)}% used
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatCurrency(data.budget - data.spend)} remaining
                              </p>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowBudgetManager(true)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Budget
                            </Button>
                          )}
                        </div>
                      </div>
                      {hasBudget && (
                        <>
                          <Progress value={utilization} className="h-2 mb-3" />
                          <div className="grid grid-cols-3 gap-4 text-center text-xs">
                            <div>
                              <p className="text-muted-foreground">Impressions</p>
                              <p className="font-medium">{data.impressions.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Clicks</p>
                              <p className="font-medium">{data.clicks.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Conversions</p>
                              <p className="font-medium">{data.conversions.toLocaleString()}</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets">
          <BudgetManager />
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Ad spend history and adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions recorded yet</p>
                  <p className="text-sm">Spend will be tracked once campaigns are active</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 20).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 border border-border/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          tx.transaction_type === "refund" ? "bg-green-500/10" : "bg-red-500/10"
                        }`}>
                          {tx.transaction_type === "refund" ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{tx.description || tx.transaction_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className={`font-medium ${
                        tx.transaction_type === "refund" ? "text-green-500" : "text-red-500"
                      }`}>
                        {tx.transaction_type === "refund" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <AdMetricsChart />
        </TabsContent>
      </Tabs>

      {/* Budget Manager Modal */}
      {showBudgetManager && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <BudgetManager onClose={() => setShowBudgetManager(false)} isModal />
          </motion.div>
        </div>
      )}
    </div>
  );
});

AdSpendDashboard.displayName = "AdSpendDashboard";

export default AdSpendDashboard;
