import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  Send,
  Eye,
  Star,
  Filter,
  Search,
  Loader2,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ServiceRequest {
  id: string;
  title: string;
  description: string | null;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  preferred_date: string | null;
  location?: string | null;
  priority?: string | null;
  bidding_deadline: string | null;
  min_bids_required: number | null;
  created_at: string;
  bid_count?: number;
  has_bid?: boolean;
  recommendation?: {
    match_score: number;
    match_reasons: string[];
  };
}

interface PartnerBid {
  id: string;
  service_request_id: string;
  bid_amount: number;
  proposed_timeline: string | null;
  bid_message: string;
  status: string;
  created_at: string;
  service_request?: {
    title: string;
    category: string;
    status: string;
  };
}

interface Partner {
  id: string;
  company_name: string;
  categories: string[];
}

const categoryLabels: Record<string, string> = {
  travel: "Travel",
  dining: "Dining",
  events_access: "Events",
  shopping: "Shopping",
  wellness: "Wellness",
  chauffeur: "Chauffeur",
  security: "Security",
  private_aviation: "Private Aviation",
  yacht_charter: "Yacht Charter",
  real_estate: "Real Estate",
  collectibles: "Collectibles",
};

const PartnerOpportunitiesPanel = () => {
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [opportunities, setOpportunities] = useState<ServiceRequest[]>([]);
  const [myBids, setMyBids] = useState<PartnerBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  
  // Bid dialog state
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [bidForm, setBidForm] = useState({
    amount: "",
    timeline: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get partner profile
      const { data: partnerData, error: partnerError } = await supabase
        .from("partners")
        .select("id, company_name, categories")
        .eq("user_id", user!.id)
        .single();

      if (partnerError || !partnerData) {
        console.error("Partner not found:", partnerError);
        return;
      }

      setPartner(partnerData);

      // Get open opportunities (requests with bidding enabled)
      const { data: requestsData, error: requestsError } = await supabase
        .from("service_requests")
        .select("*")
        .eq("bidding_enabled", true)
        .in("status", ["pending", "accepted"])
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      // Get partner's existing bids - use explicit FK relationship
      const { data: bidsData, error: bidsError } = await supabase
        .from("service_request_bids")
        .select(`
          *,
          service_request:service_requests!service_request_bids_service_request_id_fkey(title, category, status)
        `)
        .eq("partner_id", partnerData.id)
        .order("created_at", { ascending: false });

      if (bidsError) throw bidsError;

      // Get recommendations for this partner
      const { data: recommendationsData } = await supabase
        .from("partner_recommendations")
        .select("service_request_id, match_score, match_reasons")
        .eq("partner_id", partnerData.id);

      const recommendationMap = new Map(
        recommendationsData?.map(r => [r.service_request_id, r]) || []
      );

      // Get bid counts per request
      const requestIds = requestsData?.map(r => r.id) || [];
      const { data: bidCountsData } = await supabase
        .from("service_request_bids")
        .select("service_request_id")
        .in("service_request_id", requestIds);

      const bidCountMap: Record<string, number> = {};
      bidCountsData?.forEach(b => {
        bidCountMap[b.service_request_id] = (bidCountMap[b.service_request_id] || 0) + 1;
      });

      // Check which requests partner has already bid on
      const myBidRequestIds = new Set(bidsData?.map(b => b.service_request_id) || []);

      // Enrich opportunities
      const enrichedOpportunities = (requestsData || []).map(request => ({
        ...request,
        bid_count: bidCountMap[request.id] || 0,
        has_bid: myBidRequestIds.has(request.id),
        recommendation: recommendationMap.get(request.id),
      }));

      setOpportunities(enrichedOpportunities);
      setMyBids(bidsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities
    .filter(opp => {
      const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || opp.category === categoryFilter;
      const notExpired = !opp.bidding_deadline || !isPast(new Date(opp.bidding_deadline));
      return matchesSearch && matchesCategory && notExpired && !opp.has_bid;
    })
    .sort((a, b) => {
      if (sortBy === "recommended") {
        return (b.recommendation?.match_score || 0) - (a.recommendation?.match_score || 0);
      } else if (sortBy === "deadline") {
        if (!a.bidding_deadline) return 1;
        if (!b.bidding_deadline) return -1;
        return new Date(a.bidding_deadline).getTime() - new Date(b.bidding_deadline).getTime();
      } else if (sortBy === "budget") {
        return (b.budget_max || 0) - (a.budget_max || 0);
      }
      return 0;
    });

  const openBidDialog = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setBidForm({ amount: "", timeline: "", message: "" });
    setBidDialogOpen(true);
  };

  const handleSubmitBid = async () => {
    if (!selectedRequest || !partner || !bidForm.amount || !bidForm.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("service_request_bids").insert({
        service_request_id: selectedRequest.id,
        partner_id: partner.id,
        bid_amount: parseFloat(bidForm.amount),
        proposed_timeline: bidForm.timeline || null,
        bid_message: bidForm.message,
        is_recommended: !!selectedRequest.recommendation,
      });

      if (error) throw error;

      // Update recommendation status if applicable
      if (selectedRequest.recommendation) {
        await supabase
          .from("partner_recommendations")
          .update({ 
            status: "bid_submitted",
            responded_at: new Date().toISOString(),
          })
          .eq("service_request_id", selectedRequest.id)
          .eq("partner_id", partner.id);
      }

      toast.success("Bid submitted successfully!");
      setBidDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error submitting bid:", error);
      if (error.code === "23505") {
        toast.error("You have already submitted a bid for this request");
      } else {
        toast.error("Failed to submit bid");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawBid = async (bidId: string) => {
    if (!confirm("Are you sure you want to withdraw this bid?")) return;

    try {
      const { error } = await supabase
        .from("service_request_bids")
        .update({ status: "withdrawn" })
        .eq("id", bidId);

      if (error) throw error;
      toast.success("Bid withdrawn");
      fetchData();
    } catch (error) {
      console.error("Error withdrawing bid:", error);
      toast.error("Failed to withdraw bid");
    }
  };

  const getBidStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      pending: { className: "bg-yellow-500/20 text-yellow-500", label: "Pending" },
      accepted: { className: "bg-green-500/20 text-green-500", label: "Accepted" },
      rejected: { className: "bg-destructive/20 text-destructive", label: "Not Selected" },
      withdrawn: { className: "bg-muted text-muted-foreground", label: "Withdrawn" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  // Stats
  const stats = {
    openOpportunities: filteredOpportunities.length,
    recommendedForYou: opportunities.filter(o => o.recommendation && o.recommendation.match_score >= 70).length,
    activeBids: myBids.filter(b => b.status === "pending").length,
    wonBids: myBids.filter(b => b.status === "accepted").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Opportunities", value: stats.openOpportunities, icon: Briefcase },
          { label: "Recommended", value: stats.recommendedForYou, icon: Star, highlight: true },
          { label: "Active Bids", value: stats.activeBids, icon: Clock },
          { label: "Won", value: stats.wonBids, icon: CheckCircle },
        ].map((stat) => (
          <Card key={stat.label} className={stat.highlight ? "border-primary/30 bg-primary/5" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-serif ${stat.highlight ? "text-primary" : "text-foreground"}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.highlight ? "text-primary/60" : "text-primary/40"}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">
            <Briefcase className="w-4 h-4 mr-2" />
            Open Opportunities
          </TabsTrigger>
          <TabsTrigger value="mybids">
            <Send className="w-4 h-4 mr-2" />
            My Bids
            {stats.activeBids > 0 && (
              <Badge variant="secondary" className="ml-2">{stats.activeBids}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {partner?.categories?.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryLabels[cat] || cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities List */}
          {filteredOpportunities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No Open Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  New service requests matching your expertise will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOpportunities.map((opportunity) => (
                <motion.div
                  key={opportunity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`hover:border-primary/30 transition-colors ${
                    opportunity.recommendation && opportunity.recommendation.match_score >= 80 
                      ? "border-primary/30 bg-primary/5" 
                      : ""
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-foreground">{opportunity.title}</h3>
                            <Badge variant="outline" className="capitalize">
                              {categoryLabels[opportunity.category] || opportunity.category}
                            </Badge>
                            {opportunity.recommendation && opportunity.recommendation.match_score >= 80 && (
                              <Badge className="bg-primary/20 text-primary border-primary/30">
                                <Star className="w-3 h-3 mr-1 fill-primary" />
                                {opportunity.recommendation.match_score}% Match
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {opportunity.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {(opportunity.budget_min || opportunity.budget_max) && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {opportunity.budget_min && opportunity.budget_max ? (
                                  <span>${opportunity.budget_min.toLocaleString()} - ${opportunity.budget_max.toLocaleString()}</span>
                                ) : opportunity.budget_max ? (
                                  <span>Up to ${opportunity.budget_max.toLocaleString()}</span>
                                ) : null}
                              </div>
                            )}
                            {opportunity.preferred_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{format(new Date(opportunity.preferred_date), "MMM d, yyyy")}</span>
                              </div>
                            )}
                            {opportunity.bidding_deadline && (
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Clock className="w-4 h-4" />
                                <span>Deadline: {formatDistanceToNow(new Date(opportunity.bidding_deadline), { addSuffix: true })}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{opportunity.bid_count} bid{opportunity.bid_count !== 1 ? "s" : ""}</span>
                            </div>
                          </div>

                          {opportunity.recommendation?.match_reasons && opportunity.recommendation.match_reasons.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {opportunity.recommendation.match_reasons.slice(0, 3).map((reason, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button onClick={() => openBidDialog(opportunity)}>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Bid
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Bids Tab */}
        <TabsContent value="mybids" className="space-y-4">
          {myBids.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Send className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No Bids Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Your submitted bids will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myBids.map((bid) => (
                <Card key={bid.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-foreground">
                            {bid.service_request?.title || "Service Request"}
                          </h3>
                          {getBidStatusBadge(bid.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium text-foreground">
                              ${bid.bid_amount.toLocaleString()}
                            </span>
                          </div>
                          {bid.proposed_timeline && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{bid.proposed_timeline}</span>
                            </div>
                          )}
                          <span>
                            Submitted {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {bid.bid_message}
                        </p>
                      </div>

                      {bid.status === "pending" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleWithdrawBid(bid.id)}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Submit Bid Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Your Bid</DialogTitle>
            <DialogDescription>
              {selectedRequest?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedRequest && (
              <div className="p-3 rounded-lg bg-muted/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium capitalize">
                    {categoryLabels[selectedRequest.category] || selectedRequest.category}
                  </span>
                </div>
                {(selectedRequest.budget_min || selectedRequest.budget_max) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client Budget:</span>
                    <span className="font-medium">
                      {selectedRequest.budget_min && selectedRequest.budget_max
                        ? `$${selectedRequest.budget_min.toLocaleString()} - $${selectedRequest.budget_max.toLocaleString()}`
                        : selectedRequest.budget_max
                          ? `Up to $${selectedRequest.budget_max.toLocaleString()}`
                          : "Not specified"}
                    </span>
                  </div>
                )}
                {selectedRequest.preferred_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preferred Date:</span>
                    <span className="font-medium">
                      {format(new Date(selectedRequest.preferred_date), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="amount">Your Bid Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                value={bidForm.amount}
                onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                placeholder="Enter your competitive rate"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timeline">Proposed Timeline</Label>
              <Input
                id="timeline"
                value={bidForm.timeline}
                onChange={(e) => setBidForm({ ...bidForm, timeline: e.target.value })}
                placeholder="e.g., 2-3 business days"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Your Proposal *</Label>
              <Textarea
                id="message"
                value={bidForm.message}
                onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                placeholder="Describe your approach, experience, and why you're the right fit..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBidDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitBid} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerOpportunitiesPanel;
