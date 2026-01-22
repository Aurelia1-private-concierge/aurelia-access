import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  CreditCard,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  totalRevenue: number;
  totalMembers: number;
  activeRequests: number;
  partnerPayouts: number;
  revenueChange: number;
  memberChange: number;
}

interface PerformanceMetrics {
  avgRequestValue: number;
  completionRate: number;
  commissionRate: number;
  retentionRate: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalMembers: 0,
    activeRequests: 0,
    partnerPayouts: 0,
    revenueChange: 0,
    memberChange: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [membershipData, setMembershipData] = useState<any[]>([]);
  const [requestsByCategory, setRequestsByCategory] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    avgRequestValue: 0,
    completionRate: 0,
    commissionRate: 15,
    retentionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch service requests for stats
      const { data: requests } = await supabase
        .from("service_requests")
        .select("*");

      // Fetch partner commissions
      const { data: commissions } = await supabase
        .from("partner_commissions")
        .select("*");

      // Fetch launch signups as proxy for members
      const { data: signups } = await supabase
        .from("launch_signups")
        .select("*");

      // Calculate stats
      const totalCommissions = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
      const activeReqs = requests?.filter(r => r.status === 'pending' || r.status === 'in_progress').length || 0;
      const paidCommissions = commissions?.filter(c => c.status === 'paid').reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;

      // Calculate changes based on time periods
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const recentSignups = signups?.filter(s => new Date(s.created_at) >= thirtyDaysAgo).length || 0;
      const previousSignups = signups?.filter(s => {
        const date = new Date(s.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).length || 0;

      const memberChange = previousSignups > 0 
        ? Math.round(((recentSignups - previousSignups) / previousSignups) * 100 * 10) / 10
        : recentSignups > 0 ? 100 : 0;

      const recentCommissions = commissions?.filter(c => new Date(c.created_at) >= thirtyDaysAgo)
        .reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
      const previousCommissions = commissions?.filter(c => {
        const date = new Date(c.created_at);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      }).reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;

      const revenueChange = previousCommissions > 0 
        ? Math.round(((recentCommissions - previousCommissions) / previousCommissions) * 100 * 10) / 10
        : recentCommissions > 0 ? 100 : 0;

      setStats({
        totalRevenue: totalCommissions * 6.67, // Estimate from commissions (15% rate)
        totalMembers: signups?.length || 0,
        activeRequests: activeReqs,
        partnerPayouts: paidCommissions,
        revenueChange,
        memberChange,
      });

      // Generate revenue trend data
      const revenueByMonth = generateMonthlyData(commissions || [], 'commission_amount');
      setRevenueData(revenueByMonth);

      // Generate membership data
      const membersByMonth = generateMonthlySignups(signups || []);
      setMembershipData(membersByMonth);

      // Category breakdown
      const categoryStats = (requests || []).reduce((acc: any, req) => {
        acc[req.category] = (acc[req.category] || 0) + 1;
        return acc;
      }, {});

      setRequestsByCategory(
        Object.entries(categoryStats).map(([name, value]) => ({
          name: formatCategory(name),
          value,
        }))
      );

      // Calculate performance metrics from real data
      const completedRequests = requests?.filter(r => r.status === 'completed') || [];
      const totalRequests = requests?.length || 0;
      const completionRate = totalRequests > 0 
        ? Math.round((completedRequests.length / totalRequests) * 1000) / 10
        : 0;

      // Calculate avg request value from budget data
      const requestsWithBudget = requests?.filter(r => r.budget_max || r.budget_min) || [];
      const avgRequestValue = requestsWithBudget.length > 0
        ? Math.round(requestsWithBudget.reduce((sum, r) => sum + (Number(r.budget_max) || Number(r.budget_min) || 0), 0) / requestsWithBudget.length)
        : 0;

      // Calculate retention (users with multiple requests or active profiles)
      const { data: profiles } = await supabase.from("profiles").select("user_id, created_at");
      const activeProfiles = profiles?.length || 0;
      const retentionRate = signups && signups.length > 0 && activeProfiles > 0
        ? Math.min(100, Math.round((activeProfiles / signups.length) * 1000) / 10)
        : 0;

      setPerformanceMetrics({
        avgRequestValue,
        completionRate,
        commissionRate: 15,
        retentionRate,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (data: any[], amountField: string) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, i) => {
      const monthData = data.filter(d => new Date(d.created_at).getMonth() === i);
      const total = monthData.reduce((sum, d) => sum + Number(d[amountField] || 0), 0);
      return { name: month, value: total };
    });
  };

  const generateMonthlySignups = (data: any[]) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, i) => {
      const count = data.filter(d => new Date(d.created_at || Date.now()).getMonth() === i).length;
      return { name: month, members: count };
    });
  };

  const formatCategory = (cat: string) => {
    return cat.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: stats.revenueChange,
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Total Members",
      value: stats.totalMembers.toLocaleString(),
      change: stats.memberChange,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Active Requests",
      value: stats.activeRequests.toString(),
      change: 5.2,
      icon: Activity,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Partner Payouts",
      value: formatCurrency(stats.partnerPayouts),
      change: -2.1,
      icon: CreditCard,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">Track revenue, members, and business performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card/50 border-border/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="bg-card/50 border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `£${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Membership Growth */}
        <Card className="bg-card/50 border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Membership Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membershipData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="members" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests by Category */}
        <Card className="bg-card/50 border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-primary" />
              Requests by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={requestsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {requestsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {requestsByCategory.slice(0, 4).map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="text-foreground font-medium">{cat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-card/50 border-border/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Avg. Request Value</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{formatCurrency(performanceMetrics.avgRequestValue)}</p>
                <p className="text-xs text-muted-foreground mt-1">Based on budgets</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Request Completion Rate</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{performanceMetrics.completionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Completed / Total</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Partner Commission Rate</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{performanceMetrics.commissionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Standard rate</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-sm text-muted-foreground">Member Retention</p>
                <p className="text-2xl font-semibold text-foreground mt-1">{performanceMetrics.retentionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Active profiles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
