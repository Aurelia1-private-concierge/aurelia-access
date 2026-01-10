import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Mail,
  Phone,
  Building2,
  Calendar,
  Eye,
  Play,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { toast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";

interface TrialApplication {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  company: string | null;
  phone: string | null;
  referral_source: string | null;
  annual_income_range: string | null;
  interests: string[];
  reason: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  trial_starts_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500",
  approved: "bg-emerald-500/10 text-emerald-500",
  rejected: "bg-rose-500/10 text-rose-500",
  converted: "bg-purple-500/10 text-purple-500",
  expired: "bg-muted text-muted-foreground",
};

const interestLabels: Record<string, string> = {
  aviation: "Private Aviation",
  yachts: "Yacht Charters",
  real_estate: "Real Estate",
  collectibles: "Collectibles",
  events: "Events",
  travel: "Travel",
};

const TrialApplicationsPanel = () => {
  const [applications, setApplications] = useState<TrialApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<TrialApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("trial_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedApp) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updates: any = {
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes || null,
      };

      if (status === "approved") {
        const startDate = new Date();
        const endDate = addDays(startDate, 7);
        updates.trial_starts_at = startDate.toISOString();
        updates.trial_ends_at = endDate.toISOString();
      }

      const { error } = await supabase
        .from("trial_applications")
        .update(updates)
        .eq("id", selectedApp.id);

      if (error) throw error;

      toast({
        title: status === "approved" ? "Trial Approved" : "Application Rejected",
        description: status === "approved" 
          ? `7-day trial activated for ${selectedApp.full_name}`
          : `Application rejected for ${selectedApp.full_name}`,
      });

      setDialogOpen(false);
      setSelectedApp(null);
      setReviewNotes("");
      fetchApplications();
    } catch (error) {
      console.error("Error updating application:", error);
      toast({ title: "Error", description: "Failed to update application", variant: "destructive" });
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    converted: applications.filter((a) => a.status === "converted").length,
  };

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Active Trials</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.converted}</p>
                <p className="text-sm text-muted-foreground">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-card/50 border-border/30">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Interests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{app.full_name}</p>
                      {app.company && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {app.company}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {app.email}
                      </p>
                      {app.phone && (
                        <p className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {app.phone}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {app.interests.slice(0, 2).map((i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {interestLabels[i] || i}
                        </Badge>
                      ))}
                      {app.interests.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{app.interests.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[app.status]}>{app.status}</Badge>
                    {app.status === "approved" && app.trial_ends_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Ends {format(new Date(app.trial_ends_at), "MMM d")}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(app.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedApp(app);
                          setDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {app.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setDialogOpen(true);
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" /> Review
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>Trial Application Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Applicant Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedApp.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedApp.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{selectedApp.company || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Income Range</p>
                    <p className="font-medium">{selectedApp.annual_income_range || "-"}</p>
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.interests.map((i) => (
                      <Badge key={i}>{interestLabels[i] || i}</Badge>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                {selectedApp.reason && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Why they're interested</p>
                    <p className="text-sm bg-muted/20 p-3 rounded-lg">{selectedApp.reason}</p>
                  </div>
                )}

                {/* Review Notes */}
                {selectedApp.status === "pending" && (
                  <div>
                    <label className="text-sm font-medium">Review Notes (optional)</label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add internal notes about this application..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Existing review */}
                {selectedApp.review_notes && selectedApp.status !== "pending" && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Review Notes</p>
                    <p className="text-sm bg-muted/20 p-3 rounded-lg">{selectedApp.review_notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                {selectedApp.status === "pending" ? (
                  <>
                    <Button variant="outline" onClick={() => handleReview("rejected")}>
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                    <Button onClick={() => handleReview("approved")}>
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve Trial
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Close
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrialApplicationsPanel;
