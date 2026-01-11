import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Mail, Phone, Send, Search, Download, Trash2, Check, X, RefreshCw, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Logo } from "@/components/brand";
import ZapierSettings from "@/components/admin/ZapierSettings";
import BroadcastNotifications from "@/components/admin/BroadcastNotifications";
import ContactSubmissionsPanel from "@/components/admin/ContactSubmissionsPanel";
import ServiceRequestsPanel from "@/components/admin/ServiceRequestsPanel";
import ConciergeRequestsPanel from "@/components/admin/ConciergeRequestsPanel";
import PartnerApplicationsPanel from "@/components/admin/PartnerApplicationsPanel";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";
import CampaignAnalytics from "@/components/admin/CampaignAnalytics";
import ABTestingPanel from "@/components/admin/ABTestingPanel";
import CRMPanel from "@/components/admin/CRMPanel";
import CommissionTracker from "@/components/admin/CommissionTracker";
import TrialApplicationsPanel from "@/components/admin/TrialApplicationsPanel";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LaunchSignup {
  id: string;
  email: string | null;
  phone: string | null;
  country_code: string | null;
  notification_preference: string;
  source: string | null;
  verified: boolean;
  notification_sent_at: string | null;
  created_at: string;
}

const Admin = () => {
  const { user } = useAuth();
  const [signups, setSignups] = useState<LaunchSignup[]>([]);
  const [filteredSignups, setFilteredSignups] = useState<LaunchSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [preferenceFilter, setPreferenceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(
    "Aurelia Private Concierge is now live. Your journey into extraordinary begins: www.aurelia-privateconcierge.com"
  );

  // Fetch signups
  const fetchSignups = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("launch_signups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSignups(data || []);
    } catch (err) {
      console.error("Error fetching signups:", err);
      toast({
        title: "Error",
        description: "Failed to load signups.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignups();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = signups;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.email?.toLowerCase().includes(query) ||
          s.phone?.toLowerCase().includes(query)
      );
    }

    // Preference filter
    if (preferenceFilter !== "all") {
      result = result.filter((s) => s.notification_preference === preferenceFilter);
    }

    // Status filter
    if (statusFilter === "sent") {
      result = result.filter((s) => s.notification_sent_at !== null);
    } else if (statusFilter === "pending") {
      result = result.filter((s) => s.notification_sent_at === null);
    }

    setFilteredSignups(result);
  }, [signups, searchQuery, preferenceFilter, statusFilter]);

  // Stats
  const stats = {
    total: signups.length,
    emailOnly: signups.filter((s) => s.notification_preference === "email").length,
    smsOnly: signups.filter((s) => s.notification_preference === "sms").length,
    both: signups.filter((s) => s.notification_preference === "both").length,
    pending: signups.filter((s) => !s.notification_sent_at).length,
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSignups.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSignups.map((s) => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Get selected signups breakdown
  const getSelectedBreakdown = () => {
    const selected = signups.filter((s) => selectedIds.has(s.id));
    return {
      email: selected.filter((s) => s.notification_preference === "email" || s.notification_preference === "both").length,
      sms: selected.filter((s) => s.notification_preference === "sms" || s.notification_preference === "both").length,
      total: selected.length,
    };
  };

  // Send notifications
  const handleSendNotifications = async () => {
    if (selectedIds.size === 0) return;
    
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-launch-notifications", {
        body: {
          signupIds: Array.from(selectedIds),
          message: notificationMessage,
        },
      });

      if (error) throw error;

      toast({
        title: "Notifications Sent",
        description: `Successfully sent ${data.sent} notifications.`,
      });

      setSendDialogOpen(false);
      setSelectedIds(new Set());
      fetchSignups();
    } catch (err) {
      console.error("Error sending notifications:", err);
      toast({
        title: "Error",
        description: "Failed to send notifications. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  // Delete selected
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    try {
      const { error } = await supabase
        .from("launch_signups")
        .delete()
        .in("id", Array.from(selectedIds));

      if (error) throw error;

      toast({
        title: "Deleted",
        description: `Removed ${selectedIds.size} signup(s).`,
      });

      setDeleteDialogOpen(false);
      setSelectedIds(new Set());
      fetchSignups();
    } catch (err) {
      console.error("Error deleting signups:", err);
      toast({
        title: "Error",
        description: "Failed to delete signups.",
        variant: "destructive",
      });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Email", "Phone", "Country Code", "Preference", "Source", "Created At", "Status"];
    const rows = filteredSignups.map((s) => [
      s.email || "",
      s.phone || "",
      s.country_code || "",
      s.notification_preference,
      s.source || "",
      format(new Date(s.created_at), "yyyy-MM-dd HH:mm"),
      s.notification_sent_at ? "Sent" : "Pending",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `launch-signups-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const breakdown = getSelectedBreakdown();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <div className="h-8 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-serif text-lg text-foreground">Admin Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Encrypted Session Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-card border border-border/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="abtesting">A/B Tests</TabsTrigger>
            <TabsTrigger value="trials">Trials</TabsTrigger>
            <TabsTrigger value="concierge">Concierge</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="signups">Signups</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="trials" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-serif text-3xl text-foreground mb-2">Trial Applications</h1>
              <p className="text-muted-foreground">Review and approve 7-day trial applications</p>
            </motion.div>
            <TrialApplicationsPanel />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <CampaignAnalytics />
          </TabsContent>

          <TabsContent value="abtesting" className="space-y-6">
            <ABTestingPanel />
          </TabsContent>

          <TabsContent value="crm" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-serif text-3xl text-foreground mb-2">Client Relationship Management</h1>
              <p className="text-muted-foreground">Track client preferences, notes, and interactions</p>
            </motion.div>
            <CRMPanel />
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-serif text-3xl text-foreground mb-2">Commission Tracking</h1>
              <p className="text-muted-foreground">Manage partner commissions and payouts</p>
            </motion.div>
            <CommissionTracker />
          </TabsContent>

          <TabsContent value="concierge" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-serif text-3xl text-foreground mb-2">Concierge Requests</h1>
              <p className="text-muted-foreground">Handle client requests manually as the concierge</p>
            </motion.div>
            <ConciergeRequestsPanel />
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-serif text-3xl text-foreground mb-2">Partner Applications</h1>
              <p className="text-muted-foreground">Review and approve partner recruitment applications</p>
            </motion.div>
            <PartnerApplicationsPanel />
          </TabsContent>

          <TabsContent value="signups" className="space-y-6">
            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-serif text-3xl text-foreground mb-2">Launch Signups</h1>
              <p className="text-muted-foreground">Manage email and SMS notification subscribers</p>
            </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="bg-card border border-border/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.emailOnly}</p>
                <p className="text-sm text-muted-foreground">Email Only</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Phone className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.smsOnly}</p>
                <p className="text-sm text-muted-foreground">SMS Only</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Send className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.both}</p>
                <p className="text-sm text-muted-foreground">Both</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <RefreshCw className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Filters & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/50"
            />
          </div>
          <Select value={preferenceFilter} onValueChange={setPreferenceFilter}>
            <SelectTrigger className="w-full md:w-40 bg-card border-border/50">
              <SelectValue placeholder="Preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Preferences</SelectItem>
              <SelectItem value="email">Email Only</SelectItem>
              <SelectItem value="sms">SMS Only</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-card border-border/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="border-border/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={selectedIds.size === 0}
              className="border-border/50 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button
              onClick={() => setSendDialogOpen(true)}
              disabled={selectedIds.size === 0}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Send ({selectedIds.size})
            </Button>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-border/50 rounded-lg overflow-hidden bg-card"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === filteredSignups.length && filteredSignups.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Preference</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading signups...
                  </TableCell>
                </TableRow>
              ) : filteredSignups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No signups found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSignups.map((signup) => (
                  <TableRow key={signup.id} className="border-border/30">
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(signup.id)}
                        onCheckedChange={() => toggleSelect(signup.id)}
                      />
                    </TableCell>
                    <TableCell className="text-foreground">
                      {signup.email || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {signup.phone ? (
                        `${signup.country_code || ""} ${signup.phone}`
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          signup.notification_preference === "email"
                            ? "border-blue-500/50 text-blue-500"
                            : signup.notification_preference === "sms"
                            ? "border-green-500/50 text-green-500"
                            : "border-purple-500/50 text-purple-500"
                        }
                      >
                        {signup.notification_preference}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {signup.source?.replace("_", " ") || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(signup.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {signup.notification_sent_at ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                          <Check className="h-3 w-3 mr-1" />
                          Sent
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>

            {/* Pagination info */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredSignups.length} of {signups.length} signups
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <ContactSubmissionsPanel />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-serif text-3xl text-foreground mb-2">Service Requests</h1>
              <p className="text-muted-foreground">Manage client service requests and bookings</p>
            </motion.div>
            <ServiceRequestsPanel />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-serif text-3xl text-foreground mb-2">Integrations</h1>
              <p className="text-muted-foreground">Manage external service connections</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-6">
              <ZapierSettings />
              <BroadcastNotifications />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Send Notification Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Send Notifications</DialogTitle>
            <DialogDescription>
              Send launch notifications to {breakdown.total} selected subscriber(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span>{breakdown.email} email</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                <span>{breakdown.sms} SMS</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                className="w-full h-24 px-3 py-2 bg-background border border-border/50 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotifications} disabled={sending}>
              {sending ? "Sending..." : "Send Notifications"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Signups</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} signup(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
