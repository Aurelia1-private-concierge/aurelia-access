import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plane, Ship, Hotel, UtensilsCrossed, Calendar, Shield, 
  Heart, Car, Home, ShoppingBag, Palette, Cpu,
  Sparkles, Clock, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PartnerWaitlistModal from '@/components/PartnerWaitlistModal';

const serviceCategories = [
  { 
    id: 'aviation', 
    name: 'Private Aviation', 
    icon: Plane, 
    description: 'Jets, helicopters & luxury air travel',
    gradient: 'from-blue-500/20 to-sky-500/20'
  },
  { 
    id: 'yacht', 
    name: 'Yacht Charter', 
    icon: Ship, 
    description: 'Superyachts & exclusive cruises',
    gradient: 'from-cyan-500/20 to-teal-500/20'
  },
  { 
    id: 'hospitality', 
    name: 'Luxury Hotels', 
    icon: Hotel, 
    description: 'Five-star stays & private villas',
    gradient: 'from-amber-500/20 to-orange-500/20'
  },
  { 
    id: 'dining', 
    name: 'Private Dining', 
    icon: UtensilsCrossed, 
    description: 'Michelin chefs & exclusive tables',
    gradient: 'from-rose-500/20 to-pink-500/20'
  },
  { 
    id: 'events', 
    name: 'Exclusive Events', 
    icon: Calendar, 
    description: 'VIP access & private gatherings',
    gradient: 'from-violet-500/20 to-purple-500/20'
  },
  { 
    id: 'security', 
    name: 'Security Services', 
    icon: Shield, 
    description: 'Executive protection & privacy',
    gradient: 'from-slate-500/20 to-zinc-500/20'
  },
  { 
    id: 'wellness', 
    name: 'Wellness & Spa', 
    icon: Heart, 
    description: 'Luxury retreats & personal wellness',
    gradient: 'from-emerald-500/20 to-green-500/20'
  },
  { 
    id: 'automotive', 
    name: 'Luxury Automotive', 
    icon: Car, 
    description: 'Supercars & chauffeur services',
    gradient: 'from-red-500/20 to-orange-500/20'
  },
  { 
    id: 'real_estate', 
    name: 'Real Estate', 
    icon: Home, 
    description: 'Exclusive properties & estates',
    gradient: 'from-indigo-500/20 to-blue-500/20'
  },
  { 
    id: 'shopping', 
    name: 'Personal Shopping', 
    icon: ShoppingBag, 
    description: 'Bespoke fashion & luxury goods',
    gradient: 'from-fuchsia-500/20 to-pink-500/20'
  },
  { 
    id: 'art_collectibles', 
    name: 'Art & Collectibles', 
    icon: Palette, 
    description: 'Rare pieces & auction access',
    gradient: 'from-yellow-500/20 to-amber-500/20'
  },
  { 
    id: 'technology', 
    name: 'Technology', 
    icon: Cpu, 
    description: 'Smart home & digital services',
    gradient: 'from-cyan-500/20 to-blue-500/20'
  },
];

export const MarketplaceComingSoon: React.FC = () => {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowWaitlist(true);
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Clock className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Curating Excellence</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 font-serif">
            Service Marketplace
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Our team is carefully vetting world-class service providers across every category. 
            Be notified when exclusive services become available.
          </p>

          <Button 
            size="lg" 
            onClick={() => setShowWaitlist(true)}
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            Join the Waitlist
          </Button>
        </motion.div>

        {/* Category Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {serviceCategories.map((category, index) => {
            const IconComponent = category.icon;
            
            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.03 }}
                onClick={() => handleCategoryClick(category.id)}
                className={`
                  group relative p-6 rounded-2xl border border-border/50
                  bg-gradient-to-br ${category.gradient}
                  backdrop-blur-sm hover:border-primary/50 
                  transition-all duration-300 cursor-pointer text-left
                  hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10
                `}
              >
                {/* Curating Badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant="outline" 
                    className="bg-background/80 text-xs flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Curating
                  </Badge>
                </div>

                {/* Icon */}
                <div className="mb-4 p-3 rounded-xl bg-background/50 w-fit">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {category.description}
                </p>

                {/* Hover indicator */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-8 text-center"
        >
          <div>
            <p className="text-3xl font-bold text-primary">12+</p>
            <p className="text-sm text-muted-foreground">Categories</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">50+</p>
            <p className="text-sm text-muted-foreground">Cities Planned</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">Q2 2026</p>
            <p className="text-sm text-muted-foreground">Launch Target</p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center p-8 rounded-2xl bg-card/50 border border-border"
        >
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Are you a luxury service provider?
          </h3>
          <p className="text-muted-foreground mb-4">
            Join our exclusive partner network and connect with discerning clientele worldwide.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedCategory(null);
              setShowWaitlist(true);
            }}
          >
            Apply as Partner
          </Button>
        </motion.div>
      </div>

      {/* Waitlist Modal */}
      <PartnerWaitlistModal 
        isOpen={showWaitlist} 
        onClose={() => {
          setShowWaitlist(false);
          setSelectedCategory(null);
        }}
        preselectedCategory={selectedCategory}
      />
    </section>
  );
};

export default MarketplaceComingSoon;
