import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { 
  Building2, 
  Package, 
  MessageSquare, 
  Settings, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Partner = {
  id: string;
  company_name: string;
  status: string;
  categories: string[];
  created_at: string;
};

type ServiceRequest = {
  id: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  preferred_date: string | null;
};

type PartnerService = {
  id: string;
  title: string;
  category: string;
  is_active: boolean;
  min_price: number | null;
  max_price: number | null;
};

const PartnerPortal = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [services, setServices] = useState<PartnerService[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchPartnerData();
    }
  }, [user, authLoading]);

  const fetchPartnerData = async () => {
    try {
      // Fetch partner profile
      const { data: partnerData, error: partnerError } = await supabase
        .from("partners")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (partnerError) throw partnerError;

      if (!partnerData) {
        navigate("/partner/apply");
        return;
      }

      setPartner(partnerData);

      // Fetch services
      const { data: servicesData } = await supabase
        .from("partner_services")
        .select("*")
        .eq("partner_id", partnerData.id)
        .order("created_at", { ascending: false });

      setServices(servicesData || []);

      // Fetch requests assigned to this partner
      const { data: requestsData } = await supabase
        .from("service_requests")
        .select("*")
        .eq("partner_id", partnerData.id)
        .order("created_at", { ascending: false });

      setRequests(requestsData || []);
    } catch (error) {
      console.error("Error fetching partner data:", error);
      toast.error("Failed to load partner data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending Review" },
      approved: { variant: "default", label: "Approved" },
      suspended: { variant: "destructive", label: "Suspended" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRequestStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "accepted": return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "in_progress": return <TrendingUp className="w-4 h-4 text-primary" />;
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!partner) return null;

  const isPending = partner.status === "pending";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-serif text-foreground">{partner.company_name}</h1>
                {getStatusBadge(partner.status)}
              </div>
              <p className="text-muted-foreground text-sm">Partner Portal</p>
            </div>
            
            {!isPending && (
              <Button asChild>
                <Link to="/partner/services/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Link>
              </Button>
            )}
          </motion.div>

          {/* Pending Status Message */}
          {isPending && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8"
            >
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground">Application Under Review</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your partner application is being reviewed by our team. You'll receive notification 
                    once approved. This typically takes 24-48 hours.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          {!isPending && (
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Active Services", value: services.filter(s => s.is_active).length, icon: Package },
                { label: "Pending Requests", value: requests.filter(r => r.status === "pending").length, icon: Clock },
                { label: "In Progress", value: requests.filter(r => r.status === "in_progress").length, icon: TrendingUp },
                { label: "Completed", value: requests.filter(r => r.status === "completed").length, icon: CheckCircle },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card/50 border border-border/30 rounded-xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-serif text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                    <stat.icon className="w-8 h-8 text-primary/40" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Main Content */}
          {!isPending && (
            <Tabs defaultValue="requests" className="space-y-6">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="requests">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Requests
                </TabsTrigger>
                <TabsTrigger value="services">
                  <Package className="w-4 h-4 mr-2" />
                  My Services
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="requests" className="space-y-4">
                {requests.length === 0 ? (
                  <div className="bg-card/50 border border-border/30 rounded-xl p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">No Requests Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      When clients request your services, they'll appear here.
                    </p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-card/50 border border-border/30 rounded-xl p-5 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getRequestStatusIcon(request.status)}
                          <div>
                            <h4 className="font-medium text-foreground">{request.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">
                              {request.category.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="capitalize">
                            {request.status.replace("_", " ")}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                {services.length === 0 ? (
                  <div className="bg-card/50 border border-border/30 rounded-xl p-12 text-center">
                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">No Services Listed</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your first service to start receiving requests.
                    </p>
                    <Button asChild>
                      <Link to="/partner/services/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                      </Link>
                    </Button>
                  </div>
                ) : (
                  services.map((service) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-card/50 border border-border/30 rounded-xl p-5 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{service.title}</h4>
                            {!service.is_active && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {service.category.replace("_", " ")}
                          </p>
                        </div>
                        {(service.min_price || service.max_price) && (
                          <p className="text-sm text-primary">
                            {service.min_price && service.max_price 
                              ? `$${service.min_price.toLocaleString()} - $${service.max_price.toLocaleString()}`
                              : service.min_price 
                                ? `From $${service.min_price.toLocaleString()}`
                                : `Up to $${service.max_price?.toLocaleString()}`
                            }
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="settings">
                <div className="bg-card/50 border border-border/30 rounded-xl p-6">
                  <h3 className="font-medium text-foreground mb-4">Partner Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Company Name</p>
                      <p className="text-foreground">{partner.company_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Categories</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {partner.categories.map((cat) => (
                          <Badge key={cat} variant="outline" className="capitalize">
                            {cat.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="text-foreground">
                        {new Date(partner.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  );
};

export default PartnerPortal;
