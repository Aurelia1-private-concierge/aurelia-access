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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
  partner?: {
    company_name: string;
    contact_name: string;
  };
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
          partner:partners(company_name, contact_name)
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
      const updates: any = { status: newStatus };
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
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
    const headers = ["Partner", "Service", "Booking Amount", "Rate", "Commission", "Status", "Date"];
    const rows = filteredCommissions.map((c) => [
      c.partner?.company_name || "Unknown",
      c.service_title,
      c.booking_amount,
      `${c.commission_rate}%`,
      c.commission_amount,
      c.status,
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      </div>

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
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredCommissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                    <Badge className={statusColors[commission.status]}>{commission.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(commission.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {commission.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCommissionStatus(commission.id, "approved")}
                      >
                        Approve
                      </Button>
                    )}
                    {commission.status === "approved" && (
                      <Button
                        size="sm"
                        onClick={() => updateCommissionStatus(commission.id, "paid")}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default CommissionTracker;
