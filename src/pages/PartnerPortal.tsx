import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
  Users,
  CreditCard,
  ExternalLink,
  Loader2,
  DollarSign,
  Wallet,
  Hotel
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SiteMinderIntegration from "@/components/partner/SiteMinderIntegration";

type Partner = {
  id: string;
  company_name: string;
  status: string;
  categories: string[];
  created_at: string;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  stripe_payouts_enabled: boolean;
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

type Commission = {
  id: string;
  service_title: string;
  booking_amount: number;
  commission_amount: number;
  status: string | null;
  created_at: string;
  paid_at: string | null;
};

type StripeStatus = {
  connected: boolean;
  onboardingComplete: boolean;
  payoutsEnabled: boolean;
  accountId?: string;
};

const PartnerPortal = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [services, setServices] = useState<PartnerService[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchPartnerData();
    }
  }, [user, authLoading]);

  // Check for Stripe onboarding return
  useEffect(() => {
    const stripeOnboarding = searchParams.get("stripe_onboarding");
    const stripeRefresh = searchParams.get("stripe_refresh");
    
    if (stripeOnboarding === "complete") {
      toast.success("Stripe setup completed! Checking account status...");
      checkStripeStatus();
      // Clean URL
      window.history.replaceState({}, "", "/partner-portal");
    } else if (stripeRefresh === "true") {
      toast.info("Please complete your Stripe setup");
      window.history.replaceState({}, "", "/partner-portal");
    }
  }, [searchParams]);

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

      // Fetch commissions
      const { data: commissionsData } = await supabase
        .from("partner_commissions")
        .select("*")
        .eq("partner_id", partnerData.id)
        .order("created_at", { ascending: false });

      setCommissions(commissionsData || []);

      // Check Stripe status
      if (partnerData.stripe_account_id) {
        checkStripeStatus();
      }
    } catch (error) {
      console.error("Error fetching partner data:", error);
      toast.error("Failed to load partner data");
    } finally {
      setLoading(false);
    }
  };

  const checkStripeStatus = async () => {
    setCheckingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-status");
      
      if (error) throw error;
      
      setStripeStatus(data);
      
      if (data.onboardingComplete && data.payoutsEnabled) {
        toast.success("Your Stripe account is ready to receive payouts!");
      }
    } catch (error) {
      console.error("Error checking Stripe status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const startStripeOnboarding = async () => {
    setConnectingStripe(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-onboard");
      
      if (error) throw error;
      
      if (data.url) {
        window.open(data.url, "_blank");
        toast.info("Complete your Stripe setup in the new window");
      }
    } catch (error) {
      console.error("Error starting Stripe onboarding:", error);
      toast.error("Failed to start Stripe setup");
    } finally {
      setConnectingStripe(false);
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

  const totalEarnings = commissions
    .filter(c => c.status === "paid")
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const pendingEarnings = commissions
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + c.commission_amount, 0);

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

          {/* Stripe Connect Card */}
          {!isPending && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    Payment Setup
                  </CardTitle>
                  <CardDescription>
                    Connect your bank account to receive automatic commission payouts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!stripeStatus?.connected && !partner.stripe_account_id ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Not connected</p>
                          <p className="text-xs text-muted-foreground">Set up Stripe to receive payments</p>
                        </div>
                      </div>
                      <Button onClick={startStripeOnboarding} disabled={connectingStripe}>
                        {connectingStripe ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        Connect Stripe
                      </Button>
                    </div>
                  ) : stripeStatus?.payoutsEnabled ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Payouts enabled</p>
                          <p className="text-xs text-muted-foreground">You're ready to receive automatic payments</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={checkStripeStatus} disabled={checkingStatus}>
                          {checkingStatus && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                          Refresh Status
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Setup incomplete</p>
                          <p className="text-xs text-muted-foreground">Complete your Stripe onboarding to receive payments</p>
                        </div>
                      </div>
                      <Button onClick={startStripeOnboarding} disabled={connectingStripe}>
                        {connectingStripe ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        Complete Setup
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats */}
          {!isPending && (
            <div className="grid md:grid-cols-5 gap-4 mb-8">
              {[
                { label: "Active Services", value: services.filter(s => s.is_active).length, icon: Package },
                { label: "Pending Requests", value: requests.filter(r => r.status === "pending").length, icon: Clock },
                { label: "In Progress", value: requests.filter(r => r.status === "in_progress").length, icon: TrendingUp },
                { label: "Total Earned", value: `$${totalEarnings.toLocaleString()}`, icon: DollarSign, highlight: true },
                { label: "Pending Payout", value: `$${pendingEarnings.toLocaleString()}`, icon: Wallet },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-card/50 border rounded-xl p-5 ${stat.highlight ? 'border-primary/30 bg-primary/5' : 'border-border/30'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-2xl font-serif ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.highlight ? 'text-primary/60' : 'text-primary/40'}`} />
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
                <TabsTrigger value="earnings">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Earnings
                </TabsTrigger>
                <TabsTrigger value="services">
                  <Package className="w-4 h-4 mr-2" />
                  My Services
                </TabsTrigger>
                <TabsTrigger value="integrations">
                  <Hotel className="w-4 h-4 mr-2" />
                  Integrations
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

              <TabsContent value="earnings" className="space-y-4">
                {commissions.length === 0 ? (
                  <div className="bg-card/50 border border-border/30 rounded-xl p-12 text-center">
                    <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">No Earnings Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Your commissions will appear here once you complete service requests.
                    </p>
                  </div>
                ) : (
                  commissions.map((commission) => (
                    <motion.div
                      key={commission.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-card/50 border border-border/30 rounded-xl p-5 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {commission.status === "paid" ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-medium text-foreground">{commission.service_title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Booking: ${commission.booking_amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-serif text-primary">
                            +${commission.commission_amount.toLocaleString()}
                          </p>
                          <Badge 
                            variant={commission.status === "paid" ? "default" : "secondary"} 
                            className="mt-1"
                          >
                            {commission.status === "paid" ? "Paid" : "Pending"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            {commission.paid_at 
                              ? `Paid ${new Date(commission.paid_at).toLocaleDateString()}`
                              : new Date(commission.created_at).toLocaleDateString()
                            }
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

              <TabsContent value="integrations">
                <SiteMinderIntegration partnerId={partner.id} />
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
                    <div>
                      <p className="text-sm text-muted-foreground">Stripe Account</p>
                      <p className="text-foreground">
                        {stripeStatus?.payoutsEnabled 
                          ? "Connected & Active" 
                          : stripeStatus?.connected 
                            ? "Connected (Setup Incomplete)"
                            : "Not Connected"
                        }
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
