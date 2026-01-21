import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  User,
  Building2,
  MessageSquare,
  Loader2,
  Trophy,
  ThumbsUp,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Bid {
  id: string;
  partner_id: string;
  bid_amount: number;
  proposed_timeline: string | null;
  bid_message: string;
  status: string;
  is_recommended: boolean;
  created_at: string;
  partner?: {
    id: string;
    company_name: string;
    logo_url: string | null;
    categories: string[];
  };
}

interface ServiceRequestBidsProps {
  requestId: string;
  requestStatus: string;
  biddingEnabled: boolean;
  biddingDeadline: string | null;
  blindBidding?: boolean;
  onBidAccepted?: () => void;
}

const ServiceRequestBids = ({
  requestId,
  requestStatus,
  biddingEnabled,
  biddingDeadline,
  blindBidding = false,
  onBidAccepted,
}: ServiceRequestBidsProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetchBids();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`bids-${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_request_bids",
          filter: `service_request_id=eq.${requestId}`,
        },
        () => {
          fetchBids();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from("service_request_bids")
        .select(`
          *,
          partner:partners(id, company_name, logo_url, categories)
        `)
        .eq("service_request_id", requestId)
        .neq("status", "withdrawn")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setBids(data || []);
    } catch (error) {
      console.error("Error fetching bids:", error);
      toast.error("Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async () => {
    if (!selectedBid) return;

    setAccepting(true);
    try {
      // Update the selected bid to accepted
      const { error: bidError } = await supabase
        .from("service_request_bids")
        .update({ status: "accepted" })
        .eq("id", selectedBid.id);

      if (bidError) throw bidError;

      // Reject all other bids
      const { error: rejectError } = await supabase
        .from("service_request_bids")
        .update({ status: "rejected" })
        .eq("service_request_id", requestId)
        .neq("id", selectedBid.id)
        .eq("status", "pending");

      if (rejectError) throw rejectError;

      // Update service request with winning bid and partner
      const { error: requestError } = await supabase
        .from("service_requests")
        .update({
          winning_bid_id: selectedBid.id,
          partner_id: selectedBid.partner_id,
          status: "accepted",
        })
        .eq("id", requestId);

      if (requestError) throw requestError;

      // Create notification for the winning partner
      await supabase.from("notifications").insert({
        user_id: selectedBid.partner_id, // This should be the partner's user_id
        type: "bid_accepted",
        title: "Your bid was accepted!",
        description: `Congratulations! Your bid of $${selectedBid.bid_amount.toLocaleString()} has been accepted.`,
        action_url: `/partner/portal`,
      });

      toast.success("Bid accepted successfully!");
      setConfirmDialogOpen(false);
      setSelectedBid(null);
      fetchBids();
      onBidAccepted?.();
    } catch (error) {
      console.error("Error accepting bid:", error);
      toast.error("Failed to accept bid");
    } finally {
      setAccepting(false);
    }
  };

  const openConfirmDialog = (bid: Bid) => {
    setSelectedBid(bid);
    setConfirmDialogOpen(true);
  };

  const acceptedBid = bids.find(b => b.status === "accepted");
  const pendingBids = bids.filter(b => b.status === "pending");
  const canSelectBid = requestStatus === "pending" && biddingEnabled && pendingBids.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!biddingEnabled) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Partner Bids ({bids.length})
        </h3>
        {biddingDeadline && (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Deadline: {formatDistanceToNow(new Date(biddingDeadline), { addSuffix: true })}
          </Badge>
        )}
      </div>

      {/* Accepted Bid Highlight */}
      {acceptedBid && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-500">Selected Partner</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {acceptedBid.partner?.logo_url ? (
                    <AvatarImage src={acceptedBid.partner.logo_url} />
                  ) : (
                    <AvatarFallback>
                      <Building2 className="w-5 h-5" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">
                    {acceptedBid.partner?.company_name || "Partner"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${acceptedBid.bid_amount.toLocaleString()}
                    {acceptedBid.proposed_timeline && ` • ${acceptedBid.proposed_timeline}`}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Accepted
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Bids */}
      {pendingBids.length === 0 && !acceptedBid ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No bids received yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Partners will submit their proposals soon
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingBids.map((bid, index) => (
            <motion.div
              key={bid.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`hover:border-primary/30 transition-colors ${
                bid.is_recommended ? "border-primary/30 bg-primary/5" : ""
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-10 w-10 mt-1">
                        {!blindBidding && bid.partner?.logo_url ? (
                          <AvatarImage src={bid.partner.logo_url} />
                        ) : (
                          <AvatarFallback>
                            <Building2 className="w-5 h-5" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">
                            {blindBidding 
                              ? `Partner ${index + 1}` 
                              : bid.partner?.company_name || "Partner"
                            }
                          </p>
                          {bid.is_recommended && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                              <Star className="w-3 h-3 mr-1 fill-primary" />
                              Recommended
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1 font-medium text-foreground">
                            <DollarSign className="w-4 h-4" />
                            ${bid.bid_amount.toLocaleString()}
                          </div>
                          {bid.proposed_timeline && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {bid.proposed_timeline}
                            </div>
                          )}
                          <span>
                            {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {bid.bid_message}
                        </p>
                      </div>
                    </div>

                    {canSelectBid && (
                      <Button
                        size="sm"
                        onClick={() => openConfirmDialog(bid)}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Select
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Confirm Selection Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Partner Selection</DialogTitle>
            <DialogDescription>
              You're about to accept this bid. The partner will be notified and assigned to your request.
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
                      <p className="text-sm text-muted-foreground">
                        ${selectedBid.bid_amount.toLocaleString()}
                        {selectedBid.proposed_timeline && ` • ${selectedBid.proposed_timeline}`}
                      </p>
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
              Accept Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceRequestBids;
