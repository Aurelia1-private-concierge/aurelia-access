import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Clock,
  Star,
  CheckCircle,
  Building2,
  Award,
  ArrowUpDown,
  ThumbsUp,
  History,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Bid {
  id: string;
  partner_id: string;
  bid_amount: number;
  proposed_timeline: string | null;
  bid_message: string;
  status: string;
  is_recommended: boolean;
  revision_count: number;
  created_at: string;
  updated_at: string;
  partner?: {
    id: string;
    company_name: string;
    logo_url: string | null;
  };
}

interface BidRevision {
  id: string;
  bid_id: string;
  revision_number: number;
  previous_amount: number;
  new_amount: number;
  previous_timeline: string | null;
  new_timeline: string | null;
  revision_reason: string | null;
  created_at: string;
}

interface BidComparisonViewProps {
  requestId: string;
  requestTitle: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  onBidAccepted?: () => void;
}

type SortField = "amount" | "timeline" | "recommended";
type SortDirection = "asc" | "desc";

const BidComparisonView = ({
  requestId,
  requestTitle,
  budgetMin,
  budgetMax,
  onBidAccepted,
}: BidComparisonViewProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [revisions, setRevisions] = useState<Record<string, BidRevision[]>>({});
  const [loading, setLoading] = useState(true);
  const [shortlist, setShortlist] = useState<Set<string>>(new Set());
  const [expandedBid, setExpandedBid] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("amount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetchBids();
    
    const channel = supabase
      .channel(`bid-comparison-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_request_bids",
          filter: `service_request_id=eq.${requestId}`,
        },
        () => fetchBids()
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bid_revisions",
        },
        () => fetchBids()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  const fetchBids = async () => {
    try {
      const { data: bidsData, error: bidsError } = await supabase
        .from("service_request_bids")
        .select(`
          *,
          partner:partners(id, company_name, logo_url)
        `)
        .eq("service_request_id", requestId)
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (bidsError) throw bidsError;
      setBids((bidsData || []) as unknown as Bid[]);

      // Fetch revisions for all bids
      if (bidsData && bidsData.length > 0) {
        const bidIds = bidsData.map(b => b.id);
        const { data: revisionsData } = await supabase
          .from("bid_revisions")
          .select("*")
          .in("bid_id", bidIds)
          .order("revision_number", { ascending: false });

        const revisionMap: Record<string, BidRevision[]> = {};
        revisionsData?.forEach(rev => {
          if (!revisionMap[rev.bid_id]) {
            revisionMap[rev.bid_id] = [];
          }
          revisionMap[rev.bid_id].push(rev);
        });
        setRevisions(revisionMap);
      }
    } catch (error) {
      console.error("Error fetching bids:", error);
      toast.error("Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  const sortedBids = [...bids].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "amount":
        comparison = a.bid_amount - b.bid_amount;
        break;
      case "recommended":
        comparison = (b.is_recommended ? 1 : 0) - (a.is_recommended ? 1 : 0);
        break;
      case "timeline":
        comparison = (a.proposed_timeline || "zzz").localeCompare(b.proposed_timeline || "zzz");
        break;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const shortlistedBids = sortedBids.filter(b => shortlist.has(b.id));
  const otherBids = sortedBids.filter(b => !shortlist.has(b.id));

  const toggleShortlist = (bidId: string) => {
    const newShortlist = new Set(shortlist);
    if (newShortlist.has(bidId)) {
      newShortlist.delete(bidId);
    } else if (newShortlist.size < 3) {
      newShortlist.add(bidId);
    } else {
      toast.info("You can shortlist up to 3 bids");
      return;
    }
    setShortlist(newShortlist);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleAcceptBid = async () => {
    if (!selectedBid) return;

    setAccepting(true);
    try {
      const { error: bidError } = await supabase
        .from("service_request_bids")
        .update({ status: "accepted" })
        .eq("id", selectedBid.id);

      if (bidError) throw bidError;

      const { error: rejectError } = await supabase
        .from("service_request_bids")
        .update({ status: "rejected" })
        .eq("service_request_id", requestId)
        .neq("id", selectedBid.id)
        .eq("status", "pending");

      if (rejectError) throw rejectError;

      const { error: requestError } = await supabase
        .from("service_requests")
        .update({
          winning_bid_id: selectedBid.id,
          partner_id: selectedBid.partner_id,
          status: "accepted",
        })
        .eq("id", requestId);

      if (requestError) throw requestError;

      toast.success("Partner selected successfully!");
      setConfirmDialogOpen(false);
      setSelectedBid(null);
      onBidAccepted?.();
    } catch (error) {
      console.error("Error accepting bid:", error);
      toast.error("Failed to accept bid");
    } finally {
      setAccepting(false);
    }
  };

  const isWithinBudget = (amount: number) => {
    if (budgetMin && amount < budgetMin) return false;
    if (budgetMax && amount > budgetMax) return false;
    return true;
  };

  const getBestValue = () => {
    if (bids.length === 0) return null;
    
    // Best value = lowest price among recommended, or just lowest price
    const recommendedBids = bids.filter(b => b.is_recommended);
    const pool = recommendedBids.length > 0 ? recommendedBids : bids;
    return pool.reduce((best, current) => 
      current.bid_amount < best.bid_amount ? current : best
    );
  };

  const bestValue = getBestValue();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No bids to compare yet</p>
        </CardContent>
      </Card>
    );
  }

  const renderBidRow = (bid: Bid, isShortlisted: boolean) => {
    const bidRevisions = revisions[bid.id] || [];
    const hasRevisions = bidRevisions.length > 0;
    
    return (
      <Collapsible
        key={bid.id}
        open={expandedBid === bid.id}
        onOpenChange={() => setExpandedBid(expandedBid === bid.id ? null : bid.id)}
      >
        <TableRow className={isShortlisted ? "bg-primary/5" : ""}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {bid.partner?.logo_url ? (
                  <AvatarImage src={bid.partner.logo_url} />
                ) : (
                  <AvatarFallback>
                    <Building2 className="w-5 h-5" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{bid.partner?.company_name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {bid.is_recommended && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs py-0">
                      <Star className="w-2.5 h-2.5 mr-0.5 fill-primary" />
                      Match
                    </Badge>
                  )}
                  {bid.id === bestValue?.id && (
                    <Badge variant="outline" className="bg-accent/50 text-accent-foreground border-accent text-xs py-0">
                      <Award className="w-2.5 h-2.5 mr-0.5" />
                      Best Value
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </TableCell>
          
          <TableCell>
            <div className={`font-medium ${isWithinBudget(bid.bid_amount) ? "text-foreground" : "text-destructive"}`}>
              ${bid.bid_amount.toLocaleString()}
            </div>
            {hasRevisions && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <History className="w-3 h-3" />
                {bid.revision_count} revision{bid.revision_count !== 1 ? "s" : ""}
              </div>
            )}
          </TableCell>
          
          <TableCell className="text-muted-foreground">
            {bid.proposed_timeline || "—"}
          </TableCell>
          
          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                variant={isShortlisted ? "secondary" : "outline"}
                size="sm"
                onClick={() => toggleShortlist(bid.id)}
              >
                {isShortlisted ? "★" : "☆"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedBid(bid);
                  setConfirmDialogOpen(true);
                }}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Select
              </Button>
              {hasRevisions && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {expandedBid === bid.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
          </TableCell>
        </TableRow>
        
        {hasRevisions && (
          <CollapsibleContent asChild>
            <TableRow className="bg-muted/30">
              <TableCell colSpan={4} className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Bid History</p>
                  {bidRevisions.map((rev) => (
                    <div key={rev.id} className="flex items-center gap-4 text-sm">
                      <Badge variant="outline" className="text-xs">v{rev.revision_number}</Badge>
                      <span className="text-muted-foreground">
                        ${rev.previous_amount.toLocaleString()} → ${rev.new_amount.toLocaleString()}
                      </span>
                      {rev.revision_reason && (
                        <span className="text-muted-foreground italic">"{rev.revision_reason}"</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(rev.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">
              Compare Bids ({bids.length})
            </CardTitle>
            {(budgetMin || budgetMax) && (
              <Badge variant="outline" className="text-muted-foreground">
                Budget: {budgetMin && budgetMax
                  ? `$${budgetMin.toLocaleString()} - $${budgetMax.toLocaleString()}`
                  : budgetMax
                    ? `Up to $${budgetMax.toLocaleString()}`
                    : `From $${budgetMin?.toLocaleString()}`
                }
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Partner</TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort("amount")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    Amount
                    {sortField === "amount" && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort("timeline")}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    Timeline
                    {sortField === "timeline" && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shortlistedBids.map(bid => renderBidRow(bid, true))}
              {otherBids.map(bid => renderBidRow(bid, false))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Shortlist Summary */}
      {shortlist.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {shortlist.size} Partner{shortlist.size !== 1 ? "s" : ""} Shortlisted
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Compare your top choices before deciding
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShortlist(new Set())}
                >
                  Clear Shortlist
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Partner Selection</DialogTitle>
            <DialogDescription>
              You're about to select this partner for "{requestTitle}". This will accept their bid and notify them.
            </DialogDescription>
          </DialogHeader>

          {selectedBid && (
            <div className="py-4">
              <Card className="border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      {selectedBid.partner?.logo_url ? (
                        <AvatarImage src={selectedBid.partner.logo_url} />
                      ) : (
                        <AvatarFallback>
                          <Building2 className="w-5 h-5" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedBid.partner?.company_name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>${selectedBid.bid_amount.toLocaleString()}</span>
                        {selectedBid.proposed_timeline && (
                          <span>• {selectedBid.proposed_timeline}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedBid.bid_message}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcceptBid} disabled={accepting}>
              {accepting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BidComparisonView;
