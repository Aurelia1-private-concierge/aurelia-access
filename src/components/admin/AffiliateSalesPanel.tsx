import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Download, 
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AffiliateSale = {
  id: string;
  affiliate_code: string;
  experience_name: string;
  partner_company: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  preferred_category: string | null;
  message: string | null;
  status: string;
  sale_amount: number | null;
  commission_rate: number;
  commission_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "text-warning" },
  contacted: { label: "Contacted", icon: Mail, className: "text-blue-400" },
  sold: { label: "Sold", icon: CheckCircle, className: "text-success" },
  declined: { label: "Declined", icon: XCircle, className: "text-destructive" },
};

const AffiliateSalesPanel = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: sales, isLoading, refetch } = useQuery({
    queryKey: ["affiliate-sales", selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from("affiliate_sales")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AffiliateSale[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("affiliate_sales")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-sales"] });
      toast.success("Status updated");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const updateSaleAmountMutation = useMutation({
    mutationFn: async ({ id, amount, commissionRate }: { id: string; amount: number; commissionRate: number }) => {
      const commissionAmount = amount * (commissionRate / 100);
      const { error } = await supabase
        .from("affiliate_sales")
        .update({ 
          sale_amount: amount,
          commission_amount: commissionAmount,
          status: "sold"
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-sales"] });
      toast.success("Sale recorded");
    },
    onError: () => {
      toast.error("Failed to record sale");
    },
  });

  // Calculate stats
  const stats = {
    totalInquiries: sales?.length || 0,
    pendingInquiries: sales?.filter(s => s.status === "pending").length || 0,
    totalSold: sales?.filter(s => s.status === "sold").length || 0,
    totalRevenue: sales?.reduce((sum, s) => sum + (s.sale_amount || 0), 0) || 0,
    totalCommission: sales?.reduce((sum, s) => sum + (s.commission_amount || 0), 0) || 0,
    currentRate: (sales?.length || 0) >= 30 ? 10 : 6,
  };

  const exportToCSV = () => {
    if (!sales?.length) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Category", "Status", "Sale Amount", "Commission", "Date"];
    const rows = sales.map(s => [
      s.client_name,
      s.client_email,
      s.client_phone || "",
      s.preferred_category || "",
      s.status,
      s.sale_amount?.toString() || "",
      s.commission_amount?.toString() || "",
      format(new Date(s.created_at), "yyyy-MM-dd"),
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `triptych-leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">TRIPTYCH Affiliate Sales</h2>
          <p className="text-sm text-muted-foreground">
            Track leads and commissions • Code: APC-TRIPTYCH-001
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-card border border-border/30 text-foreground hover:bg-card/80 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card/50 border border-border/20 p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Total Leads</span>
          </div>
          <p className="text-2xl font-light text-foreground">{stats.totalInquiries}</p>
        </div>
        <div className="bg-card/50 border border-border/20 p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-2xl font-light text-warning">{stats.pendingInquiries}</p>
        </div>
        <div className="bg-card/50 border border-border/20 p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Sold</span>
          </div>
          <p className="text-2xl font-light text-success">{stats.totalSold}</p>
        </div>
        <div className="bg-card/50 border border-border/20 p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Revenue</span>
          </div>
          <p className="text-2xl font-light text-foreground">
            ${stats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-card/50 border border-border/20 p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Commission ({stats.currentRate}%)</span>
          </div>
          <p className="text-2xl font-light text-primary">
            ${stats.totalCommission.toLocaleString()}
          </p>
          {stats.totalSold < 30 && (
            <p className="text-[10px] text-muted-foreground mt-1">
              {30 - stats.totalSold} more sales to unlock 10% rate
            </p>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40 bg-card/50 border-border/30">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : !sales?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          No leads yet. Share your TRIPTYCH page to start tracking inquiries.
        </div>
      ) : (
        <div className="border border-border/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-card/50">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Sale</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {sales.map((sale) => {
                  const StatusIcon = statusConfig[sale.status]?.icon || Clock;
                  return (
                    <motion.tr
                      key={sale.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-card/30 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-foreground font-medium">
                            {sale.client_name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <a
                              href={`mailto:${sale.client_email}`}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Mail className="w-3 h-3" />
                              {sale.client_email}
                            </a>
                            {sale.client_phone && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {sale.client_phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-muted-foreground">
                          {sale.preferred_category?.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()) || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`flex items-center gap-1.5 text-xs ${statusConfig[sale.status]?.className}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig[sale.status]?.label || sale.status}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {sale.sale_amount ? (
                          <span className="text-sm text-foreground">
                            ${sale.sale_amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {sale.commission_amount ? (
                          <span className="text-sm text-primary font-medium">
                            ${sale.commission_amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(sale.created_at), "MMM d, yyyy")}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Select
                          value={sale.status}
                          onValueChange={(status) => updateStatusMutation.mutate({ id: sale.id, status })}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs bg-transparent border-border/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Partner Contact */}
      <div className="bg-card/30 border border-border/20 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground">Journeys Beyond Limits</p>
          <p className="text-xs text-muted-foreground">Forward qualified leads to partner</p>
        </div>
        <a
          href="mailto:incoming@journeysbeyondlimits.com"
          className="flex items-center gap-2 text-xs text-primary hover:underline"
        >
          incoming@journeysbeyondlimits.com
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default AffiliateSalesPanel;
