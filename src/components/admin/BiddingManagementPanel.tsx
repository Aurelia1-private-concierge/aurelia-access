import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Gavel, Clock, CheckCircle, XCircle, DollarSign, Star, Plus } from "lucide-react";
import { useHousePartnerBids } from "@/hooks/useHousePartnerBids";
import { useHousePartners } from "@/hooks/useHousePartners";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

export function BiddingManagementPanel() {
  const { biddingRequests, requestsLoading } = useHousePartnerBids();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [showBidDialog, setShowBidDialog] = useState(false);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5 text-primary" />
          Service Request Bidding
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage bids from house partners on active service requests
        </p>
      </CardHeader>
      <CardContent>
        {requestsLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : !biddingRequests?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No requests with bidding enabled</p>
            <p className="text-sm mt-1">Enable bidding on a service request to start collecting vendor bids</p>
          </div>
        ) : (
          <div className="space-y-4">
            {biddingRequests.map((request) => (
              <RequestBiddingCard
                key={request.id}
                request={request}
                onManageBids={() => setSelectedRequestId(request.id)}
              />
            ))}
          </div>
        )}

        {/* Bid Management Dialog */}
        {selectedRequestId && (
          <BidManagementDialog
            requestId={selectedRequestId}
            open={!!selectedRequestId}
            onClose={() => setSelectedRequestId(null)}
          />
        )}
      </CardContent>
    </Card>
  );
}

function RequestBiddingCard({ 
  request, 
  onManageBids 
}: { 
  request: any;
  onManageBids: () => void;
}) {
  const { bids } = useHousePartnerBids(request.id);
  const bidCount = bids?.length || 0;
  const lowestBid = bids?.reduce((min, bid) => 
    bid.status === "pending" && bid.bid_amount < min ? bid.bid_amount : min, 
    Infinity
  );
  const hasAccepted = bids?.some(b => b.status === "accepted");

  return (
    <div className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{request.title}</h4>
            {hasAccepted && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Awarded
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {request.description}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <Badge variant="outline">{request.category}</Badge>
            {request.budget_max && (
              <span className="text-muted-foreground">
                Budget: ${request.budget_min?.toLocaleString()} - ${request.budget_max?.toLocaleString()}
              </span>
            )}
            {request.bidding_deadline && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                Deadline: {format(new Date(request.bidding_deadline), "MMM d, h:mm a")}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold">{bidCount}</p>
            <p className="text-xs text-muted-foreground">bids</p>
          </div>
          {bidCount > 0 && lowestBid !== Infinity && (
            <div className="text-right">
              <p className="text-lg font-semibold text-green-500">
                ${lowestBid.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">lowest bid</p>
            </div>
          )}
          <Button size="sm" onClick={onManageBids}>
            Manage Bids
          </Button>
        </div>
      </div>
    </div>
  );
}

function BidManagementDialog({
  requestId,
  open,
  onClose,
}: {
  requestId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { bids, bidsLoading, acceptBid, createBid, isAccepting, isCreating } = useHousePartnerBids(requestId);
  const { data: partners } = useHousePartners();
  const [showAddBid, setShowAddBid] = useState(false);
  const [newBid, setNewBid] = useState({
    partnerId: "",
    amount: "",
    timeline: "",
    notes: "",
  });

  const handleAddBid = () => {
    if (!newBid.partnerId || !newBid.amount) {
      toast.error("Please select a partner and enter a bid amount");
      return;
    }
    createBid({
      serviceRequestId: requestId,
      housePartnerId: newBid.partnerId,
      bidAmount: parseFloat(newBid.amount),
      estimatedTimeline: newBid.timeline || undefined,
      notes: newBid.notes || undefined,
    });
    setNewBid({ partnerId: "", amount: "", timeline: "", notes: "" });
    setShowAddBid(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            Manage Bids
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Bid Section */}
          <div className="flex justify-end">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowAddBid(!showAddBid)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Bid from Partner
            </Button>
          </div>

          {showAddBid && (
            <div className="p-4 rounded-lg border bg-muted/50 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>House Partner</Label>
                  <Select
                    value={newBid.partnerId}
                    onValueChange={(v) => setNewBid({ ...newBid, partnerId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select partner" />
                    </SelectTrigger>
                    <SelectContent>
                      {partners?.filter(p => p.is_active).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} {p.company_name && `(${p.company_name})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bid Amount ($)</Label>
                  <Input
                    type="number"
                    value={newBid.amount}
                    onChange={(e) => setNewBid({ ...newBid, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estimated Timeline</Label>
                <Input
                  value={newBid.timeline}
                  onChange={(e) => setNewBid({ ...newBid, timeline: e.target.value })}
                  placeholder="e.g., 3-5 business days"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={newBid.notes}
                  onChange={(e) => setNewBid({ ...newBid, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddBid} disabled={isCreating}>
                  Submit Bid
                </Button>
                <Button variant="outline" onClick={() => setShowAddBid(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Bids Table */}
          {bidsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading bids...</div>
          ) : !bids?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bids yet</p>
              <p className="text-sm">Add bids from your house partners above</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Bid Amount</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {bid.house_partner?.name}
                          </span>
                          {bid.house_partner?.is_preferred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        {bid.house_partner?.company_name && (
                          <span className="text-sm text-muted-foreground">
                            {bid.house_partner.company_name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-lg font-semibold">
                          ${bid.bid_amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {bid.estimated_timeline || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            bid.status === "accepted" ? "default" :
                            bid.status === "rejected" ? "destructive" :
                            "secondary"
                          }
                        >
                          {bid.status === "accepted" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {bid.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                          {bid.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {bid.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => acceptBid({ bidId: bid.id, requestId })}
                            disabled={isAccepting}
                          >
                            Accept
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BiddingManagementPanel;
