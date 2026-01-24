import { useState, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Crown, 
  Flame, 
  ThermometerSun, 
  Mail, 
  Clock, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Target,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getVIPAlerts, updateVIPAlertStatus, getVIPStats, VIPAlert } from "@/lib/vip-detection";
import { LeadScoreIndicator } from "./LeadScoreIndicator";
import { useToast } from "@/hooks/use-toast";

const VIPLeadsPanel = forwardRef<HTMLDivElement>((props, ref) => {
  const [alerts, setAlerts] = useState<VIPAlert[]>([]);
  const [stats, setStats] = useState({ totalVIPs: 0, newAlerts: 0, converted: 0, avgScore: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<VIPAlert | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [alertsData, statsData] = await Promise.all([
        getVIPAlerts(),
        getVIPStats(),
      ]);
      setAlerts(alertsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch VIP data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (status: VIPAlert["status"]) => {
    if (!selectedAlert) return;
    
    const success = await updateVIPAlertStatus(selectedAlert.id, status, notes);
    if (success) {
      toast({
        title: "Status Updated",
        description: `Lead marked as ${status}`,
      });
      setSelectedAlert(null);
      setNotes("");
      fetchData();
    } else {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getAlertIcon = (alertType: VIPAlert["alert_type"]) => {
    switch (alertType) {
      case "ultra_high_intent":
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case "high_intent":
        return <Flame className="w-5 h-5 text-red-500" />;
      default:
        return <ThermometerSun className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: VIPAlert["status"]) => {
    const variants: Record<VIPAlert["status"], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      new: { variant: "default", label: "New" },
      contacted: { variant: "secondary", label: "Contacted" },
      converted: { variant: "outline", label: "Converted" },
      dismissed: { variant: "destructive", label: "Dismissed" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div ref={ref} className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total VIPs", value: stats.totalVIPs, icon: Users, color: "text-primary" },
          { label: "New Alerts", value: stats.newAlerts, icon: Zap, color: "text-yellow-500" },
          { label: "Converted", value: stats.converted, icon: Target, color: "text-green-500" },
          { label: "Avg Score", value: stats.avgScore, icon: TrendingUp, color: "text-blue-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                  </div>
                  <stat.icon className={cn("w-8 h-8 opacity-50", stat.color)} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Alerts List */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            VIP Leads
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <Crown className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No VIP leads detected yet</p>
              <p className="text-sm text-muted-foreground/70">High-value visitors will appear here automatically</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/50",
                      alert.status === "new" 
                        ? "bg-primary/5 border-primary/30" 
                        : "bg-muted/30 border-border/50"
                    )}
                    onClick={() => {
                      setSelectedAlert(alert);
                      setNotes(alert.notes || "");
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-full bg-background/50">
                          {getAlertIcon(alert.alert_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium capitalize">
                              {alert.alert_type.replace(/_/g, " ")}
                            </span>
                            {getStatusBadge(alert.status)}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            {alert.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {alert.email}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimeAgo(alert.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <LeadScoreIndicator 
                          score={alert.score} 
                          breakdown={alert.signals as Record<string, number>}
                          compact 
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && getAlertIcon(selectedAlert.alert_type)}
              VIP Lead Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <LeadScoreIndicator 
                score={selectedAlert.score}
                breakdown={selectedAlert.signals as Record<string, number>}
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  rows={3}
                />
              </div>
              
              {selectedAlert.email && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Contact Email</p>
                  <p className="font-medium">{selectedAlert.email}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("dismissed")}
              className="flex-1 sm:flex-none"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Dismiss
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleStatusUpdate("contacted")}
              className="flex-1 sm:flex-none"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contacted
            </Button>
            <Button
              onClick={() => handleStatusUpdate("converted")}
              className="flex-1 sm:flex-none"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Converted
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

VIPLeadsPanel.displayName = "VIPLeadsPanel";

export default VIPLeadsPanel;