import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Inbox, Clock, CheckCircle, XCircle, MessageSquare, 
  User, Mail, Calendar, MapPin, DollarSign, Search,
  ChevronDown, ChevronUp, Send, AlertCircle
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

interface ConciergeRequest {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  guest_name: string | null;
  category: string;
  title: string;
  description: string;
  budget_range: string | null;
  preferred_date: string | null;
  location: string | null;
  status: string;
  priority: string;
  internal_notes: string | null;
  response: string | null;
  responded_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  in_progress: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  pending_response: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  completed: "bg-green-500/20 text-green-500 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-500 border-red-500/30",
};

const priorityColors: Record<string, string> = {
  low: "text-muted-foreground",
  normal: "text-foreground",
  high: "text-amber-500",
  urgent: "text-red-500",
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
  general: "General",
};

const ConciergeRequestsPanel = () => {
  const [requests, setRequests] = useState<ConciergeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ConciergeRequest | null>(null);
  const [responseText, setResponseText] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("concierge_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests((data as ConciergeRequest[]) || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      toast({ title: "Error", description: "Failed to load requests.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.guest_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.guest_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    new: requests.filter((r) => r.status === "new").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from("concierge_requests")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      toast({ title: "Status Updated", description: `Request marked as ${newStatus}` });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
    }
  };

  const handleRespond = async () => {
    if (!selectedRequest || !responseText.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from("concierge_requests")
        .update({
          response: responseText,
          internal_notes: internalNotes || null,
          responded_at: new Date().toISOString(),
          status: "pending_response",
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({ title: "Response Saved", description: "Your response has been recorded." });
      setRespondDialogOpen(false);
      setSelectedRequest(null);
      setResponseText("");
      setInternalNotes("");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to save response.", variant: "destructive" });
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
              <Inbox className="h-5 w-5 text-primary" />
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
              <AlertCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.new}</p>
              <p className="text-sm text-muted-foreground">New</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.in_progress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, email, or name..."
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
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending_response">Pending Response</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchRequests}>
          Refresh
        </Button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No requests found</div>
        ) : (
          filteredRequests.map((request) => (
            <Collapsible
              key={request.id}
              open={expandedId === request.id}
              onOpenChange={(open) => setExpandedId(open ? request.id : null)}
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
                          <Badge
                            variant="outline"
                            className={statusColors[request.status]}
                          >
                            {request.status.replace("_", " ")}
                          </Badge>
                          <span
                            className={`text-xs font-medium uppercase ${priorityColors[request.priority]}`}
                          >
                            {request.priority}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {categoryLabels[request.category] || request.category}
                          </span>
                        </div>
                        <h3 className="font-medium text-foreground truncate">{request.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {request.guest_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {request.guest_email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(request.created_at), "MMM d, HH:mm")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {expandedId === request.id ? (
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
                    {/* Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
                        <p className="text-foreground">{request.description}</p>
                      </div>
                      <div className="space-y-2">
                        {request.guest_name && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{request.guest_name}</span>
                          </div>
                        )}
                        {request.preferred_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{request.preferred_date}</span>
                          </div>
                        )}
                        {request.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{request.location}</span>
                          </div>
                        )}
                        {request.budget_range && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{request.budget_range}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Response */}
                    {request.response && (
                      <div className="bg-secondary/30 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Your Response</h4>
                        <p className="text-foreground">{request.response}</p>
                        {request.responded_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Responded {format(new Date(request.responded_at), "MMM d, yyyy HH:mm")}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Internal Notes */}
                    {request.internal_notes && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-amber-500 mb-2">Internal Notes</h4>
                        <p className="text-foreground text-sm">{request.internal_notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Select
                        value={request.status}
                        onValueChange={(value) => handleStatusChange(request.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="pending_response">Pending Response</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setResponseText(request.response || "");
                          setInternalNotes(request.internal_notes || "");
                          setRespondDialogOpen(true);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {request.response ? "Edit Response" : "Respond"}
                      </Button>
                      {request.guest_email && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(`mailto:${request.guest_email}`, "_blank")}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Email Client
                        </Button>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </motion.div>
            </Collapsible>
          ))
        )}
      </div>

      {/* Respond Dialog */}
      <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Respond to Request</DialogTitle>
            <DialogDescription>
              {selectedRequest?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Response to Client</label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Your response to the client..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Internal Notes (private)</label>
              <Textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Notes for your team..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setRespondDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleRespond} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Saving..." : "Save Response"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConciergeRequestsPanel;