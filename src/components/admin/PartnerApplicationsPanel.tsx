import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building2, Clock, CheckCircle, XCircle, 
  Search, ChevronDown, ChevronUp, Globe, Mail, Phone,
  ExternalLink, Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAdminAuditLog } from "@/hooks/useAdminAuditLog";

interface PartnerApplication {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  categories: string[];
  description: string | null;
  experience_years: number | null;
  notable_clients: string | null;
  coverage_regions: string[] | null;
  status: string;
  notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  reviewing: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  approved: "bg-green-500/20 text-green-500 border-green-500/30",
  rejected: "bg-red-500/20 text-red-500 border-red-500/30",
};

const categoryLabels: Record<string, string> = {
  private_aviation: "Private Aviation",
  yacht_charter: "Yacht Charter",
  real_estate: "Real Estate",
  dining: "Fine Dining",
  chauffeur: "Chauffeur",
  security: "Security",
  events_access: "VIP Events",
  wellness: "Wellness",
  travel: "Travel",
  shopping: "Shopping",
  collectibles: "Collectibles",
};

const PartnerApplicationsPanel = () => {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { logPartnerAction, logListAccess, logDataAccess } = useAdminAuditLog();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("partner_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications((data as PartnerApplication[]) || []);
      
      // Log access to partner applications list
      logListAccess("partner_application", { filter: statusFilter }, data?.length || 0);
    } catch (err) {
      console.error("Error fetching applications:", err);
      toast({ title: "Error", description: "Failed to load applications.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter((a) => {
    const matchesSearch =
      a.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from("partner_applications")
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus, reviewed_at: new Date().toISOString() } : a))
      );
      toast({ title: "Status Updated", description: `Application marked as ${newStatus}` });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const handleReview = async (newStatus: "approved" | "rejected") => {
    if (!selectedApp) return;

    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from("partner_applications")
        .update({
          status: newStatus,
          notes: reviewNotes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedApp.id);

      if (error) throw error;

      // Log the partner action
      logPartnerAction(newStatus, selectedApp.id, reviewNotes || undefined);

      toast({ 
        title: newStatus === "approved" ? "Application Approved" : "Application Rejected", 
        description: `${selectedApp.company_name} has been ${newStatus}.` 
      });
      setReviewDialogOpen(false);
      setSelectedApp(null);
      setReviewNotes("");
      fetchApplications();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update application.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, contact, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48 bg-card border-border/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchApplications}>
          Refresh
        </Button>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading applications...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No applications found</div>
        ) : (
          filteredApplications.map((app) => (
            <Collapsible
              key={app.id}
              open={expandedId === app.id}
              onOpenChange={(open) => setExpandedId(open ? app.id : null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/50 rounded-lg overflow-hidden"
              >
                <CollapsibleTrigger asChild>
                  <div className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={statusColors[app.status]}>
                            {app.status}
                          </Badge>
                          {app.experience_years && (
                            <span className="text-xs text-muted-foreground">
                              {app.experience_years} years exp.
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-foreground">{app.company_name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{app.contact_name}</span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {app.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(app.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {expandedId === app.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 border-t border-border/30 pt-4 space-y-4">
                    {/* Categories */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Service Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {app.categories.map((cat) => (
                          <Badge key={cat} variant="secondary">
                            {categoryLabels[cat] || cat}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    {app.description && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">About</h4>
                        <p className="text-foreground">{app.description}</p>
                      </div>
                    )}

                    {/* Contact & Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        {app.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{app.phone}</span>
                          </div>
                        )}
                        {app.website && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <a 
                              href={app.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {app.website}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {app.coverage_regions && app.coverage_regions.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">Coverage: </span>
                            <span className="text-sm text-foreground">{app.coverage_regions.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notable Clients */}
                    {app.notable_clients && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Notable Clients</h4>
                        <p className="text-foreground text-sm">{app.notable_clients}</p>
                      </div>
                    )}

                    {/* Internal Notes */}
                    {app.notes && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-amber-500 mb-2">Review Notes</h4>
                        <p className="text-foreground text-sm">{app.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {app.status === "pending" || app.status === "reviewing" ? (
                        <>
                          <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              setSelectedApp(app);
                              setReviewNotes(app.notes || "");
                              setReviewDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Review & Decide
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleStatusChange(app.id, "reviewing")}
                          >
                            Mark as Reviewing
                          </Button>
                        </>
                      ) : (
                        <Select
                          value={app.status}
                          onValueChange={(value) => handleStatusChange(app.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewing">Reviewing</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => window.open(`mailto:${app.email}`, "_blank")}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </motion.div>
            </Collapsible>
          ))
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              {selectedApp?.company_name} - {selectedApp?.contact_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Review Notes</label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes about this application..."
                rows={4}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleReview("rejected")} 
              disabled={isSubmitting}
              className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={() => handleReview("approved")} 
              disabled={isSubmitting} 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerApplicationsPanel;