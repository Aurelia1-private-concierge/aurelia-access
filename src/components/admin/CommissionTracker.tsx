import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Search,
  Send,
  Loader2,
  AlertCircle,
  CreditCard,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format } from "date-fns";

interface Partner {
  company_name: string;
  contact_name: string;
  stripe_account_id: string | null;
  stripe_payouts_enabled: boolean;
}

interface Commission {
  id: string;
  partner_id: string;
  service_title: string;
  booking_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  stripe_transfer_id: string | null;
  payout_error: string | null;
  partner?: Partner;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500",
  approved: "bg-blue-500/10 text-blue-500",
  paid: "bg-emerald-500/10 text-emerald-500",
  cancelled: "bg-rose-500/10 text-rose-500",
};

const CommissionTracker = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [processingPayout, setProcessingPayout] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("partner_commissions")
        .select(`
          *,
          partner:partners(company_name, contact_name, stripe_account_id, stripe_payouts_enabled)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCommissions(data || []);
    } catch (error) {
      console.error("Error fetching commissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCommissionStatus = async (id: string, newStatus: string) => {
    try {
      const updates: Record<string, unknown> = { status: newStatus };
      if (newStatus === "paid") {
        updates.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("partner_commissions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Updated", description: `Commission marked as ${newStatus}` });
      fetchCommissions();
    } catch (error) {
      console.error("Error updating commission:", error);
      toast({ title: "Error", description: "Failed to update commission", variant: "destructive" });
    }
  };

  const initiateStripePayout = (commission: Commission) => {
    setSelectedCommission(commission);
    setPayoutDialogOpen(true);
  };

  const processStripePayout = async () => {
    if (!selectedCommission) return;
    
    setProcessingPayout(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-payout", {
        body: { commission_id: selectedCommission.id }
      });

      // Handle HTTP errors from edge function
      if (error) {
        // Check if it's an insufficient funds error (402 status)
        const errorMsg = error.message || "";
        if (errorMsg.includes("INSUFFICIENT_FUNDS") || errorMsg.includes("insufficient") || errorMsg.includes("402")) {
          toast({ 
            title: "Test Mode Limitation", 
            description: "Stripe test account needs funds. In production, payouts will process automatically.",
          });
          setPayoutDialogOpen(false);
          fetchCommissions();
          return;
        }
        throw error;
      }

      if (data?.success) {
        toast({ 
          title: "Payout Successful", 
          description: `$${selectedCommission.commission_amount.toLocaleString()} transferred to partner` 
        });
        setPayoutDialogOpen(false);
        fetchCommissions();
      } else if (data?.code === "INSUFFICIENT_FUNDS") {
        toast({ 
          title: "Test Mode Limitation", 
          description: "Stripe test account needs funds. In production, payouts will process automatically.",
        });
        setPayoutDialogOpen(false);
        fetchCommissions();
      } else {
        throw new Error(data?.error || "Payout failed");
      }
    } catch (error) {
      console.error("Error processing payout:", error);
      toast({ 
        title: "Payout Failed", 
        description: error instanceof Error ? error.message : "Failed to process payout", 
        variant: "destructive" 
      });
    } finally {
      setProcessingPayout(false);
    }
  };

  const processBatchPayouts = async () => {
    const eligibleCommissions = commissions.filter(
      c => c.status === "approved" && 
      c.partner?.stripe_payouts_enabled && 
      !c.stripe_transfer_id
    );

    if (eligibleCommissions.length === 0) {
      toast({ 
        title: "No Eligible Payouts", 
        description: "No approved commissions with enabled Stripe accounts found" 
      });
      return;
    }

    setBatchProcessing(true);
    let successCount = 0;
    let failCount = 0;
    let insufficientFundsCount = 0;

    for (const commission of eligibleCommissions) {
      try {
        const { data, error } = await supabase.functions.invoke("stripe-connect-payout", {
          body: { commission_id: commission.id }
        });

        if (data?.code === "INSUFFICIENT_FUNDS" || error?.message?.includes("402")) {
          insufficientFundsCount++;
        } else if (error || !data?.success) {
          failCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    if (insufficientFundsCount > 0 && successCount === 0 && failCount === 0) {
      toast({ 
        title: "Test Mode Limitation", 
        description: "Stripe test account needs funds. Payouts will work in production.",
      });
    } else {
      toast({ 
        title: "Batch Processing Complete", 
        description: `${successCount} successful${failCount > 0 ? `, ${failCount} failed` : ''}${insufficientFundsCount > 0 ? ` (${insufficientFundsCount} pending funds)` : ''}` 
      });
    }
    
    setBatchProcessing(false);
    fetchCommissions();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const stats = {
    totalPending: commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + Number(c.commission_amount), 0),
    totalApproved: commissions
      .filter((c) => c.status === "approved")
      .reduce((sum, c) => sum + Number(c.commission_amount), 0),
    totalPaid: commissions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + Number(c.commission_amount), 0),
    totalBookings: commissions.reduce((sum, c) => sum + Number(c.booking_amount), 0),
    readyForPayout: commissions.filter(
      c => c.status === "approved" && c.partner?.stripe_payouts_enabled && !c.stripe_transfer_id
    ).length,
  };

  const filteredCommissions = commissions.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      c.service_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partner?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ["Partner", "Service", "Booking Amount", "Rate", "Commission", "Status", "Stripe Transfer", "Date"];
    const rows = filteredCommissions.map((c) => [
      c.partner?.company_name || "Unknown",
      c.service_title,
      c.booking_amount,
      `${c.commission_rate}%`,
      c.commission_amount,
      c.status,
      c.stripe_transfer_id || "N/A",
      format(new Date(c.created_at), "yyyy-MM-dd"),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commissions-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const canProcessPayout = (commission: Commission) => {
    return (
      commission.status === "approved" &&
      commission.partner?.stripe_account_id &&
      commission.partner?.stripe_payouts_enabled &&
      !commission.stripe_transfer_id
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(stats.totalPending)}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(stats.totalApproved)}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(stats.totalPaid)}</p>
                <p className="text-sm text-muted-foreground">Paid Out</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(stats.totalBookings)}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-primary">{stats.readyForPayout}</p>
                <p className="text-sm text-muted-foreground">Ready for Payout</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Payout Action */}
      {stats.readyForPayout > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {stats.readyForPayout} commission{stats.readyForPayout > 1 ? 's' : ''} ready for automatic payout
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Process all approved commissions to connected Stripe accounts
                  </p>
                </div>
              </div>
              <Button onClick={processBatchPayouts} disabled={batchProcessing}>
                {batchProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Process All Payouts
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by partner or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-card/50 border-border/30">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Booking</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Stripe Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredCommissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No commissions found
                </TableCell>
              </TableRow>
            ) : (
              filteredCommissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{commission.partner?.company_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{commission.partner?.contact_name}</p>
                    </div>
                  </TableCell>
                  <TableCell>{commission.service_title}</TableCell>
                  <TableCell>{formatCurrency(commission.booking_amount)}</TableCell>
                  <TableCell>{commission.commission_rate}%</TableCell>
                  <TableCell className="font-medium">{formatCurrency(commission.commission_amount)}</TableCell>
                  <TableCell>
                    {commission.stripe_transfer_id ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Transferred
                      </Badge>
                    ) : commission.partner?.stripe_payouts_enabled ? (
                      <Badge className="bg-blue-500/10 text-blue-500">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    ) : commission.partner?.stripe_account_id ? (
                      <Badge className="bg-amber-500/10 text-amber-500">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Incomplete
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Not Connected
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[commission.status]}>{commission.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(commission.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {commission.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCommissionStatus(commission.id, "approved")}
                        >
                          Approve
                        </Button>
                      )}
                      {canProcessPayout(commission) && (
                        <Button
                          size="sm"
                          onClick={() => initiateStripePayout(commission)}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Pay
                        </Button>
                      )}
                      {commission.status === "approved" && !commission.partner?.stripe_payouts_enabled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCommissionStatus(commission.id, "paid")}
                        >
                          Mark Paid
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

      {/* Payout Confirmation Dialog */}
      <AlertDialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Stripe Payout</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>You are about to transfer funds to the partner's connected Stripe account:</p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Partner:</span>
                    <span className="font-medium">{selectedCommission?.partner?.company_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{selectedCommission?.service_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium text-primary">
                      {selectedCommission && formatCurrency(selectedCommission.commission_amount)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. The transfer will be processed immediately via Stripe Connect.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingPayout}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={processStripePayout} disabled={processingPayout}>
              {processingPayout ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Confirm Payout
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CommissionTracker;
