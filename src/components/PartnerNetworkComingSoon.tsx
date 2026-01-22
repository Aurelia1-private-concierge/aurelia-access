import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Plane, Ship, Shield, Utensils, Building2, Sparkles, 
  Calendar, Palette, ArrowRight, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PartnerWaitlistModal from "./PartnerWaitlistModal";

interface CategoryCard {
  name: string;
  icon: typeof Plane;
  description: string;
  status: "curating" | "coming_q2" | "coming_q3";
}

const categories: CategoryCard[] = [
  { 
    name: "Private Aviation", 
    icon: Plane, 
    description: "Charter flights & jet management",
    status: "curating"
  },
  { 
    name: "Yacht Charter", 
    icon: Ship, 
    description: "Luxury vessels worldwide",
    status: "curating"
  },
  { 
    name: "Security & Chauffeur", 
    icon: Shield, 
    description: "Executive protection services",
    status: "curating"
  },
  { 
    name: "Fine Dining", 
    icon: Utensils, 
    description: "Michelin-starred reservations",
    status: "coming_q2"
  },
  { 
    name: "Real Estate", 
    icon: Building2, 
    description: "Ultra-prime property access",
    status: "coming_q2"
  },
  { 
    name: "Wellness & Spa", 
    icon: Sparkles, 
    description: "Exclusive retreat bookings",
    status: "coming_q2"
  },
  { 
    name: "Events & Entertainment", 
    icon: Calendar, 
    description: "VIP access & private events",
    status: "coming_q3"
  },
  { 
    name: "Art & Collectibles", 
    icon: Palette, 
    description: "Acquisition & authentication",
    status: "coming_q3"
  }
];

const statusLabels = {
  curating: "Curating Partners",
  coming_q2: "Launching Q2 2026",
  coming_q3: "Launching Q3 2026"
};

const PartnerNetworkComingSoon = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setIsModalOpen(true);
  };

  const handleJoinWaitlist = () => {
    setSelectedCategory(undefined);
    setIsModalOpen(true);
  };

  return (
    <section id="partners" className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground block mb-4">
            Partner Network
          </span>
          <h2 
            className="text-4xl md:text-5xl text-foreground tracking-[-0.02em] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Under Curation
          </h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            We're hand-selecting the world's most distinguished service providers. 
            Each partner undergoes rigorous vetting to meet Aurelia's exceptional standards.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isCurating = category.status === "curating";

            return (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleCategoryClick(category.name)}
                className="group relative p-6 bg-card/30 border border-border/10 hover:border-primary/20 transition-all duration-500 text-left rounded-lg overflow-hidden"
              >
                {/* Curating pulse effect */}
                {isCurating && (
                  <motion.div
                    className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                <div className="w-10 h-10 rounded-full border border-border/20 flex items-center justify-center mb-4 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-500">
                  <Icon 
                    className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-500" 
                    strokeWidth={1.5} 
                  />
                </div>
                
                <h3 
                  className="text-base text-foreground mb-1"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {category.name}
                </h3>

                <p className="text-xs text-muted-foreground/70 mb-3">
                  {category.description}
                </p>

                <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${
                  isCurating ? "text-primary" : "text-muted-foreground/50"
                }`}>
                  {isCurating && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                    </span>
                  )}
                  {statusLabels[category.status]}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Stats & CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          {/* Expansion stats */}
          <div className="flex items-center justify-center gap-8 mb-8 text-sm text-muted-foreground/60">
            <span>8 Categories</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>50+ Cities Planned</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Launching 2026</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleJoinWaitlist}
              className="min-w-[200px]"
            >
              <Bell className="w-4 h-4 mr-2" />
              Get Notified at Launch
            </Button>
            <Link
              to="/partners/join"
              className="inline-flex items-center gap-2 text-xs text-primary hover:underline"
            >
              Apply as a Partner
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Exclusivity note */}
          <p className="text-[10px] text-muted-foreground/40 mt-8 max-w-md mx-auto">
            Partner acceptance rate: approximately 8%. We prioritize excellence, 
            discretion, and alignment with Aurelia's values.
          </p>
        </motion.div>
      </div>

      <PartnerWaitlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedCategory={selectedCategory}
      />
    </section>
  );
};

export default PartnerNetworkComingSoon;
