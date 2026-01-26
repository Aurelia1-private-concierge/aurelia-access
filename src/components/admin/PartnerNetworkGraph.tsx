import { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import {
  Network,
  Users,
  Building2,
  MapPin,
  TrendingUp,
  Filter,
  RefreshCw,
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Handshake,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UHNW_NETWORKS } from "@/lib/marketing-strategies";

interface NetworkPartnership {
  id: string;
  network_name: string;
  network_type: string | null;
  partnership_status: string;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  engagement_notes: string | null;
  referrals_received: number | null;
  conversions_from_referrals: number | null;
  last_contact_at: string | null;
  next_followup_at: string | null;
  created_at: string;
}

const PartnerNetworkGraph = forwardRef<HTMLDivElement>((_, ref) => {
  const [partnerships, setPartnerships] = useState<NetworkPartnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchPartnerships = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("network_partnerships")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPartnerships(data || []);
    } catch (err) {
      console.error("Error fetching partnerships:", err);
      // Use fallback data from constants
      const fallbackData = UHNW_NETWORKS.map((n, i) => ({
        id: `fallback-${i}`,
        network_name: n.name,
        network_type: n.type,
        partnership_status: n.status,
        primary_contact_name: null,
        primary_contact_email: null,
        primary_contact_phone: null,
        engagement_notes: n.description,
        referrals_received: 0,
        conversions_from_referrals: 0,
        last_contact_at: null,
        next_followup_at: null,
        created_at: new Date().toISOString(),
      }));
      setPartnerships(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerships();
  }, []);

  const filteredPartnerships = partnerships.filter(
    p => statusFilter === "all" || p.partnership_status === statusFilter
  );

  const statusCounts = {
    active: partnerships.filter(p => p.partnership_status === "active").length,
    pending: partnerships.filter(p => p.partnership_status === "pending").length,
    negotiating: partnerships.filter(p => p.partnership_status === "negotiating").length,
    declined: partnerships.filter(p => p.partnership_status === "declined").length,
  };

  const totalReferrals = partnerships.reduce(
    (sum, p) => sum + (p.referrals_received || 0),
    0
  );
  const totalConversions = partnerships.reduce(
    (sum, p) => sum + (p.conversions_from_referrals || 0),
    0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "pending":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "negotiating":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "declined":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "negotiating":
        return <Handshake className="w-4 h-4" />;
      case "declined":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const updatePartnershipStatus = async (id: string, newStatus: "active" | "pending" | "negotiating" | "declined") => {
    try {
      const { error } = await supabase
        .from("network_partnerships")
        .update({ partnership_status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setPartnerships(prev =>
        prev.map(p => (p.id === id ? { ...p, partnership_status: newStatus } : p))
      );

      toast({
        title: "Partnership Updated",
        description: `Status changed to ${newStatus}`,
      });
    } catch (err) {
      console.error("Error updating partnership:", err);
      toast({
        title: "Update Failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div ref={ref} className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Partners</p>
                <p className="text-2xl font-bold text-emerald-400">{statusCounts.active}</p>
              </div>
              <Network className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">In Negotiation</p>
                <p className="text-2xl font-bold text-amber-400">{statusCounts.negotiating}</p>
              </div>
              <Handshake className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Referrals</p>
                <p className="text-2xl font-bold text-foreground">{totalReferrals}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Conversions</p>
                <p className="text-2xl font-bold text-foreground">{totalConversions}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Pipeline */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Network className="w-5 h-5" />
            UHNW Network Partnerships
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Networks</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchPartnerships}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Pipeline View */}
          <div className="flex items-center justify-between mb-6 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Pending ({statusCounts.pending})</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm">Negotiating ({statusCounts.negotiating})</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm">Active ({statusCounts.active})</span>
            </div>
          </div>

          {/* Partnership Cards */}
          <div className="space-y-4">
            {filteredPartnerships.map((partnership, index) => (
              <motion.div
                key={partnership.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border/30 rounded-lg p-4 hover:border-border/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h4 className="font-medium text-foreground">{partnership.network_name}</h4>
                      <Badge variant="outline" className={getStatusColor(partnership.partnership_status)}>
                        {getStatusIcon(partnership.partnership_status)}
                        <span className="ml-1 capitalize">{partnership.partnership_status}</span>
                      </Badge>
                      {partnership.network_type && (
                        <Badge variant="secondary" className="text-xs">
                          {partnership.network_type}
                        </Badge>
                      )}
                    </div>

                    {partnership.engagement_notes && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {partnership.engagement_notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {partnership.primary_contact_name && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{partnership.primary_contact_name}</span>
                        </div>
                      )}
                      {partnership.primary_contact_email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{partnership.primary_contact_email}</span>
                        </div>
                      )}
                      {partnership.last_contact_at && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Last contact: {new Date(partnership.last_contact_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {(partnership.referrals_received || partnership.conversions_from_referrals) && (
                      <div className="flex items-center gap-6 mt-3">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Referrals: </span>
                          <span className="font-medium">{partnership.referrals_received || 0}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Conversions: </span>
                          <span className="font-medium text-emerald-400">
                            {partnership.conversions_from_referrals || 0}
                          </span>
                        </div>
                        {partnership.referrals_received && partnership.referrals_received > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Conv. Rate: </span>
                            <span className="font-medium">
                              {(
                                ((partnership.conversions_from_referrals || 0) /
                                  partnership.referrals_received) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {partnership.partnership_status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-400 border-amber-500/30"
                        onClick={() => updatePartnershipStatus(partnership.id, "negotiating")}
                      >
                        Start Negotiating
                      </Button>
                    )}
                    {partnership.partnership_status === "negotiating" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-400 border-emerald-500/30"
                        onClick={() => updatePartnershipStatus(partnership.id, "active")}
                      >
                        Mark Active
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredPartnerships.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No partnerships found matching the filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* UHNW Networks Reference */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Target UHNW Networks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {UHNW_NETWORKS.slice(0, 6).map((network, index) => (
              <div
                key={index}
                className="p-4 border border-border/30 rounded-lg hover:border-border/60 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{network.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {network.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{network.description}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {network.memberCount && (
                    <span className="text-muted-foreground">{network.memberCount}</span>
                  )}
                  {network.annualFee && (
                    <span className="text-amber-400">{network.annualFee}/year</span>
                  )}
                </div>
                {network.benefits && (
                  <ul className="mt-3 space-y-1">
                    {network.benefits.slice(0, 2).map((benefit, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

PartnerNetworkGraph.displayName = "PartnerNetworkGraph";

export default PartnerNetworkGraph;
