import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, RefreshCw, Eye, MessageSquare, Calendar, DollarSign, Tag, User, Gavel, Loader2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  budget_min: number | null;
  budget_max: number | null;
  preferred_date: string | null;
  partner_response: string | null;
  internal_notes: string | null;
  client_id: string;
  created_at: string;
  updated_at: string;
  bidding_enabled: boolean;
  bidding_deadline: string | null;
  bid_count?: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  accepted: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  in_progress: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const categoryLabels: Record<string, string> = {
  private_aviation: "Private Aviation",
  yacht_charter: "Yacht Charter",
  real_estate: "Real Estate",
  collectibles: "Collectibles",
  events_access: "Events Access",
  security: "Security",
  dining: "Dining",
  travel: "Travel",
  wellness: "Wellness",
  shopping: "Shopping",
};

const ServiceRequestsPanel = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [togglingBidding, setTogglingBidding] = useState(false);
  const [triggeringAI, setTriggeringAI] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Get bid counts
      const requestIds = data?.map(r => r.id) || [];
      const { data: bidCounts } = await supabase
        .from("service_request_bids")
        .select("service_request_id")
        .in("service_request_id", requestIds);

      const bidCountMap: Record<string, number> = {};
      bidCounts?.forEach(b => {
        bidCountMap[b.service_request_id] = (bidCountMap[b.service_request_id] || 0) + 1;
      });

      setRequests((data || []).map(r => ({
        ...r,
        bid_count: bidCountMap[r.id] || 0,
      })));
    } catch (err) {
      console.error("Error fetching service requests:", err);
      toast({
        title: "Error",
        description: "Failed to load service requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBidding = async (requestId: string, enabled: boolean) => {
    setTogglingBidding(true);
    try {
      const updates: any = { bidding_enabled: enabled };
      if (enabled && !selectedRequest?.bidding_deadline) {
        // Set default deadline to 3 days from now
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 3);
        updates.bidding_deadline = deadline.toISOString();
      }

      const { error } = await supabase
        .from("service_requests")
        .update(updates)
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: enabled ? "Partner Bidding Enabled" : "Bidding Disabled",
        description: enabled ? "Partners can now submit bids for this request." : "Bidding has been disabled.",
      });

      fetchRequests();
      if (selectedRequest) {
        setSelectedRequest({ ...selectedRequest, bidding_enabled: enabled });
      }
    } catch (err) {
      console.error("Error toggling bidding:", err);
      toast({
        title: "Error",
        description: "Failed to update bidding status.",
        variant: "destructive",
      });
    } finally {
      setTogglingBidding(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      searchQuery === "" ||
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || req.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleViewDetails = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setInternalNotes(request.internal_notes || "");
    setDetailsOpen(true);
  };

  const handleUpdateStatus = async (newStatus: "pending" | "accepted" | "in_progress" | "completed" | "cancelled") => {
    if (!selectedRequest) return;
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ 
          status: newStatus,
          internal_notes: internalNotes,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({ title: "Updated", description: `Request status changed to ${newStatus}` });
      setDetailsOpen(false);
      fetchRequests();
    } catch (err) {
      console.error("Error updating request:", err);
      toast({
        title: "Error",
        description: "Failed to update request.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    inProgress: requests.filter((r) => r.status === "in_progress" || r.status === "accepted").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total Requests</p>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <p className="text-2xl font-semibold text-amber-500">{stats.pending}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <p className="text-2xl font-semibold text-purple-500">{stats.inProgress}</p>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <p className="text-2xl font-semibold text-emerald-500">{stats.completed}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40 bg-card border-border/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48 bg-card border-border/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchRequests} className="border-border/50">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border/50 rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bidding</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading requests...
                </TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No service requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id} className="border-border/30">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{request.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {request.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[request.category] || request.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[request.status] || ""}>
                      {request.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.bidding_enabled ? (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        <Gavel className="w-3 h-3 mr-1" />
                        {request.bid_count || 0} bids
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {request.budget_min || request.budget_max
                      ? `$${request.budget_min?.toLocaleString() || "0"} - $${request.budget_max?.toLocaleString() || "∞"}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(request.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              {selectedRequest?.title}
            </DialogTitle>
            <DialogDescription>
              Service request details and management
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Category
                  </p>
                  <p className="text-sm font-medium">
                    {categoryLabels[selectedRequest.category] || selectedRequest.category}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Preferred Date
                  </p>
                  <p className="text-sm font-medium">
                    {selectedRequest.preferred_date
                      ? format(new Date(selectedRequest.preferred_date), "PPP")
                      : "Not specified"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Budget Range
                  </p>
                  <p className="text-sm font-medium">
                    {selectedRequest.budget_min || selectedRequest.budget_max
                      ? `$${selectedRequest.budget_min?.toLocaleString() || "0"} - $${selectedRequest.budget_max?.toLocaleString() || "∞"}`
                      : "Not specified"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Status
                  </p>
                  <Badge className={statusColors[selectedRequest.status] || ""}>
                    {selectedRequest.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm bg-secondary/30 p-3 rounded-lg">
                  {selectedRequest.description}
                </p>
              </div>

              {selectedRequest.partner_response && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> Partner Response
                  </p>
                  <p className="text-sm bg-primary/5 border border-primary/20 p-3 rounded-lg">
                    {selectedRequest.partner_response}
                  </p>
                </div>
              )}

              {/* Partner Bidding Section */}
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gavel className="h-4 w-4 text-primary" />
                    <Label htmlFor="bidding-toggle" className="font-medium">Partner Bidding</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    {togglingBidding && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Switch
                      id="bidding-toggle"
                      checked={selectedRequest.bidding_enabled || false}
                      onCheckedChange={(checked) => toggleBidding(selectedRequest.id, checked)}
                      disabled={togglingBidding || selectedRequest.status === "completed"}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedRequest.bidding_enabled 
                    ? `Bidding is open. ${selectedRequest.bid_count || 0} bid(s) received.`
                    : "Enable bidding to allow partners to submit competitive quotes."}
                </p>
                {selectedRequest.bidding_enabled && selectedRequest.bidding_deadline && (
                  <p className="text-xs text-muted-foreground">
                    Deadline: {format(new Date(selectedRequest.bidding_deadline), "PPP 'at' p")}
                  </p>
                )}
                
                {/* AI Partner Matching Button */}
                {selectedRequest.bidding_enabled && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2 border-primary/30 hover:bg-primary/10"
                        disabled={triggeringAI}
                        onClick={async () => {
                          setTriggeringAI(true);
                          try {
                            const { data, error } = await supabase.functions.invoke("ai-partner-matching", {
                              body: { service_request_id: selectedRequest.id },
                            });
                            if (error) throw error;
                            toast({
                              title: "Partners Recommended",
                              description: `${data.recommendations_created} partners have been notified about this opportunity.`,
                            });
                            fetchRequests();
                          } catch (err) {
                            console.error("AI matching error:", err);
                            toast({
                              title: "Error",
                              description: "Failed to find matching partners.",
                              variant: "destructive",
                            });
                          } finally {
                            setTriggeringAI(false);
                          }
                        }}
                      >
                        {triggeringAI ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Find Matching Partners (AI)
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Use AI to find and notify the best-fit partners for this request</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Internal Notes (Admin Only)</p>
                <Textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  className="bg-card border-border/50"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Select
              defaultValue={selectedRequest?.status}
              onValueChange={handleUpdateStatus}
              disabled={updatingStatus}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceRequestsPanel;
