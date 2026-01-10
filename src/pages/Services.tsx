import { motion } from "framer-motion";
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
import ChatWidget from "@/components/ChatWidget";

const services = [
  {
    icon: Plane,
    title: "Private Aviation",
    description: "Access to the world's finest fleet of private jets, helicopters, and beyond. 24/7 availability with as little as 4 hours notice.",
    features: ["Empty leg optimization", "Global positioning", "Catering customization", "Ground transportation coordination"]
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
    features: ["Market intelligence", "Auction representation", "Authentication services", "Secure storage"]
  },
  {
    icon: Calendar,
    title: "Exclusive Access",
    description: "Invitations to the world's most coveted events, from film premieres to private gallery viewings.",
    features: ["Fashion week front rows", "Sports hospitality", "Cultural events", "Private concerts"]
  },
  {
    icon: ShieldCheck,
    title: "Security & Protection",
    description: "Comprehensive security services including personal bodyguards, home protection systems, and 24/7 family security details.",
    features: ["Personal bodyguards", "Home protection", "Family security", "Threat assessment"]
  },
  {
    icon: Car,
    title: "Chauffeur & Ground Transport",
    description: "Luxury ground transportation with vetted professional chauffeurs, armored vehicles, and seamless global mobility.",
    features: ["Armored vehicles", "Global chauffeur network", "Airport transfers", "Event transport"]
  },
  {
    icon: Utensils,
    title: "Culinary Excellence",
    description: "Reserved tables at impossible-to-book restaurants and private dining experiences with world-renowned chefs.",
    features: ["Priority reservations", "Private chef services", "Wine procurement", "Event catering"]
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
    description: "Access to elite medical institutions, wellness retreats, and preventive health programs worldwide.",
    features: ["Medical concierge", "Wellness retreats", "Specialist access", "Health optimization"]
  },
  {
    icon: ShoppingBag,
    title: "Personal Shopping",
    description: "Private appointments, pre-release access, and bespoke creations from the world's finest houses.",
    features: ["Wardrobe curation", "Trunk shows", "Bespoke commissions", "Gift sourcing"]
  }
];

// Discovery Services - innovative offerings clients never knew they needed
const discoveryServices = [
  {
    icon: Moon,
    title: "Sleep Architecture",
    description: "Custom sleep environment engineering—bespoke mattress science, circadian lighting design, and acoustic optimization for perfect rest.",
    features: ["Sleep environment audit", "Custom mattress creation", "Circadian lighting", "Acoustic engineering"]
  },
  {
    icon: Fingerprint,
    title: "Digital Estate Planning",
    description: "Comprehensive management of your digital legacy—cryptocurrency inheritance, password vault architecture, and social media legacy planning.",
    features: ["Crypto inheritance", "Digital asset inventory", "Password architecture", "Legacy documentation"]
  },
  {
    icon: Shield,
    title: "Reputation Sentinel",
    description: "Proactive protection of your digital presence—dark web monitoring, digital footprint management, and crisis response retainers.",
    features: ["Dark web monitoring", "Footprint scrubbing", "Privacy audits", "Crisis PR retainer"]
  },
  {
    icon: BookOpen,
    title: "Legacy Curation",
    description: "Professional archivists documenting your family history, digitizing heirlooms, and creating museum-quality legacy publications.",
    features: ["Family archives", "Heirloom digitization", "Coffee table books", "Oral histories"]
  },
  {
    icon: Brain,
    title: "Longevity Concierge",
    description: "Access to cutting-edge treatments, personalized health optimization protocols, and the world's foremost specialists in preventive medicine.",
    features: ["Preventive protocols", "Specialist network", "Biometric tracking", "Treatment access"]
  },
  {
    icon: Flower2,
    title: "Signature Scent Creation",
    description: "Bespoke fragrance development for your homes, offices, and private aircraft—working with master perfumers to capture your essence.",
    features: ["Personal fragrance", "Home scenting", "Aircraft & yacht", "Seasonal variations"]
  },
  {
    icon: Users,
    title: "Companion Matching",
    description: "Vetted travel and dining companions for solo journeys—intelligent, cultured individuals for meaningful connection without complication.",
    features: ["Travel companions", "Dining partners", "Event escorts", "Background verification"]
  },
  {
    icon: Cloud,
    title: "Private Meteorology",
    description: "Personal weather forecasting services for yacht crossings, outdoor events, and optimal travel windows—your own meteorologist on call.",
    features: ["Event forecasting", "Sailing windows", "Travel optimization", "Storm tracking"]
  },
  {
    icon: Key,
    title: "Second Passport Advisory",
    description: "Discreet guidance on citizenship-by-investment programs, residency planning, and global mobility optimization for ultimate freedom.",
    features: ["CBI programs", "Residency planning", "Tax optimization", "Global mobility"]
  },
  {
    icon: Home,
    title: "Household Optimization",
    description: "Comprehensive estate management—staff training and vetting, smart home integration, and operational efficiency consulting.",
    features: ["Staff training", "Smart integration", "Vendor management", "Efficiency audits"]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
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
            className="text-4xl md:text-6xl font-serif text-foreground mb-6"
          >
            Curated for the <span className="text-primary italic">Extraordinary</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground font-light max-w-2xl mx-auto"
          >
            Every service is tailored to your unique requirements. Our network spans 
            continents, our discretion is absolute, and our standards are uncompromising.
          </motion.p>
        </div>
      </section>

      {/* Core Services Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-2xl font-serif text-foreground mb-2">Core Services</h2>
            <p className="text-muted-foreground font-light">The foundation of extraordinary living</p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                variants={itemVariants}
                className="group relative bg-card/50 border border-border/30 rounded-2xl p-8 hover:border-primary/30 transition-all duration-500 overflow-hidden"
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <service.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs text-muted-foreground/50 font-light">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-serif text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground font-light leading-relaxed mb-6">
                    {service.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <div className="w-1 h-1 rounded-full bg-primary/60" />
                        <span className="text-xs text-muted-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Discovery Services Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-secondary/30 to-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 border border-primary/30 bg-primary/5 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
                Discovery Services
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">
              Services You Never Knew <span className="text-primary italic">You Needed</span>
            </h2>
            <p className="text-muted-foreground font-light max-w-2xl mx-auto">
              Beyond the expected, we anticipate desires you haven&apos;t yet articulated. 
              These invisible infrastructures and sensory luxuries define the AURELIA difference.
            </p>
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {discoveryServices.map((service, index) => (
              <motion.div
                key={service.title}
                variants={itemVariants}
                className="group relative bg-card/30 border border-primary/10 rounded-2xl p-6 hover:border-primary/40 hover:bg-card/50 transition-all duration-500 overflow-hidden"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <service.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-serif text-foreground group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground font-light leading-relaxed mb-5">
                    {service.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span 
                        key={feature} 
                        className="text-xs px-2 py-1 rounded-full bg-primary/5 text-muted-foreground/80 border border-primary/10"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-border/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">
            Ready to Experience <span className="text-primary">Aurelia</span>?
          </h2>
          <p className="text-muted-foreground font-light mb-8">
            Membership is by invitation or application. Begin your journey to extraordinary.
          </p>
          <Link
            to="/auth"
            className="group inline-flex items-center space-x-3 px-8 py-4 bg-primary text-primary-foreground text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-primary/90 gold-glow-hover"
          >
            <span>Apply for Membership</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Services;
