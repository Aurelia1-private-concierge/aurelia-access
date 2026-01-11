import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Search, 
  Download, 
  RefreshCw, 
  User, 
  Clock, 
  Globe,
  Filter,
  Eye,
  FileText,
  UserCheck,
  Settings,
  Bell,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { useAdminAuditLog } from "@/hooks/useAdminAuditLog";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  "admin.user_viewed": <Eye className="h-4 w-4" />,
  "admin.user_list_viewed": <User className="h-4 w-4" />,
  "admin.csv_downloaded": <Download className="h-4 w-4" />,
  "admin.data_exported": <Download className="h-4 w-4" />,
  "admin.partner_approved": <UserCheck className="h-4 w-4" />,
  "admin.partner_rejected": <AlertTriangle className="h-4 w-4" />,
  "admin.trial_approved": <UserCheck className="h-4 w-4" />,
  "admin.trial_rejected": <AlertTriangle className="h-4 w-4" />,
  "admin.settings_changed": <Settings className="h-4 w-4" />,
  "admin.notification_sent": <Bell className="h-4 w-4" />,
  "admin.broadcast_sent": <Bell className="h-4 w-4" />,
  "admin.commission_approved": <DollarSign className="h-4 w-4" />,
  "admin.commission_paid": <DollarSign className="h-4 w-4" />,
  "admin.audit_log_accessed": <FileText className="h-4 w-4" />,
};

const actionLabels: Record<string, string> = {
  "admin.user_viewed": "Viewed User",
  "admin.user_profile_accessed": "Accessed Profile",
  "admin.user_list_viewed": "Viewed User List",
  "admin.user_search": "Searched Users",
  "admin.data_exported": "Exported Data",
  "admin.csv_downloaded": "Downloaded CSV",
  "admin.report_generated": "Generated Report",
  "admin.partner_approved": "Approved Partner",
  "admin.partner_rejected": "Rejected Partner",
  "admin.partner_viewed": "Viewed Partner",
  "admin.partner_list_accessed": "Accessed Partners",
  "admin.contact_viewed": "Viewed Contact",
  "admin.contact_status_changed": "Changed Contact Status",
  "admin.submission_deleted": "Deleted Submission",
  "admin.service_request_viewed": "Viewed Request",
  "admin.service_request_assigned": "Assigned Request",
  "admin.service_request_status_changed": "Changed Request Status",
  "admin.trial_approved": "Approved Trial",
  "admin.trial_rejected": "Rejected Trial",
  "admin.trial_extended": "Extended Trial",
  "admin.commission_approved": "Approved Commission",
  "admin.commission_paid": "Paid Commission",
  "admin.payout_initiated": "Initiated Payout",
  "admin.settings_changed": "Changed Settings",
  "admin.role_granted": "Granted Role",
  "admin.role_revoked": "Revoked Role",
  "admin.notification_sent": "Sent Notification",
  "admin.broadcast_sent": "Sent Broadcast",
  "admin.audit_log_accessed": "Accessed Audit Logs",
  "admin.sensitive_data_accessed": "Accessed Sensitive Data",
  "admin.bulk_action_performed": "Bulk Action",
  // Auth actions
  "login_success": "Login Success",
  "login_failed": "Login Failed",
  "logout": "Logout",
  "signup": "Signup",
  "password_reset_request": "Password Reset Request",
  "password_reset_complete": "Password Reset Complete",
  "mfa_enroll": "MFA Enrolled",
  "mfa_verify": "MFA Verified",
  "session_timeout": "Session Timeout",
};

const severityColors: Record<string, string> = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
};

const getSeverity = (action: string): "high" | "medium" | "low" => {
  if (action.includes("deleted") || action.includes("role") || action.includes("rejected")) {
    return "high";
  }
  if (action.includes("approved") || action.includes("changed") || action.includes("export")) {
    return "medium";
  }
  return "low";
};

const AuditLogsPanel = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const { logAuditLogAccess } = useAdminAuditLog();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      // Filter for admin actions and auth events
      if (actionFilter !== "all") {
        query = query.ilike("action", `%${actionFilter}%`);
      }

      if (resourceFilter !== "all") {
        query = query.eq("resource_type", resourceFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      toast({
        title: "Error",
        description: "Failed to load audit logs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Log that admin accessed audit logs
    logAuditLogAccess();
  }, [actionFilter, resourceFilter]);

  // Apply search filter locally
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(query) ||
      log.resource_type?.toLowerCase().includes(query) ||
      log.resource_id?.toLowerCase().includes(query) ||
      log.ip_address?.toLowerCase().includes(query) ||
      JSON.stringify(log.details)?.toLowerCase().includes(query)
    );
  });

  // Get unique resource types for filter
  const resourceTypes = [...new Set(logs.map((l) => l.resource_type).filter(Boolean))];

  // Stats
  const stats = {
    total: logs.length,
    today: logs.filter((l) => 
      new Date(l.created_at).toDateString() === new Date().toDateString()
    ).length,
    adminActions: logs.filter((l) => l.action?.startsWith("admin.")).length,
    authEvents: logs.filter((l) => 
      l.resource_type === "authentication" || l.action?.includes("login")
    ).length,
  };

  const handleExportCSV = () => {
    const headers = ["Timestamp", "Action", "Resource Type", "Resource ID", "IP Address", "User Agent", "Details"];
    const rows = filteredLogs.map((log) => [
      format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
      log.action,
      log.resource_type,
      log.resource_id || "",
      log.ip_address || "",
      log.user_agent || "",
      JSON.stringify(log.details || {}),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="font-serif text-3xl text-foreground">Audit Logs</h1>
        </div>
        <p className="text-muted-foreground">
          Track all admin actions and sensitive data access for security compliance
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.today}</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Shield className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.adminActions}</p>
                <p className="text-sm text-muted-foreground">Admin Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <User className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.authEvents}</p>
                <p className="text-sm text-muted-foreground">Auth Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Action Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="admin">Admin Actions</SelectItem>
            <SelectItem value="login">Login Events</SelectItem>
            <SelectItem value="export">Exports</SelectItem>
            <SelectItem value="approved">Approvals</SelectItem>
            <SelectItem value="rejected">Rejections</SelectItem>
            <SelectItem value="deleted">Deletions</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            {resourceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Activity Log</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {logs.length} records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead className="w-[120px]">IP Address</TableHead>
                    <TableHead className="w-[80px]">Severity</TableHead>
                    <TableHead className="w-[80px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                        Loading audit logs...
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.slice(0, 100).map((log) => {
                      const severity = getSeverity(log.action);
                      return (
                        <TableRow key={log.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs">
                            <div>{format(new Date(log.created_at), "MMM dd, HH:mm:ss")}</div>
                            <div className="text-muted-foreground">
                              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {actionIcons[log.action] || <FileText className="h-4 w-4" />}
                              <span className="font-medium">
                                {actionLabels[log.action] || log.action}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span className="text-muted-foreground">{log.resource_type}</span>
                              {log.resource_id && (
                                <div className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                                  {log.resource_id}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.ip_address ? (
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3 text-muted-foreground" />
                                {log.ip_address}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={severityColors[severity]}>
                              {severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredLogs.length > 100 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                Showing first 100 of {filteredLogs.length} results
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && (actionIcons[selectedLog.action] || <FileText className="h-5 w-5" />)}
              {selectedLog && (actionLabels[selectedLog.action] || selectedLog.action)}
            </DialogTitle>
            <DialogDescription>
              {selectedLog && format(new Date(selectedLog.created_at), "PPpp")}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Resource Type</p>
                  <p className="font-mono">{selectedLog.resource_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Resource ID</p>
                  <p className="font-mono text-sm break-all">{selectedLog.resource_id || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                  <p className="font-mono">{selectedLog.ip_address || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs break-all">{selectedLog.user_id || "—"}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                <p className="text-xs text-muted-foreground break-all">
                  {selectedLog.user_agent || "—"}
                </p>
              </div>
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Details</p>
                  <pre className="bg-muted/50 rounded-lg p-4 text-xs overflow-auto max-h-64">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogsPanel;
