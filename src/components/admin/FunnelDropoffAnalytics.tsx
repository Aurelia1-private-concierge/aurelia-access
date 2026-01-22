import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  TrendingDown, 
  TrendingUp, 
  Users, 
  LogIn, 
  UserPlus, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StageData {
  stage: string;
  count: number;
  percentage: number;
  dropoff: number;
}

interface FunnelMetrics {
  authFlow: StageData[];
  onboardingFlow: StageData[];
  conversionRate: number;
  authDropoffRate: number;
  onboardingDropoffRate: number;
  totalSessions: number;
}

const STAGE_LABELS: Record<string, string> = {
  landing: "Landing Page",
  auth_page_view: "Auth Page View",
  auth_login_attempt: "Login Attempt",
  auth_login_success: "Login Success",
  auth_login_failed: "Login Failed",
  auth_signup_view: "Signup View",
  signup_started: "Signup Started",
  signup_completed: "Signup Completed",
  signup_failed: "Signup Failed",
  auth_password_reset: "Password Reset",
  auth_google_attempt: "Google Auth",
  auth_mfa_required: "MFA Required",
  auth_mfa_success: "MFA Success",
  auth_mfa_failed: "MFA Failed",
  onboarding_started: "Onboarding Start",
  onboarding_step_1: "Step 1: Welcome",
  onboarding_step_2: "Step 2: Archetype",
  onboarding_step_3: "Step 3: Pace",
  onboarding_step_4: "Step 4: Accommodation",
  onboarding_step_5: "Step 5: Cuisines",
  onboarding_step_6: "Step 6: Activities",
  onboarding_step_7: "Step 7: Special",
  onboarding_skipped: "Onboarding Skipped",
  onboarding_completed: "Onboarding Completed",
  converted: "Converted",
};

const STAGE_ICONS: Record<string, React.ElementType> = {
  landing: Users,
  auth_page_view: LogIn,
  auth_login_attempt: LogIn,
  auth_login_success: CheckCircle,
  auth_login_failed: XCircle,
  signup_started: UserPlus,
  signup_completed: CheckCircle,
  signup_failed: XCircle,
  onboarding_started: Users,
  onboarding_completed: CheckCircle,
  onboarding_skipped: AlertTriangle,
  converted: TrendingUp,
};

const FunnelDropoffAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<FunnelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from("funnel_events")
        .select("stage, session_id")
        .gte("created_at", startDate.toISOString());

      if (error) throw error;

      // Count unique sessions per stage
      const stageCounts: Record<string, Set<string>> = {};
      data?.forEach(event => {
        if (!stageCounts[event.stage]) {
          stageCounts[event.stage] = new Set();
        }
        stageCounts[event.stage].add(event.session_id);
      });

      const totalSessions = new Set(data?.map(e => e.session_id) || []).size;

      // Auth flow stages
      const authStages = [
        "landing",
        "auth_page_view",
        "auth_login_attempt",
        "auth_login_success",
        "signup_started",
        "signup_completed",
      ];

      const authFlow: StageData[] = authStages.map((stage, i) => {
        const count = stageCounts[stage]?.size || 0;
        const prevCount = i === 0 ? totalSessions : (stageCounts[authStages[i - 1]]?.size || totalSessions);
        const percentage = totalSessions > 0 ? (count / totalSessions) * 100 : 0;
        const dropoff = prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : 0;
        return { stage, count, percentage, dropoff: i === 0 ? 0 : dropoff };
      });

      // Onboarding flow stages
      const onboardingStages = [
        "onboarding_started",
        "onboarding_step_1",
        "onboarding_step_2",
        "onboarding_step_3",
        "onboarding_step_4",
        "onboarding_step_5",
        "onboarding_step_6",
        "onboarding_step_7",
        "onboarding_completed",
      ];

      const onboardingStartCount = stageCounts["onboarding_started"]?.size || 1;
      const onboardingFlow: StageData[] = onboardingStages.map((stage, i) => {
        const count = stageCounts[stage]?.size || 0;
        const prevCount = i === 0 ? onboardingStartCount : (stageCounts[onboardingStages[i - 1]]?.size || onboardingStartCount);
        const percentage = onboardingStartCount > 0 ? (count / onboardingStartCount) * 100 : 0;
        const dropoff = prevCount > 0 ? ((prevCount - count) / prevCount) * 100 : 0;
        return { stage, count, percentage, dropoff: i === 0 ? 0 : dropoff };
      });

      // Calculate rates
      const signupCompletedCount = stageCounts["signup_completed"]?.size || 0;
      const onboardingCompletedCount = stageCounts["onboarding_completed"]?.size || 0;
      const skippedCount = stageCounts["onboarding_skipped"]?.size || 0;

      const conversionRate = totalSessions > 0 ? (onboardingCompletedCount / totalSessions) * 100 : 0;
      const authDropoffRate = totalSessions > 0 
        ? ((totalSessions - signupCompletedCount - (stageCounts["auth_login_success"]?.size || 0)) / totalSessions) * 100 
        : 0;
      const onboardingDropoffRate = onboardingStartCount > 0 
        ? ((onboardingStartCount - onboardingCompletedCount - skippedCount) / onboardingStartCount) * 100 
        : 0;

      setMetrics({
        authFlow,
        onboardingFlow,
        conversionRate,
        authDropoffRate,
        onboardingDropoffRate,
        totalSessions,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch funnel metrics:", err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const renderFunnelStage = (stage: StageData, index: number, isLast: boolean) => {
    const Icon = STAGE_ICONS[stage.stage] || Users;
    const isDropoffHigh = stage.dropoff > 30;
    const isDropoffCritical = stage.dropoff > 50;

    return (
      <motion.div
        key={stage.stage}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="relative"
      >
        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 border border-border/30">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isDropoffCritical ? "bg-destructive/20 text-destructive" :
            isDropoffHigh ? "bg-warning/20 text-warning" :
            "bg-primary/20 text-primary"
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground truncate">
                {STAGE_LABELS[stage.stage] || stage.stage}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                {stage.count.toLocaleString()} users
              </span>
            </div>
            <Progress value={stage.percentage} className="h-2" />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {stage.percentage.toFixed(1)}% of total
              </span>
              {index > 0 && stage.dropoff > 0 && (
                <span className={`text-xs flex items-center gap-1 ${
                  isDropoffCritical ? "text-destructive" :
                  isDropoffHigh ? "text-warning" :
                  "text-muted-foreground"
                }`}>
                  <TrendingDown className="w-3 h-3" />
                  {stage.dropoff.toFixed(1)}% drop-off
                </span>
              )}
            </div>
          </div>
        </div>
        
        {!isLast && (
          <div className="flex justify-center py-1">
            <ArrowRight className="w-4 h-4 text-muted-foreground/50 rotate-90" />
          </div>
        )}
      </motion.div>
    );
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif text-foreground">User Flow Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Track drop-off points in authentication and onboarding
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border/50 overflow-hidden">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs transition-colors ${
                  timeRange === range 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-medium text-foreground">
                  {metrics?.totalSessions.toLocaleString() || 0}
                </p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                (metrics?.authDropoffRate || 0) > 50 ? "bg-destructive/20" : "bg-warning/20"
              }`}>
                <LogIn className={`w-5 h-5 ${
                  (metrics?.authDropoffRate || 0) > 50 ? "text-destructive" : "text-warning"
                }`} />
              </div>
              <div>
                <p className="text-2xl font-medium text-foreground">
                  {metrics?.authDropoffRate.toFixed(1) || 0}%
                </p>
                <p className="text-xs text-muted-foreground">Auth Drop-off</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                (metrics?.onboardingDropoffRate || 0) > 50 ? "bg-destructive/20" : "bg-warning/20"
              }`}>
                <UserPlus className={`w-5 h-5 ${
                  (metrics?.onboardingDropoffRate || 0) > 50 ? "text-destructive" : "text-warning"
                }`} />
              </div>
              <div>
                <p className="text-2xl font-medium text-foreground">
                  {metrics?.onboardingDropoffRate.toFixed(1) || 0}%
                </p>
                <p className="text-xs text-muted-foreground">Onboarding Drop-off</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-medium text-foreground">
                  {metrics?.conversionRate.toFixed(1) || 0}%
                </p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-serif">Funnel Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="auth" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="auth">Authentication Flow</TabsTrigger>
              <TabsTrigger value="onboarding">Onboarding Flow</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auth" className="space-y-2">
              {metrics?.authFlow.map((stage, i) => 
                renderFunnelStage(stage, i, i === (metrics.authFlow.length - 1))
              )}
            </TabsContent>
            
            <TabsContent value="onboarding" className="space-y-2">
              {metrics?.onboardingFlow.map((stage, i) => 
                renderFunnelStage(stage, i, i === (metrics.onboardingFlow.length - 1))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default FunnelDropoffAnalytics;
