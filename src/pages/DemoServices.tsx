import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, Ship, Building2, UtensilsCrossed, Car, Shield, 
  Star, Globe, Crown, ArrowRight, MapPin, Clock, Check,
  Sparkles, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Demo services showcase
const demoServices = [
  {
    id: "jet-1",
    category: "private_aviation",
    title: "Gulfstream G700 Charter",
    description: "Ultra-long-range luxury jet for intercontinental travel. Features include full bedroom suite, gourmet galley, and advanced connectivity.",
    location: "Available Worldwide",
    price: "From £12,000/hour",
    highlights: ["16 passengers", "14-hour range", "Full bedroom suite", "Live connectivity"],
    icon: Plane,
    gradient: "from-blue-500/20 to-indigo-500/20",
    featured: true,
  },
  {
    id: "yacht-1",
    category: "yacht_charter",
    title: "Mediterranean Superyacht",
    description: "90m superyacht available for charter in the French Riviera, Monaco, and Italian coast. Full crew, water toys, and helipad included.",
    location: "Monaco / Côte d'Azur",
    price: "From €450,000/week",
    highlights: ["12 guests", "Full crew", "Helipad", "Jacuzzi & pool"],
    icon: Ship,
    gradient: "from-cyan-500/20 to-teal-500/20",
    featured: true,
  },
  {
    id: "estate-1",
    category: "real_estate",
    title: "Monaco Penthouse",
    description: "Exclusive penthouse in Monte Carlo with panoramic sea views, private rooftop pool, and 24/7 concierge service.",
    location: "Monte Carlo, Monaco",
    price: "€45,000,000",
    highlights: ["800m²", "Sea views", "Private pool", "Wine cellar"],
    icon: Building2,
    gradient: "from-amber-500/20 to-orange-500/20",
    featured: true,
  },
  {
    id: "dining-1",
    category: "dining",
    title: "Alain Ducasse VIP Experience",
    description: "Private dining room at Louis XV in Monaco with personalized tasting menu by the legendary chef.",
    location: "Monte Carlo, Monaco",
    price: "From €2,500/person",
    highlights: ["3 Michelin stars", "Private room", "Wine pairing", "Chef's table"],
    icon: UtensilsCrossed,
    gradient: "from-rose-500/20 to-pink-500/20",
  },
  {
    id: "chauffeur-1",
    category: "chauffeur",
    title: "Maybach S680 Chauffeur",
    description: "Executive chauffeur service with armored Maybach S680 and professionally trained security driver.",
    location: "London, Paris, Dubai",
    price: "From £800/day",
    highlights: ["Armored vehicle", "Security trained", "24/7 availability", "Multi-city"],
    icon: Car,
    gradient: "from-slate-500/20 to-gray-500/20",
  },
  {
    id: "security-1",
    category: "security",
    title: "Executive Protection",
    description: "Discrete close protection services by former military and government specialists.",
    location: "Global Coverage",
    price: "From £3,000/day",
    highlights: ["Ex-military", "Secure transport", "Advance team", "Risk assessment"],
    icon: Shield,
    gradient: "from-emerald-500/20 to-green-500/20",
  },
  {
    id: "events-1",
    category: "events_access",
    title: "Monaco Grand Prix VIP",
    description: "Exclusive access to the Monaco Grand Prix with yacht hospitality, paddock access, and celebrity meet & greet.",
    location: "Monte Carlo, Monaco",
    price: "From €25,000",
    highlights: ["Yacht hospitality", "Paddock access", "VIP transfers", "After-party"],
    icon: Star,
    gradient: "from-red-500/20 to-rose-500/20",
  },
  {
    id: "wellness-1",
    category: "wellness",
    title: "SHA Wellness Retreat",
    description: "Two-week comprehensive wellness program at the world-renowned SHA Wellness Clinic in Spain.",
    location: "Alicante, Spain",
    price: "From €15,000",
    highlights: ["Medical checkup", "Personalized program", "Suite accommodation", "Spa access"],
    icon: Globe,
    gradient: "from-purple-500/20 to-violet-500/20",
  },
];

const categoryLabels: Record<string, string> = {
  private_aviation: "Private Aviation",
  yacht_charter: "Yacht Charter",
  real_estate: "Real Estate",
  dining: "Fine Dining",
  chauffeur: "Chauffeur",
  security: "Security",
  events_access: "VIP Events",
  wellness: "Wellness",
};

const DemoServices = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<typeof demoServices[0] | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: "",
    email: "",
    preferred_date: "",
    message: "",
  });

  const filteredServices = selectedCategory
    ? demoServices.filter(s => s.category === selectedCategory)
    : demoServices;

  const featuredServices = demoServices.filter(s => s.featured);

  const handleRequest = async () => {
    if (!requestForm.email || !requestForm.message) {
      toast({ title: "Required Fields", description: "Please fill in email and message.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any).from("concierge_requests").insert({
        user_id: user?.id || null,
        guest_email: requestForm.email,
        guest_name: requestForm.name || null,
        category: selectedService?.category || "general",
        title: `Interest in: ${selectedService?.title}`,
        description: requestForm.message,
        preferred_date: requestForm.preferred_date || null,
        status: "new",
        priority: "high",
      });

      if (error) throw error;

      toast({ title: "Request Submitted", description: "Our concierge team will contact you within 24 hours." });
      setIsRequestDialogOpen(false);
      setSelectedService(null);
      setRequestForm({ name: "", email: "", preferred_date: "", message: "" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to submit request. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [...new Set(demoServices.map(s => s.category))];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Curated Experiences</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-6xl text-foreground mb-6"
            >
              Extraordinary
              <span className="text-primary block">Experiences</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground"
            >
              Discover a curated selection of the world's most exclusive services, 
              handpicked by our team of luxury experts.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-12 bg-secondary/20">
        <div className="container mx-auto px-6">
          <h2 className="font-serif text-2xl text-foreground mb-8 text-center">Featured</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedService(service);
                    setIsRequestDialogOpen(true);
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-50`} />
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-background/80 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {categoryLabels[service.category]}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl text-foreground mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {service.location}
                      </div>
                      <span className="text-sm font-medium text-primary">{service.price}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b border-border/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {categoryLabels[cat]}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* All Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedService(service);
                      setIsRequestDialogOpen(true);
                    }}
                  >
                    <div className={`h-32 bg-gradient-to-br ${service.gradient} flex items-center justify-center`}>
                      <Icon className="w-12 h-12 text-foreground/50" />
                    </div>
                    <div className="p-5">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        {categoryLabels[service.category]}
                      </div>
                      <h3 className="font-serif text-lg text-foreground mb-2">{service.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {service.highlights.slice(0, 2).map((h) => (
                          <span key={h} className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
                            {h}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-border/30">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {service.location}
                        </span>
                        <span className="text-sm font-medium text-primary">{service.price}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <Crown className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="font-serif text-3xl text-foreground mb-4">
              Looking for Something Unique?
            </h2>
            <p className="text-muted-foreground mb-8">
              Our concierge team can source any experience, no matter how exclusive or unusual. 
              Tell us your vision and we'll make it reality.
            </p>
            <Button
              size="lg"
              onClick={() => {
                setSelectedService({ 
                  id: "custom", 
                  category: "general", 
                  title: "Custom Request",
                  description: "",
                  location: "",
                  price: "",
                  highlights: [],
                  icon: Crown,
                  gradient: "",
                });
                setIsRequestDialogOpen(true);
              }}
            >
              Submit Custom Request <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {selectedService?.id === "custom" ? "Custom Request" : `Request: ${selectedService?.title}`}
            </DialogTitle>
            <DialogDescription>
              Our concierge team will contact you within 24 hours to discuss your requirements.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Your Name</label>
              <Input
                value={requestForm.name}
                onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Email *</label>
              <Input
                type="email"
                value={requestForm.email}
                onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Preferred Date</label>
              <Input
                type="date"
                value={requestForm.preferred_date}
                onChange={(e) => setRequestForm({ ...requestForm, preferred_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Tell Us More *</label>
              <Textarea
                value={requestForm.message}
                onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                placeholder="Share your requirements, preferences, and any special requests..."
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleRequest} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default DemoServices;