import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Plane, 
  Ship, 
  Home, 
  Gem, 
  Ticket, 
  Shield, 
  UtensilsCrossed, 
  MapPin, 
  Sparkles, 
  ShoppingBag,
  Star,
  ArrowRight,
  Loader2,
  Car,
  Coins
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import VettedPartnersSection from "@/components/VettedPartnersSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Credit cost per service category
const SERVICE_CREDIT_COSTS: Record<string, number> = {
  private_aviation: 3,
  yacht_charter: 3,
  real_estate: 2,
  collectibles: 2,
  events_access: 1,
  security: 2,
  dining: 1,
  travel: 1,
  wellness: 1,
  shopping: 1,
  chauffeur: 1,
};

type ServiceCategory = 
  | "private_aviation"
  | "yacht_charter"
  | "real_estate"
  | "collectibles"
  | "events_access"
  | "security"
  | "dining"
  | "travel"
  | "wellness"
  | "shopping"
  | "chauffeur";

interface PartnerService {
  id: string;
  title: string;
  description: string | null;
  category: ServiceCategory;
  min_price: number | null;
  max_price: number | null;
  currency: string | null;
  availability_notes: string | null;
  highlights: string[] | null;
  images: string[] | null;
  partner_id: string;
  partners?: {
    company_name: string;
    logo_url: string | null;
  };
}

const categoryConfig: Record<ServiceCategory, { label: string; icon: React.ElementType; gradient: string }> = {
  private_aviation: { label: "Private Aviation", icon: Plane, gradient: "from-sky-500 to-blue-600" },
  yacht_charter: { label: "Yacht Charter", icon: Ship, gradient: "from-cyan-500 to-teal-600" },
  real_estate: { label: "Real Estate", icon: Home, gradient: "from-amber-500 to-orange-600" },
  collectibles: { label: "Collectibles", icon: Gem, gradient: "from-purple-500 to-violet-600" },
  events_access: { label: "Events Access", icon: Ticket, gradient: "from-pink-500 to-rose-600" },
  security: { label: "Security & Protection", icon: Shield, gradient: "from-slate-500 to-gray-600" },
  dining: { label: "Fine Dining", icon: UtensilsCrossed, gradient: "from-red-500 to-rose-600" },
  travel: { label: "Travel", icon: MapPin, gradient: "from-emerald-500 to-green-600" },
  wellness: { label: "Wellness", icon: Sparkles, gradient: "from-indigo-500 to-purple-600" },
  shopping: { label: "Shopping", icon: ShoppingBag, gradient: "from-fuchsia-500 to-pink-600" },
  chauffeur: { label: "Chauffeur & Transport", icon: Car, gradient: "from-zinc-500 to-neutral-700" },
};

const Discover = () => {
  const { user } = useAuth();
  const { balance, isUnlimited, useCredit, refetch: refetchCredits } = useCredits();
  const [services, setServices] = useState<PartnerService[]>([]);
  const [filteredServices, setFilteredServices] = useState<PartnerService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">("all");
  const [requestingService, setRequestingService] = useState<PartnerService | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery, selectedCategory]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("partner_services")
        .select(`
          *,
          partners (
            company_name,
            logo_url
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    if (selectedCategory !== "all") {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.partners?.company_name.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  };

  const handleRequestService = async () => {
    if (!requestingService || !user) return;

    const creditCost = SERVICE_CREDIT_COSTS[requestingService.category] || 1;

    // Check if user has enough credits (unless unlimited)
    if (!isUnlimited && balance < creditCost) {
      toast({
        title: "Insufficient Credits",
        description: `This service requires ${creditCost} credit${creditCost > 1 ? "s" : ""}. Please purchase additional credits.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Deduct credits first
      const creditResult = await useCredit(
        creditCost,
        `Service request: ${requestingService.title}`
      );

      if (!creditResult.success) {
        throw new Error(creditResult.error || "Failed to deduct credits");
      }

      // Then create the service request
      const { data: requestData, error } = await supabase.from("service_requests").insert({
        client_id: user.id,
        service_id: requestingService.id,
        partner_id: requestingService.partner_id,
        category: requestingService.category,
        title: `Request for ${requestingService.title}`,
        description: requestMessage || `I'm interested in ${requestingService.title}`,
        status: "pending",
      }).select().single();

      if (error) throw error;

      // Update the transaction with the service request ID
      if (requestData) {
        await supabase
          .from("credit_transactions")
          .update({ service_request_id: requestData.id })
          .eq("user_id", user.id)
          .eq("description", `Service request: ${requestingService.title}`)
          .order("created_at", { ascending: false })
          .limit(1);
      }

      toast({
        title: "Request Sent",
        description: `Your service request has been submitted. ${creditCost} credit${creditCost > 1 ? "s" : ""} used.`,
      });

      setRequestingService(null);
      setRequestMessage("");
      refetchCredits();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (min: number | null, max: number | null, currency: string | null) => {
    const curr = currency || "USD";
    if (min && max) {
      return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    } else if (min) {
      return `From ${curr} ${min.toLocaleString()}`;
    } else if (max) {
      return `Up to ${curr} ${max.toLocaleString()}`;
    }
    return "Price on request";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              <Sparkles className="w-3 h-3 mr-1" />
              Curated Excellence
            </Badge>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Discover <span className="text-primary italic">Extraordinary</span> Services
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse our handpicked collection of luxury services from the world's most prestigious partners.
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search services, partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-muted/30 border-border/50"
                />
              </div>
              <Button variant="outline" size="icon" className="h-12 w-12 border-border/50">
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              All Services
            </button>
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key as ServiceCategory)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredServices.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-2">No Services Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "New services are being added soon"}
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service, index) => {
                const config = categoryConfig[service.category];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300"
                  >
                    {/* Image/Gradient Header */}
                    <div className={`h-40 bg-gradient-to-br ${config.gradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                          <Icon className="w-4 h-4 text-white" />
                          <span className="text-xs text-white font-medium">{config.label}</span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <div className="flex items-center gap-1 text-white/80">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm font-medium">Premium</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-3">
                        <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
                          {service.partners?.company_name || "Premium Partner"}
                        </p>
                        <h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors">
                          {service.title}
                        </h3>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {service.description || "Experience luxury at its finest with this exclusive service."}
                      </p>

                      {/* Highlights */}
                      {service.highlights && service.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {service.highlights.slice(0, 3).map((highlight, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Price & Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <p className="text-sm font-medium text-foreground">
                          {formatPrice(service.min_price, service.max_price, service.currency)}
                        </p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => setRequestingService(service)}
                            >
                              Request
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="font-serif">Request Service</DialogTitle>
                              <DialogDescription>
                                Tell us about your requirements for {requestingService?.title}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              {/* Credit Cost Display */}
                              {requestingService && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                                  <div className="flex items-center gap-2">
                                    <Coins className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-foreground">Credit Cost</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-lg font-medium text-primary">
                                      {SERVICE_CREDIT_COSTS[requestingService.category] || 1}
                                    </span>
                                    <span className="text-sm text-muted-foreground ml-1">
                                      credit{(SERVICE_CREDIT_COSTS[requestingService.category] || 1) > 1 ? "s" : ""}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {/* Balance Warning */}
                              {requestingService && !isUnlimited && balance < (SERVICE_CREDIT_COSTS[requestingService.category] || 1) && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                                  <Coins className="w-4 h-4" />
                                  <span className="text-sm">
                                    Insufficient credits. You have {balance} credit{balance !== 1 ? "s" : ""}.
                                  </span>
                                </div>
                              )}

                              <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                  Your Message (Optional)
                                </label>
                                <Textarea
                                  placeholder="Share any specific requirements, dates, or preferences..."
                                  value={requestMessage}
                                  onChange={(e) => setRequestMessage(e.target.value)}
                                  className="min-h-[120px]"
                                />
                              </div>
                              <Button
                                className="w-full"
                                onClick={handleRequestService}
                                disabled={
                                  isSubmitting || 
                                  !user || 
                                  (!isUnlimited && balance < (SERVICE_CREDIT_COSTS[requestingService?.category || ""] || 1))
                                }
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                  </>
                                ) : !user ? (
                                  "Sign in to Request"
                                ) : (
                                  <>
                                    <Coins className="w-4 h-4 mr-2" />
                                    Submit Request
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Vetted Partners Section */}
      <section className="pb-24 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <VettedPartnersSection limit={6} showHeader={true} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Discover;