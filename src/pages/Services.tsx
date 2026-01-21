import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, 
  Anchor, 
  Building2, 
  Gem, 
  Calendar, 
  Shield, 
  Utensils, 
  Globe, 
  Heart, 
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Moon,
  Fingerprint,
  BookOpen,
  Brain,
  Users,
  Cloud,
  Key,
  Home,
  Flower2,
  Car,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ServiceProcessSteps from "@/components/services/ServiceProcessSteps";

const services = [
  {
    icon: Plane,
    title: "Private Aviation",
    description: "Access to the world's finest fleet of private jets, helicopters, and beyond. 24/7 availability with as little as 4 hours notice.",
    features: ["Empty leg optimization", "Global positioning", "Catering customization", "Ground transportation"]
  },
  {
    icon: Anchor,
    title: "Yacht Charters",
    description: "Curated selection of superyachts and sailing vessels, from Mediterranean summers to Caribbean escapes.",
    features: ["Charter management", "Crew vetting", "Itinerary design", "Provisioning excellence"]
  },
  {
    icon: Building2,
    title: "Real Estate",
    description: "Off-market acquisitions and discreet sales of the world's most extraordinary properties.",
    features: ["Pre-market access", "Anonymous transactions", "Legal coordination", "Property management"]
  },
  {
    icon: Gem,
    title: "Rare Collectibles",
    description: "Authentication, acquisition, and curation of fine art, timepieces, rare wines, and classic automobiles.",
    features: ["Market intelligence", "Auction representation", "Authentication", "Secure storage"]
  },
  {
    icon: Calendar,
    title: "Exclusive Access",
    description: "Invitations to the world's most coveted events, from film premieres to private gallery viewings.",
    features: ["Fashion week", "Sports hospitality", "Cultural events", "Private concerts"]
  },
  {
    icon: ShieldCheck,
    title: "Security & Protection",
    description: "Comprehensive security services including personal bodyguards, home protection, and family security.",
    features: ["Personal bodyguards", "Home protection", "Family security", "Threat assessment"]
  },
  {
    icon: Car,
    title: "Chauffeur Services",
    description: "Luxury ground transportation with vetted professional chauffeurs and armored vehicles.",
    features: ["Armored vehicles", "Global network", "Airport transfers", "Event transport"]
  },
  {
    icon: Utensils,
    title: "Culinary Excellence",
    description: "Reserved tables at impossible-to-book restaurants and private dining with world-renowned chefs.",
    features: ["Priority reservations", "Private chef", "Wine procurement", "Event catering"]
  },
  {
    icon: Globe,
    title: "Bespoke Travel",
    description: "Transformative journeys crafted around your passions, from polar expeditions to cultural immersions.",
    features: ["Expedition planning", "Cultural access", "Luxury lodges", "Private guides"]
  },
  {
    icon: Heart,
    title: "Wellness & Medical",
    description: "Access to elite medical institutions, wellness retreats, and preventive health programs.",
    features: ["Medical concierge", "Wellness retreats", "Specialist access", "Health optimization"]
  },
  {
    icon: ShoppingBag,
    title: "Personal Shopping",
    description: "Private appointments, pre-release access, and bespoke creations from the finest houses.",
    features: ["Wardrobe curation", "Trunk shows", "Bespoke commissions", "Gift sourcing"]
  }
];

const discoveryServices = [
  {
    icon: Moon,
    title: "Sleep Architecture",
    description: "Custom sleep environment engineering—bespoke mattress science, circadian lighting, and acoustic optimization.",
    features: ["Sleep audit", "Custom mattress", "Circadian lighting", "Acoustics"]
  },
  {
    icon: Fingerprint,
    title: "Digital Estate Planning",
    description: "Comprehensive management of your digital legacy—cryptocurrency inheritance and password architecture.",
    features: ["Crypto inheritance", "Digital assets", "Password vault", "Legacy docs"]
  },
  {
    icon: Shield,
    title: "Reputation Sentinel",
    description: "Proactive protection of your digital presence—dark web monitoring and crisis response.",
    features: ["Dark web monitoring", "Footprint scrubbing", "Privacy audits", "Crisis PR"]
  },
  {
    icon: BookOpen,
    title: "Legacy Curation",
    description: "Professional archivists documenting your family history and creating museum-quality publications.",
    features: ["Family archives", "Digitization", "Coffee table books", "Oral histories"]
  },
  {
    icon: Brain,
    title: "Longevity Concierge",
    description: "Access to cutting-edge treatments and personalized health optimization protocols.",
    features: ["Preventive protocols", "Specialist network", "Biometric tracking", "Treatment access"]
  },
  {
    icon: Flower2,
    title: "Signature Scent",
    description: "Bespoke fragrance development for homes, offices, and private aircraft with master perfumers.",
    features: ["Personal fragrance", "Home scenting", "Aircraft & yacht", "Seasonal variations"]
  },
  {
    icon: Users,
    title: "Companion Matching",
    description: "Vetted travel and dining companions—intelligent, cultured individuals for meaningful connection.",
    features: ["Travel companions", "Dining partners", "Event escorts", "Background checks"]
  },
  {
    icon: Cloud,
    title: "Private Meteorology",
    description: "Personal weather forecasting for yacht crossings, outdoor events, and optimal travel windows.",
    features: ["Event forecasting", "Sailing windows", "Travel optimization", "Storm tracking"]
  },
  {
    icon: Key,
    title: "Second Passport Advisory",
    description: "Discreet guidance on citizenship-by-investment programs and global mobility optimization.",
    features: ["CBI programs", "Residency planning", "Tax optimization", "Global mobility"]
  },
  {
    icon: Home,
    title: "Household Optimization",
    description: "Comprehensive estate management—staff training, smart home integration, and efficiency consulting.",
    features: ["Staff training", "Smart integration", "Vendor management", "Efficiency audits"]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  },
  exit: { opacity: 0 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

type TabType = "core" | "discovery";

const Services = () => {
  const [activeTab, setActiveTab] = useState<TabType>("core");

  const currentServices = activeTab === "core" ? services : discoveryServices;

  return (
    <div className="min-h-[100dvh] bg-background">
      <SEOHead pageType="services" />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute inset-0 hero-overlay opacity-50" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 border border-border/30 bg-secondary/50 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
              Our Services
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-foreground mb-4"
          >
            Curated for the <span className="text-primary italic">Extraordinary</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground font-light max-w-2xl mx-auto"
          >
            Every service tailored to your unique requirements. Our network spans 
            continents, our discretion is absolute.
          </motion.p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="inline-flex bg-secondary/50 border border-border/30 rounded-full p-1">
              <button
                onClick={() => setActiveTab("core")}
                className={`relative px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 rounded-full ${
                  activeTab === "core"
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === "core" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Core Services</span>
              </button>
              <button
                onClick={() => setActiveTab("discovery")}
                className={`relative px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 rounded-full ${
                  activeTab === "discovery"
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === "discovery" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">Discovery</span>
              </button>
            </div>
          </motion.div>
          
          {/* Tab Description */}
          <motion.p
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground mt-4"
          >
            {activeTab === "core" 
              ? "The foundation of extraordinary living" 
              : "Services you never knew you needed"}
          </motion.p>
        </div>
      </section>

      {/* How It Works Section */}
      <ServiceProcessSteps />

      {/* Services Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {currentServices.map((service, index) => (
                <motion.div
                  key={service.title}
                  variants={itemVariants}
                  className="group relative bg-card/50 border border-border/30 rounded-2xl p-6 hover:border-primary/30 transition-all duration-500 overflow-hidden"
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                        <service.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs text-muted-foreground/50 font-light">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-serif text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground font-light leading-relaxed mb-4">
                      {service.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {service.features.map((feature) => (
                        <span 
                          key={feature} 
                          className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground/80 border border-border/20"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 border-t border-border/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4">
            Ready to Experience <span className="text-primary">Aurelia</span>?
          </h2>
          <p className="text-muted-foreground font-light mb-6">
            Browse our curated marketplace or apply for membership to unlock exclusive access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services/marketplace"
              className="group inline-flex items-center justify-center space-x-3 px-8 py-4 bg-secondary border border-border text-foreground text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:border-primary/50"
            >
              <span>Browse Marketplace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/auth"
              className="group inline-flex items-center justify-center space-x-3 px-8 py-4 bg-primary text-primary-foreground text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-primary/90 gold-glow-hover"
            >
              <span>Apply for Membership</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
