import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Clock,
  DollarSign,
  Target,
  Play,
  Pause,
  Calendar,
  BarChart3,
  Zap,
  Users,
  RefreshCw,
  Filter,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  FREE_STRATEGIES,
  PAID_STRATEGIES,
  calculateFreeTimeInvestment,
  calculatePaidBudget,
  type StrategyStatus,
} from "@/lib/marketing-strategies";

interface DBStrategy {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string | null;
  channels: string[] | null;
  estimated_hours_weekly: number | null;
  estimated_monthly_budget: number | null;
  target_cpa: number | null;
  expected_roi: string | null;
  expected_results: string | null;
  status: string;
  priority: number | null;
  created_at: string;
}

const StrategyManagementPanel = forwardRef<HTMLDivElement>((_, ref) => {
  const [strategies, setStrategies] = useState<DBStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"free" | "paid">("free");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchStrategies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("marketing_strategies")
        .select("*")
        .order("priority", { ascending: true });

      if (error) throw error;
      setStrategies(data || []);
    } catch (err) {
      console.error("Error fetching strategies:", err);
      // Fallback to static data
      const fallbackData = [...FREE_STRATEGIES, ...PAID_STRATEGIES].map((s, i) => ({
        id: `fallback-${i}`,
        name: s.name,
        type: s.type,
        category: s.category,
        description: s.description,
        channels: s.channels,
        estimated_hours_weekly: s.estimatedHoursWeekly || null,
        estimated_monthly_budget: s.estimatedMonthlyBudget || null,
        target_cpa: s.targetCPA || null,
        expected_roi: s.expectedROI || null,
        expected_results: s.expectedResults,
        status: s.status,
        priority: s.priority,
        created_at: new Date().toISOString(),
      }));
      setStrategies(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  const updateStrategyStatus = async (id: string, newStatus: StrategyStatus) => {
    try {
      const { error } = await supabase
        .from("marketing_strategies")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setStrategies(prev =>
        prev.map(s => (s.id === id ? { ...s, status: newStatus } : s))
      );

      toast({
        title: "Strategy Updated",
        description: `Strategy status changed to ${newStatus}`,
      });
    } catch (err) {
      console.error("Error updating strategy:", err);
      toast({
        title: "Update Failed",
        description: "Could not update strategy status",
        variant: "destructive",
      });
    }
  };

  const freeStrategies = strategies.filter(s => s.type === "free");
  const paidStrategies = strategies.filter(s => s.type === "paid");

  const filteredStrategies = (activeTab === "free" ? freeStrategies : paidStrategies)
    .filter(s => statusFilter === "all" || s.status === statusFilter);

  const totalFreeHours = freeStrategies
    .filter(s => s.status === "active")
    .reduce((sum, s) => sum + (s.estimated_hours_weekly || 0), 0);

  const totalPaidBudget = paidStrategies
    .filter(s => s.status === "active")
    .reduce((sum, s) => sum + (s.estimated_monthly_budget || 0), 0);

  const activeCount = strategies.filter(s => s.status === "active").length;
  const plannedCount = strategies.filter(s => s.status === "planned").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "planned":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "paused":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="w-3 h-3" />;
      case "planned":
        return <Calendar className="w-3 h-3" />;
      case "paused":
        return <Pause className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div ref={ref} className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Strategies</p>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Planned</p>
                <p className="text-2xl font-bold text-foreground">{plannedCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Weekly Hours (Free)</p>
                <p className="text-2xl font-bold text-foreground">{totalFreeHours}h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Monthly Budget</p>
                <p className="text-2xl font-bold text-foreground">${(totalPaidBudget / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Tabs */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Marketing Strategies</CardTitle>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchStrategies}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "free" | "paid")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="free" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Free Strategies ({freeStrategies.length})
              </TabsTrigger>
              <TabsTrigger value="paid" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Paid Strategies ({paidStrategies.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="free" className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-medium">Organic Growth Focus</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  These strategies require time investment but no direct ad spend. 
                  Total active commitment: <strong>{totalFreeHours} hours/week</strong>
                </p>
              </div>

              {filteredStrategies.map((strategy, index) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  index={index}
                  onStatusChange={updateStrategyStatus}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </TabsContent>

            <TabsContent value="paid" className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-medium">Paid Acquisition</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Budget-driven strategies for accelerated growth. 
                  Active monthly budget: <strong>${totalPaidBudget.toLocaleString()}</strong>
                </p>
              </div>

              {filteredStrategies.map((strategy, index) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  index={index}
                  onStatusChange={updateStrategyStatus}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ROI Comparison */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Free vs. Paid Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-emerald-400 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Free Strategies
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time Investment</span>
                  <span>{totalFreeHours} hrs/week</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Monthly Value</span>
                  <span>${(totalFreeHours * 150).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. ROI Timeline</span>
                  <span>3-6 months</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sustainability</span>
                  <span className="text-emerald-400">Long-term compounding</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-amber-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Paid Strategies
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Budget</span>
                  <span>${totalPaidBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Target CPA</span>
                  <span>
                    $
                    {Math.round(
                      paidStrategies
                        .filter(s => s.target_cpa)
                        .reduce((sum, s) => sum + (s.target_cpa || 0), 0) /
                        paidStrategies.filter(s => s.target_cpa).length || 1
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ROI Timeline</span>
                  <span>Immediate - 3 months</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Scalability</span>
                  <span className="text-amber-400">Budget-dependent</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

StrategyManagementPanel.displayName = "StrategyManagementPanel";

interface StrategyCardProps {
  strategy: DBStrategy;
  index: number;
  onStatusChange: (id: string, status: StrategyStatus) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const StrategyCard = ({
  strategy,
  index,
  onStatusChange,
  getStatusColor,
  getStatusIcon,
}: StrategyCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-border/30 rounded-lg p-4 hover:border-border/60 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-medium text-foreground">{strategy.name}</h4>
            <Badge variant="outline" className={getStatusColor(strategy.status)}>
              {getStatusIcon(strategy.status)}
              <span className="ml-1 capitalize">{strategy.status}</span>
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {strategy.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            {strategy.estimated_hours_weekly && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{strategy.estimated_hours_weekly} hrs/week</span>
              </div>
            )}
            {strategy.estimated_monthly_budget && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>${strategy.estimated_monthly_budget.toLocaleString()}/mo</span>
              </div>
            )}
            {strategy.target_cpa && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Target className="w-4 h-4" />
                <span>CPA: ${strategy.target_cpa}</span>
              </div>
            )}
            {strategy.expected_results && (
              <div className="flex items-center gap-1 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span>{strategy.expected_results}</span>
              </div>
            )}
          </div>

          {strategy.channels && strategy.channels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {strategy.channels.map((channel, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {channel}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {strategy.status !== "active" && (
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              onClick={() => onStatusChange(strategy.id, "active")}
            >
              <Play className="w-3 h-3 mr-1" />
              Activate
            </Button>
          )}
          {strategy.status === "active" && (
            <Button
              size="sm"
              variant="outline"
              className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              onClick={() => onStatusChange(strategy.id, "paused")}
            >
              <Pause className="w-3 h-3 mr-1" />
              Pause
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StrategyManagementPanel;
